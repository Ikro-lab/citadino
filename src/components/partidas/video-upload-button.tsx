"use client";

import { useState } from "react";
import { PlayCircle, Video } from "lucide-react";
import { upload } from "@vercel/blob/client";
import { setEventoVideo } from "@/lib/actions/partidas";
import { VIDEO_MAX_BYTES, VIDEO_MAX_MB } from "@/lib/video-limits";

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

    if (file.size > VIDEO_MAX_BYTES) {
      setError(
        `Vídeo com ${Math.round(file.size / 1024 / 1024)}MB; o limite é ${VIDEO_MAX_MB}MB. Corte só o lance (até 20s) ou envie a versão que passou pelo WhatsApp.`
      );
      e.target.value = "";
      return;
    }

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
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-accent hover:bg-accent-soft"
      >
        <PlayCircle size={16} />
        Ver vídeo
      </a>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <label
        className={`inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-lg border border-border px-3 text-sm font-semibold hover:bg-field ${pending ? "pointer-events-none opacity-60" : ""}`}
      >
        <Video size={16} />
        {pending ? "Enviando..." : "Anexar vídeo"}
        <input
          type="file"
          accept="video/mp4,video/quicktime,video/webm"
          className="hidden"
          onChange={handleFile}
          disabled={pending}
        />
      </label>
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  );
}
