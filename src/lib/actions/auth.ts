"use server";

import { AuthError } from "next-auth";
import * as z from "zod";
import bcrypt from "bcryptjs";
import { signIn } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getTenantBySlug } from "@/lib/tenant";
import { paths } from "@/lib/tenant-path";

export type LoginState = { error?: string } | undefined;

export async function login(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = formData.get("email");
  const password = formData.get("password");
  const tenantSlug = String(formData.get("tenantSlug") || "");
  const callbackUrl = (formData.get("callbackUrl") as string) || paths.home(tenantSlug);

  if (!tenantSlug) {
    return { error: "Tenant não informado." };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      tenantSlug,
      redirectTo: callbackUrl,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "E-mail ou senha inválidos." };
        default:
          return { error: "Não foi possível entrar. Tente novamente." };
      }
    }
    throw error;
  }
}

const CadastroSchema = z
  .object({
    name: z.string().trim().min(2, "Informe seu nome completo."),
    email: z.email("E-mail inválido."),
    password: z.string().min(6, "A senha deve ter ao menos 6 caracteres."),
    confirmPassword: z.string(),
    nomeTime: z.string().trim().optional(),
    categoriaId: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

export type CadastroState =
  | { error?: string; fieldErrors?: Record<string, string[]> }
  | undefined;

export async function cadastroTreinador(
  _prevState: CadastroState,
  formData: FormData
): Promise<CadastroState> {
  const tenantSlug = String(formData.get("tenantSlug") || "");
  if (!tenantSlug) {
    return { error: "Tenant não informado." };
  }

  const parsed = CadastroSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    nomeTime: formData.get("nomeTime") || undefined,
    categoriaId: formData.get("categoriaId") || undefined,
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { name, email, password, nomeTime, categoriaId } = parsed.data;

  const tenant = await getTenantBySlug(tenantSlug);

  const existing = await prisma.user.findUnique({
    where: { tenantId_email: { tenantId: tenant.id, email } },
  });
  if (existing) {
    return { error: "Já existe uma conta com este e-mail." };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { name, email, passwordHash, role: "TREINADOR", tenantId: tenant.id },
  });

  if (nomeTime) {
    await prisma.solicitacaoTime.create({
      data: {
        tenantId: tenant.id,
        nomeTime,
        treinadorId: user.id,
        categoriaId: categoriaId || null,
        status: "PENDENTE",
      },
    });
  }

  try {
    await signIn("credentials", {
      email,
      password,
      tenantSlug,
      redirectTo: paths.treinador.root(tenantSlug),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Conta criada. Faça login para continuar." };
    }
    throw error;
  }
}

export async function logout() {
  const { signOut } = await import("@/auth");
  await signOut({ redirectTo: "/" });
}

export async function loginSuperAdmin(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = formData.get("email");
  const password = formData.get("password");

  try {
    await signIn("super-admin-credentials", {
      email,
      password,
      redirectTo: "/super-admin",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "E-mail ou senha inválidos." };
        default:
          return { error: "Não foi possível entrar. Tente novamente." };
      }
    }
    throw error;
  }
}
