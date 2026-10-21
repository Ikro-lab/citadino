import { writeFile, mkdir, readFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { get, put } from "@vercel/blob";
import sharp from "sharp";

const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads");

/**
 * Documentos de atleta (identidade e comprovante de residência, muitos de
 * menores) não podem ficar em URL pública. Eles vão para um Blob store
 * PRIVADO, separado do store público de fotos/escudos/vídeos — no Vercel Blob
 * o modo de acesso é do store inteiro, não de cada arquivo.
 *
 * No banco fica só uma referência `privado:<pathname>`; quem lê é a rota
 * autenticada /api/[tenant]/documentos/..., nunca o navegador direto.
 */
const PRIVATE_ROOT = path.join(process.cwd(), ".private-uploads");
const PRIVATE_PREFIX = "privado:";
const PUBLIC_BLOB_HOST = /\.public\.blob\.vercel-storage\.com$/;
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
 * Salva um documento sensível (identidade, comprovante) sem URL pública.
 *
 * - Com BLOB_PRIVATE_READ_WRITE_TOKEN (store privado): grava no Blob privado.
 * - Sem token nenhum (dev local): grava em `.private-uploads/`, fora de `public/`.
 * - Só com o token do store público (produção ainda não configurada): mantém o
 *   comportamento antigo, público, e avisa no log — para o cadastro não parar
 *   no meio de um campeonato enquanto o store privado não é criado.
 *
 * Retorna a referência a ser gravada no banco (`privado:...` ou, no último
 * caso, a URL pública antiga).
 */
export async function saveDocumentoPrivado(file: File, subdir: string): Promise<string> {
  if (file.size === 0) throw new Error("Arquivo vazio.");
  if (file.size > MAX_BYTES) throw new Error("Arquivo maior que 10MB.");

  const ext = EXT_BY_MIME[file.type] || path.extname(file.name) || "";
  const filename = `${randomUUID()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const contentType = file.type || "application/octet-stream";
  const pathname = `${subdir}/${filename}`;

  const privateToken = process.env.BLOB_PRIVATE_READ_WRITE_TOKEN;
  if (privateToken) {
    const blob = await put(pathname, buffer, {
      access: "private",
      contentType,
      addRandomSuffix: false,
      token: privateToken,
    });
    return `${PRIVATE_PREFIX}${blob.pathname}`;
  }

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    console.warn(
      "[storage] BLOB_PRIVATE_READ_WRITE_TOKEN não configurado: documento salvo em store PÚBLICO. " +
        "Crie um Blob store privado e configure o token."
    );
    return saveBufferToBlob(buffer, contentType, subdir, filename);
  }

  const dir = path.join(PRIVATE_ROOT, subdir);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), buffer);
  return `${PRIVATE_PREFIX}${pathname}`;
}

const CONTENT_TYPE_BY_EXT: Record<string, string> = Object.fromEntries(
  Object.entries(EXT_BY_MIME).map(([mime, ext]) => [ext, mime])
);

/**
 * Lê um documento para a rota autenticada servir. Aceita a referência nova
 * (`privado:...`) e os formatos antigos (URL do Blob público, `/uploads/...`
 * em dev), para os documentos enviados antes desta mudança continuarem
 * abrindo — agora só para quem tem permissão.
 */
export async function lerDocumento(
  ref: string
): Promise<{ body: ReadableStream<Uint8Array> | Uint8Array; contentType: string } | null> {
  if (ref.startsWith(PRIVATE_PREFIX)) {
    const pathname = ref.slice(PRIVATE_PREFIX.length);
    const privateToken = process.env.BLOB_PRIVATE_READ_WRITE_TOKEN;
    if (privateToken) {
      const result = await get(pathname, { access: "private", token: privateToken });
      if (!result || result.statusCode !== 200) return null;
      return { body: result.stream, contentType: result.blob.contentType };
    }
    return lerArquivoLocal(PRIVATE_ROOT, pathname);
  }

  if (ref.startsWith("/uploads/")) {
    return lerArquivoLocal(UPLOAD_ROOT, ref.slice("/uploads/".length));
  }

  // URL pública antiga do Blob. Só busca no host do Vercel Blob: o valor vem
  // do banco, mas não vale virar um proxy para qualquer endereço.
  let url: URL;
  try {
    url = new URL(ref);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" || !PUBLIC_BLOB_HOST.test(url.hostname)) return null;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok || !res.body) return null;
  return { body: res.body, contentType: res.headers.get("content-type") ?? "application/octet-stream" };
}

async function lerArquivoLocal(root: string, relativo: string) {
  const alvo = path.resolve(root, relativo);
  if (!alvo.startsWith(path.resolve(root) + path.sep)) return null; // bloqueia ../
  try {
    const conteudo = await readFile(alvo);
    const contentType = CONTENT_TYPE_BY_EXT[path.extname(alvo).toLowerCase()] ?? "application/octet-stream";
    return { body: new Uint8Array(conteudo), contentType };
  } catch {
    return null;
  }
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
    // Logo nunca aparece maior que isso; evita PNG de vários MB vindo de foto.
    buffer = Buffer.from(
      await sharp(original)
        .trim()
        .resize({ width: 800, height: 800, fit: "inside", withoutEnlargement: true })
        .png()
        .toBuffer()
    );
  } catch {
    // formato que o sharp não conseguiu processar (ex: SVG) — usa o original
    const ext = EXT_BY_MIME[file.type] || path.extname(file.name) || ".png";
    return saveBuffer(original, file.type || "image/png", subdir, `${randomUUID()}${ext}`);
  }

  return saveBuffer(buffer, "image/png", subdir, filename);
}
