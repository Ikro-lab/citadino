import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getTenantPrisma } from "@/lib/tenant-prisma";

/**
 * Planilha com os atletas de todos os times da categoria (time, camisa e nome
 * completo), só para o ADMIN. CSV com ";" e BOM para o Excel em português abrir
 * as colunas e os acentos certos; o Google Planilhas também abre.
 */
const SEM_CACHE = { "Cache-Control": "private, no-store" };

function celula(valor: string) {
  // Nome vem de formulário público: começo com = + - @ viraria fórmula no Excel.
  const texto = /^[=+\-@]/.test(valor) ? `'${valor}` : valor;
  return /[";\r\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
}

function nomeDeArquivo(nome: string) {
  const base = nome
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
  return `atletas-${base || "categoria"}.csv`;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ tenant: string; id: string }> }
) {
  const { tenant: tenantSlug, id } = await params;

  const session = await auth();
  const user = session?.user;
  if (!user || !user.tenantId || user.tenantSlug !== tenantSlug) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401, headers: SEM_CACHE });
  }
  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "forbidden" }, { status: 403, headers: SEM_CACHE });
  }

  const db = getTenantPrisma(user.tenantId);
  const categoria = await db.categoria.findUnique({
    where: { id },
    select: {
      nome: true,
      times: {
        orderBy: { nome: "asc" },
        select: {
          nome: true,
          atletas: { orderBy: [{ numero: "asc" }, { nome: "asc" }], select: { nome: true, numero: true } },
        },
      },
    },
  });
  if (!categoria) {
    return NextResponse.json({ error: "not_found" }, { status: 404, headers: SEM_CACHE });
  }

  const linhas = [["Time", "Camisa", "Nome completo"]];
  for (const time of categoria.times) {
    for (const atleta of time.atletas) {
      linhas.push([time.nome, String(atleta.numero), atleta.nome]);
    }
  }
  const csv = "﻿" + linhas.map((l) => l.map(celula).join(";")).join("\r\n") + "\r\n";

  return new NextResponse(csv, {
    headers: {
      ...SEM_CACHE,
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${nomeDeArquivo(categoria.nome)}"`,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
