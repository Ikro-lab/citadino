/**
 * Agenda a fase de grupos do Livre e do Veterano do Campeonato Municipal
 * Cidreira 2026, a partir da tabela "TABELA JOGOS SORTEIO LIVRE - VETERANO".
 * Cria os grupos (Grupo A/B/C no Livre, Grupo Único no Veterano), coloca cada
 * time no seu grupo e cria as partidas com a rodada de cada uma.
 *
 * Os jogos são descritos pela posição no sorteio (A1 x A2, 3 x 1...), não pelo
 * nome escrito no confronto: a tabela tinha dois confrontos com nomes que não
 * batiam com as posições (jogo 29 e jogo 45), e a posição é a que fecha o
 * todos contra todos de cada grupo.
 *
 * Mata-mata (quartas, semis e finais) fica de fora: os times ainda não existem.
 * Partida já cadastrada com os mesmos times na mesma categoria é pulada.
 *
 * Uso (sem --aplicar só mostra o que vai fazer):
 *   npx tsx scripts/agendar-jogos-cidreira-2026.ts
 *   npx tsx scripts/agendar-jogos-cidreira-2026.ts --aplicar
 *   npx tsx scripts/agendar-jogos-cidreira-2026.ts --categoria "Masculino Livre"   # só uma categoria
 *
 * Lê DATABASE_URL e DATABASE_AUTH_TOKEN do ambiente ou de .env.production.local.
 */
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

config({ path: ".env.production.local", quiet: true });

const aplicar = process.argv.includes("--aplicar");
const iCategoria = process.argv.indexOf("--categoria");
const soCategoria = iCategoria >= 0 ? process.argv[iCategoria + 1] : undefined;

type Jogo = { n: number; data: string; hora: string; grupo: string; casa: number; fora: number };
type CategoriaTabela = {
  categoria: string;
  /** Times de cada grupo, na ordem do sorteio (posição 1 primeiro). */
  grupos: Record<string, string[]>;
  jogosPorRodada: number;
  jogos: Jogo[];
};

const TABELA: CategoriaTabela[] = [
  {
    categoria: "Masculino Livre",
    grupos: {
      // Na tabela, A2 é "RENASCER FUTSAL" e A3 é "RENASCER"; no sistema são "Renascer" e "renascer B".
      "Grupo A": ["ATLETICO CIDREIRA", "RENASCER", "RENASCER B", "BECO"],
      "Grupo B": ["REAL CIDREIRA", "TROPA GAUCHO", "GIBE", "MADRUGADAO"],
      "Grupo C": ["FURIA", "SACANAGEM", "VICTORIA", "LYON"],
    },
    jogosPorRodada: 2, // por grupo
    jogos: [
      { n: 6, data: "2026-11-04", hora: "22:10", grupo: "Grupo A", casa: 1, fora: 2 },
      { n: 7, data: "2026-11-04", hora: "22:50", grupo: "Grupo B", casa: 1, fora: 2 },
      { n: 14, data: "2026-11-06", hora: "22:10", grupo: "Grupo C", casa: 1, fora: 2 },
      { n: 15, data: "2026-11-06", hora: "22:50", grupo: "Grupo A", casa: 3, fora: 4 },
      { n: 22, data: "2026-11-09", hora: "22:10", grupo: "Grupo B", casa: 3, fora: 4 },
      { n: 23, data: "2026-11-09", hora: "22:50", grupo: "Grupo C", casa: 3, fora: 4 },
      { n: 30, data: "2026-11-11", hora: "22:10", grupo: "Grupo A", casa: 2, fora: 3 },
      { n: 31, data: "2026-11-11", hora: "22:50", grupo: "Grupo B", casa: 2, fora: 3 },
      { n: 38, data: "2026-11-13", hora: "22:10", grupo: "Grupo C", casa: 2, fora: 3 },
      { n: 39, data: "2026-11-13", hora: "22:50", grupo: "Grupo A", casa: 4, fora: 1 },
      { n: 44, data: "2026-11-16", hora: "21:00", grupo: "Grupo B", casa: 4, fora: 1 },
      { n: 45, data: "2026-11-16", hora: "21:40", grupo: "Grupo C", casa: 4, fora: 1 },
      { n: 46, data: "2026-11-16", hora: "22:20", grupo: "Grupo A", casa: 2, fora: 4 },
      { n: 52, data: "2026-11-18", hora: "21:40", grupo: "Grupo B", casa: 2, fora: 4 },
      { n: 53, data: "2026-11-18", hora: "22:20", grupo: "Grupo C", casa: 2, fora: 4 },
      { n: 59, data: "2026-11-20", hora: "21:40", grupo: "Grupo A", casa: 3, fora: 1 },
      { n: 60, data: "2026-11-20", hora: "22:20", grupo: "Grupo B", casa: 3, fora: 1 },
      { n: 66, data: "2026-11-23", hora: "21:30", grupo: "Grupo C", casa: 3, fora: 1 },
    ],
  },
  {
    categoria: "Veterano",
    grupos: {
      "Grupo Único": ["CDC VETERANO", "ATLETICO LITORAL", "CDC MASTER", "RENASCER", "CERPAK", "FENIX"],
    },
    jogosPorRodada: 3,
    jogos: [
      { n: 5, data: "2026-11-04", hora: "21:30", grupo: "Grupo Único", casa: 1, fora: 6 },
      { n: 13, data: "2026-11-06", hora: "21:30", grupo: "Grupo Único", casa: 5, fora: 2 },
      { n: 21, data: "2026-11-09", hora: "21:30", grupo: "Grupo Único", casa: 3, fora: 4 },
      { n: 29, data: "2026-11-11", hora: "21:30", grupo: "Grupo Único", casa: 3, fora: 1 },
      { n: 37, data: "2026-11-13", hora: "21:30", grupo: "Grupo Único", casa: 4, fora: 5 },
      { n: 42, data: "2026-11-16", hora: "20:00", grupo: "Grupo Único", casa: 6, fora: 2 },
      { n: 43, data: "2026-11-16", hora: "20:30", grupo: "Grupo Único", casa: 5, fora: 1 },
      { n: 51, data: "2026-11-18", hora: "21:00", grupo: "Grupo Único", casa: 4, fora: 6 },
      { n: 58, data: "2026-11-20", hora: "21:00", grupo: "Grupo Único", casa: 2, fora: 3 },
    ],
  },
];

const IGNORAR = new Set(["fc", "f", "c", "ec", "do", "da", "de", "dos", "das"]);
const tokens = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .filter((t) => t && !IGNORAR.has(t));

/**
 * Acha o time do banco pelo nome da tabela: todas as palavras da tabela
 * precisam estar no nome do banco (ou ser começo de uma, "vet" -> "veterano").
 * Entre os que servem, fica o de menos palavras sobrando ("Renascer" ganha de
 * "Renascer Futsal"); empate é erro.
 */
function acharTime<T extends { nome: string }>(nome: string, times: T[]): T | string {
  const procurado = tokens(nome);
  const candidatos = times
    .map((t) => ({ t, tk: tokens(t.nome) }))
    .filter(({ tk }) => procurado.every((p) => tk.some((x) => x === p || x.startsWith(p))))
    .map(({ t, tk }) => ({ t, sobra: tk.length - procurado.length }))
    .sort((a, b) => a.sobra - b.sobra);
  if (candidatos.length === 0) return `nenhum time parecido no banco`;
  if (candidatos.length > 1 && candidatos[0].sobra === candidatos[1].sobra) {
    return `ambíguo: ${candidatos.filter((c) => c.sobra === candidatos[0].sobra).map((c) => c.t.nome).join(" / ")}`;
  }
  return candidatos[0].t;
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL ?? "";
  if (!databaseUrl.startsWith("libsql:") && !databaseUrl.startsWith("https:")) {
    throw new Error("DATABASE_URL não é do Turso (libsql://...).");
  }
  const prisma = new PrismaClient({
    adapter: new PrismaLibSql({ url: databaseUrl, authToken: process.env.DATABASE_AUTH_TOKEN }),
  });

  let problemas = 0;
  const montagens: { tenantId: string; categoriaId: string; idPorPosicao: Record<string, string[]> }[] = [];
  const planos: {
    tenantId: string; categoriaId: string; j: Jogo; casa: string; fora: string; rodada: number; jaExiste: boolean;
  }[] = [];

  for (const cat of TABELA.filter((c) => !soCategoria || c.categoria === soCategoria)) {
    const categorias = await prisma.categoria.findMany({
      where: { nome: cat.categoria, campeonato: { ativo: true, nome: { contains: "Cidreira" } } },
      include: {
        times: { select: { id: true, nome: true, grupoId: true } },
        grupos: { select: { id: true, nome: true } },
        partidas: { select: { timeCasaId: true, timeForaId: true } },
      },
    });
    if (categorias.length !== 1) throw new Error(`Categoria "${cat.categoria}": ${categorias.length} encontradas.`);
    const [categoria] = categorias;

    console.log(`\n== ${cat.categoria} ==`);
    const idPorPosicao: Record<string, string[]> = {};
    const nomePorId = new Map(categoria.times.map((t) => [t.id, t.nome]));
    for (const [grupo, nomes] of Object.entries(cat.grupos)) {
      const grupoAtual = categoria.grupos.find((g) => g.nome === grupo);
      idPorPosicao[grupo] = nomes.map((nome, i) => {
        const achado = acharTime(nome, categoria.times);
        if (typeof achado === "string") {
          problemas++;
          console.log(`  ${grupo} ${i + 1}  ${nome.padEnd(18)} ->  ERRO: ${achado}`);
          return "";
        }
        const outroGrupo = achado.grupoId && achado.grupoId !== grupoAtual?.id;
        console.log(
          `  ${grupo} ${i + 1}  ${nome.padEnd(18)} ->  ${achado.nome}${outroGrupo ? "  (AVISO: já está em outro grupo; será movido)" : ""}`
        );
        return achado.id;
      });
    }
    montagens.push({ tenantId: categoria.tenantId, categoriaId: categoria.id, idPorPosicao });
    const usados = new Set(Object.values(idPorPosicao).flat());
    const foraDaTabela = categoria.times.filter((t) => !usados.has(t.id)).map((t) => t.nome);
    if (foraDaTabela.length) console.log(`  Times da categoria fora da tabela (ficam sem grupo): ${foraDaTabela.join(", ")}`);

    const contagemGrupo: Record<string, number> = {};
    for (const j of cat.jogos) {
      const i = (contagemGrupo[j.grupo] = (contagemGrupo[j.grupo] ?? 0) + 1) - 1;
      const casa = idPorPosicao[j.grupo][j.casa - 1];
      const fora = idPorPosicao[j.grupo][j.fora - 1];
      const rodada = Math.floor(i / cat.jogosPorRodada) + 1;
      const jaExiste =
        !!casa && !!fora &&
        categoria.partidas.some(
          (p) => (p.timeCasaId === casa && p.timeForaId === fora) || (p.timeCasaId === fora && p.timeForaId === casa)
        );
      planos.push({ tenantId: categoria.tenantId, categoriaId: categoria.id, j, casa, fora, rodada, jaExiste });
      const [, m, d] = j.data.split("-");
      console.log(
        `  Jogo ${String(j.n).padStart(2, "0")}  ${d}/${m} ${j.hora}  R${rodada}  ` +
          `${nomePorId.get(casa) ?? "?"} x ${nomePorId.get(fora) ?? "?"}${jaExiste ? "  (já cadastrado, pula)" : ""}`
      );
    }
  }

  if (problemas) {
    console.log(`\n${problemas} time(s) não encontrados. Nada foi alterado.`);
    process.exit(1);
  }
  if (!aplicar) {
    console.log("\nNada foi alterado. Rode de novo com --aplicar para confirmar.");
    return;
  }

  let criadas = 0;
  await prisma.$transaction(async (tx) => {
    for (const { tenantId, categoriaId, idPorPosicao } of montagens) {
      for (const [grupo, ids] of Object.entries(idPorPosicao)) {
        const g = await tx.grupo.upsert({
          where: { categoriaId_nome: { categoriaId, nome: grupo } },
          create: { tenantId, categoriaId, nome: grupo },
          update: {},
        });
        await tx.time.updateMany({ where: { id: { in: ids } }, data: { grupoId: g.id } });
      }
    }
    for (const p of planos) {
      if (p.jaExiste) continue;
      await tx.partida.create({
        data: {
          tenantId: p.tenantId,
          categoriaId: p.categoriaId,
          timeCasaId: p.casa,
          timeForaId: p.fora,
          dataHora: new Date(`${p.j.data}T${p.j.hora}:00-03:00`),
          rodada: p.rodada,
          fase: "GRUPOS",
        },
      });
      criadas++;
    }
  });
  console.log(`\nPronto: grupos montados e ${criadas} partida(s) criadas.`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
