import Link from "next/link";
import { notFound } from "next/navigation";
import { getTenantBySlug } from "@/lib/tenant";
import { getTenantPrisma } from "@/lib/tenant-prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label, Select } from "@/components/ui/input";
import { EventoVideo } from "@/components/partidas/evento-video";
import { acaoLinkClass } from "@/components/partidas/partida-list-item";
import { aprovarGolSugerido, descartarGolSugerido } from "@/lib/actions/gols-sugeridos";
import { extrairYoutubeId, youtubeUrlNoSegundo } from "@/lib/youtube";
import { nomeDoAtleta } from "@/lib/labels";
import { paths } from "@/lib/tenant-path";

const SITUACAO: Record<string, string> = {
  APROVADO: "Gol aprovado e lançado na súmula.",
  LANCADO: "Esse gol já tinha sido lançado na súmula; o clipe dele foi acertado pela transmissão.",
  DESCARTADO: "Descartado: nenhum gol foi lançado.",
};

/** Gol visto no placar da live: o admin confere o lance, escolhe o autor e aprova. */
export default async function GolSugeridoPage({ params }: { params: Promise<{ tenant: string; id: string }> }) {
  const { tenant: tenantSlug, id } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  const db = getTenantPrisma(tenant.id);

  const sugestao = await db.golSugerido.findUnique({
    where: { id },
    include: {
      partida: {
        include: {
          categoria: { select: { nome: true } },
          timeCasa: { select: { id: true, nome: true } },
          timeFora: { select: { id: true, nome: true } },
        },
      },
    },
  });
  if (!sugestao) notFound();

  const { partida } = sugestao;
  const time = sugestao.timeId === partida.timeCasa.id ? partida.timeCasa : partida.timeFora;
  const atletas = await db.atleta.findMany({
    where: { timeId: time.id },
    orderBy: { numero: "asc" },
    select: { id: true, nome: true, apelido: true, numero: true },
  });
  const videoId = extrairYoutubeId(partida.linkTransmissaoUrl);
  const pendente = sugestao.status === "PENDENTE";

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <div className="mb-3 flex items-center justify-between gap-2">
          <Badge variant="accent">{partida.categoria.nome}</Badge>
          <Badge variant={pendente ? "live" : "neutral"}>{pendente ? "Esperando aprovação" : "Resolvido"}</Badge>
        </div>
        <p className="text-sm text-muted">Gol detectado no placar da transmissão</p>
        <h2 className="text-xl font-semibold">Gol de {time.nome}?</h2>
        <p className="mt-1 font-display text-2xl font-bold tabular-nums">
          {partida.timeCasa.nome} {sugestao.placarCasa} x {sugestao.placarFora} {partida.timeFora.nome}
        </p>
        {videoId && (
          <EventoVideo url={youtubeUrlNoSegundo(videoId, sugestao.videoSegundo)} className="mt-4 aspect-video w-full rounded-xl bg-black" />
        )}
      </Card>

      {pendente ? (
        <Card>
          <form action={aprovarGolSugerido.bind(null, id)} className="flex flex-col gap-3">
            <div>
              <Label htmlFor="atletaId">Quem fez o gol</Label>
              <Select id="atletaId" name="atletaId" defaultValue="">
                <option value="">Escolher depois</option>
                {atletas.map((a) => (
                  <option key={a.id} value={a.id}>
                    #{a.numero} {nomeDoAtleta(a)}
                  </option>
                ))}
              </Select>
            </div>
            <Button type="submit" size="lg" className="w-full">
              Aprovar gol
            </Button>
          </form>
          <form action={descartarGolSugerido.bind(null, id)} className="mt-2">
            <Button type="submit" variant="secondary" size="lg" className="w-full">
              Descartar (não foi gol)
            </Button>
          </form>
        </Card>
      ) : (
        <Card>
          <p className="mb-3 text-sm">{SITUACAO[sugestao.status] ?? sugestao.status}</p>
          <Link href={paths.admin.partidaSumula(tenantSlug, partida.id)} className={acaoLinkClass}>
            Abrir a súmula
          </Link>
        </Card>
      )}
    </div>
  );
}
