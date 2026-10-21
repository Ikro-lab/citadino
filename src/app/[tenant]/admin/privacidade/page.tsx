import Link from "next/link";
import { getTenantBySlug } from "@/lib/tenant";
import { getTenantPrisma } from "@/lib/tenant-prisma";
import { paths } from "@/lib/tenant-path";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/ui/delete-button";
import { ehRefPrivada } from "@/lib/storage";
import { ehMenorDeIdade } from "@/lib/privacidade";
import { apagarDocumentosTemporada, ocultarFotosMenoresSemAutorizacao } from "@/lib/actions/privacidade";
import { PrivacidadeForm } from "./privacidade-form";

export default async function AdminPrivacidadePage({ params }: PageProps<"/[tenant]/admin/privacidade">) {
  const { tenant: tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  const db = getTenantPrisma(tenant.id);

  const [atletas, comDocumentos] = await Promise.all([
    db.atleta.findMany({ select: { fotoUrl: true, dataNascimento: true, imagemAutorizadaEm: true } }),
    db.atleta.count({ where: { OR: [{ documentoUrl: { not: null } }, { comprovanteEnderecoUrl: { not: null } }] } }),
  ]);
  const semAutorizacao = atletas.filter((a) => !a.imagemAutorizadaEm).length;
  const menoresComFotoPublica = atletas.filter(
    (a) =>
      !a.imagemAutorizadaEm &&
      a.fotoUrl &&
      !ehRefPrivada(a.fotoUrl) &&
      a.dataNascimento &&
      ehMenorDeIdade(a.dataNascimento)
  ).length;

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <h2 className="mb-1 font-semibold">Política de privacidade</h2>
        <p className="mb-4 text-sm text-muted">
          Estes dados aparecem na{" "}
          <Link href={paths.privacidade(tenantSlug)} className="text-accent underline" target="_blank">
            política pública do campeonato
          </Link>
          . O e-mail é para onde atletas e responsáveis mandam pedidos de acesso, correção ou exclusão.
        </p>
        <PrivacidadeForm orgao={tenant.privacidadeOrgao ?? ""} email={tenant.privacidadeEmail ?? ""} />
      </Card>

      <Card className="flex flex-col gap-3">
        <h2 className="font-semibold">Autorização de imagem</h2>
        <p className="text-sm text-muted">
          {semAutorizacao === 0
            ? "Todos os atletas têm autorização de imagem registrada."
            : `${semAutorizacao} de ${atletas.length} atletas não têm autorização de imagem registrada. Quem se inscreveu depois do termo e não autorizou já aparece sem foto.`}
        </p>
        {menoresComFotoPublica > 0 && (
          <div className="flex flex-col gap-2 rounded-lg bg-accent-soft p-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm">
              {menoresComFotoPublica} menor(es) de idade, cadastrados antes do termo, aparecem com foto no site sem
              autorização registrada.
            </p>
            <form action={ocultarFotosMenoresSemAutorizacao}>
              <Button type="submit" size="sm" variant="secondary">
                Tirar essas fotos do site
              </Button>
            </form>
          </div>
        )}
        <p className="text-xs text-muted">
          Para registrar uma autorização, edite o atleta no elenco do time e marque a autorização de imagem.
        </p>
      </Card>

      <Card className="flex flex-col gap-3">
        <h2 className="font-semibold">Documentos e comprovantes</h2>
        <p className="text-sm text-muted">
          Documento de identidade e comprovante de residência servem só para conferir a inscrição. Os de inscrições
          recusadas são apagados na hora. Ao fim da temporada, apague os demais: {comDocumentos} atleta(s) ainda têm
          arquivos guardados. Inscrições pendentes não são afetadas.
        </p>
        {comDocumentos > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Apagar todos os documentos dos atletas</span>
            <DeleteButton action={apagarDocumentosTemporada} label="Apagar documentos" />
          </div>
        )}
      </Card>
    </div>
  );
}
