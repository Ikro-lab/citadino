import { NextResponse } from "next/server";
import { getFeed, todayStr } from "@/lib/partidas";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const categoriaId = searchParams.get("categoria");
  const data = searchParams.get("data") || todayStr();

  if (!categoriaId) {
    return NextResponse.json({ error: "categoria_obrigatoria" }, { status: 400 });
  }

  const partidas = await getFeed(categoriaId, data);
  return NextResponse.json(partidas);
}
