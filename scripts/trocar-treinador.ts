/**
 * Passa o comando de um time para outra pessoa (ex.: uma atleta que virou a
 * técnica). Acha o time pelo nome da atleta, cria a conta de TREINADOR com o
 * e-mail e a senha informados e troca o treinador do time. Se já existe conta
 * com esse e-mail no campeonato, ela é reaproveitada: recebe o nome da atleta
 * e a senha nova. A conta do treinador antigo (outro e-mail) continua
 * existindo, só deixa de gerenciar este time.
 *
 * Uso (sem --aplicar só mostra o que vai fazer):
 *   npx tsx scripts/trocar-treinador.ts --atleta "Nome da Atleta" --email x@y.com --senha 123456
 *   npx tsx scripts/trocar-treinador.ts --atleta "Nome da Atleta" --email x@y.com --senha 123456 --aplicar
 *
 * Lê DATABASE_URL e DATABASE_AUTH_TOKEN do ambiente ou de .env.production.local.
 */
import { config } from "dotenv";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

config({ path: ".env.production.local", quiet: true });

const arg = (nome: string) => {
  const i = process.argv.indexOf(`--${nome}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
};
const atletaBusca = arg("atleta");
const email = arg("email")?.trim();
const senha = arg("senha");
const aplicar = process.argv.includes("--aplicar");

const normalizar = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();

async function main() {
  if (!atletaBusca || !email || !senha) throw new Error('Informe --atleta "nome" --email e-mail --senha senha.');
  if (senha.length < 6) throw new Error("A senha precisa ter ao menos 6 caracteres.");

  const databaseUrl = process.env.DATABASE_URL ?? "";
  if (!databaseUrl.startsWith("libsql:") && !databaseUrl.startsWith("https:")) {
    throw new Error("DATABASE_URL não é do Turso (libsql://...).");
  }
  const prisma = new PrismaClient({
    adapter: new PrismaLibSql({ url: databaseUrl, authToken: process.env.DATABASE_AUTH_TOKEN }),
  });

  const alvo = normalizar(atletaBusca);
  const atletas = (
    await prisma.atleta.findMany({
      select: {
        id: true, nome: true, numero: true,
        time: { select: { id: true, nome: true, tenantId: true, treinador: { select: { id: true, name: true, email: true } } } },
      },
    })
  ).filter((a) => normalizar(a.nome).includes(alvo));

  if (atletas.length === 0) throw new Error(`Nenhuma atleta encontrada com "${atletaBusca}".`);
  if (atletas.length > 1) {
    console.table(atletas.map((a) => ({ atleta: a.nome, numero: a.numero, time: a.time.nome })));
    throw new Error("Mais de uma atleta encontrada; use o nome mais completo.");
  }
  const [atleta] = atletas;
  const { time } = atleta;

  const existente = await prisma.user.findUnique({
    where: { tenantId_email: { tenantId: time.tenantId, email } },
    include: { times: { select: { nome: true } } },
  });

  console.log(`Atleta:            ${atleta.nome} (#${atleta.numero})`);
  console.log(`Time:              ${time.nome}`);
  console.log(`Treinador atual:   ${time.treinador ? `${time.treinador.name} <${time.treinador.email}>` : "(nenhum)"}`);
  console.log(
    existente
      ? `Conta:             já existe (${existente.name}, ${existente.role}); passa a se chamar ${atleta.nome} e recebe a senha informada`
      : `Conta:             nova conta TREINADOR ${email}`
  );
  if (existente) {
    console.log(`Times da conta:    ${existente.times.map((t) => t.nome).join(", ") || "(nenhum)"}`);
  }

  if (!aplicar) {
    console.log("\nNada foi alterado. Rode de novo com --aplicar para confirmar.");
    return;
  }

  const passwordHash = await bcrypt.hash(senha, 10);
  const userId = existente
    ? (await prisma.user.update({ where: { id: existente.id }, data: { name: atleta.nome, passwordHash } })).id
    : (
        await prisma.user.create({
          data: { name: atleta.nome, email, passwordHash, role: "TREINADOR", tenantId: time.tenantId },
        })
      ).id;
  await prisma.time.update({ where: { id: time.id }, data: { treinadorId: userId } });
  console.log(`\nPronto: ${time.nome} agora é gerenciado por ${email}.`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
