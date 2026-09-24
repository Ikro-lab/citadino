import { getTenantBySlug } from "@/lib/tenant";
import { getTenantPrisma } from "@/lib/tenant-prisma";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { NovoItem } from "@/components/ui/novo-item";
import { Badge } from "@/components/ui/badge";
import { Input, Label, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/ui/delete-button";
import {
  createPatrocinador,
  deletePatrocinador,
  toggleAtivoPatrocinador,
  updatePatrocinadoresAnimados,
  updatePatrocinadoresTamanho,
  updatePatrocinadoresPosicao,
} from "@/lib/actions/patrocinadores";

const nivelVariant = {
  MASTER: "accent",
  OURO: "secondary",
  PRATA: "neutral",
} as const;

const TAMANHOS = [
  { value: "PEQUENO", label: "Pequena" },
  { value: "MEDIO", label: "Média" },
  { value: "GRANDE", label: "Grande" },
] as const;

const POSICOES = [
  { value: "AMBOS", label: "Ambos" },
  { value: "TOPO", label: "Só topo" },
  { value: "RODAPE", label: "Só rodapé" },
] as const;

export default async function PatrocinadoresPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  const db = getTenantPrisma(tenant.id);

  const [patrocinadores, campeonatos] = await Promise.all([
    db.patrocinador.findMany({
      orderBy: [{ ordem: "asc" }, { createdAt: "desc" }],
      include: { campeonato: { select: { nome: true } } },
    }),
    db.campeonato.findMany({ orderBy: { nome: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <Card className="flex flex-col divide-y divide-border p-0">
        <h2 className="px-4 pt-4 pb-3 font-semibold">Exibição no site</h2>

        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium">Movimento</p>
            <p className="text-sm text-muted">Faixa de logos em carrossel ou parada.</p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex">
            {[
              { value: true, label: "Em movimento" },
              { value: false, label: "Parada" },
            ].map((o) => (
              <form key={String(o.value)} action={updatePatrocinadoresAnimados.bind(null, o.value)}>
                <Button
                  type="submit"
                  variant={tenant.patrocinadoresAnimados === o.value ? "primary" : "secondary"}
                  size="sm"
                  aria-pressed={tenant.patrocinadoresAnimados === o.value}
                  disabled={tenant.patrocinadoresAnimados === o.value}
                  className="h-10 w-full disabled:opacity-100"
                >
                  {o.label}
                </Button>
              </form>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium">Tamanho dos logos</p>
            <p className="text-sm text-muted">No celular, a faixa do topo é sempre compacta.</p>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:flex">
            {TAMANHOS.map((t) => (
              <form key={t.value} action={updatePatrocinadoresTamanho.bind(null, t.value)}>
                <Button
                  type="submit"
                  variant={tenant.patrocinadoresTamanho === t.value ? "primary" : "secondary"}
                  size="sm"
                  aria-pressed={tenant.patrocinadoresTamanho === t.value}
                  disabled={tenant.patrocinadoresTamanho === t.value}
                  className="h-10 w-full disabled:opacity-100"
                >
                  {t.label}
                </Button>
              </form>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium">Onde aparecem</p>
            <p className="text-sm text-muted">O topo mostra só os Master; o rodapé mostra todos os níveis.</p>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:flex">
            {POSICOES.map((p) => (
              <form key={p.value} action={updatePatrocinadoresPosicao.bind(null, p.value)}>
                <Button
                  type="submit"
                  variant={tenant.patrocinadoresPosicao === p.value ? "primary" : "secondary"}
                  size="sm"
                  aria-pressed={tenant.patrocinadoresPosicao === p.value}
                  disabled={tenant.patrocinadoresPosicao === p.value}
                  className="h-10 w-full px-2 disabled:opacity-100"
                >
                  {p.label}
                </Button>
              </form>
            ))}
          </div>
        </div>
      </Card>

      <NovoItem titulo="Novo patrocinador" aberto={patrocinadores.length === 0}>
        {campeonatos.length === 0 ? (
          <p className="text-sm text-muted">
            Crie um campeonato antes de adicionar patrocinadores.
          </p>
        ) : (
          <form
            action={createPatrocinador}
            className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6 lg:items-end"
          >
            <div className="lg:col-span-2">
              <Label htmlFor="nome">Nome</Label>
              <Input id="nome" name="nome" placeholder="Padaria do João" required />
            </div>
            <div>
              <Label htmlFor="campeonatoId">Campeonato</Label>
              <Select id="campeonatoId" name="campeonatoId" required defaultValue="">
                <option value="" disabled>
                  Selecione
                </option>
                {campeonatos.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome} ({c.temporada})
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="nivel">Nível</Label>
              <Select id="nivel" name="nivel" defaultValue="PRATA">
                <option value="MASTER">Master</option>
                <option value="OURO">Ouro</option>
                <option value="PRATA">Prata</option>
              </Select>
            </div>
            <div className="lg:col-span-2">
              <Label htmlFor="linkUrl">Link (site/Instagram)</Label>
              <Input id="linkUrl" name="linkUrl" type="url" placeholder="https://..." />
            </div>
            <div>
              <Label htmlFor="ordem">Ordem</Label>
              <Input id="ordem" name="ordem" type="number" defaultValue={0} />
            </div>
            <div className="lg:col-span-2">
              <Label htmlFor="logo">Logo</Label>
              <Input id="logo" name="logo" type="file" accept="image/*" required />
            </div>
            <Button type="submit">Adicionar</Button>
          </form>
        )}
      </NovoItem>

      <div className="flex flex-col gap-2">
        {patrocinadores.map((p) => (
          <Card key={p.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.logoUrl}
                alt={p.nome}
                style={{ height: 40, width: "auto" }}
                className="object-contain"
              />
              <div>
                <p className="font-medium">
                  {p.nome} <Badge variant={nivelVariant[p.nivel]}>{p.nivel}</Badge>{" "}
                  {!p.ativo && <Badge variant="danger">Inativo</Badge>}
                </p>
                <p className="text-xs text-muted">
                  {p.campeonato.nome} · ordem {p.ordem}
                  {p.linkUrl ? ` · ${p.linkUrl}` : ""}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <form action={toggleAtivoPatrocinador.bind(null, p.id, !p.ativo)}>
                <Button type="submit" variant="secondary" size="sm">
                  {p.ativo ? "Desativar" : "Ativar"}
                </Button>
              </form>
              <DeleteButton action={deletePatrocinador.bind(null, p.id)} />
            </div>
          </Card>
        ))}
        {patrocinadores.length === 0 && (
          <EmptyState>Nenhum patrocinador cadastrado. Adicione o primeiro acima.</EmptyState>
        )}
      </div>
    </div>
  );
}
