/**
 * Cópia de segurança do banco: exporta todas as tabelas para JSON compactado
 * em backups/<data-hora>/ (pasta fora do git). Só lê; não altera nada.
 *
 * Uso:
 *   npx tsx scripts/backup-banco.ts                 # banco local (dev.db)
 *   DATABASE_URL=libsql://... DATABASE_AUTH_TOKEN=... npx tsx scripts/backup-banco.ts
 *
 * Guarde a pasta gerada fora do computador também (HD externo ou nuvem no
 * Brasil): a política de privacidade diz que a cópia fica no Brasil.
 * Os arquivos têm dados pessoais de atletas; não mande por e-mail ou WhatsApp.
 */
import "dotenv/config";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { gzipSync } from "zlib";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const databaseUrl = process.env.DATABASE_URL ?? "file:./dev.db";
const isRemote = databaseUrl.startsWith("libsql:") || databaseUrl.startsWith("https:");
const adapter = isRemote
  ? new PrismaLibSql({ url: databaseUrl, authToken: process.env.DATABASE_AUTH_TOKEN })
  : new PrismaBetterSqlite3({ url: databaseUrl });
const prisma = new PrismaClient({ adapter });

const json = (v: unknown) =>
  JSON.stringify(v, (_k, x) => (typeof x === "bigint" ? x.toString() : x instanceof Uint8Array ? Buffer.from(x).toString("base64") : x));

async function main() {
  const tabelas = await prisma.$queryRawUnsafe<{ name: string; sql: string }[]>(
    "SELECT name, sql FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%' ORDER BY name"
  );
  const carimbo = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const destino = path.join(process.cwd(), "backups", `${isRemote ? "producao" : "local"}-${carimbo}`);
  await mkdir(destino, { recursive: true });

  const resumo: Record<string, number> = {};
  for (const { name } of tabelas) {
    const linhas = await prisma.$queryRawUnsafe<unknown[]>(`SELECT * FROM "${name.replace(/"/g, '""')}"`);
    await writeFile(path.join(destino, `${name}.json.gz`), gzipSync(json(linhas)));
    resumo[name] = linhas.length;
  }
  await writeFile(
    path.join(destino, "schema.json"),
    json({ geradoEm: new Date().toISOString(), origem: isRemote ? "remoto" : databaseUrl, tabelas, linhas: resumo })
  );

  console.log(`Backup em ${destino}`);
  for (const [t, n] of Object.entries(resumo)) console.log(`  ${t}: ${n}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
