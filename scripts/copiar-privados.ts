/**
 * Copia os arquivos privados (documento, comprovante e foto sem autorização de
 * imagem, guardados no banco como `privado:<pathname>`) do store privado
 * antigo para o novo, no MESMO pathname: a referência no banco continua
 * valendo e nada no banco muda.
 *
 * Uso (sem --aplicar só confere o que falta copiar):
 *   npx tsx scripts/copiar-privados.ts [--aplicar]
 *
 * Lê de .env.production.local (ou do ambiente):
 *   DATABASE_URL, DATABASE_AUTH_TOKEN
 *   BLOB_PRIVATE_READ_WRITE_TOKEN   store privado novo (destino)
 *   BLOB_PRIVATE_ANTIGO_TOKEN       read-write token do store privado antigo (origem)
 * Pode rodar de novo: o que já está no store novo é pulado.
 */
import { config } from "dotenv";
import { get, head, put } from "@vercel/blob";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

config({ path: ".env.production.local", quiet: true });

const aplicar = process.argv.includes("--aplicar");
const PRIVATE_PREFIX = "privado:";

const prisma = new PrismaClient({
  adapter: new PrismaLibSql({ url: process.env.DATABASE_URL!, authToken: process.env.DATABASE_AUTH_TOKEN }),
});

async function existe(pathname: string, token: string) {
  try {
    await head(pathname, { token });
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const destino = process.env.BLOB_PRIVATE_READ_WRITE_TOKEN?.trim();
  const origem = process.env.BLOB_PRIVATE_ANTIGO_TOKEN?.trim();
  if (!process.env.DATABASE_URL) throw new Error("Defina DATABASE_URL (e DATABASE_AUTH_TOKEN).");
  if (!destino) throw new Error("Defina BLOB_PRIVATE_READ_WRITE_TOKEN (store privado novo).");
  if (!origem) throw new Error("Defina BLOB_PRIVATE_ANTIGO_TOKEN (store privado antigo).");

  const select = { fotoUrl: true, documentoUrl: true, comprovanteEnderecoUrl: true } as const;
  const [atletas, inscricoes] = await Promise.all([
    prisma.atleta.findMany({ select }),
    prisma.inscricaoAtleta.findMany({ select }),
  ]);
  const pathnames = new Set<string>();
  for (const r of [...atletas, ...inscricoes]) {
    for (const ref of [r.fotoUrl, r.documentoUrl, r.comprovanteEnderecoUrl]) {
      if (ref?.startsWith(PRIVATE_PREFIX)) pathnames.add(ref.slice(PRIVATE_PREFIX.length));
    }
  }
  console.log(`${pathnames.size} arquivo(s) privado(s) referenciado(s) no banco.`);

  let jaCopiados = 0;
  let copiados = 0;
  let bytes = 0;
  const falhas: string[] = [];

  for (const pathname of pathnames) {
    try {
      if (await existe(pathname, destino)) {
        jaCopiados++;
        continue;
      }
      const lido = await get(pathname, { access: "private", token: origem });
      if (!lido || lido.statusCode !== 200) throw new Error(`download ${lido?.statusCode ?? "vazio"}`);
      const buffer = Buffer.from(await new Response(lido.stream).arrayBuffer());
      bytes += buffer.length;
      if (!aplicar) continue;
      await put(pathname, buffer, {
        access: "private",
        contentType: lido.blob.contentType,
        addRandomSuffix: false,
        token: destino,
      });
      copiados++;
    } catch (e) {
      falhas.push(`${pathname}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  console.log(`${jaCopiados} já estava(m) no store novo.`);
  console.log(`${(bytes / 1024 / 1024).toFixed(1)} MB lidos do store antigo.`);
  if (aplicar) console.log(`${copiados} copiado(s).`);
  else console.log("Simulação: nada foi copiado. Rode com --aplicar para copiar.");
  if (falhas.length) {
    console.log(`${falhas.length} falha(s):`);
    for (const f of falhas) console.log(`  ${f}`);
    process.exitCode = 1;
  }
}

main().finally(() => prisma.$disconnect());
