import { existsSync, mkdirSync, copyFileSync } from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const databaseUrl = process.env.DATABASE_URL ?? "file:./dev.db";
const databaseAuthToken = process.env.DATABASE_AUTH_TOKEN;
const isRemote = databaseUrl.startsWith("libsql:") || databaseUrl.startsWith("https:");

/**
 * Se o arquivo SQLite local ainda não existe, copia um template pré-populado
 * do repositório. Só se aplica a `file:` (dev local) — em produção o banco é
 * remoto (Turso/libSQL, ver DATABASE_URL/DATABASE_AUTH_TOKEN no README).
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

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

if (!isRemote) ensureSqliteFile(databaseUrl);

const adapter = isRemote
  ? new PrismaLibSql({ url: databaseUrl, authToken: databaseAuthToken })
  : new PrismaBetterSqlite3({ url: databaseUrl });

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
