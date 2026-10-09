"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/require-role";
import { isValidTenantSlug } from "@/lib/tenant";
import { isValidHexColor } from "@/lib/color";

export type CreateTenantState = { error?: string; success?: boolean } | undefined;

export async function createTenantComAdmin(
  _prevState: CreateTenantState,
  formData: FormData
): Promise<CreateTenantState> {
  await requireSuperAdmin();

  const slug = String(formData.get("slug") || "").trim().toLowerCase();
  const nome = String(formData.get("nome") || "").trim();
  const corPrimaria = String(formData.get("corPrimaria") || "").trim() || "#f5821f";
  const corSecundaria = String(formData.get("corSecundaria") || "").trim() || "#2fbf8f";
  const adminName = String(formData.get("adminName") || "").trim();
  const adminEmail = String(formData.get("adminEmail") || "").trim();
  const adminPassword = String(formData.get("adminPassword") || "");

  if (!nome || !adminName || !adminEmail || adminPassword.length < 6) {
    return { error: "Preencha todos os campos (senha com ao menos 6 caracteres)." };
  }
  if (!isValidTenantSlug(slug)) {
    return { error: "Slug inválido. Use apenas letras minúsculas, números e hífen." };
  }
  if (!isValidHexColor(corPrimaria) || !isValidHexColor(corSecundaria)) {
    return { error: "Cor inválida. Use o seletor de cores ou um hex no formato #rrggbb." };
  }

  const existingTenant = await prisma.tenant.findUnique({ where: { slug } });
  if (existingTenant) {
    return { error: "Já existe um tenant com esse slug." };
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.$transaction(async (tx) => {
    const tenant = await tx.tenant.create({ data: { slug, nome, corPrimaria, corSecundaria, ativo: true } });
    await tx.user.create({
      data: {
        name: adminName,
        email: adminEmail,
        passwordHash,
        role: "ADMIN",
        tenantId: tenant.id,
      },
    });
  });

  revalidatePath("/super-admin");
  // A tela inicial é pré-renderizada no build e lista os tenants ativos.
  revalidatePath("/");
  return { success: true };
}

export async function toggleTenantAtivo(id: string, ativo: boolean) {
  await requireSuperAdmin();
  await prisma.tenant.update({ where: { id }, data: { ativo } });
  revalidatePath("/super-admin");
  // A tela inicial é pré-renderizada no build e lista os tenants ativos.
  revalidatePath("/");
}

export type ExcluirTenantState = { error?: string } | undefined;

/**
 * Exclui um tenant e tudo dele. Várias ligações internas são RESTRICT (jogo →
 * time, opção de enquete → atleta), então a cascata do tenant não basta: apaga
 * na ordem certa, numa transação (se algo falhar, nada é apagado). Exige
 * digitar o slug para confirmar.
 */
export async function excluirTenant(id: string, _prev: ExcluirTenantState, formData: FormData): Promise<ExcluirTenantState> {
  await requireSuperAdmin();
  const tenant = await prisma.tenant.findUnique({ where: { id }, select: { slug: true } });
  if (!tenant) return { error: "Campeonato não encontrado." };
  if (String(formData.get("confirmacao") || "").trim() !== tenant.slug) {
    return { error: `Digite exatamente "${tenant.slug}" para confirmar.` };
  }

  const doTenant = { where: { tenantId: id } };
  await prisma.$transaction([
    prisma.enqueteVoto.deleteMany(doTenant),
    prisma.enqueteOpcao.deleteMany(doTenant),
    prisma.enquete.deleteMany(doTenant),
    prisma.eventoPartida.deleteMany(doTenant),
    prisma.partida.deleteMany(doTenant),
    prisma.inscricaoAtleta.deleteMany(doTenant),
    prisma.solicitacaoTime.deleteMany(doTenant),
    prisma.atleta.deleteMany(doTenant),
    prisma.time.deleteMany(doTenant),
    prisma.grupo.deleteMany(doTenant),
    prisma.patrocinador.deleteMany(doTenant),
    prisma.categoria.deleteMany(doTenant),
    prisma.campeonato.deleteMany(doTenant),
    prisma.pushSubscription.deleteMany(doTenant),
    prisma.user.deleteMany(doTenant),
    prisma.tenant.delete({ where: { id } }),
  ]);

  revalidatePath("/super-admin");
  revalidatePath("/");
  return {};
}
