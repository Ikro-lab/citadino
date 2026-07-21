import { prisma } from "../src/lib/prisma";
import type { Posicao } from "@prisma/client";

/**
 * Substitui os 4 times da categoria "Masculino Livre" pelas 4 seleções que
 * chegaram às semifinais da Copa do Mundo FIFA 2026 (França, Espanha,
 * Inglaterra, Argentina), usando a escalação titular real do último jogo de
 * cada seleção no torneio. Fotos e bandeiras apontam pra arquivos com licença
 * livre no Wikimedia Commons (verificado individualmente); Instagram é o
 * público real de cada atleta, quando encontrado com confiança.
 *
 * Atualiza os Atleta existentes NO LUGAR (mantém o id) em vez de apagar e
 * recriar, pra não quebrar EventoPartida/EnqueteOpcao que já referenciam
 * esses atletas nas partidas de demonstração.
 */

type Jogador = {
  nome: string;
  numero: number;
  posicao: Posicao;
  instagram: string | null;
  fotoUrl: string | null;
};

type Selecao = {
  timeAtual: string;
  nomeNovo: string;
  escudoUrl: string;
  jogadores: Jogador[];
};

const selecoes: Selecao[] = [
  {
    timeAtual: "Real Bairro FC",
    nomeNovo: "França",
    escudoUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c3/Flag_of_France.svg",
    jogadores: [
      { nome: "Mike Maignan", numero: 16, posicao: "GOLEIRO", instagram: "@magicmikemaignan", fotoUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e1/Mike_Maignan_France_v_Norway_26_June_26-132_%28cropped%29.jpg" },
      { nome: "Jules Koundé", numero: 5, posicao: "FIXO", instagram: "@jkeey4", fotoUrl: "https://upload.wikimedia.org/wikipedia/commons/e/ee/Jules_Kounde_France_v_Senegal_16_June_2026-449_%28cropped%29.jpg" },
      { nome: "Dayot Upamecano", numero: 4, posicao: "FIXO", instagram: "@upamecano", fotoUrl: null },
      { nome: "William Saliba", numero: 17, posicao: "FIXO", instagram: "@w.saliba4", fotoUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c2/William_Saliba_France_v_Senegal_16_June_2026-336_%28cropped%29.jpg" },
      { nome: "Lucas Digne", numero: 3, posicao: "FIXO", instagram: "@lucasdigne", fotoUrl: "https://upload.wikimedia.org/wikipedia/commons/f/f6/Lucas_Digne_France_v_Senegal_16_June_2026-275_%28cropped%29.jpg" },
      { nome: "Aurélien Tchouaméni", numero: 8, posicao: "LINHA", instagram: "@aurelientchm", fotoUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c0/Aurelien_Tchouameni_France_v_Senegal_16_June_2026-447_%28cropped%29.jpg" },
      { nome: "Adrien Rabiot", numero: 14, posicao: "LINHA", instagram: "@adrienrabiot_25", fotoUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a5/Adrien_Rabiot_France_v_Senegal_16_June_2026-371_%28cropped%29.jpg" },
      { nome: "Ousmane Dembélé", numero: 7, posicao: "ALA", instagram: "@o.dembele7", fotoUrl: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Ousmane_Dembele_France_v_Senegal_16_June_2026-341_%28cropped%29.jpg" },
      { nome: "Michael Olise", numero: 11, posicao: "ALA", instagram: "@m.olise", fotoUrl: "https://upload.wikimedia.org/wikipedia/commons/0/04/Michael_Olise_France_v_Senegal_16_June_2026-307_%28cropped%29.jpg" },
      { nome: "Bradley Barcola", numero: 12, posicao: "ALA", instagram: "@bradley_dls", fotoUrl: "https://upload.wikimedia.org/wikipedia/commons/2/28/Bradley_Barcola_-12_France_v_Sweden_at_2026_Fifa_World_Cup_by_YantsImages_01.jpg" },
      { nome: "Kylian Mbappé", numero: 10, posicao: "PIVO", instagram: "@k.mbappe", fotoUrl: "https://upload.wikimedia.org/wikipedia/commons/9/95/Kylian_Mbappe_France_v_Senegal_16_June_2026-391_%28cropped%29.jpg" },
    ],
  },
  {
    timeAtual: "Unidos da Vila",
    nomeNovo: "Espanha",
    escudoUrl: "https://upload.wikimedia.org/wikipedia/commons/9/9a/Flag_of_Spain.svg",
    jogadores: [
      { nome: "Unai Simón", numero: 23, posicao: "GOLEIRO", instagram: null, fotoUrl: "https://upload.wikimedia.org/wikipedia/commons/3/33/Unai_Sim%C3%B3n.jpg" },
      { nome: "Pedro Porro", numero: 12, posicao: "FIXO", instagram: "@pedroporro29_", fotoUrl: "https://upload.wikimedia.org/wikipedia/commons/8/85/Pedro_Porro_2021.png" },
      { nome: "Pau Cubarsí", numero: 22, posicao: "FIXO", instagram: "@paucubarsi", fotoUrl: "https://upload.wikimedia.org/wikipedia/commons/1/16/Pau_Cubars%C3%AD.jpg" },
      { nome: "Aymeric Laporte", numero: 14, posicao: "FIXO", instagram: "@laporte", fotoUrl: "https://upload.wikimedia.org/wikipedia/commons/f/f9/Aymeric_Laporte_2023_%28cropped%29.jpg" },
      { nome: "Marc Cucurella", numero: 24, posicao: "FIXO", instagram: "@cucurella3", fotoUrl: "https://upload.wikimedia.org/wikipedia/commons/7/72/Marc_Cucurella.jpg" },
      { nome: "Rodri", numero: 16, posicao: "LINHA", instagram: null, fotoUrl: "https://upload.wikimedia.org/wikipedia/commons/4/41/RODRI_-_SWE_vs_ESP_-_UEFA_EURO_2020_QUALIFIERS_-_2019.10.15_%28cropped%29.jpg" },
      { nome: "Fabián Ruiz", numero: 8, posicao: "LINHA", instagram: "@fabianruiz52", fotoUrl: "https://upload.wikimedia.org/wikipedia/commons/8/83/FABIAN_RUIZ_-_SWE_v_ESP_-_2019.10.15.jpg" },
      { nome: "Lamine Yamal", numero: 19, posicao: "ALA", instagram: "@lamineyamal", fotoUrl: "https://upload.wikimedia.org/wikipedia/commons/2/2c/Lamine_Yamal_in_2025_%28cropped%29.jpg" },
      { nome: "Dani Olmo", numero: 10, posicao: "ALA", instagram: "@daniolmo", fotoUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e0/Dani_Olmo_2022.jpg" },
      { nome: "Álex Baena", numero: 15, posicao: "ALA", instagram: "@alexbbaena", fotoUrl: "https://upload.wikimedia.org/wikipedia/commons/1/16/%C3%81lex_Baena_2019.jpg" },
      { nome: "Mikel Oyarzabal", numero: 21, posicao: "PIVO", instagram: "@mikel10oyar", fotoUrl: "https://upload.wikimedia.org/wikipedia/commons/8/84/Oyarzabal_Spain_football_team_in_2025_%28cropped%29.jpg" },
    ],
  },
  {
    timeAtual: "Furacão FC",
    nomeNovo: "Inglaterra",
    escudoUrl: "https://upload.wikimedia.org/wikipedia/commons/b/be/Flag_of_England.svg",
    jogadores: [
      { nome: "Dean Henderson", numero: 13, posicao: "GOLEIRO", instagram: "@deanhenderson", fotoUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c8/Dean_Henderson_England_v_Ghana_23_June_2026-003.jpg" },
      { nome: "Djed Spence", numero: 25, posicao: "FIXO", instagram: "@djedspence", fotoUrl: "https://upload.wikimedia.org/wikipedia/commons/b/ba/Djed_Spence_England_v_Ghana_23_June_2026-022.jpg" },
      { nome: "Marc Guéhi", numero: 6, posicao: "FIXO", instagram: "@marcguehi", fotoUrl: "https://upload.wikimedia.org/wikipedia/commons/8/8a/Marc_Gu%C3%A9hi_at_2026_FIFA_World_Cup_by_YantsImages.jpg" },
      { nome: "Ezri Konsa", numero: 2, posicao: "FIXO", instagram: "@ezrikonsa", fotoUrl: "https://upload.wikimedia.org/wikipedia/commons/c/cc/Team_England_England_v_Ghana_at_2026_Fifa_World_Cup_by_YantsImages_03_%28Ezri_Konsa%29.jpg" },
      { nome: "Jarell Quansah", numero: 26, posicao: "FIXO", instagram: "@jarellquansah", fotoUrl: "https://upload.wikimedia.org/wikipedia/commons/a/ad/Jarell_Quansah_England_v_Ghana_23_June_2026-045.jpg" },
      { nome: "Declan Rice", numero: 4, posicao: "LINHA", instagram: "@declanrice", fotoUrl: "https://upload.wikimedia.org/wikipedia/commons/5/5d/Declan_Rice_England_v_Ghana_23_June_2026-150.jpg" },
      { nome: "Bukayo Saka", numero: 7, posicao: "ALA", instagram: "@bukayosaka87", fotoUrl: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Bukayo_Saka_England_v_Ghana_23_June_2026-057_%28cropped%29.jpg" },
      { nome: "Eberechi Eze", numero: 21, posicao: "ALA", instagram: "@eze", fotoUrl: "https://upload.wikimedia.org/wikipedia/commons/a/af/Eberechi_Eze_England_v_Panama_27_June_26-231.jpg" },
      { nome: "Morgan Rogers", numero: 17, posicao: "ALA", instagram: "@mrogers", fotoUrl: "https://upload.wikimedia.org/wikipedia/commons/2/26/Morgan_Rogers_England_v_Ghana_23_June_2026-034_%28cropped%29.jpg" },
      { nome: "Marcus Rashford", numero: 11, posicao: "ALA", instagram: "@marcusrashford", fotoUrl: "https://upload.wikimedia.org/wikipedia/commons/4/41/Marcus_Rashford_%282025%29.png" },
      { nome: "Ivan Toney", numero: 22, posicao: "PIVO", instagram: "@ivantoney1", fotoUrl: "https://upload.wikimedia.org/wikipedia/commons/b/bd/Ivan_Toney_England_v_Ghana_23_June_2026-047.jpg" },
    ],
  },
  {
    timeAtual: "Atlético Central",
    nomeNovo: "Argentina",
    escudoUrl: "https://upload.wikimedia.org/wikipedia/commons/1/1a/Flag_of_Argentina.svg",
    jogadores: [
      { nome: "Emiliano Martínez", numero: 23, posicao: "GOLEIRO", instagram: "@emi_martinez26", fotoUrl: "https://upload.wikimedia.org/wikipedia/commons/9/9f/Emiliano_Martinez_Argentina_v_Egypt_7_July_2026-093_%28cropped%29.jpg" },
      { nome: "Gonzalo Montiel", numero: 4, posicao: "FIXO", instagram: "@gonzalo_montiel29", fotoUrl: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Gonzalo_Montiel_Argentina_v_Egypt_7_July_2026-298.jpg" },
      { nome: "Cristian Romero", numero: 13, posicao: "FIXO", instagram: "@cutiromero2", fotoUrl: "https://upload.wikimedia.org/wikipedia/commons/8/8c/Cuti_Romero_Tottenham_2022.jpg" },
      { nome: "Lisandro Martínez", numero: 6, posicao: "FIXO", instagram: "@lisandromartinez", fotoUrl: "https://upload.wikimedia.org/wikipedia/commons/a/ad/Lisandro_Mart%C3%ADnez_Manchester_United_v_Brighton_%26_Hove_Albion%2C_7_August_2022_%2805%29_%28cropped%29.jpg" },
      { nome: "Nicolás Tagliafico", numero: 3, posicao: "FIXO", instagram: "@tagliafico3", fotoUrl: "https://upload.wikimedia.org/wikipedia/commons/b/b2/Nicolas_Tagliafico_Argentina_v_Egypt_7_July_2026-126_%28cropped%29.jpg" },
      { nome: "Rodrigo De Paul", numero: 7, posicao: "LINHA", instagram: "@rodridepaul", fotoUrl: "https://upload.wikimedia.org/wikipedia/commons/9/90/25th_Laureus_World_Sports_Awards_-_Red_Carpet_-_Rodrigo_de_Paul_-_240422_192702.jpg" },
      { nome: "Enzo Fernández", numero: 24, posicao: "LINHA", instagram: "@enzojfernandez", fotoUrl: "https://upload.wikimedia.org/wikipedia/commons/f/f2/Enzo_Fernandez_Argentina_v_Egypt_7_July_2026-058.jpg" },
      { nome: "Alexis Mac Allister", numero: 20, posicao: "LINHA", instagram: "@alemacallister", fotoUrl: "https://upload.wikimedia.org/wikipedia/commons/4/49/Alexis_Mac_Allister_WC_2022.jpg" },
      { nome: "Nicolás González", numero: 15, posicao: "ALA", instagram: "@nicoigonzalez", fotoUrl: "https://upload.wikimedia.org/wikipedia/commons/d/d3/Nicolas_Gonzalez_%28cropped%29.jpg" },
      { nome: "Lionel Messi", numero: 10, posicao: "PIVO", instagram: "@leomessi", fotoUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c8/Lionel_Messi_NE_Revolution_Inter_Miami_7.9.25-178_%28cropped_2%29.jpg" },
      { nome: "Julián Álvarez", numero: 9, posicao: "PIVO", instagram: "@juliaanalvarez", fotoUrl: "https://upload.wikimedia.org/wikipedia/commons/3/34/Juli%C3%A1n_%C3%81lvarez_%28footballer%29_2023.jpg" },
    ],
  },
];

async function main() {
  for (const sel of selecoes) {
    const time = await prisma.time.findFirstOrThrow({ where: { nome: sel.timeAtual } });
    const atletasExistentes = await prisma.atleta.findMany({
      where: { timeId: time.id },
      orderBy: { numero: "asc" },
    });

    // fase 1: numero temporário, pra não colidir com a constraint unique(timeId, numero)
    for (const [i, a] of atletasExistentes.entries()) {
      await prisma.atleta.update({ where: { id: a.id }, data: { numero: 9000 + i } });
    }

    // fase 2: atualiza no lugar os atletas existentes (preserva o id, então
    // eventos/enquetes que já apontam pra eles continuam válidos)
    const n = Math.min(atletasExistentes.length, sel.jogadores.length);
    for (let i = 0; i < n; i++) {
      const j = sel.jogadores[i];
      await prisma.atleta.update({
        where: { id: atletasExistentes[i].id },
        data: {
          nome: j.nome,
          numero: j.numero,
          posicao: j.posicao,
          instagram: j.instagram,
          fotoUrl: j.fotoUrl,
        },
      });
    }

    // fase 3: cria os titulares que sobrarem (elenco real tem 11, o fictício tinha 8)
    for (let i = n; i < sel.jogadores.length; i++) {
      const j = sel.jogadores[i];
      await prisma.atleta.create({
        data: {
          nome: j.nome,
          numero: j.numero,
          posicao: j.posicao,
          instagram: j.instagram,
          fotoUrl: j.fotoUrl,
          timeId: time.id,
        },
      });
    }

    await prisma.time.update({
      where: { id: time.id },
      data: { nome: sel.nomeNovo, escudoUrl: sel.escudoUrl },
    });

    console.log(`${sel.timeAtual} -> ${sel.nomeNovo}: ${sel.jogadores.length} titulares.`);
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
