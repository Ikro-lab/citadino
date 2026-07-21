import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { put } from "@vercel/blob";
import sharp from "sharp";

const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads");
const MAX_BYTES = 10 * 1024 * 1024; // 10MB

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "application/pdf": ".pdf",
};

async function saveBufferToBlob(
  buffer: Buffer,
  contentType: string,
  subdir: string,
  filename: string
): Promise<string> {
  const blob = await put(`${subdir}/${filename}`, buffer, {
    access: "public",
    contentType,
    addRandomSuffix: false,
  });
  return blob.url;
}

async function saveBufferToLocalDisk(buffer: Buffer, subdir: string, filename: string): Promise<string> {
  const dir = path.join(UPLOAD_ROOT, subdir);
  await mkdir(dir, { recursive: true });

  await writeFile(path.join(dir, filename), buffer);

  return `/uploads/${subdir}/${filename}`;
}

async function saveBuffer(buffer: Buffer, contentType: string, subdir: string, filename: string) {
  return process.env.BLOB_READ_WRITE_TOKEN
    ? saveBufferToBlob(buffer, contentType, subdir, filename)
    : saveBufferToLocalDisk(buffer, subdir, filename);
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
  const buffer = Buffer.from(await file.arrayBuffer());

  return saveBuffer(buffer, file.type || "application/octet-stream", subdir, filename);
}

/**
 * Salva um logo de patrocinador, recortando automaticamente a margem em
 * branco/transparente ao redor (comum em logos exportados com padding),
 * pra não sobrar espaço vazio quando exibido em tamanho fixo no site.
 */
export async function saveLogoUpload(file: File, subdir: string): Promise<string> {
  if (file.size === 0) throw new Error("Arquivo vazio.");
  if (file.size > MAX_BYTES) throw new Error("Arquivo maior que 10MB.");

  const original = Buffer.from(await file.arrayBuffer());
  const filename = `${randomUUID()}.png`;

  let buffer = original;
  try {
    buffer = Buffer.from(await sharp(original).trim().png().toBuffer());
  } catch {
    // formato que o sharp não conseguiu processar (ex: SVG) — usa o original
    const ext = EXT_BY_MIME[file.type] || path.extname(file.name) || ".png";
    return saveBuffer(original, file.type || "image/png", subdir, `${randomUUID()}${ext}`);
  }

  return saveBuffer(buffer, "image/png", subdir, filename);
}
