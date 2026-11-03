/**
 * Previsão de início dos jogos que ainda não começaram, pelo atraso dos jogos
 * anteriores do mesmo dia e local (quadra única: um jogo depois do outro).
 * Não muda o horário marcado (dataHora): é só o que o feed e a página da
 * partida mostram ao lado dele.
 *
 * Cada jogo começa, no mínimo, no horário marcado e depois que o anterior
 * ocupou o seu espaço na tabela (início real ou previsto + intervalo até o
 * jogo seguinte). O próximo jogo a começar também não começa antes de agora:
 * se o anterior passou do tempo ou ninguém tocou em "Iniciar partida", o
 * atraso cresce com o relógio.
 */

type JogoDoDia = {
  id: string;
  dataHora: Date | string;
  iniciadaEm?: Date | string | null;
  status: string;
  local?: string | null;
};

const MINUTO = 60_000;
/** Intervalo maior que isso entre dois jogos é pausa na tabela e absorve o atraso. */
const ESPACO_MAXIMO = 60 * MINUTO;
/** Atraso menor que isso não aparece. */
const ATRASO_MINIMO = 5 * MINUTO;
/** Atraso maior que isso é jogo que ninguém iniciou no app (dado não confiável). */
const ATRASO_MAXIMO = 3 * 60 * MINUTO;
const ARREDONDAR = 5 * MINUTO;

/** id da partida → início previsto (só jogos agendados com atraso que vale mostrar). */
export function previsoesDeInicio(jogos: JogoDoDia[], agora = Date.now()): Map<string, Date> {
  const previsoes = new Map<string, Date>();
  const porLocal = new Map<string, JogoDoDia[]>();
  for (const j of jogos) {
    if (j.status === "ADIADA") continue;
    const local = (j.local ?? "").trim().toLowerCase();
    porLocal.set(local, [...(porLocal.get(local) ?? []), j]);
  }

  for (const lista of porLocal.values()) {
    lista.sort((a, b) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime());
    // Jogo agendado antes de um que já começou foi trocado de ordem ou jogado
    // sem súmula: não dá para prever.
    const ultimoIniciado = lista.findLastIndex((j) => j.status !== "AGENDADA");
    let liberaEm: number | null = null;
    let proximoAComecar = true;

    lista.forEach((jogo, i) => {
      const marcado = new Date(jogo.dataHora).getTime();
      let inicio: number;
      if (jogo.status !== "AGENDADA") {
        inicio = new Date(jogo.iniciadaEm ?? jogo.dataHora).getTime();
        proximoAComecar = true;
      } else if (i < ultimoIniciado) {
        inicio = marcado;
      } else {
        inicio = Math.max(marcado, liberaEm ?? marcado);
        if (proximoAComecar) inicio = Math.max(inicio, agora);
        proximoAComecar = false;
        const atraso = inicio - marcado;
        if (atraso >= ATRASO_MINIMO && atraso <= ATRASO_MAXIMO) {
          previsoes.set(jogo.id, new Date(Math.ceil(inicio / ARREDONDAR) * ARREDONDAR));
        }
      }

      const seguinte = lista[i + 1];
      const espaco = seguinte ? new Date(seguinte.dataHora).getTime() - marcado : 0;
      liberaEm = inicio + Math.min(espaco, ESPACO_MAXIMO);
    });
  }
  return previsoes;
}
