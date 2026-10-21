/**
 * Aplica no banco remoto (Turso) as migrations de prisma/migrations que ainda
 * não estão nele. O deploy da Vercel não roda migrations, e o
 * `prisma migrate deploy` do Prisma 7 não aceita URL libsql:// — sem isto, o
 * código novo sobe pedindo colunas que o banco não tem e o site inteiro dá 500.
 *
 * Registra cada uma em `_prisma_migrations` do mesmo jeito que o Prisma
 * (checksum = SHA-256 do migration.sql), então o histórico continua coerente.
 *
 * Uso (rode ANTES do push que leva a migration para a master):
 *   npx tsx scripts/backup-banco.ts                  # com as variáveis abaixo; cópia de segurança
 *   npx tsx scripts/migrar-producao.ts               # só lista o que falta aplicar
 *   npx tsx scripts/migrar-producao.ts --aplicar     # aplica
 *   npx tsx scripts/migrar-producao.ts --registrar <nome>
 *     # marca como aplicada SEM executar: para uma migration rodada à mão no
 *     # passado (as colunas já existem no banco, mas falta o registro)
 *
 * Lê DATABASE_URL e DATABASE_AUTH_TOKEN do ambiente ou de .env.production.local.
 */
import { config } from "dotenv";
import { readdir, readFile } from "fs/promises";
import { createHash, randomBytes } from "crypto";
import path from "path";
import { createClient } from "@libsql/client";

config({ path: ".env.production.local", quiet: true });

const databaseUrl = process.env.DATABASE_URL ?? "";
const aplicar = process.argv.includes("--aplicar");
const registrarIdx = process.argv.indexOf("--registrar");
const registrar = registrarIdx >= 0 ? process.argv[registrarIdx + 1] : undefined;
const PASTA = path.join(process.cwd(), "prisma", "migrations");

const agora = () => new Date().toISOString().replace("T", " ").slice(0, 19);

async function main() {
  if (!databaseUrl.startsWith("libsql:") && !databaseUrl.startsWith("https:")) {
    throw new Error("DATABASE_URL não é do Turso (libsql://...). Para o banco local, use `npx prisma migrate dev`.");
  }
  const db = createClient({ url: databaseUrl, authToken: process.env.DATABASE_AUTH_TOKEN });

  // Banco recém-criado: a tabela de histórico ainda não existe (mesma estrutura do Prisma).
  await db.execute(`CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    "id" TEXT PRIMARY KEY NOT NULL,
    "checksum" TEXT NOT NULL,
    "finished_at" DATETIME,
    "migration_name" TEXT NOT NULL,
    "logs" TEXT,
    "rolled_back_at" DATETIME,
    "started_at" DATETIME NOT NULL DEFAULT current_timestamp,
    "applied_steps_count" INTEGER UNSIGNED NOT NULL DEFAULT 0
  )`);

  const aplicadas = new Map(
    (await db.execute("SELECT migration_name, checksum FROM _prisma_migrations WHERE rolled_back_at IS NULL")).rows.map(
      (r) => [String(r.migration_name), String(r.checksum)]
    )
  );
  const nomes = (await readdir(PASTA, { withFileTypes: true }))
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  const pendentes: { nome: string; sql: Buffer }[] = [];
  const checksumDe = (sql: Buffer) => createHash("sha256").update(sql).digest("hex");
  const registrarComoAplicada = (nome: string, sql: Buffer, inicio: string) =>
    db.execute({
      sql: `INSERT INTO _prisma_migrations (id, checksum, finished_at, migration_name, started_at, applied_steps_count)
            VALUES (?, ?, ?, ?, ?, 1)`,
      args: [randomBytes(16).toString("hex"), checksumDe(sql), agora(), nome, inicio],
    });
  for (const nome of nomes) {
    const sql = await readFile(path.join(PASTA, nome, "migration.sql"));
    const checksum = checksumDe(sql);
    const registrada = aplicadas.get(nome);
    if (!registrada) pendentes.push({ nome, sql });
    else if (registrada !== checksum) console.warn(`Aviso: ${nome} foi alterada depois de aplicada (checksum diferente).`);
  }

  if (registrar) {
    const alvo = pendentes.find((p) => p.nome === registrar);
    if (!alvo) throw new Error(`${registrar} não está entre as pendentes.`);
    await registrarComoAplicada(alvo.nome, alvo.sql, agora());
    console.log(`Registrada sem executar: ${alvo.nome}`);
    return;
  }

  if (pendentes.length === 0) {
    console.log("Banco em dia: nenhuma migration pendente.");
    return;
  }
  console.log(`Migrations pendentes (${pendentes.length}):`);
  for (const { nome } of pendentes) console.log(`  ${nome}`);
  if (!aplicar) {
    console.log("\nNada foi alterado. Faça o backup e rode de novo com --aplicar.");
    return;
  }

  // Uma por vez, na ordem; para na primeira que falhar, sem registrar.
  for (const { nome, sql } of pendentes) {
    const inicio = agora();
    await db.executeMultiple(sql.toString("utf8"));
    await registrarComoAplicada(nome, sql, inicio);
    console.log(`Aplicada: ${nome}`);
  }

  const problemas = (await db.execute("PRAGMA foreign_key_check")).rows.length;
  console.log(problemas ? `Atenção: ${problemas} problema(s) de chave estrangeira.` : "Chaves estrangeiras ok.");
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exitCode = 1;
});
