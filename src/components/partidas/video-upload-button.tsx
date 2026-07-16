"use client";

import { useState } from "react";
import { upload } from "@vercel/blob/client";
import { setEventoVideo } from "@/lib/actions/partidas";

export function VideoUploadButton({
  eventoId,
  videoUrl,
}: {
  eventoId: string;
  videoUrl: string | null;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState(videoUrl);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setPending(true);
    setError(null);
    try {
      const blob = await upload(`eventos/${eventoId}/${file.name}`, file, {
        access: "public",
        handleUploadUrl: "/api/blob/upload",
        clientPayload: JSON.stringify({ eventoId }),
      });
      await setEventoVideo(eventoId, blob.url);
      setUrl(blob.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao enviar vídeo.");
    } finally {
      setPending(false);
      e.target.value = "";
    }
  }

  if (url) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-accent underline">
        Ver vídeo
      </a>
    );
  }

  return (
    <div className="flex items-center gap-2 text-xs">
      <label className="cursor-pointer text-accent underline">
        {pending ? "Enviando vídeo..." : "Anexar vídeo"}
        <input
          type="file"
          accept="video/mp4,video/quicktime,video/webm"
          className="hidden"
          onChange={handleFile}
          disabled={pending}
        />
      </label>
      {error && <span className="text-danger">{error}</span>}
    </div>
  );
}
