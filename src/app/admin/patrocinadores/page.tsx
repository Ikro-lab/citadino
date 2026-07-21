import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input, Label, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/ui/delete-button";
import {
  createPatrocinador,
  deletePatrocinador,
  toggleAtivoPatrocinador,
} from "@/lib/actions/patrocinadores";

const nivelVariant = {
  MASTER: "accent",
  OURO: "secondary",
  PRATA: "neutral",
} as const;

export default async function PatrocinadoresPage() {
  const [patrocinadores, campeonatos] = await Promise.all([
    prisma.patrocinador.findMany({
      orderBy: [{ ordem: "asc" }, { createdAt: "desc" }],
      include: { campeonato: { select: { nome: true } } },
    }),
    prisma.campeonato.findMany({ orderBy: { nome: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <h2 className="mb-3 font-semibold">Novo patrocinador</h2>
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
      </Card>

      <div className="flex flex-col gap-2">
        {patrocinadores.map((p) => (
          <Card key={p.id} className="flex items-center justify-between gap-3">
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
            <div className="flex items-center gap-2">
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
          <p className="text-sm text-muted">Nenhum patrocinador cadastrado.</p>
        )}
      </div>
    </div>
  );
}
