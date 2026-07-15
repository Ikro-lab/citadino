"use client";

import { useMemo, useState } from "react";
import { Input, Label, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Categoria = { id: string; nome: string; formato: string };
type Time = { id: string; nome: string; categoriaId: string };

const fases = [
  { value: "GRUPOS", label: "Fase de grupos" },
  { value: "OITAVAS", label: "Oitavas de final" },
  { value: "QUARTAS", label: "Quartas de final" },
  { value: "SEMIFINAL", label: "Semifinal" },
  { value: "TERCEIRO_LUGAR", label: "Terceiro lugar" },
  { value: "FINAL", label: "Final" },
];

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
    fase?: string;
  };
  submitLabel?: string;
}) {
  const [categoriaId, setCategoriaId] = useState(defaultValues?.categoriaId ?? "");

  const timesDaCategoria = useMemo(
    () => times.filter((t) => t.categoriaId === categoriaId),
    [times, categoriaId]
  );

  const categoriaAtual = categorias.find((c) => c.id === categoriaId);
  const mostrarFase = categoriaAtual?.formato === "GRUPOS_MATA_MATA";

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

      {mostrarFase && (
        <div>
          <Label htmlFor="fase">Fase</Label>
          <Select id="fase" name="fase" defaultValue={defaultValues?.fase ?? "GRUPOS"}>
            {fases.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </Select>
        </div>
      )}

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
