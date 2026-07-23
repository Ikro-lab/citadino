import type { Metadata } from "next";
import { auth } from "@/auth";
import { getTenantBySlug } from "@/lib/tenant";
import { deriveThemeVariants } from "@/lib/color";
import { TopHeader } from "@/components/nav/top-header";
import { BottomNav } from "@/components/nav/bottom-nav";
import { SponsorFooter } from "@/components/patrocinadores/sponsor-footer";
import { SponsorStrip } from "@/components/patrocinadores/sponsor-strip";
import { getPatrocinadoresAtivos } from "@/lib/patrocinadores";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tenant: string }>;
}): Promise<Metadata> {
  const { tenant: tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  return {
    title: tenant.nome,
    description: `Acompanhe o ${tenant.nome}: feed de partidas ao vivo, resultados e tabela de classificação.`,
  };
}

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

  const accent = deriveThemeVariants(tenant.corPrimaria);
  const secondary = deriveThemeVariants(tenant.corSecundaria);
  const paletteCss = `
    :root {
      --accent: ${accent.light.base};
      --accent-foreground: ${accent.light.foreground};
      --accent-dark: ${accent.light.darkVariant};
      --accent-soft: ${accent.light.soft};
      --secondary: ${secondary.light.base};
      --secondary-foreground: ${secondary.light.foreground};
      --secondary-soft: ${secondary.light.soft};
    }
    [data-theme="dark"] {
      --accent: ${accent.dark.base};
      --accent-foreground: ${accent.dark.foreground};
      --accent-dark: ${accent.dark.darkVariant};
      --accent-soft: ${accent.dark.soft};
      --secondary: ${secondary.dark.base};
      --secondary-foreground: ${secondary.dark.foreground};
      --secondary-soft: ${secondary.dark.soft};
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: paletteCss }} />
      <TopHeader role={role} userName={userName} tenantSlug={tenantSlug} nomeSistema={tenant.nome} />
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
