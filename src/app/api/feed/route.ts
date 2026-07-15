import { NextResponse } from "next/server";
import { getFeedAgrupado, getFormaRecenteEmLote, todayStr } from "@/lib/partidas";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const data = searchParams.get("data") || todayStr();
  const soVivo = searchParams.get("vivo") === "1";

  let grupos = await getFeedAgrupado(data);
  if (soVivo) {
    grupos = grupos
      .map((g) => ({ ...g, partidas: g.partidas.filter((p) => p.status === "AO_VIVO") }))
      .filter((g) => g.partidas.length > 0);
  }

  const timeIds = grupos.flatMap((g) => g.partidas.flatMap((p) => [p.timeCasaId, p.timeForaId]));
  const forma = await getFormaRecenteEmLote(timeIds);

  return NextResponse.json({ grupos, forma });
}
