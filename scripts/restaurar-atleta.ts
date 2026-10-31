/**
 * Recria um atleta apagado por engano a partir de uma cópia de segurança
 * (pasta gerada por scripts/backup-banco.ts). Volta com o mesmo id, nome,
 * número, posição e data de nascimento.
 *
 * Arquivos: apagar o atleta apaga também foto e documentos do armazenamento,
 * então a foto só volta se a URL ainda responder; os documentos só voltam se
 * a inscrição dele ainda existir (caso de inscrição revogada, que não apaga
 * arquivos), e nesse caso ela é religada ao atleta e volta a APROVADA.
 *
 * Uso (sem --aplicar só lista os atletas do time que estão no backup e
 * não estão mais no banco):
 *   npx tsx scripts/restaurar-atleta.ts --backup backups/<pasta> --time "Gibe"
 *   npx tsx scripts/restaurar-atleta.ts --backup backups/<pasta> --time "Gibe" --id <atletaId> --aplicar
 *
 * Lê DATABASE_URL e DATABASE_AUTH_TOKEN do ambiente ou de .env.production.local.
 */
import { config } from "dotenv";
import { readFile } from "fs/promises";
import path from "path";
import { gunzipSync } from "zlib";
import { PrismaClient, type Posicao } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

config({ path: ".env.production.local", quiet: true });

const arg = (nome: string) => {
  const i = process.argv.indexOf(`--${nome}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
};
const pasta = arg("backup");
const timeBusca = arg("time");
const idEscolhido = arg("id");
const aplicar = process.argv.includes("--aplicar");

type AtletaBackup = {
  id: string; tenantId: string; nome: string; numero: number; posicao: Posicao;
  fotoUrl: string | null; dataNascimento: string | null; instagram: string | null;
  timeId: string; createdAt: string;
};
type TimeBackup = { id: string; nome: string };

const normalizar = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();

const lerTabela = async <T>(nome: string): Promise<T[]> =>
  JSON.parse(gunzipSync(await readFile(path.join(pasta!, `${nome}.json.gz`))).toString());

async function fotoExiste(url: string | null) {
  if (!url?.startsWith("http")) return false;
  try {
    return (await fetch(url, { method: "HEAD" })).ok;
  } catch {
    return false;
  }
}

async function main() {
  if (!pasta || !timeBusca) throw new Error('Informe --backup backups/<pasta> --time "nome do time".');

  const databaseUrl = process.env.DATABASE_URL ?? "";
  if (!databaseUrl.startsWith("libsql:") && !databaseUrl.startsWith("https:")) {
    throw new Error("DATABASE_URL não é do Turso (libsql://...).");
  }
  const prisma = new PrismaClient({
    adapter: new PrismaLibSql({ url: databaseUrl, authToken: process.env.DATABASE_AUTH_TOKEN }),
  });

  const times = (await lerTabela<TimeBackup>("Time")).filter((t) => normalizar(t.nome).includes(normalizar(timeBusca)));
  if (times.length !== 1) {
    console.table(times.map((t) => ({ time: t.nome })));
    throw new Error(times.length ? "Mais de um time no backup; use o nome mais completo." : "Time não encontrado no backup.");
  }
  const [time] = times;

  const doBackup = (await lerTabela<AtletaBackup>("Atleta")).filter((a) => a.timeId === time.id);
  const noBanco = new Set(
    (await prisma.atleta.findMany({ where: { id: { in: doBackup.map((a) => a.id) } }, select: { id: true } })).map((a) => a.id)
  );
  const apagados = doBackup.filter((a) => !noBanco.has(a.id));

  console.log(`Time: ${time.nome}`);
  if (apagados.length === 0) {
    console.log("Todos os atletas do backup ainda estão no banco.");
    return;
  }
  console.log("Atletas do backup que não estão mais no banco:");
  console.table(apagados.map((a) => ({ id: a.id, nome: a.nome, numero: a.numero, posicao: a.posicao })));

  if (!aplicar) {
    console.log("\nNada foi alterado. Para restaurar, rode de novo com --id <id> --aplicar.");
    return;
  }
  const atleta = apagados.find((a) => a.id === idEscolhido);
  if (!atleta) throw new Error("Informe com --id um dos ids da lista acima.");

  const numeroOcupado = await prisma.atleta.findFirst({ where: { timeId: atleta.timeId, numero: atleta.numero } });
  if (numeroOcupado) throw new Error(`O número ${atleta.numero} já é de ${numeroOcupado.nome} no time; resolva isso antes.`);

  const inscricao = await prisma.inscricaoAtleta.findFirst({
    where: { timeId: atleta.timeId, atletaId: null, nome: atleta.nome },
    orderBy: { createdAt: "desc" },
  });
  const fotoUrl = (await fotoExiste(atleta.fotoUrl)) ? atleta.fotoUrl : (inscricao?.fotoUrl ?? null);

  await prisma.$transaction(async (tx) => {
    await tx.atleta.create({
      data: {
        id: atleta.id,
        tenantId: atleta.tenantId,
        timeId: atleta.timeId,
        nome: atleta.nome,
        numero: atleta.numero,
        posicao: atleta.posicao,
        dataNascimento: atleta.dataNascimento ? new Date(atleta.dataNascimento) : null,
        instagram: atleta.instagram,
        createdAt: new Date(atleta.createdAt),
        fotoUrl,
        documentoUrl: inscricao?.documentoUrl ?? null,
        comprovanteEnderecoUrl: inscricao?.comprovanteEnderecoUrl ?? null,
        aceiteTermoEm: inscricao?.aceiteTermoEm,
        aceiteVersao: inscricao?.aceiteVersao,
        aceiteOrigem: inscricao?.aceiteOrigem,
        aceiteResponsavel: inscricao?.aceiteResponsavel,
        imagemAutorizadaEm: inscricao?.imagemAutorizadaEm,
      },
    });
    if (inscricao) {
      await tx.inscricaoAtleta.update({ where: { id: inscricao.id }, data: { atletaId: atleta.id, status: "APROVADA" } });
    }
  });

  console.log(`\nPronto: ${atleta.nome} (#${atleta.numero}) voltou para o ${time.nome}.`);
  console.log(`Foto: ${fotoUrl ? "recuperada" : "perdida, precisa enviar de novo"}`);
  console.log(`Documentos: ${inscricao?.documentoUrl ? "recuperados da inscrição" : "perdidos, precisa enviar de novo"}`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
