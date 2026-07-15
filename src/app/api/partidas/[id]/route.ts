import { NextResponse } from "next/server";
import { getPartidaDetalhe } from "@/lib/partidas";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const partida = await getPartidaDetalhe(id);
  if (!partida) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json(partida);
}
