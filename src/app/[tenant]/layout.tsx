import { auth } from "@/auth";
import { getTenantBySlug } from "@/lib/tenant";
import { TopHeader } from "@/components/nav/top-header";
import { BottomNav } from "@/components/nav/bottom-nav";
import { SponsorFooter } from "@/components/patrocinadores/sponsor-footer";
import { SponsorStrip } from "@/components/patrocinadores/sponsor-strip";
import { getPatrocinadoresAtivos } from "@/lib/patrocinadores";

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);

  const session = await auth();
  const role = session?.user?.tenantSlug === tenantSlug ? session.user.role : null;
  const userName = session?.user?.tenantSlug === tenantSlug ? session.user.name : null;

  const patrocinadoresMaster = (await getPatrocinadoresAtivos(tenant.id)).filter(
    (p) => p.nivel === "MASTER"
  );

  return (
    <>
      <TopHeader role={role} userName={userName} tenantSlug={tenantSlug} />
      {patrocinadoresMaster.length > 0 && (
        <SponsorStrip
          patrocinadores={patrocinadoresMaster}
          className="justify-center border-b border-border bg-surface/50"
        />
      )}
      <main className="flex-1 pb-20 md:pb-8">{children}</main>
      <SponsorFooter tenantId={tenant.id} />
      <BottomNav role={role} tenantSlug={tenantSlug} />
    </>
  );
}
