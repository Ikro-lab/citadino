import Link from "next/link";
import { resolveCategoriaId } from "@/lib/categorias";
import { getArtilharia } from "@/lib/artilharia";
import { CategoriaTabs } from "@/components/partidas/categoria-tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function ArtilhariaPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  const sp = await searchParams;
  const { categoriaId, categorias } = await resolveCategoriaId(sp.categoria);

  const linhas = categoriaId ? await getArtilharia(categoriaId) : [];

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-bold">Artilharia</h1>

      {categorias.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border py-12 text-center text-sm text-muted">
          Nenhum campeonato ativo no momento.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          <CategoriaTabs categorias={categorias} categoriaId={categoriaId} basePath="/artilharia" />

          {linhas.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border py-12 text-center text-sm text-muted">
              Nenhum gol ou cartão registrado ainda nesta categoria.
            </p>
          ) : (
            <Card className="p-0">
              <ul className="divide-y divide-border">
                {linhas.map((l, i) => (
                  <li key={l.atletaId} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="w-5 text-sm font-semibold text-muted">{i + 1}</span>
                      <div>
                        <Link
                          href={`/atleta/${l.atletaId}`}
                          className="text-sm font-medium hover:text-accent hover:underline"
                        >
                          {l.nome}
                        </Link>
                        <p className="text-xs text-muted">{l.timeNome}</p>
                      </div>
                      {l.statusSuspensao === "suspenso" && (
                        <Badge variant="danger">Suspenso</Badge>
                      )}
                      {l.statusSuspensao === "pendurado" && (
                        <Badge variant="accent">Pendurado</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="font-bold text-accent">{l.gols}</span>
                      <span className="text-yellow-600">{l.amarelos}🟨</span>
                      <span className="text-danger">{l.vermelhos}🟥</span>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
