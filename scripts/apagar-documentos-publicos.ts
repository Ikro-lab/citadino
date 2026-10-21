/**
 * Depois da migração (scripts/migrar-documentos-privados.ts), apaga do Blob
 * PÚBLICO as cópias antigas dos documentos de atleta.
 *
 * O banco já não guarda as URLs públicas, então a lista vem do store PRIVADO:
 * a migração copiou cada documento mantendo o mesmo caminho (pathname). Para
 * cada caminho que está no privado, apaga o arquivo de mesmo caminho no
 * público, MENOS os que o banco ainda usa (foto de atleta, escudo, logo,
 * regulamento, vídeo) — fotos ficam na mesma pasta dos documentos.
 *
 * Por padrão só simula. Uso:
 *   DOTENV_CONFIG_PATH=.env.migracao npx tsx scripts/apagar-documentos-publicos.ts
 *   DOTENV_CONFIG_PATH=.env.migracao npx tsx scripts/apagar-documentos-publicos.ts --apagar
 *
 * Precisa de DATABASE_URL (+ DATABASE_AUTH_TOKEN), BLOB_PRIVATE_STORE_ID (ou
 * BLOB_PRIVATE_READ_WRITE_TOKEN) e da credencial do store público
 * (BLOB_STORE_ID + VERCEL_OIDC_TOKEN, ou BLOB_READ_WRITE_TOKEN).
 */
import "dotenv/config";
import { BlobNotFoundError, del, head, list } from "@vercel/blob";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const apagar = process.argv.includes("--apagar");

const databaseUrl = process.env.DATABASE_URL ?? "file:./dev.db";
if (/SENSITIVE/.test(databaseUrl) || /SENSITIVE/.test(process.env.DATABASE_AUTH_TOKEN ?? "")) {
  throw new Error("DATABASE_URL/DATABASE_AUTH_TOKEN ainda estão com o marcador [SENSITIVE]: cole os valores reais.");
}
const isRemote = databaseUrl.startsWith("libsql:") || databaseUrl.startsWith("https:");
const prisma = new PrismaClient({
  adapter: isRemote
    ? new PrismaLibSql({ url: databaseUrl, authToken: process.env.DATABASE_AUTH_TOKEN })
    : new PrismaBetterSqlite3({ url: databaseUrl }),
});

const privateToken = process.env.BLOB_PRIVATE_READ_WRITE_TOKEN?.trim();
const privateStoreId = process.env.BLOB_PRIVATE_STORE_ID?.trim();
const credPrivada = privateToken ? { token: privateToken } : privateStoreId ? { storeId: privateStoreId } : null;

/** Toda URL que o banco ainda usa, em qualquer campo de arquivo. */
async function urlsEmUso(): Promise<Set<string>> {
  const [camp, patr, cat, times, atletas, insc, eventos] = await Promise.all([
    prisma.campeonato.findMany({ select: { regulamentoUrl: true } }),
    prisma.patrocinador.findMany({ select: { logoUrl: true } }),
    prisma.categoria.findMany({ select: { regulamentoUrl: true } }),
    prisma.time.findMany({ select: { escudoUrl: true } }),
    prisma.atleta.findMany({ select: { fotoUrl: true, documentoUrl: true, comprovanteEnderecoUrl: true } }),
    prisma.inscricaoAtleta.findMany({ select: { fotoUrl: true, documentoUrl: true, comprovanteEnderecoUrl: true } }),
    prisma.eventoPartida.findMany({ select: { videoUrl: true } }),
  ]);
  const todos = [...camp, ...patr, ...cat, ...times, ...atletas, ...insc, ...eventos].flatMap((r) => Object.values(r));
  return new Set(todos.filter((v): v is string => typeof v === "string" && v.startsWith("https://")));
}

async function main() {
  if (!credPrivada) throw new Error("Defina BLOB_PRIVATE_STORE_ID ou BLOB_PRIVATE_READ_WRITE_TOKEN.");
  if (privateStoreId && !privateToken && !process.env.VERCEL_OIDC_TOKEN) {
    throw new Error("BLOB_PRIVATE_STORE_ID precisa de VERCEL_OIDC_TOKEN: rode `vercel env pull` antes.");
  }

  const emUso = await urlsEmUso();

  const caminhos: string[] = [];
  let cursor: string | undefined;
  do {
    const pagina = await list({ ...credPrivada, cursor, limit: 1000 });
    caminhos.push(...pagina.blobs.map((b) => b.pathname));
    cursor = pagina.hasMore ? pagina.cursor : undefined;
  } while (cursor);

  let semCopiaPublica = 0;
  let protegidos = 0;
  const paraApagar: string[] = [];
  for (const caminho of caminhos) {
    // Credencial do store público vem do ambiente (BLOB_STORE_ID + OIDC ou token).
    let url: string;
    try {
      url = (await head(caminho)).url;
    } catch (e) {
      if (e instanceof BlobNotFoundError) {
        semCopiaPublica++;
        continue;
      }
      throw e;
    }
    if (emUso.has(url)) {
      protegidos++;
      continue;
    }
    paraApagar.push(url);
  }

  console.log(`${caminhos.length} arquivo(s) no store privado.`);
  console.log(`${paraApagar.length} cópia(s) pública(s) para apagar.`);
  console.log(`${semCopiaPublica} sem cópia pública (nada a fazer).`);
  console.log(`${protegidos} pulado(s) porque o banco ainda usa a URL pública.`);

  if (!apagar) {
    console.log("Simulação: nada foi apagado. Rode com --apagar para apagar.");
    return;
  }

  let apagados = 0;
  for (let i = 0; i < paraApagar.length; i += 50) {
    await del(paraApagar.slice(i, i + 50));
    apagados += Math.min(50, paraApagar.length - i);
  }
  console.log(`${apagados} cópia(s) pública(s) apagada(s).`);
}

main().finally(() => prisma.$disconnect());
