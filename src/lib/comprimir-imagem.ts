"use client";

const LADO_MAXIMO = 1600; // px — suficiente para ler um documento e para foto de perfil
const QUALIDADE_JPEG = 0.8;
const EXT_POR_TIPO: Record<string, string> = { "image/jpeg": ".jpg", "image/webp": ".webp", "image/png": ".png" };

function temTransparencia(ctx: CanvasRenderingContext2D, largura: number, altura: number) {
  const pixels = ctx.getImageData(0, 0, largura, altura).data;
  for (let i = 3; i < pixels.length; i += 4) if (pixels[i] < 255) return true;
  return false;
}

/**
 * Reduz uma foto de câmera de celular (3–8MB) para ~200–400KB antes do envio.
 * Na Vercel, o corpo de uma requisição para o servidor é limitado a 4,5MB —
 * sem isso, um formulário com 3 fotos de câmera falha em produção.
 * PDFs e arquivos que não são imagem passam direto.
 */
export async function comprimirImagem(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif" || file.type === "image/svg+xml") {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file);
    const escala = Math.min(1, LADO_MAXIMO / Math.max(bitmap.width, bitmap.height));
    const largura = Math.round(bitmap.width * escala);
    const altura = Math.round(bitmap.height * escala);

    const canvas = document.createElement("canvas");
    canvas.width = largura;
    canvas.height = altura;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, largura, altura);
    bitmap.close();

    // JPEG não tem transparência: o fundo transparente de um escudo em PNG
    // viraria preto. Imagem com transparência vai como WebP (ou PNG, nos
    // navegadores que não geram WebP) — o tipo real vem do blob.
    const formato = temTransparencia(ctx, largura, altura) ? "image/webp" : "image/jpeg";
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, formato, QUALIDADE_JPEG)
    );
    if (!blob || blob.size >= file.size) return file;

    const ext = EXT_POR_TIPO[blob.type];
    if (!ext) return file;
    const nome = file.name.replace(/\.[^.]+$/, "") + ext;
    return new File([blob], nome, { type: blob.type, lastModified: Date.now() });
  } catch {
    // Formato que o navegador não decodifica — envia o original.
    return file;
  }
}
