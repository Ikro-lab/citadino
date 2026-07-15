import { redirect } from "next/navigation";
import { auth } from "@/auth";

export async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/login");
  return session;
}

export async function requireTreinador() {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.role !== "TREINADOR" && session.user.role !== "ADMIN")
  ) {
    redirect("/login");
  }
  return session;
}
