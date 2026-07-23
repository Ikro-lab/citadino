import { Suspense } from "react";
import { getTenantBySlug } from "@/lib/tenant";
import LoginForm from "./login-form";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: tenantSlug } = await params;
  await getTenantBySlug(tenantSlug);

  return (
    <Suspense>
      <LoginForm tenantSlug={tenantSlug} />
    </Suspense>
  );
}
