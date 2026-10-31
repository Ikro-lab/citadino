import type { LinhaClassificacao } from "@/lib/classificacao";

/**
 * Chaveamento do mata-mata da tabela oficial (Cidreira 2026), montado pela
 * classificação do momento: antes do mata-mata ter jogos cadastrados, a página
 * mostra quem se enfrentaria "se a fase de grupos terminasse agora".
 *
 * - Masculino Livre: 2 primeiros de cada grupo + 2 melhores terceiros, em
 *   ordem geral de campanha (1º a 8º); quartas 1x8, 2x7, 3x6, 4x5; semis
 *   venc. (1x8) x venc. (4x5) e venc. (2x7) x venc. (3x6).
 * - Veterano e Feminino Livre: 4 melhores; semis 1x4 e 2x3.
 * Categorias fora desta lista não têm chaveamento projetado.
 */
const FORMATOS: Record<string, { vagas: 4 | 8; porGrupo?: number }> = {
  "Masculino Livre": { vagas: 8, porGrupo: 2 },
  Veterano: { vagas: 4 },
  "Feminino Livre": { vagas: 4 },
};

export type Vaga = { semente: number; time: { timeId: string; nome: string } | null };
export type ConfrontoProjetado = { rotulo: string; casa: Vaga | string; fora: Vaga | string };
export type FaseProjetada = { fase: "QUARTAS" | "SEMIFINAL" | "FINAL"; jogos: ConfrontoProjetado[] };

const porCampanha = (a: LinhaClassificacao, b: LinhaClassificacao) =>
  b.pontos - a.pontos || b.saldoGols - a.saldoGols || b.golsPro - a.golsPro || a.nome.localeCompare(b.nome);

/** Classificados em ordem de semente (1º primeiro). Grupos já vêm ordenados. */
function classificados(grupos: LinhaClassificacao[][], vagas: number, porGrupo?: number) {
  if (!porGrupo) return grupos.flat().sort(porCampanha).slice(0, vagas);
  const diretos = grupos.flatMap((g) => g.slice(0, porGrupo));
  const repescagem = grupos
    .map((g) => g[porGrupo])
    .filter((l): l is LinhaClassificacao => !!l)
    .sort(porCampanha)
    .slice(0, Math.max(0, vagas - diretos.length));
  return [...diretos, ...repescagem].sort(porCampanha);
}

export function chaveamentoProjetado(categoriaNome: string, grupos: LinhaClassificacao[][]): FaseProjetada[] | null {
  const formato = FORMATOS[categoriaNome];
  if (!formato) return null;
  const lista = classificados(grupos, formato.vagas, formato.porGrupo);
  const vaga = (semente: number): Vaga => {
    const l = lista[semente - 1];
    return { semente, time: l ? { timeId: l.timeId, nome: l.nome } : null };
  };

  if (formato.vagas === 8) {
    return [
      {
        fase: "QUARTAS",
        jogos: [
          { rotulo: "Jogo 1", casa: vaga(1), fora: vaga(8) },
          { rotulo: "Jogo 2", casa: vaga(2), fora: vaga(7) },
          { rotulo: "Jogo 3", casa: vaga(3), fora: vaga(6) },
          { rotulo: "Jogo 4", casa: vaga(4), fora: vaga(5) },
        ],
      },
      {
        fase: "SEMIFINAL",
        jogos: [
          { rotulo: "Semi 1", casa: "Venc. jogo 1", fora: "Venc. jogo 4" },
          { rotulo: "Semi 2", casa: "Venc. jogo 2", fora: "Venc. jogo 3" },
        ],
      },
      { fase: "FINAL", jogos: [{ rotulo: "Final", casa: "Venc. semi 1", fora: "Venc. semi 2" }] },
    ];
  }
  return [
    {
      fase: "SEMIFINAL",
      jogos: [
        { rotulo: "Semi 1", casa: vaga(1), fora: vaga(4) },
        { rotulo: "Semi 2", casa: vaga(2), fora: vaga(3) },
      ],
    },
    { fase: "FINAL", jogos: [{ rotulo: "Final", casa: "Venc. semi 1", fora: "Venc. semi 2" }] },
  ];
}
