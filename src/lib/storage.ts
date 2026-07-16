import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { put } from "@vercel/blob";

const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads");
const MAX_BYTES = 10 * 1024 * 1024; // 10MB

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "application/pdf": ".pdf",
};

async function saveToBlob(file: File, subdir: string, filename: string): Promise<string> {
  const blob = await put(`${subdir}/${filename}`, file, {
    access: "public",
    contentType: file.type || undefined,
    addRandomSuffix: false,
  });
  return blob.url;
}

async function saveToLocalDisk(file: File, subdir: string, filename: string): Promise<string> {
  const dir = path.join(UPLOAD_ROOT, subdir);
  await mkdir(dir, { recursive: true });

  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), bytes);

  return `/uploads/${subdir}/${filename}`;
}

/**
 * Salva um upload (foto, documento, PDF) e retorna a URL pública.
 *
 * Usa o Vercel Blob quando BLOB_READ_WRITE_TOKEN está configurado (produção);
 * cai para disco local (public/uploads) quando não está, pra dev local
 * funcionar sem depender de uma conta Blob.
 */
export async function saveUpload(file: File, subdir: string): Promise<string> {
  if (file.size === 0) throw new Error("Arquivo vazio.");
  if (file.size > MAX_BYTES) throw new Error("Arquivo maior que 10MB.");

  const ext = EXT_BY_MIME[file.type] || path.extname(file.name) || "";
  const filename = `${randomUUID()}${ext}`;

  return process.env.BLOB_READ_WRITE_TOKEN
    ? saveToBlob(file, subdir, filename)
    : saveToLocalDisk(file, subdir, filename);
}
