import "server-only";
import { prisma } from "@/lib/prisma";
import { apagarArquivos } from "@/lib/storage";

type ComArquivos = {
  fotoUrl?: string | null;
  documentoUrl?: string | null;
  comprovanteEnderecoUrl?: string | null;
};

export const selectArquivos = { fotoUrl: true, documentoUrl: true, comprovanteEnderecoUrl: true } as const;

/** Referências de arquivo (foto, documento, comprovante) de um conjunto de linhas. */
export function refsDe(linhas: ComArquivos[]) {
  const refs = new Set<string>();
  for (const l of linhas) {
    for (const v of [l.fotoUrl, l.documentoUrl, l.comprovanteEnderecoUrl]) if (v) refs.add(v);
  }
  return refs;
}

/**
 * Chame DEPOIS de apagar as linhas do banco. A inscrição aprovada copia as
 * mesmas referências para o atleta, então um arquivo só é apagado quando
 * nenhum atleta nem inscrição restante ainda aponta para ele.
 */
export async function apagarArquivosSemUso(refs: Set<string>) {
  if (refs.size === 0) return;
  const lista = [...refs];
  const filtro = {
    OR: [{ fotoUrl: { in: lista } }, { documentoUrl: { in: lista } }, { comprovanteEnderecoUrl: { in: lista } }],
  };
  const [atletas, inscricoes] = await Promise.all([
    prisma.atleta.findMany({ where: filtro, select: selectArquivos }),
    prisma.inscricaoAtleta.findMany({ where: filtro, select: selectArquivos }),
  ]);
  const emUso = refsDe([...atletas, ...inscricoes]);
  await apagarArquivos(lista.filter((r) => !emUso.has(r)));
}
