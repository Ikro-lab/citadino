// Rótulos de exibição dos enums do banco — fonte única, usada em telas
// públicas e nos painéis. Sem imports de servidor: pode ir para o cliente.

export type StatusPartida = "AGENDADA" | "AO_VIVO" | "ENCERRADA" | "ADIADA";

export const statusPartida: Record<
  StatusPartida,
  { label: string; variant: "neutral" | "live" | "success" | "danger" }
> = {
  AGENDADA: { label: "Agendada", variant: "neutral" },
  AO_VIVO: { label: "Ao vivo", variant: "live" },
  ENCERRADA: { label: "Encerrada", variant: "success" },
  ADIADA: { label: "Adiada", variant: "danger" },
};

export type TipoEvento = "GOL" | "CARTAO_AMARELO" | "CARTAO_VERMELHO" | "SUBSTITUICAO" | "OUTRO";

export const tipoEventoLabel: Record<TipoEvento, string> = {
  GOL: "Gol",
  CARTAO_AMARELO: "Cartão amarelo",
  CARTAO_VERMELHO: "Cartão vermelho",
  SUBSTITUICAO: "Substituição",
  OUTRO: "Lance",
};

export const abasPartida = [
  { id: "detalhes", label: "Detalhes" },
  { id: "lances", label: "Linha do tempo" },
  { id: "escalacao", label: "Escalação" },
  { id: "classificacao", label: "Classificação" },
] as const;

export type AbaPartida = (typeof abasPartida)[number]["id"];

export function isAbaPartida(valor: string | undefined): valor is AbaPartida {
  return abasPartida.some((a) => a.id === valor);
}

export type PosicaoAtleta = "GOLEIRO" | "FIXO" | "ALA" | "PIVO" | "LINHA";

export const posicoes: PosicaoAtleta[] = ["GOLEIRO", "FIXO", "ALA", "PIVO", "LINHA"];

export const posicaoLabel: Record<PosicaoAtleta, string> = {
  GOLEIRO: "Goleiro",
  FIXO: "Fixo",
  ALA: "Ala",
  PIVO: "Pivô",
  LINHA: "Linha",
};
