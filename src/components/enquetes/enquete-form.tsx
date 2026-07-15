"use client";

import { useMemo, useState } from "react";
import { Input, Label, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createEnquete } from "@/lib/actions/enquetes";

type Categoria = { id: string; nome: string };
type Atleta = { id: string; nome: string; timeNome: string; categoriaId: string };

export function EnqueteForm({
  categorias,
  atletas,
}: {
  categorias: Categoria[];
  atletas: Atleta[];
}) {
  const [categoriaId, setCategoriaId] = useState("");

  const atletasDaCategoria = useMemo(
    () => atletas.filter((a) => a.categoriaId === categoriaId),
    [atletas, categoriaId]
  );

  return (
    <form action={createEnquete} className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="categoriaId">Categoria</Label>
          <Select
            id="categoriaId"
            name="categoriaId"
            required
            value={categoriaId}
            onChange={(e) => setCategoriaId(e.target.value)}
          >
            <option value="" disabled>
              Selecione
            </option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="rodada">Rodada</Label>
          <Input id="rodada" name="rodada" type="number" min={1} required />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="pergunta">Pergunta</Label>
          <Input id="pergunta" name="pergunta" defaultValue="Melhor Jogador da Rodada" required />
        </div>
      </div>

      {categoriaId && (
        <div>
          <p className="mb-2 text-sm font-medium">Opções (selecione ao menos 2 atletas)</p>
          <div className="grid max-h-64 grid-cols-1 gap-1 overflow-y-auto rounded-xl border border-border p-3 sm:grid-cols-2">
            {atletasDaCategoria.map((a) => (
              <label key={a.id} className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="atletaIds" value={a.id} className="h-4 w-4 accent-accent" />
                {a.nome} <span className="text-xs text-muted">· {a.timeNome}</span>
              </label>
            ))}
            {atletasDaCategoria.length === 0 && (
              <p className="text-sm text-muted">Nenhum atleta cadastrado nesta categoria.</p>
            )}
          </div>
        </div>
      )}

      <Button type="submit" className="self-start">
        Criar enquete
      </Button>
    </form>
  );
}
