import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { assertPodeEditarEvento } from "@/lib/actions/partidas";

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const { eventoId } = JSON.parse(clientPayload || "{}") as { eventoId?: string };
        if (!eventoId) throw new Error("eventoId ausente.");
        await assertPodeEditarEvento(eventoId);

        return {
          allowedContentTypes: ["video/mp4", "video/quicktime", "video/webm"],
          maximumSizeInBytes: 200 * 1024 * 1024,
          addRandomSuffix: false,
          tokenPayload: clientPayload,
        };
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Falha no upload." },
      { status: 400 }
    );
  }
}
