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
  const atletas = [];
  for (let numero = 1; numero <= 8; numero++) {
    const nome = `${NOMES_JOGADORES[(numero * 3) % NOMES_JOGADORES.length]} ${numero}`;
    const atleta = await prisma.atleta.create({
      data: {
        nome,
        numero,
        posicao: POSICOES[numero % POSICOES.length],
        timeId,
      },
    });
    atletas.push(atleta);
  }
  return atletas;
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
    data: { nome: "Masculino Livre", campeonatoId: campeonato.id, cartoesParaSuspensao: 3 },
  });
  const categoriaFem = await prisma.categoria.create({
    data: {
      nome: "Feminino",
      campeonatoId: campeonato.id,
      formato: "GRUPOS_MATA_MATA",
      classificadosPorGrupo: 1,
    },
  });

  const timesMasc = [];
  const elencosMasc: Record<string, Awaited<ReturnType<typeof criarElenco>>> = {};
  for (const nome of NOMES_TIMES_MASC) {
    const time = await prisma.time.create({
      data: { nome, categoriaId: categoriaMasc.id },
    });
    elencosMasc[time.id] = await criarElenco(time.id);
    timesMasc.push(time);
  }
  // link the demo treinador to the first men's team
  await prisma.time.update({
    where: { id: timesMasc[0].id },
    data: { treinadorId: treinador.id },
  });

  // dá um Instagram e data de nascimento pro artilheiro, pra exibir no perfil público
  const artilheiro = elencosMasc[timesMasc[0].id][0];
  await prisma.atleta.update({
    where: { id: artilheiro.id },
    data: { instagram: "@" + artilheiro.nome.toLowerCase().replace(/\s+/g, ""), dataNascimento: new Date(2000, 4, 12) },
  });

  const timesFem = [];
  const elencosFem: Record<string, Awaited<ReturnType<typeof criarElenco>>> = {};
  for (const nome of NOMES_TIMES_FEM) {
    const time = await prisma.time.create({
      data: { nome, categoriaId: categoriaFem.id },
    });
    elencosFem[time.id] = await criarElenco(time.id);
    timesFem.push(time);
  }

  // grupos da categoria feminina (fase de grupos + mata-mata)
  const grupoA = await prisma.grupo.create({ data: { nome: "Grupo A", categoriaId: categoriaFem.id } });
  const grupoB = await prisma.grupo.create({ data: { nome: "Grupo B", categoriaId: categoriaFem.id } });
  await prisma.time.update({ where: { id: timesFem[0].id }, data: { grupoId: grupoA.id } });
  await prisma.time.update({ where: { id: timesFem[1].id }, data: { grupoId: grupoA.id } });
  await prisma.time.update({ where: { id: timesFem[2].id }, data: { grupoId: grupoB.id } });
  await prisma.time.update({ where: { id: timesFem[3].id }, data: { grupoId: grupoB.id } });

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
      { partidaId: encerrada1.id, tipo: "GOL", minuto: 5, timeId: timesMasc[0].id, atletaId: artilheiro.id },
      { partidaId: encerrada1.id, tipo: "GOL", minuto: 18, timeId: timesMasc[1].id },
      { partidaId: encerrada1.id, tipo: "CARTAO_AMARELO", minuto: 22, timeId: timesMasc[1].id },
      { partidaId: encerrada1.id, tipo: "GOL", minuto: 30, timeId: timesMasc[0].id, atletaId: artilheiro.id },
      { partidaId: encerrada1.id, tipo: "GOL", minuto: 39, timeId: timesMasc[0].id, atletaId: artilheiro.id },
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
  const zagueiroPendurado = elencosMasc[timesMasc[3].id][1];
  const zagueiroSuspenso = elencosMasc[timesMasc[3].id][2];
  await prisma.eventoPartida.createMany({
    data: [
      { partidaId: encerrada2.id, tipo: "GOL", minuto: 10, timeId: timesMasc[2].id },
      { partidaId: encerrada2.id, tipo: "GOL", minuto: 20, timeId: timesMasc[3].id },
      { partidaId: encerrada2.id, tipo: "GOL", minuto: 25, timeId: timesMasc[2].id },
      { partidaId: encerrada2.id, tipo: "CARTAO_VERMELHO", minuto: 35, timeId: timesMasc[3].id },
      { partidaId: encerrada2.id, tipo: "GOL", minuto: 40, timeId: timesMasc[3].id },
      // 2 amarelos pro zagueiro "pendurado" (fica a 1 do limite de 3)
      { partidaId: encerrada2.id, tipo: "CARTAO_AMARELO", minuto: 12, timeId: timesMasc[3].id, atletaId: zagueiroPendurado.id },
      // 3 amarelos pro zagueiro "suspenso" (bate o limite de 3)
      { partidaId: encerrada2.id, tipo: "CARTAO_AMARELO", minuto: 15, timeId: timesMasc[3].id, atletaId: zagueiroSuspenso.id },
    ],
  });
  await prisma.eventoPartida.createMany({
    data: [
      { partidaId: encerrada1.id, tipo: "CARTAO_AMARELO", minuto: 8, timeId: timesMasc[3].id, atletaId: zagueiroPendurado.id },
      { partidaId: encerrada1.id, tipo: "CARTAO_AMARELO", minuto: 44, timeId: timesMasc[3].id, atletaId: zagueiroSuspenso.id },
      { partidaId: encerrada1.id, tipo: "CARTAO_AMARELO", minuto: 50, timeId: timesMasc[3].id, atletaId: zagueiroSuspenso.id },
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
    data: { partidaId: aoVivo.id, tipo: "GOL", minuto: 12, timeId: timesMasc[0].id, atletaId: artilheiro.id },
  });

  // Agendada — hoje mais tarde
  await prisma.partida.create({
    data: {
      categoriaId: categoriaMasc.id,
      timeCasaId: timesMasc[1].id,
      timeForaId: timesMasc[3].id,
      dataHora: hoje(now.getHours() + 2),
      local: "Ginásio Municipal",
      rodada: 2,
      status: "AGENDADA",
    },
  });

  // Feminino — fase de grupos (encerrada) + mata-mata
  await prisma.partida.create({
    data: {
      categoriaId: categoriaFem.id,
      timeCasaId: timesFem[0].id,
      timeForaId: timesFem[1].id,
      dataHora: diasAtras(5),
      local: "Ginásio Municipal",
      rodada: 1,
      fase: "GRUPOS",
      status: "ENCERRADA",
      placarCasa: 4,
      placarFora: 1,
    },
  });
  await prisma.partida.create({
    data: {
      categoriaId: categoriaFem.id,
      timeCasaId: timesFem[2].id,
      timeForaId: timesFem[3].id,
      dataHora: diasAtras(5, 20),
      local: "Ginásio Municipal",
      rodada: 1,
      fase: "GRUPOS",
      status: "ENCERRADA",
      placarCasa: 2,
      placarFora: 3,
    },
  });
  // semifinal: vencedores dos grupos (Estrela FC x Águias FC)
  await prisma.partida.create({
    data: {
      categoriaId: categoriaFem.id,
      timeCasaId: timesFem[0].id,
      timeForaId: timesFem[3].id,
      dataHora: diasNaFrente(2),
      local: "Ginásio Municipal",
      fase: "SEMIFINAL",
      status: "AGENDADA",
    },
  });

  // enquete "Melhor da Rodada" pra categoria masculina, rodada 1
  const enquete = await prisma.enquete.create({
    data: {
      categoriaId: categoriaMasc.id,
      rodada: 1,
      pergunta: "Melhor Jogador da Rodada",
      ativa: true,
    },
  });
  await prisma.enqueteOpcao.createMany({
    data: [
      { enqueteId: enquete.id, atletaId: artilheiro.id },
      { enqueteId: enquete.id, atletaId: elencosMasc[timesMasc[2].id][0].id },
      { enqueteId: enquete.id, atletaId: elencosMasc[timesMasc[3].id][0].id },
    ],
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
