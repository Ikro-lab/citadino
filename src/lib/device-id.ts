import "server-only";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";

const COOKIE_NAME = "citadino_device";

/**
 * Identificador anônimo de dispositivo/sessão usado só para limitar 1 voto
 * por enquete (não é vinculado a nenhuma conta de usuário).
 */
export async function getOrCreateDeviceId() {
  const cookieStore = await cookies();
  const existing = cookieStore.get(COOKIE_NAME)?.value;
  if (existing) return existing;

  const id = randomUUID();
  cookieStore.set(COOKIE_NAME, id, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
  return id;
}

/** Só leitura — seguro para usar durante a renderização de páginas. */
export async function getDeviceIdReadOnly() {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value ?? null;
}
