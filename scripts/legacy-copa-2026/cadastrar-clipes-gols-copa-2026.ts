import { prisma } from "../../src/lib/prisma";

/**
 * Preenche o videoUrl de cada gol das partidas da fase final da Copa 2026
 * (ver scripts/cadastrar-fase-final-copa-2026.ts) com o link do YouTube +
 * timestamp (&t=Xs) informado pelo usuário.
 */

type ClipeInput = {
  fase: string;
  casa: string;
  fora: string;
  videoId: string;
  gols: { jogador: string; minuto: number; segundos: number }[];
};

const clipes: ClipeInput[] = [
  {
    fase: "SEMIFINAL",
    casa: "França",
    fora: "Espanha",
    videoId: "_cV8QcKp3GU",
    gols: [
      { jogador: "Mikel Oyarzabal", minuto: 21, segundos: 15 },
      { jogador: "Pedro Porro", minuto: 57, segundos: 51 },
    ],
  },
  {
    fase: "SEMIFINAL",
    casa: "Inglaterra",
    fora: "Argentina",
    videoId: "oB2mK8eJli4",
    gols: [
      { jogador: "Anthony Gordon", minuto: 55, segundos: 33 },
      { jogador: "Enzo Fernández", minuto: 85, segundos: 83 },
      { jogador: "Lautaro Martínez", minuto: 90, segundos: 100 },
    ],
  },
  {
    fase: "TERCEIRO_LUGAR",
    casa: "França",
    fora: "Inglaterra",
    videoId: "ewJg4VMt020",
    gols: [
      { jogador: "Declan Rice", minuto: 3, segundos: 42 },
      { jogador: "Ezri Konsa", minuto: 18, segundos: 230 },
      { jogador: "Bukayo Saka", minuto: 36, segundos: 450 },
      { jogador: "Bukayo Saka", minuto: 46, segundos: 545 },
      { jogador: "Kylian Mbappé", minuto: 47, segundos: 625 },
      { jogador: "Bradley Barcola", minuto: 54, segundos: 730 },
      { jogador: "Kylian Mbappé", minuto: 66, segundos: 930 },
      { jogador: "Bukayo Saka", minuto: 84, segundos: 1150 },
      { jogador: "Ousmane Dembélé", minuto: 90, segundos: 1215 },
      { jogador: "Jude Bellingham", minuto: 91, segundos: 1281 },
    ],
  },
  {
    fase: "FINAL",
    casa: "Espanha",
    fora: "Argentina",
    videoId: "6HaHNYjnghE",
    gols: [{ jogador: "Ferran Torres", minuto: 106, segundos: 69 }],
  },
];

async function main() {
  for (const c of clipes) {
    const timeCasa = await prisma.time.findFirstOrThrow({ where: { nome: c.casa } });
    const timeFora = await prisma.time.findFirstOrThrow({ where: { nome: c.fora } });

    const partida = await prisma.partida.findFirstOrThrow({
      where: {
        fase: c.fase as never,
        timeCasaId: timeCasa.id,
        timeForaId: timeFora.id,
      },
    });

    for (const g of c.gols) {
      const atleta = await prisma.atleta.findFirstOrThrow({
        where: { nome: g.jogador },
      });

      const evento = await prisma.eventoPartida.findFirstOrThrow({
        where: {
          partidaId: partida.id,
          atletaId: atleta.id,
          minuto: g.minuto,
          tipo: "GOL",
        },
      });

      const videoUrl = `https://www.youtube.com/watch?v=${c.videoId}&t=${g.segundos}s`;
      await prisma.eventoPartida.update({
        where: { id: evento.id },
        data: { videoUrl },
      });

      console.log(`${c.casa} x ${c.fora}: ${g.jogador} (${g.minuto}') -> ${videoUrl}`);
    }
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
