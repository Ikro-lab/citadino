"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/require-role";
import { isValidTenantSlug } from "@/lib/tenant";

export type CreateTenantState = { error?: string; success?: boolean } | undefined;

export async function createTenantComAdmin(
  _prevState: CreateTenantState,
  formData: FormData
): Promise<CreateTenantState> {
  await requireSuperAdmin();

  const slug = String(formData.get("slug") || "").trim().toLowerCase();
  const nome = String(formData.get("nome") || "").trim();
  const adminName = String(formData.get("adminName") || "").trim();
  const adminEmail = String(formData.get("adminEmail") || "").trim();
  const adminPassword = String(formData.get("adminPassword") || "");

  if (!nome || !adminName || !adminEmail || adminPassword.length < 6) {
    return { error: "Preencha todos os campos (senha com ao menos 6 caracteres)." };
  }
  if (!isValidTenantSlug(slug)) {
    return { error: "Slug inválido. Use apenas letras minúsculas, números e hífen." };
  }

  const existingTenant = await prisma.tenant.findUnique({ where: { slug } });
  if (existingTenant) {
    return { error: "Já existe um tenant com esse slug." };
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.$transaction(async (tx) => {
    const tenant = await tx.tenant.create({ data: { slug, nome, ativo: true } });
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
  return { success: true };
}

export async function toggleTenantAtivo(id: string, ativo: boolean) {
  await requireSuperAdmin();
  await prisma.tenant.update({ where: { id }, data: { ativo } });
  revalidatePath("/super-admin");
}
