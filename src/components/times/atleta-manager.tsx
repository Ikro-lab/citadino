"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/ui/delete-button";
import { createAtleta, updateAtleta, deleteAtleta } from "@/lib/actions/atletas";
import type { Posicao } from "@prisma/client";

type Atleta = {
  id: string;
  nome: string;
  numero: number;
  posicao: Posicao;
  fotoUrl: string | null;
};

const posicoes: Posicao[] = ["GOLEIRO", "FIXO", "ALA", "PIVO", "LINHA"];

function AtletaRow({ atleta, timeId }: { atleta: Atleta; timeId: string }) {
  const [editando, setEditando] = useState(false);

  if (editando) {
    return (
      <form
        action={async (formData) => {
          await updateAtleta(atleta.id, timeId, formData);
          setEditando(false);
        }}
        className="flex flex-wrap items-end gap-2 rounded-xl bg-surface p-3"
      >
        <div className="w-16">
          <Label htmlFor={`numero-${atleta.id}`}>Nº</Label>
          <Input
            id={`numero-${atleta.id}`}
            name="numero"
            type="number"
            defaultValue={atleta.numero}
            required
          />
        </div>
        <div className="flex-1 min-w-[140px]">
          <Label htmlFor={`nome-${atleta.id}`}>Nome</Label>
          <Input id={`nome-${atleta.id}`} name="nome" defaultValue={atleta.nome} required />
        </div>
        <div className="w-36">
          <Label htmlFor={`posicao-${atleta.id}`}>Posição</Label>
          <Select id={`posicao-${atleta.id}`} name="posicao" defaultValue={atleta.posicao}>
            {posicoes.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </Select>
        </div>
        <Button type="submit" size="sm">
          Salvar
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={() => setEditando(false)}>
          Cancelar
        </Button>
      </form>
    );
  }

  return (
    <div className="flex items-center justify-between rounded-xl border border-border px-3 py-2">
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface font-mono text-sm font-bold">
          {atleta.numero}
        </span>
        <div>
          <p className="text-sm font-medium">{atleta.nome}</p>
          <p className="text-xs text-muted">{atleta.posicao}</p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setEditando(true)}
          className="rounded-lg px-2 py-1 text-xs font-medium text-accent hover:bg-orange-50"
        >
          Editar
        </button>
        <DeleteButton action={deleteAtleta.bind(null, atleta.id, timeId)} />
      </div>
    </div>
  );
}

export function AtletaManager({
  timeId,
  atletas,
}: {
  timeId: string;
  atletas: Atleta[];
}) {
  return (
    <Card>
      <h2 className="mb-3 font-semibold">Elenco</h2>

      <form
        action={createAtleta.bind(null, timeId)}
        className="mb-4 flex flex-wrap items-end gap-2 rounded-xl bg-surface p-3"
      >
        <div className="w-16">
          <Label htmlFor="numero">Nº</Label>
          <Input id="numero" name="numero" type="number" min={0} required />
        </div>
        <div className="flex-1 min-w-[140px]">
          <Label htmlFor="nome">Nome</Label>
          <Input id="nome" name="nome" required />
        </div>
        <div className="w-36">
          <Label htmlFor="posicao">Posição</Label>
          <Select id="posicao" name="posicao" defaultValue="LINHA">
            {posicoes.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </Select>
        </div>
        <Button type="submit" size="sm">
          Adicionar
        </Button>
      </form>

      <div className="flex flex-col gap-2">
        {atletas.map((a) => (
          <AtletaRow key={a.id} atleta={a} timeId={timeId} />
        ))}
        {atletas.length === 0 && (
          <p className="text-sm text-muted">Nenhum atleta cadastrado.</p>
        )}
      </div>
    </Card>
  );
}
