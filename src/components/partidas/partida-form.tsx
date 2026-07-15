"use client";

import { useMemo, useState } from "react";
import { Input, Label, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Categoria = { id: string; nome: string };
type Time = { id: string; nome: string; categoriaId: string };

export function PartidaForm({
  action,
  categorias,
  times,
  defaultValues,
  submitLabel = "Salvar",
}: {
  action: (formData: FormData) => Promise<void>;
  categorias: Categoria[];
  times: Time[];
  defaultValues?: {
    categoriaId?: string;
    timeCasaId?: string;
    timeForaId?: string;
    dataHora?: string;
    local?: string;
    rodada?: number | null;
  };
  submitLabel?: string;
}) {
  const [categoriaId, setCategoriaId] = useState(defaultValues?.categoriaId ?? "");

  const timesDaCategoria = useMemo(
    () => times.filter((t) => t.categoriaId === categoriaId),
    [times, categoriaId]
  );

  return (
    <form action={action} className="grid gap-3 sm:grid-cols-2">
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
        <Label htmlFor="rodada">Rodada (opcional)</Label>
        <Input id="rodada" name="rodada" type="number" min={1} defaultValue={defaultValues?.rodada ?? ""} />
      </div>

      <div>
        <Label htmlFor="timeCasaId">Time da casa</Label>
        <Select
          id="timeCasaId"
          name="timeCasaId"
          required
          defaultValue={defaultValues?.timeCasaId ?? ""}
          disabled={!categoriaId}
        >
          <option value="" disabled>
            Selecione
          </option>
          {timesDaCategoria.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nome}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label htmlFor="timeForaId">Time visitante</Label>
        <Select
          id="timeForaId"
          name="timeForaId"
          required
          defaultValue={defaultValues?.timeForaId ?? ""}
          disabled={!categoriaId}
        >
          <option value="" disabled>
            Selecione
          </option>
          {timesDaCategoria.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nome}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label htmlFor="dataHora">Data e hora</Label>
        <Input
          id="dataHora"
          name="dataHora"
          type="datetime-local"
          required
          defaultValue={defaultValues?.dataHora}
        />
      </div>

      <div>
        <Label htmlFor="local">Local (opcional)</Label>
        <Input id="local" name="local" defaultValue={defaultValues?.local} />
      </div>

      <div className="sm:col-span-2">
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
