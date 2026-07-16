// Fuso de Brasília fixo (UTC-3, sem horário de verão desde 2019). O servidor
// (Vercel) roda em UTC, então qualquer cálculo de "hoje" ou de exibição de
// horário precisa declarar esse offset explicitamente — sem isso, o app
// silenciosamente assume o fuso do servidor, que é UTC em produção e BRT só
// na máquina local de quem desenvolve.
export const BRT_OFFSET = "-03:00";
export const TIMEZONE = "America/Sao_Paulo";

export function dayRange(dateStr: string) {
  const start = new Date(`${dateStr}T00:00:00${BRT_OFFSET}`);
  const end = new Date(`${dateStr}T23:59:59.999${BRT_OFFSET}`);
  return { start, end };
}

export function todayStr() {
  const BRT_OFFSET_MS = 3 * 60 * 60 * 1000;
  return new Date(Date.now() - BRT_OFFSET_MS).toISOString().slice(0, 10);
}

export function shiftDateStr(dateStr: string, deltaDays: number) {
  const d = new Date(`${dateStr}T00:00:00${BRT_OFFSET}`);
  d.setUTCDate(d.getUTCDate() + deltaDays);
  return d.toISOString().slice(0, 10);
}

/**
 * Converte o valor de um <input type="datetime-local"> (ex: "2026-07-16T19:00",
 * sem timezone) assumindo horário de Brasília, para um Date com o instante
 * absoluto correto — independente do fuso do servidor que roda o código.
 */
export function parseDatetimeLocalAsBRT(value: string): Date {
  const withSeconds = value.length === 16 ? `${value}:00` : value;
  return new Date(`${withSeconds}${BRT_OFFSET}`);
}

/**
 * Inverso de parseDatetimeLocalAsBRT: formata um Date pro valor esperado por
 * um <input type="datetime-local"> (ex: "2026-07-16T19:00"), representando o
 * horário em Brasília — pra preencher o defaultValue de um form de edição.
 */
export function formatDatetimeLocalBRT(date: Date): string {
  const BRT_OFFSET_MS = 3 * 60 * 60 * 1000;
  return new Date(date.getTime() - BRT_OFFSET_MS).toISOString().slice(0, 16);
}
