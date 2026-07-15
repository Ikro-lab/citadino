import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const enquete = await prisma.enquete.findUnique({
    where: { id },
    include: {
      opcoes: {
        include: {
          atleta: { select: { nome: true, time: { select: { nome: true } } } },
          _count: { select: { votos: true } },
        },
      },
    },
  });

  if (!enquete) return NextResponse.json({ error: "not_found" }, { status: 404 });

  return NextResponse.json({
    id: enquete.id,
    ativa: enquete.ativa,
    opcoes: enquete.opcoes.map((o) => ({
      id: o.id,
      atletaNome: o.atleta.nome,
      timeNome: o.atleta.time.nome,
      votos: o._count.votos,
    })),
  });
}
