/**
 * Passa os e-mails das contas para minúsculas (o login agora ignora
 * maiúsculas; ver src/lib/email.ts). Contas do mesmo campeonato com o mesmo
 * e-mail em maiúsculas diferentes (o treinador não conseguiu entrar e criou
 * outra) viram uma só: fica a que tem mais times (empate: a mais recente),
 * que recebe times, solicitações e lances das outras; as outras são apagadas.
 * Grupos com papéis diferentes (admin e treinador) só são listados.
 *
 * A senha que vale é a da conta que fica: depois de juntar, gere um link de
 * nova senha na página do time e mande para o treinador.
 *
 * Uso (sem --aplicar só mostra o que vai fazer):
 *   npx tsx scripts/normalizar-emails.ts [--aplicar]
 *
 * Lê DATABASE_URL e DATABASE_AUTH_TOKEN do ambiente ou de .env.production.local.
 * Faça um backup do banco antes de rodar com --aplicar.
 */
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

config({ path: ".env.production.local", quiet: true });

const aplicar = process.argv.includes("--aplicar");
const normalizar = (email: string) => email.trim().toLowerCase();

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("Defina DATABASE_URL (e DATABASE_AUTH_TOKEN).");
  const prisma = new PrismaClient({
    adapter: new PrismaLibSql({ url: process.env.DATABASE_URL, authToken: process.env.DATABASE_AUTH_TOKEN }),
  });

  const usuarios = await prisma.user.findMany({
    select: {
      id: true, name: true, email: true, role: true, tenantId: true, createdAt: true, categoriaConviteId: true,
      _count: { select: { times: true } },
      times: { select: { nome: true, categoria: { select: { nome: true } } } },
    },
    orderBy: { createdAt: "asc" },
  });

  const grupos = new Map<string, typeof usuarios>();
  for (const u of usuarios) {
    const chave = `${u.tenantId ?? "-"}|${normalizar(u.email)}`;
    grupos.set(chave, [...(grupos.get(chave) ?? []), u]);
  }

  let minusculas = 0;
  let juntadas = 0;
  const conflitos: string[] = [];
  const acoes: (() => Promise<unknown>)[] = [];

  for (const contas of grupos.values()) {
    const email = normalizar(contas[0].email);
    if (contas.length === 1) {
      const [u] = contas;
      if (u.email === email) continue;
      minusculas++;
      console.log(`minúsculas: ${u.email} -> ${email}`);
      acoes.push(() => prisma.user.update({ where: { id: u.id }, data: { email } }));
      continue;
    }

    if (new Set(contas.map((c) => c.role)).size > 1 || contas[0].role !== "TREINADOR") {
      conflitos.push(`${email}: ${contas.map((c) => `${c.role} ${c.email}`).join(" / ")}`);
      continue;
    }
    const [fica, ...saem] = [...contas].sort(
      (a, b) => b._count.times - a._count.times || b.createdAt.getTime() - a.createdAt.getTime()
    );
    const times = (u: (typeof contas)[number]) =>
      u.times.map((t) => `${t.categoria.nome.replace(/^Categoria de base /, "")}: ${t.nome}`).join(", ") || "nenhum time";
    console.log(`\njuntar ${email} (${fica.name}):`);
    console.log(`  fica  ${fica.email} (criada ${fica.createdAt.toISOString().slice(0, 10)}) | ${times(fica)}`);
    for (const s of saem) console.log(`  sai   ${s.email} (criada ${s.createdAt.toISOString().slice(0, 10)}) | ${times(s)}`);
    juntadas += saem.length;
    const idsSaem = saem.map((s) => s.id);
    const convite = fica.categoriaConviteId ?? saem.find((s) => s.categoriaConviteId)?.categoriaConviteId ?? null;
    acoes.push(() =>
      prisma.$transaction([
        prisma.time.updateMany({ where: { treinadorId: { in: idsSaem } }, data: { treinadorId: fica.id } }),
        prisma.solicitacaoTime.updateMany({ where: { treinadorId: { in: idsSaem } }, data: { treinadorId: fica.id } }),
        prisma.eventoPartida.updateMany({ where: { lancadoPorId: { in: idsSaem } }, data: { lancadoPorId: fica.id } }),
        prisma.user.deleteMany({ where: { id: { in: idsSaem } } }),
        prisma.user.update({ where: { id: fica.id }, data: { email, categoriaConviteId: convite } }),
      ])
    );
  }

  console.log(`\n${minusculas} e-mail(s) a passar para minúsculas; ${juntadas} conta(s) duplicada(s) a juntar.`);
  if (conflitos.length) {
    console.log(`Não mexo (papéis diferentes ou não treinador), resolva à mão:`);
    for (const c of conflitos) console.log(`  ${c}`);
  }
  if (!aplicar) {
    console.log("Simulação: nada foi alterado. Rode com --aplicar para gravar.");
  } else {
    for (const acao of acoes) await acao();
    console.log("Pronto.");
  }
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
