"use client";

const LADO_MAXIMO = 1600; // px — suficiente para ler um documento e para foto de perfil
const QUALIDADE_JPEG = 0.8;

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

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", QUALIDADE_JPEG)
    );
    if (!blob || blob.size >= file.size) return file;

    const nome = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], nome, { type: "image/jpeg", lastModified: Date.now() });
  } catch {
    // Formato que o navegador não decodifica — envia o original.
    return file;
  }
}
