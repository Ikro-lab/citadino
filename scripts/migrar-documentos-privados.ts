/**
 * Move os documentos de atleta (identidade e comprovante) que ficaram no Blob
 * PÚBLICO para o Blob PRIVADO e troca a referência no banco por `privado:...`.
 *
 * Por padrão só simula. Uso:
 *   npx tsx scripts/migrar-documentos-privados.ts                 # simula, não muda nada
 *   npx tsx scripts/migrar-documentos-privados.ts --aplicar       # copia e atualiza o banco
 *   npx tsx scripts/migrar-documentos-privados.ts --aplicar --apagar-publicos
 *        # idem e depois apaga os arquivos públicos (faça só depois de conferir
 *        # que os documentos abrem pela tela do admin)
 *
 * Precisa de DATABASE_URL (+ DATABASE_AUTH_TOKEN), BLOB_PRIVATE_READ_WRITE_TOKEN
 * e, para --apagar-publicos, BLOB_READ_WRITE_TOKEN (o do store público).
 * Faça um backup do banco antes de rodar com --aplicar.
 */
import "dotenv/config";
import { del, put } from "@vercel/blob";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const aplicar = process.argv.includes("--aplicar");
const apagarPublicos = process.argv.includes("--apagar-publicos");

const databaseUrl = process.env.DATABASE_URL ?? "file:./dev.db";
const isRemote = databaseUrl.startsWith("libsql:") || databaseUrl.startsWith("https:");
const adapter = isRemote
  ? new PrismaLibSql({ url: databaseUrl, authToken: process.env.DATABASE_AUTH_TOKEN })
  : new PrismaBetterSqlite3({ url: databaseUrl });
const prisma = new PrismaClient({ adapter });

const PUBLIC_BLOB_HOST = /\.public\.blob\.vercel-storage\.com$/;

function ehBlobPublico(valor: string | null): valor is string {
  if (!valor) return false;
  try {
    const url = new URL(valor);
    return url.protocol === "https:" && PUBLIC_BLOB_HOST.test(url.hostname);
  } catch {
    return false;
  }
}

async function main() {
  const privateToken = process.env.BLOB_PRIVATE_READ_WRITE_TOKEN;
  if (aplicar && !privateToken) throw new Error("Defina BLOB_PRIVATE_READ_WRITE_TOKEN antes de usar --aplicar.");
  if (apagarPublicos && !process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("Defina BLOB_READ_WRITE_TOKEN (store público) para usar --apagar-publicos.");
  }

  const [atletas, inscricoes] = await Promise.all([
    prisma.atleta.findMany({ select: { documentoUrl: true, comprovanteEnderecoUrl: true } }),
    prisma.inscricaoAtleta.findMany({ select: { documentoUrl: true, comprovanteEnderecoUrl: true } }),
  ]);

  // Inscrição aprovada copia a mesma URL para o atleta: migra cada URL uma vez só.
  const urls = new Set<string>();
  for (const r of [...atletas, ...inscricoes]) {
    if (ehBlobPublico(r.documentoUrl)) urls.add(r.documentoUrl);
    if (ehBlobPublico(r.comprovanteEnderecoUrl)) urls.add(r.comprovanteEnderecoUrl);
  }

  console.log(`${urls.size} documento(s) público(s) encontrados.`);
  if (!aplicar) {
    console.log("Simulação: nada foi alterado. Rode com --aplicar para migrar.");
    return;
  }

  let migrados = 0;
  const falhas: string[] = [];
  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`download ${res.status}`);
      const conteudo = Buffer.from(await res.arrayBuffer());
      const pathname = decodeURIComponent(new URL(url).pathname.replace(/^\//, ""));
      const blob = await put(pathname, conteudo, {
        access: "private",
        contentType: res.headers.get("content-type") ?? "application/octet-stream",
        addRandomSuffix: false,
        allowOverwrite: true,
        token: privateToken,
      });
      const ref = `privado:${blob.pathname}`;

      await prisma.$transaction([
        prisma.atleta.updateMany({ where: { documentoUrl: url }, data: { documentoUrl: ref } }),
        prisma.atleta.updateMany({ where: { comprovanteEnderecoUrl: url }, data: { comprovanteEnderecoUrl: ref } }),
        prisma.inscricaoAtleta.updateMany({ where: { documentoUrl: url }, data: { documentoUrl: ref } }),
        prisma.inscricaoAtleta.updateMany({
          where: { comprovanteEnderecoUrl: url },
          data: { comprovanteEnderecoUrl: ref },
        }),
      ]);

      if (apagarPublicos) await del(url, { token: process.env.BLOB_READ_WRITE_TOKEN });
      migrados++;
    } catch (e) {
      falhas.push(`${url}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  console.log(`${migrados} migrado(s)${apagarPublicos ? " e apagado(s) do store público" : ""}.`);
  if (falhas.length) {
    console.log(`${falhas.length} falha(s):`);
    for (const f of falhas) console.log(`  ${f}`);
    process.exitCode = 1;
  }
}

main().finally(() => prisma.$disconnect());
