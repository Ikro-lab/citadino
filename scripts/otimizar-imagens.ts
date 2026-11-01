/**
 * Reduz as fotos de atleta e os escudos já enviados, que foram guardados no
 * tamanho original do celular: cada miniatura do site baixava o arquivo
 * inteiro e isso esgotou a transferência do Vercel Blob.
 *
 * Para cada imagem pública maior que o limite: baixa, reduz (foto 400px WebP,
 * escudo 256px PNG, mesmos limites de src/lib/storage.ts), sobe com nome novo
 * no store do BLOB_READ_WRITE_TOKEN e troca a URL no banco (Atleta,
 * InscricaoAtleta e Time). Fotos privadas (`privado:...`) ficam como estão.
 *
 * --mover-todas: troca de store. Copia TODO arquivo público que não esteja no
 * store do token (inclusive os já leves, logos de patrocinador e PDFs de
 * regulamento), reduzindo as fotos e escudos no caminho.
 *
 * Uso (sem --aplicar só mede e lista):
 *   npx tsx scripts/otimizar-imagens.ts [--mover-todas]
 *   npx tsx scripts/otimizar-imagens.ts --aplicar [--mover-todas]
 *   npx tsx scripts/otimizar-imagens.ts --aplicar --apagar-antigos
 *        # idem e apaga os originais (só no mesmo store; faça depois de conferir o site)
 *
 * Os arquivos de origem precisam responder (store fora da suspensão). Lê
 * DATABASE_URL, DATABASE_AUTH_TOKEN e BLOB_READ_WRITE_TOKEN (store público de
 * destino) do ambiente ou de .env.production.local.
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
const moverTodas = process.argv.includes("--mover-todas");

const FOTO_MAX_PX = 400;
const ESCUDO_MAX_PX = 256;
// Abaixo disso a imagem já é leve: não vale gastar operações do Blob.
const MINIMO_BYTES = 80 * 1024;
const PUBLIC_BLOB_HOST = /\.public\.blob\.vercel-storage\.com$/;

type Tipo = "foto" | "escudo" | "copia";

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

/** Store de uma URL pública: o primeiro rótulo do host (`<store>.public.blob...`). */
const storeDaUrl = (url: string) => new URL(url).hostname.split(".")[0].toLowerCase();
/** Store do token: `vercel_blob_rw_<store>_<segredo>`. */
const storeDoToken = (token: string) => token.split("_")[3]?.toLowerCase();

async function reduzir(original: Buffer, tipo: Tipo, contentType: string) {
  if (tipo === "copia") return { buffer: original, contentType, ext: "" };
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

async function trocarUrl(de: string, para: string) {
  await prisma.$transaction([
    prisma.atleta.updateMany({ where: { fotoUrl: de }, data: { fotoUrl: para } }),
    prisma.inscricaoAtleta.updateMany({ where: { fotoUrl: de }, data: { fotoUrl: para } }),
    prisma.time.updateMany({ where: { escudoUrl: de }, data: { escudoUrl: para } }),
    prisma.patrocinador.updateMany({ where: { logoUrl: de }, data: { logoUrl: para } }),
    prisma.campeonato.updateMany({ where: { regulamentoUrl: de }, data: { regulamentoUrl: para } }),
    prisma.categoria.updateMany({ where: { regulamentoUrl: de }, data: { regulamentoUrl: para } }),
  ]);
}

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("Defina DATABASE_URL (e DATABASE_AUTH_TOKEN).");
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  if ((aplicar || moverTodas) && !token) {
    throw new Error("Defina BLOB_READ_WRITE_TOKEN (store público de destino).");
  }
  const storeDestino = token ? storeDoToken(token) : undefined;

  const [atletas, inscricoes, times, patrocinadores, campeonatos, categorias] = await Promise.all([
    prisma.atleta.findMany({ select: { fotoUrl: true } }),
    prisma.inscricaoAtleta.findMany({ select: { fotoUrl: true } }),
    prisma.time.findMany({ select: { escudoUrl: true } }),
    prisma.patrocinador.findMany({ select: { logoUrl: true } }),
    prisma.campeonato.findMany({ select: { regulamentoUrl: true } }),
    prisma.categoria.findMany({ select: { regulamentoUrl: true } }),
  ]);

  // Inscrição aprovada copia a mesma URL para o atleta: cada URL é tratada uma vez.
  const alvos = new Map<string, Tipo>();
  for (const r of [...atletas, ...inscricoes]) if (ehBlobPublico(r.fotoUrl)) alvos.set(r.fotoUrl, "foto");
  for (const t of times) if (ehBlobPublico(t.escudoUrl)) alvos.set(t.escudoUrl, "escudo");
  if (moverTodas) {
    for (const p of patrocinadores) if (ehBlobPublico(p.logoUrl)) alvos.set(p.logoUrl, "copia");
    for (const r of [...campeonatos, ...categorias]) if (ehBlobPublico(r.regulamentoUrl)) alvos.set(r.regulamentoUrl, "copia");
    // Já no store de destino: nada a mover.
    for (const url of alvos.keys()) if (storeDaUrl(url) === storeDestino) alvos.delete(url);
  } else {
    for (const [url, tipo] of alvos) if (tipo === "copia") alvos.delete(url);
  }
  console.log(`${alvos.size} arquivo(s) público(s) a verificar${moverTodas ? " para mover de store" : ""}.`);

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
      const contentType = res.headers.get("content-type") ?? "application/octet-stream";
      const leve = original.length < MINIMO_BYTES;
      if (leve && !moverTodas) {
        leves++;
        continue;
      }
      const final = leve ? { buffer: original, contentType, ext: "" } : await reduzir(original, tipo, contentType);
      antes += original.length;
      depois += final.buffer.length;
      if (!aplicar) continue;

      const pathname = decodeURIComponent(new URL(url).pathname.replace(/^\//, ""));
      const ext = final.ext || path.posix.extname(pathname);
      const novoPath = `${path.posix.dirname(pathname)}/${randomUUID()}${ext}`;
      const blob = await put(novoPath, final.buffer, {
        access: "public",
        contentType: final.contentType,
        addRandomSuffix: false,
        token,
      });

      await trocarUrl(url, blob.url);
      if (apagarAntigos && storeDaUrl(url) === storeDestino) await del(url, { token });
      trocadas++;
    } catch (e) {
      falhas.push(`${url}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  const mb = (b: number) => (b / 1024 / 1024).toFixed(1);
  if (!moverTodas) console.log(`${leves} já leve(s) (< ${MINIMO_BYTES / 1024}KB), mantida(s).`);
  console.log(`Tamanho: ${mb(antes)} MB -> ${mb(depois)} MB.`);
  if (aplicar) console.log(`${trocadas} trocado(s)${apagarAntigos ? " e original(is) do mesmo store apagado(s)" : ""}.`);
  else console.log("Simulação: nada foi alterado. Rode com --aplicar para trocar.");
  if (falhas.length) {
    console.log(`${falhas.length} falha(s):`);
    for (const f of falhas) console.log(`  ${f}`);
    process.exitCode = 1;
  }
}

main().finally(() => prisma.$disconnect());
