import type { getTenantPrisma } from "@/lib/tenant-prisma";

type Db = ReturnType<typeof getTenantPrisma>;

/**
 * O número da camisa é único dentro do time (@@unique([timeId, numero])).
 * Sem esta checagem, um número repetido estoura no banco e o treinador cai
 * na página de erro, perdendo o formulário e as fotos que já escolheu.
 * Retorna a mensagem de erro, ou null se o número está livre.
 */
export async function numeroOcupado(db: Db, timeId: string, numero: number, excetoAtletaId?: string) {
  const dono = await db.atleta.findFirst({
    where: { timeId, numero, ...(excetoAtletaId && { id: { not: excetoAtletaId } }) },
    select: { nome: true },
  });
  return dono ? `O número ${numero} já é de ${dono.nome} neste time. Escolha outro número.` : null;
}

/** Dois cadastros com o mesmo número ao mesmo tempo: a checagem passa, o banco recusa. */
export function ehNumeroRepetido(e: unknown) {
  return typeof e === "object" && e !== null && (e as { code?: unknown }).code === "P2002";
}

export const MENSAGEM_NUMERO_REPETIDO = "Esse número acabou de ser usado neste time. Escolha outro número.";
