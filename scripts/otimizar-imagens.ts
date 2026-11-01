/**
 * Reduz as fotos de atleta e os escudos já enviados, que foram guardados no
 * tamanho original do celular: cada miniatura do site baixava o arquivo
 * inteiro e isso esgotou a transferência do Vercel Blob.
 *
 * Para cada imagem pública maior que o limite: baixa, reduz (foto 400px WebP,
 * escudo 256px PNG, mesmos limites de src/lib/storage.ts), sobe com nome novo
 * e troca a URL no banco (Atleta, InscricaoAtleta e Time). Fotos privadas
 * (`privado:...`) ficam como estão: só o admin as vê.
 *
 * Uso (sem --aplicar só mede e lista quanto economizaria):
 *   npx tsx scripts/otimizar-imagens.ts
 *   npx tsx scripts/otimizar-imagens.ts --aplicar
 *   npx tsx scripts/otimizar-imagens.ts --aplicar --apagar-antigos
 *        # idem e apaga os originais do Blob (faça depois de conferir o site)
 *
 * O store precisa estar ativo (fora da suspensão por limite). Lê DATABASE_URL,
 * DATABASE_AUTH_TOKEN e BLOB_READ_WRITE_TOKEN (do store público citadino-blob,
 * copiado do painel da Vercel) do ambiente ou de .env.production.local.
 * Faça um backup do banco antes de rodar com --aplicar.
 */
import { config } from "dotenv";
import path from "path";
import { randomUUID } from "crypto";
import sharp from "sharp";
import { del, put } from "@vercel/blob";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

config({ path: ".env.production.local", quiet: true });

const aplicar = process.argv.includes("--aplicar");
const apagarAntigos = process.argv.includes("--apagar-antigos");

const FOTO_MAX_PX = 400;
const ESCUDO_MAX_PX = 256;
// Abaixo disso a imagem já é leve: não vale gastar operações do Blob.
const MINIMO_BYTES = 80 * 1024;
const PUBLIC_BLOB_HOST = /\.public\.blob\.vercel-storage\.com$/;

const prisma = new PrismaClient({
  adapter: new PrismaLibSql({ url: process.env.DATABASE_URL!, authToken: process.env.DATABASE_AUTH_TOKEN }),
});

function ehBlobPublico(valor: string | null): valor is string {
  if (!valor) return false;
  try {
    const url = new URL(valor);
    return url.protocol === "https:" && PUBLIC_BLOB_HOST.test(url.hostname);
  } catch {
    return false;
  }
}

async function reduzir(original: Buffer, tipo: "foto" | "escudo") {
  const img = sharp(original).rotate();
  if (tipo === "foto") {
    return {
      buffer: await img
        .resize({ width: FOTO_MAX_PX, height: FOTO_MAX_PX, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer(),
      contentType: "image/webp",
      ext: ".webp",
    };
  }
  return {
    buffer: await img
      .resize({ width: ESCUDO_MAX_PX, height: ESCUDO_MAX_PX, fit: "inside", withoutEnlargement: true })
      .png()
      .toBuffer(),
    contentType: "image/png",
    ext: ".png",
  };
}

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("Defina DATABASE_URL (e DATABASE_AUTH_TOKEN).");
  if (aplicar && !process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("Defina BLOB_READ_WRITE_TOKEN (store público citadino-blob) antes de usar --aplicar.");
  }

  const [atletas, inscricoes, times] = await Promise.all([
    prisma.atleta.findMany({ select: { fotoUrl: true } }),
    prisma.inscricaoAtleta.findMany({ select: { fotoUrl: true } }),
    prisma.time.findMany({ select: { escudoUrl: true } }),
  ]);

  // Inscrição aprovada copia a mesma URL para o atleta: cada URL é tratada uma vez.
  const alvos = new Map<string, "foto" | "escudo">();
  for (const r of [...atletas, ...inscricoes]) if (ehBlobPublico(r.fotoUrl)) alvos.set(r.fotoUrl, "foto");
  for (const t of times) if (ehBlobPublico(t.escudoUrl)) alvos.set(t.escudoUrl, "escudo");
  console.log(`${alvos.size} imagem(ns) pública(s) no banco.`);

  let antes = 0;
  let depois = 0;
  let trocadas = 0;
  let leves = 0;
  const falhas: string[] = [];

  for (const [url, tipo] of alvos) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`download ${res.status}`);
      const original = Buffer.from(await res.arrayBuffer());
      if (original.length < MINIMO_BYTES) {
        leves++;
        continue;
      }
      const reduzida = await reduzir(original, tipo);
      antes += original.length;
      depois += reduzida.buffer.length;
      if (!aplicar) continue;

      const pathname = decodeURIComponent(new URL(url).pathname.replace(/^\//, ""));
      const novoPath = `${path.posix.dirname(pathname)}/${randomUUID()}${reduzida.ext}`;
      const blob = await put(novoPath, reduzida.buffer, {
        access: "public",
        contentType: reduzida.contentType,
        addRandomSuffix: false,
      });

      if (tipo === "foto") {
        await prisma.$transaction([
          prisma.atleta.updateMany({ where: { fotoUrl: url }, data: { fotoUrl: blob.url } }),
          prisma.inscricaoAtleta.updateMany({ where: { fotoUrl: url }, data: { fotoUrl: blob.url } }),
        ]);
      } else {
        await prisma.time.updateMany({ where: { escudoUrl: url }, data: { escudoUrl: blob.url } });
      }
      if (apagarAntigos) await del(url);
      trocadas++;
    } catch (e) {
      falhas.push(`${url}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  const mb = (b: number) => (b / 1024 / 1024).toFixed(1);
  console.log(`${leves} já leve(s) (< ${MINIMO_BYTES / 1024}KB), mantida(s).`);
  console.log(`A reduzir: ${mb(antes)} MB -> ${mb(depois)} MB.`);
  if (aplicar) console.log(`${trocadas} trocada(s)${apagarAntigos ? " e original(is) apagado(s)" : ""}.`);
  else console.log("Simulação: nada foi alterado. Rode com --aplicar para trocar.");
  if (falhas.length) {
    console.log(`${falhas.length} falha(s):`);
    for (const f of falhas) console.log(`  ${f}`);
    process.exitCode = 1;
  }
}

main().finally(() => prisma.$disconnect());
