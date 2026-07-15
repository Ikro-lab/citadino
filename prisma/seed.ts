import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient, type Posicao } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

const NOMES_TIMES_MASC = ["Real Bairro FC", "Unidos da Vila", "Furacão FC", "Atlético Central"];
const NOMES_TIMES_FEM = ["Estrela FC", "Guerreiras do Norte", "Fênix Futsal", "Águias FC"];

const NOMES_JOGADORES = [
  "João", "Pedro", "Lucas", "Mateus", "Gabriel", "Rafael", "Bruno", "Diego",
  "Maria", "Ana", "Julia", "Camila", "Beatriz", "Larissa", "Fernanda", "Patrícia",
];

const POSICOES: Posicao[] = ["GOLEIRO", "FIXO", "ALA", "ALA", "PIVO"];

async function criarElenco(timeId: string) {
  for (let numero = 1; numero <= 8; numero++) {
    const nome = `${NOMES_JOGADORES[(numero * 3) % NOMES_JOGADORES.length]} ${numero}`;
    await prisma.atleta.create({
      data: {
        nome,
        numero,
        posicao: POSICOES[numero % POSICOES.length],
        timeId,
      },
    });
  }
}

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@citadino.local";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "Administrador",
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 10),
      role: "ADMIN",
    },
  });

  const treinadorEmail = "treinador@citadino.local";
  const treinador = await prisma.user.upsert({
    where: { email: treinadorEmail },
    update: {},
    create: {
      name: "Carlos Treinador",
      email: treinadorEmail,
      passwordHash: await bcrypt.hash("treinador123", 10),
      role: "TREINADOR",
    },
  });

  const campeonato = await prisma.campeonato.create({
    data: { nome: "Campeonato Citadino", temporada: "2026", ativo: true },
  });

  const categoriaMasc = await prisma.categoria.create({
    data: { nome: "Masculino Livre", campeonatoId: campeonato.id },
  });
  const categoriaFem = await prisma.categoria.create({
    data: { nome: "Feminino", campeonatoId: campeonato.id },
  });

  const timesMasc = [];
  for (const nome of NOMES_TIMES_MASC) {
    const time = await prisma.time.create({
      data: { nome, categoriaId: categoriaMasc.id },
    });
    await criarElenco(time.id);
    timesMasc.push(time);
  }
  // link the demo treinador to the first men's team
  await prisma.time.update({
    where: { id: timesMasc[0].id },
    data: { treinadorId: treinador.id },
  });

  const timesFem = [];
  for (const nome of NOMES_TIMES_FEM) {
    const time = await prisma.time.create({
      data: { nome, categoriaId: categoriaFem.id },
    });
    await criarElenco(time.id);
    timesFem.push(time);
  }

  const now = new Date();
  const hoje = (h: number, m = 0) => {
    const d = new Date(now);
    d.setHours(h, m, 0, 0);
    return d;
  };
  const diasAtras = (dias: number, h = 19) => {
    const d = new Date(now);
    d.setDate(d.getDate() - dias);
    d.setHours(h, 0, 0, 0);
    return d;
  };
  const diasNaFrente = (dias: number, h = 19) => {
    const d = new Date(now);
    d.setDate(d.getDate() + dias);
    d.setHours(h, 0, 0, 0);
    return d;
  };

  // Encerrada — alimenta a classificação
  const encerrada1 = await prisma.partida.create({
    data: {
      categoriaId: categoriaMasc.id,
      timeCasaId: timesMasc[0].id,
      timeForaId: timesMasc[1].id,
      dataHora: diasAtras(7),
      local: "Ginásio Municipal",
      rodada: 1,
      status: "ENCERRADA",
      placarCasa: 3,
      placarFora: 1,
    },
  });
  await prisma.eventoPartida.createMany({
    data: [
      { partidaId: encerrada1.id, tipo: "GOL", minuto: 5, timeId: timesMasc[0].id },
      { partidaId: encerrada1.id, tipo: "GOL", minuto: 18, timeId: timesMasc[1].id },
      { partidaId: encerrada1.id, tipo: "CARTAO_AMARELO", minuto: 22, timeId: timesMasc[1].id },
      { partidaId: encerrada1.id, tipo: "GOL", minuto: 30, timeId: timesMasc[0].id },
      { partidaId: encerrada1.id, tipo: "GOL", minuto: 39, timeId: timesMasc[0].id },
    ],
  });

  const encerrada2 = await prisma.partida.create({
    data: {
      categoriaId: categoriaMasc.id,
      timeCasaId: timesMasc[2].id,
      timeForaId: timesMasc[3].id,
      dataHora: diasAtras(7, 20),
      local: "Ginásio Municipal",
      rodada: 1,
      status: "ENCERRADA",
      placarCasa: 2,
      placarFora: 2,
    },
  });
  await prisma.eventoPartida.createMany({
    data: [
      { partidaId: encerrada2.id, tipo: "GOL", minuto: 10, timeId: timesMasc[2].id },
      { partidaId: encerrada2.id, tipo: "GOL", minuto: 20, timeId: timesMasc[3].id },
      { partidaId: encerrada2.id, tipo: "GOL", minuto: 25, timeId: timesMasc[2].id },
      { partidaId: encerrada2.id, tipo: "CARTAO_VERMELHO", minuto: 35, timeId: timesMasc[3].id },
      { partidaId: encerrada2.id, tipo: "GOL", minuto: 40, timeId: timesMasc[3].id },
    ],
  });

  // Ao vivo agora — demonstra feed/detalhe/súmula em tempo real
  const aoVivo = await prisma.partida.create({
    data: {
      categoriaId: categoriaMasc.id,
      timeCasaId: timesMasc[0].id,
      timeForaId: timesMasc[2].id,
      dataHora: hoje(now.getHours()),
      local: "Ginásio Municipal",
      rodada: 2,
      status: "AO_VIVO",
      placarCasa: 1,
      placarFora: 0,
    },
  });
  await prisma.eventoPartida.create({
    data: { partidaId: aoVivo.id, tipo: "GOL", minuto: 12, timeId: timesMasc[0].id },
  });

  // Agendada — hoje mais tarde
  await prisma.partida.create({
    data: {
      categoriaId: categoriaFem.id,
      timeCasaId: timesFem[0].id,
      timeForaId: timesFem[1].id,
      dataHora: hoje(now.getHours() + 2),
      local: "Ginásio Municipal",
      rodada: 1,
      status: "AGENDADA",
    },
  });

  // Agendada — próximos dias
  await prisma.partida.create({
    data: {
      categoriaId: categoriaFem.id,
      timeCasaId: timesFem[2].id,
      timeForaId: timesFem[3].id,
      dataHora: diasNaFrente(2),
      local: "Ginásio Municipal",
      rodada: 1,
      status: "AGENDADA",
    },
  });
  await prisma.partida.create({
    data: {
      categoriaId: categoriaMasc.id,
      timeCasaId: timesMasc[1].id,
      timeForaId: timesMasc[3].id,
      dataHora: diasNaFrente(3),
      local: "Ginásio Municipal",
      rodada: 2,
      status: "AGENDADA",
    },
  });

  console.log("Seed concluído.");
  console.log(`Admin: ${adminEmail} / ${adminPassword}`);
  console.log(`Treinador demo: ${treinadorEmail} / treinador123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
