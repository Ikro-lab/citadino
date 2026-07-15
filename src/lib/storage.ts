import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads");
const MAX_BYTES = 10 * 1024 * 1024; // 10MB

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "application/pdf": ".pdf",
};

/**
 * Salva um upload em disco local (public/uploads) e retorna a URL pública.
 *
 * ATENÇÃO: isso só funciona em ambientes com disco persistente (dev local).
 * Em produção na Vercel (serverless, sem disco persistente) troque a
 * implementação por um provedor de object storage (Vercel Blob, Cloudinary,
 * S3/R2, etc.) — esta é a única função que precisa mudar.
 */
export async function saveUpload(file: File, subdir: string): Promise<string> {
  if (file.size === 0) throw new Error("Arquivo vazio.");
  if (file.size > MAX_BYTES) throw new Error("Arquivo maior que 10MB.");

  const ext = EXT_BY_MIME[file.type] || path.extname(file.name) || "";
  const filename = `${randomUUID()}${ext}`;
  const dir = path.join(UPLOAD_ROOT, subdir);
  await mkdir(dir, { recursive: true });

  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), bytes);

  return `/uploads/${subdir}/${filename}`;
}
