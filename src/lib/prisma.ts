import { existsSync, mkdirSync, copyFileSync } from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const databaseUrl = process.env.DATABASE_URL ?? "file:./dev.db";

/**
 * Se o arquivo SQLite de destino ainda não existe (ex: /tmp em runtime
 * serverless, que começa vazio a cada cold start), copia um template
 * pré-populado do repositório. Isso só existe para permitir uma prévia
 * funcional em ambientes sem disco persistente (ex: Vercel) — os dados não
 * persistem entre invocações/instâncias nesse cenário. Para uso real em
 * produção, troque por um banco gerenciado (Postgres) e remova este helper.
 */
function ensureSqliteFile(url: string) {
  if (!url.startsWith("file:")) return;

  const target = url.replace(/^file:/, "");
  const absoluteTarget = path.isAbsolute(target)
    ? target
    : path.join(/* turbopackIgnore: true */ process.cwd(), target);
  if (existsSync(absoluteTarget)) return;

  const template = path.join(
    /* turbopackIgnore: true */ process.cwd(),
    "prisma",
    "seed-template.db"
  );
  if (!existsSync(template)) return;

  try {
    mkdirSync(path.dirname(absoluteTarget), { recursive: true });
    copyFileSync(template, absoluteTarget);
  } catch (error) {
    console.error("Falha ao inicializar banco SQLite a partir do template:", error);
  }
}

ensureSqliteFile(databaseUrl);

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const adapter = new PrismaBetterSqlite3({ url: databaseUrl });

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
