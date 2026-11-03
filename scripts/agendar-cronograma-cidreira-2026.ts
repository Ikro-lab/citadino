/**
 * Agenda a fase de grupos de todas as categorias do Campeonato Municipal
 * Cidreira 2026 pelo "CRONOGRAMA DOS JOGOS" (PDF de 25/10/2026).
 *
 * - Jogo já cadastrado com os mesmos dois times na categoria: atualiza data,
 *   hora, mando e rodada (só se ainda estiver AGENDADA). Senão, cria.
 * - Masculino Livre: os 18 jogos já existiam, com os Renascer trocados. No
 *   cronograma, RENASCER FUTSAL é "renascer B" e RENASCER é "Renascer".
 * - Demais categorias: grupo único com todos os times, criado aqui; grupos
 *   vazios da categoria (Grupo A/B sem time) são apagados.
 * - Times Renascer sem atletas duplicados na base são apagados, se não têm
 *   atleta, inscrição, jogo nem solicitação.
 * - Mata-mata fica de fora: os times ainda não existem.
 *
 * Uso (sem --aplicar só mostra o que vai fazer):
 *   npx tsx scripts/agendar-cronograma-cidreira-2026.ts [--aplicar]
 *
 * Lê DATABASE_URL e DATABASE_AUTH_TOKEN do ambiente ou de .env.production.local.
 */
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

config({ path: ".env.production.local", quiet: true });

const aplicar = process.argv.includes("--aplicar");

/** [data, hora, casa, fora, rodada?] com os nomes exatos do banco. */
type Jogo = [string, string, string, string, number?];
type Categoria = {
  categoria: string;
  /** Grupo único a montar com os times; ausente = mantém os grupos do banco. */
  grupoUnico?: string[];
  /** Jogos por rodada, para numerar as rodadas na ordem do cronograma. */
  jogosPorRodada?: number;
  jogos: Jogo[];
};

const GRUPO_UNICO = "Grupo Único";

const TABELA: Categoria[] = [
  {
    categoria: "Masculino Livre",
    // Rodadas por grupo: cada rodada é um jogo de cada dupla do grupo.
    jogos: [
      ["2026-11-04", "21:30", "Atlético Cidreira FC", "renascer B", 1],
      ["2026-11-04", "22:10", "Real cidreira fc", "Tropa do Gaucho", 1],
      ["2026-11-06", "21:30", "FÚRIA CDR", "Sacanagem F.C", 1],
      ["2026-11-06", "22:10", "Renascer", "Beco Fc", 1],
      ["2026-11-09", "21:30", "Gibe FC", "Madrugadão FC", 1],
      ["2026-11-09", "22:10", "Victoria Futsal Cidreira", "Lyon FC", 1],
      ["2026-11-11", "21:30", "renascer B", "Renascer", 2],
      ["2026-11-11", "22:10", "Tropa do Gaucho", "Gibe FC", 2],
      ["2026-11-13", "21:30", "Sacanagem F.C", "Victoria Futsal Cidreira", 2],
      ["2026-11-13", "22:10", "Beco Fc", "Atlético Cidreira FC", 2],
      ["2026-11-16", "22:00", "Lyon FC", "FÚRIA CDR", 2],
      ["2026-11-16", "22:40", "renascer B", "Beco Fc", 3],
      ["2026-11-18", "21:30", "Tropa do Gaucho", "Madrugadão FC", 3],
      ["2026-11-18", "22:00", "Sacanagem F.C", "Lyon FC", 3],
      ["2026-11-18", "22:40", "Real cidreira fc", "Madrugadão FC", 2],
      ["2026-11-20", "21:30", "Renascer", "Atlético Cidreira FC", 3],
      ["2026-11-20", "22:00", "Gibe FC", "Real cidreira fc", 3],
      ["2026-11-23", "22:00", "Victoria Futsal Cidreira", "FÚRIA CDR", 3],
    ],
  },
  {
    categoria: "Veterano",
    grupoUnico: ["CDC Veterano", "ATLÉTICO LITORAL F.C", "CDC Master", "Renascer", "CERPAK veterano", "Fênix veterano"],
    jogosPorRodada: 3,
    jogos: [
      ["2026-11-04", "21:00", "Renascer", "CDC Master"],
      ["2026-11-06", "21:00", "CDC Master", "CDC Veterano"],
      ["2026-11-09", "20:30", "CERPAK veterano", "ATLÉTICO LITORAL F.C"],
      ["2026-11-09", "21:00", "Fênix veterano", "Renascer"],
      ["2026-11-13", "21:00", "Renascer", "CERPAK veterano"],
      ["2026-11-16", "21:30", "Fênix veterano", "ATLÉTICO LITORAL F.C"],
      ["2026-11-18", "20:30", "CERPAK veterano", "CDC Veterano"],
      ["2026-11-18", "21:00", "ATLÉTICO LITORAL F.C", "CDC Master"],
      ["2026-11-20", "21:00", "CDC Veterano", "Fênix veterano"],
    ],
  },
  {
    categoria: "Feminino Livre",
    grupoUnico: [
      "Realeza F.C", 'Realeza "A"', "Pumas Futsal", "Cidreira Atlético Clube", "RESENHA PRIME", "C.U.Zonas Futsal Feminino",
    ],
    jogosPorRodada: 3,
    // "REALEZA" sozinho no cronograma: x C.U.Zonas é o Realeza F.C (lista do Feminino da organização); os outros, Realeza "A".
    jogos: [
      ["2026-11-09", "19:30", "RESENHA PRIME", "Pumas Futsal"],
      ["2026-11-09", "20:00", "Realeza F.C", 'Realeza "A"'],
      ["2026-11-11", "21:00", "Realeza F.C", "RESENHA PRIME"],
      ["2026-11-13", "20:30", 'Realeza "A"', "Cidreira Atlético Clube"],
      ["2026-11-16", "21:00", "Pumas Futsal", "C.U.Zonas Futsal Feminino"],
      ["2026-11-20", "20:00", "Cidreira Atlético Clube", "RESENHA PRIME"],
      ["2026-11-20", "20:30", "Realeza F.C", "C.U.Zonas Futsal Feminino"],
      ["2026-11-23", "21:00", 'Realeza "A"', "Pumas Futsal"],
      ["2026-11-23", "21:30", "Cidreira Atlético Clube", "C.U.Zonas Futsal Feminino"],
    ],
  },
  {
    categoria: "Categoria de base SUB 16 Feminino",
    grupoUnico: ["RENASCER FEMININO", "Realeza futebol", "Anjos Unidos", "Escolinha de futsal fênix 🐦‍🔥"],
    jogosPorRodada: 2,
    jogos: [
      ["2026-11-04", "20:30", "RENASCER FEMININO", "Realeza futebol"],
      ["2026-11-06", "20:00", "RENASCER FEMININO", "Anjos Unidos"],
      ["2026-11-09", "19:00", "Escolinha de futsal fênix 🐦‍🔥", "RENASCER FEMININO"],
      ["2026-11-16", "20:30", "Anjos Unidos", "Escolinha de futsal fênix 🐦‍🔥"],
      ["2026-11-18", "20:00", "Escolinha de futsal fênix 🐦‍🔥", "Realeza futebol"],
      ["2026-11-23", "20:30", "Anjos Unidos", "Realeza futebol"],
    ],
  },
  ...(
    [
      ["Categoria de base SUB 11", "RENASCER BASE", ["19:00", "19:00", "19:30", "19:00", "19:00", "19:00"]],
      ["Categoria de base SUB 13", "RENASCER BASE", ["19:30", "19:30", "20:00", "19:30", "19:30", "19:30"]],
      ["Categoria de base SUB 15", "RENASCER", ["20:00", "20:30", "20:30", "20:00", "20:00", "20:00"]],
    ] as const
  ).map(([categoria, renascer, h]): Categoria => ({
    categoria,
    grupoUnico: [renascer, "Projeto Futsal Cidreira", "UPGRADE", "Elite FC"],
    jogosPorRodada: 2,
    jogos: [
      ["2026-11-04", h[0], renascer, "Projeto Futsal Cidreira"],
      ["2026-11-06", h[1], "UPGRADE", "Projeto Futsal Cidreira"],
      ["2026-11-11", h[2], renascer, "Elite FC"],
      ["2026-11-13", h[3], "Projeto Futsal Cidreira", "Elite FC"],
      ["2026-11-16", h[4], "Elite FC", "UPGRADE"],
      ["2026-11-23", h[5], renascer, "UPGRADE"],
    ],
  })),
];

/** Times Renascer sem atletas, duplicados dos que têm. */
const APAGAR: [categoria: string, time: string][] = [
  ["Categoria de base SUB 11", "Renascer"],
  ["Categoria de base SUB 13", "Renascer"],
  ["Categoria de base SUB 16 Feminino", "RENASCER"],
];

const quando = (data: string, hora: string) => new Date(`${data}T${hora}:00-03:00`);
const fmt = (d: Date) =>
  d.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

async function main() {
  const databaseUrl = process.env.DATABASE_URL ?? "";
  if (!databaseUrl.startsWith("libsql:") && !databaseUrl.startsWith("https:")) {
    throw new Error("DATABASE_URL não é do Turso (libsql://...).");
  }
  const prisma = new PrismaClient({
    adapter: new PrismaLibSql({ url: databaseUrl, authToken: process.env.DATABASE_AUTH_TOKEN }),
  });

  let problemas = 0;
  const acoes: ((tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0]) => Promise<unknown>)[] = [];

  for (const cat of TABELA) {
    const categoria = await prisma.categoria.findFirst({
      where: { nome: cat.categoria, campeonato: { ativo: true, nome: { contains: "Cidreira" } } },
      include: {
        times: { select: { id: true, nome: true, grupoId: true } },
        grupos: { select: { id: true, nome: true, _count: { select: { times: true } } } },
        partidas: { select: { id: true, timeCasaId: true, timeForaId: true, dataHora: true, rodada: true, status: true } },
      },
    });
    if (!categoria) throw new Error(`Categoria "${cat.categoria}" não encontrada.`);
    console.log(`\n== ${cat.categoria} ==`);

    const idDe = (nome: string) => {
      const t = categoria.times.find((x) => x.nome === nome);
      if (!t) {
        problemas++;
        console.log(`  ERRO: time "${nome}" não existe na categoria.`);
      }
      return t?.id ?? "";
    };
    const nomeDe = new Map(categoria.times.map((t) => [t.id, t.nome]));

    if (cat.grupoUnico) {
      const ids = cat.grupoUnico.map(idDe);
      const vazios = categoria.grupos.filter((g) => g.nome !== GRUPO_UNICO && g._count.times === 0);
      console.log(`  ${GRUPO_UNICO}: ${cat.grupoUnico.join(", ")}`);
      if (vazios.length) console.log(`  Apaga grupos vazios: ${vazios.map((g) => g.nome).join(", ")}`);
      const outros = categoria.grupos.filter((g) => g.nome !== GRUPO_UNICO && g._count.times > 0);
      if (outros.length) console.log(`  AVISO: grupos com times ficam como estão: ${outros.map((g) => g.nome).join(", ")}`);
      acoes.push(async (tx) => {
        const g = await tx.grupo.upsert({
          where: { categoriaId_nome: { categoriaId: categoria.id, nome: GRUPO_UNICO } },
          create: { tenantId: categoria.tenantId, categoriaId: categoria.id, nome: GRUPO_UNICO },
          update: {},
        });
        await tx.time.updateMany({ where: { id: { in: ids } }, data: { grupoId: g.id } });
        if (vazios.length) await tx.grupo.deleteMany({ where: { id: { in: vazios.map((v) => v.id) } } });
      });
    }

    const usadas = new Set<string>();
    cat.jogos.forEach(([data, hora, nomeCasa, nomeFora, rodadaFixa], i) => {
      const casa = idDe(nomeCasa);
      const fora = idDe(nomeFora);
      const rodada = rodadaFixa ?? Math.floor(i / cat.jogosPorRodada!) + 1;
      const dataHora = quando(data, hora);
      const existente = categoria.partidas.find(
        (p) => (p.timeCasaId === casa && p.timeForaId === fora) || (p.timeCasaId === fora && p.timeForaId === casa)
      );
      const linha = `  ${fmt(dataHora)}  R${rodada}  ${nomeCasa} x ${nomeFora}`;
      if (!existente) {
        console.log(`${linha}  (novo)`);
        acoes.push((tx) =>
          tx.partida.create({
            data: { tenantId: categoria.tenantId, categoriaId: categoria.id, timeCasaId: casa, timeForaId: fora, dataHora, rodada, fase: "GRUPOS" },
          })
        );
        return;
      }
      usadas.add(existente.id);
      const igual =
        existente.timeCasaId === casa && existente.dataHora.getTime() === dataHora.getTime() && existente.rodada === rodada;
      if (igual) return console.log(`${linha}  (já está certo)`);
      if (existente.status !== "AGENDADA") {
        problemas++;
        return console.log(`${linha}  ERRO: já cadastrado como ${existente.status}, não altero`);
      }
      console.log(
        `${linha}  (era ${fmt(existente.dataHora)} R${existente.rodada} ${nomeDe.get(existente.timeCasaId)} x ${nomeDe.get(existente.timeForaId)})`
      );
      acoes.push((tx) =>
        tx.partida.update({ where: { id: existente.id }, data: { timeCasaId: casa, timeForaId: fora, dataHora, rodada } })
      );
    });
    for (const p of categoria.partidas.filter((p) => !usadas.has(p.id))) {
      console.log(`  AVISO: jogo fora do cronograma fica como está: ${fmt(p.dataHora)} ${nomeDe.get(p.timeCasaId)} x ${nomeDe.get(p.timeForaId)}`);
    }
  }

  console.log("\n== Times vazios a apagar ==");
  for (const [nomeCategoria, nome] of APAGAR) {
    const time = await prisma.time.findFirst({
      where: { nome, categoria: { nome: nomeCategoria, campeonato: { ativo: true, nome: { contains: "Cidreira" } } } },
      select: {
        id: true,
        _count: { select: { atletas: true, inscricoes: true, partidasCasa: true, partidasFora: true, solicitacoes: true, eventos: true } },
      },
    });
    if (!time) {
      console.log(`  ${nomeCategoria} / ${nome}: não existe (já apagado?)`);
      continue;
    }
    const usos = Object.entries(time._count).filter(([, n]) => n > 0);
    if (usos.length) {
      problemas++;
      console.log(`  ${nomeCategoria} / ${nome}: ERRO, não está vazio (${usos.map(([k, n]) => `${k}=${n}`).join(", ")})`);
      continue;
    }
    console.log(`  ${nomeCategoria} / ${nome}: apaga`);
    acoes.push((tx) => tx.time.delete({ where: { id: time.id } }));
  }

  if (problemas) {
    console.log(`\n${problemas} problema(s). Nada foi alterado.`);
    process.exit(1);
  }
  if (!aplicar) {
    console.log("\nNada foi alterado. Rode de novo com --aplicar para confirmar.");
    return;
  }
  await prisma.$transaction(async (tx) => {
    for (const acao of acoes) await acao(tx);
  }, { timeout: 120_000, maxWait: 20_000 });
  console.log(`\nPronto: ${acoes.length} alteração(ões) gravadas.`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
