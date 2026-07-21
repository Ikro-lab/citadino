import { prisma } from "../src/lib/prisma";
import type { Posicao, TipoEvento, FasePartida } from "@prisma/client";

/**
 * Cadastra as semifinais, disputa de 3º lugar e final da Copa do Mundo 2026
 * na categoria Masculino Livre (times já trocados pelas seleções em
 * scripts/atualizar-times-copa-2026.ts). Dados vindos de
 * copa_do_mundo_2026_fase_final_1.txt (placar, gols, cartões).
 *
 * Jogadores que entraram como reserva e não faziam parte da escalação titular
 * migrada são criados aqui antes de lançar os eventos.
 */

const novosJogadores: { time: string; nome: string; numero: number; posicao: Posicao }[] = [
  { time: "Espanha", nome: "Ferran Torres", numero: 7, posicao: "ALA" },
  { time: "Inglaterra", nome: "Anthony Gordon", numero: 20, posicao: "ALA" },
  { time: "Inglaterra", nome: "Elliot Anderson", numero: 18, posicao: "LINHA" },
  { time: "Inglaterra", nome: "Jude Bellingham", numero: 10, posicao: "LINHA" },
  { time: "Argentina", nome: "Lautaro Martínez", numero: 22, posicao: "PIVO" },
  { time: "Argentina", nome: "Leandro Paredes", numero: 5, posicao: "LINHA" },
];

type EventoInput = {
  tipo: TipoEvento;
  minuto: number;
  jogador: string;
  time: string;
  descricao?: string;
};

type PartidaInput = {
  fase: FasePartida;
  casa: string;
  fora: string;
  placarCasa: number;
  placarFora: number;
  dataHora: string; // ISO
  local: string;
  eventos: EventoInput[];
};

const partidas: PartidaInput[] = [
  {
    fase: "SEMIFINAL",
    casa: "França",
    fora: "Espanha",
    placarCasa: 0,
    placarFora: 2,
    dataHora: "2026-07-14T17:00:00-03:00",
    local: "AT&T Stadium, Dallas (EUA)",
    eventos: [
      { tipo: "GOL", minuto: 21, jogador: "Mikel Oyarzabal", time: "Espanha", descricao: "Cobrança de pênalti" },
      { tipo: "GOL", minuto: 57, jogador: "Pedro Porro", time: "Espanha", descricao: "12' do 2º tempo" },
      { tipo: "CARTAO_AMARELO", minuto: 8, jogador: "Adrien Rabiot", time: "França" },
      { tipo: "CARTAO_AMARELO", minuto: 30, jogador: "Marc Cucurella", time: "Espanha" },
      { tipo: "CARTAO_AMARELO", minuto: 85, jogador: "Kylian Mbappé", time: "França", descricao: "40' do 2º tempo" },
    ],
  },
  {
    fase: "SEMIFINAL",
    casa: "Inglaterra",
    fora: "Argentina",
    placarCasa: 1,
    placarFora: 2,
    dataHora: "2026-07-15T17:00:00-03:00",
    local: "Mercedes-Benz Stadium, Atlanta (EUA)",
    eventos: [
      { tipo: "GOL", minuto: 55, jogador: "Anthony Gordon", time: "Inglaterra", descricao: "10' do 2º tempo" },
      { tipo: "GOL", minuto: 85, jogador: "Enzo Fernández", time: "Argentina", descricao: "40' do 2º tempo" },
      { tipo: "GOL", minuto: 90, jogador: "Lautaro Martínez", time: "Argentina", descricao: "Acréscimos finais do 2º tempo" },
      { tipo: "CARTAO_AMARELO", minuto: 37, jogador: "Elliot Anderson", time: "Inglaterra" },
      { tipo: "CARTAO_AMARELO", minuto: 42, jogador: "Lisandro Martínez", time: "Argentina" },
    ],
  },
  {
    fase: "TERCEIRO_LUGAR",
    casa: "França",
    fora: "Inglaterra",
    placarCasa: 4,
    placarFora: 6,
    dataHora: "2026-07-18T17:00:00-03:00",
    local: "Hard Rock Stadium, Miami (EUA)",
    eventos: [
      { tipo: "GOL", minuto: 3, jogador: "Declan Rice", time: "Inglaterra" },
      { tipo: "GOL", minuto: 18, jogador: "Ezri Konsa", time: "Inglaterra" },
      { tipo: "GOL", minuto: 36, jogador: "Bukayo Saka", time: "Inglaterra" },
      { tipo: "GOL", minuto: 46, jogador: "Bukayo Saka", time: "Inglaterra", descricao: "Acréscimos do 1º tempo" },
      { tipo: "GOL", minuto: 47, jogador: "Kylian Mbappé", time: "França", descricao: "1' do 2º tempo" },
      { tipo: "GOL", minuto: 54, jogador: "Bradley Barcola", time: "França", descricao: "9' do 2º tempo" },
      { tipo: "GOL", minuto: 66, jogador: "Kylian Mbappé", time: "França", descricao: "21' do 2º tempo" },
      { tipo: "GOL", minuto: 84, jogador: "Bukayo Saka", time: "Inglaterra", descricao: "39' do 2º tempo, cobrança de pênalti" },
      { tipo: "GOL", minuto: 90, jogador: "Ousmane Dembélé", time: "França", descricao: "Acréscimos do 2º tempo" },
      { tipo: "GOL", minuto: 91, jogador: "Jude Bellingham", time: "Inglaterra", descricao: "Acréscimos do 2º tempo, logo após o gol de Dembélé" },
    ],
  },
  {
    fase: "FINAL",
    casa: "Espanha",
    fora: "Argentina",
    placarCasa: 1,
    placarFora: 0,
    dataHora: "2026-07-19T17:00:00-03:00",
    local: "MetLife Stadium, Nova Jersey (EUA)",
    eventos: [
      {
        tipo: "GOL",
        minuto: 106,
        jogador: "Ferran Torres",
        time: "Espanha",
        descricao: "Gol na prorrogação (1' do 2º tempo extra), assistência de Nico Williams",
      },
      { tipo: "CARTAO_AMARELO", minuto: 60, jogador: "Lisandro Martínez", time: "Argentina", descricao: "Minuto aproximado, não divulgado pela fonte" },
      { tipo: "CARTAO_AMARELO", minuto: 65, jogador: "Enzo Fernández", time: "Argentina", descricao: "Minuto aproximado, não divulgado pela fonte" },
      { tipo: "CARTAO_AMARELO", minuto: 70, jogador: "Leandro Paredes", time: "Argentina", descricao: "Minuto aproximado, não divulgado pela fonte" },
      { tipo: "CARTAO_AMARELO", minuto: 75, jogador: "Alexis Mac Allister", time: "Argentina", descricao: "Minuto aproximado, não divulgado pela fonte" },
      { tipo: "CARTAO_VERMELHO", minuto: 78, jogador: "Enzo Fernández", time: "Argentina", descricao: "Minuto aproximado, não divulgado pela fonte" },
      { tipo: "CARTAO_VERMELHO", minuto: 82, jogador: "Leandro Paredes", time: "Argentina", descricao: "Minuto aproximado, não divulgado pela fonte" },
    ],
  },
];

async function main() {
  const categoria = await prisma.categoria.findFirstOrThrow({ where: { nome: "Masculino Livre" } });

  const times = new Map<string, { id: string }>();
  for (const nome of ["França", "Espanha", "Inglaterra", "Argentina"]) {
    times.set(nome, await prisma.time.findFirstOrThrow({ where: { nome } }));
  }

  for (const j of novosJogadores) {
    const timeId = times.get(j.time)!.id;
    const existente = await prisma.atleta.findFirst({ where: { timeId, nome: j.nome } });
    if (existente) continue;
    await prisma.atleta.create({
      data: {
        nome: j.nome,
        numero: j.numero,
        posicao: j.posicao,
        timeId,
      },
    });
    console.log(`Jogador criado: ${j.nome} (${j.time})`);
  }

  async function acharAtleta(time: string, nome: string) {
    const timeId = times.get(time)!.id;
    return prisma.atleta.findFirstOrThrow({ where: { timeId, nome } });
  }

  for (const p of partidas) {
    const timeCasa = times.get(p.casa)!;
    const timeFora = times.get(p.fora)!;

    const partida = await prisma.partida.create({
      data: {
        categoriaId: categoria.id,
        timeCasaId: timeCasa.id,
        timeForaId: timeFora.id,
        dataHora: new Date(p.dataHora),
        local: p.local,
        fase: p.fase,
        status: "ENCERRADA",
        placarCasa: p.placarCasa,
        placarFora: p.placarFora,
      },
    });

    for (const e of p.eventos) {
      const atleta = await acharAtleta(e.time, e.jogador);
      const timeId = times.get(e.time)!.id;
      await prisma.eventoPartida.create({
        data: {
          partidaId: partida.id,
          tipo: e.tipo,
          minuto: e.minuto,
          timeId,
          atletaId: atleta.id,
          descricao: e.descricao ?? null,
        },
      });
    }

    console.log(
      `Partida criada: ${p.casa} ${p.placarCasa} x ${p.placarFora} ${p.fora} (${p.fase}), ${p.eventos.length} eventos.`
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
