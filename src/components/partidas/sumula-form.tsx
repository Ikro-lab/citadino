"use client";

import { useMemo, useState } from "react";
import { Input, Label, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { addEvento } from "@/lib/actions/partidas";

type Atleta = { id: string; nome: string; numero: number };
type Time = { id: string; nome: string; atletas: Atleta[] };

const tipos = [
  { value: "GOL", label: "Gol" },
  { value: "CARTAO_AMARELO", label: "Cartão amarelo" },
  { value: "CARTAO_VERMELHO", label: "Cartão vermelho" },
  { value: "SUBSTITUICAO", label: "Substituição" },
  { value: "OUTRO", label: "Outro" },
];

export function SumulaForm({
  partidaId,
  timeCasa,
  timeFora,
}: {
  partidaId: string;
  timeCasa: Time;
  timeFora: Time;
}) {
  const [timeId, setTimeId] = useState(timeCasa.id);

  const atletas = useMemo(
    () => (timeId === timeCasa.id ? timeCasa.atletas : timeFora.atletas),
    [timeId, timeCasa, timeFora]
  );

  return (
    <form
      action={async (formData) => {
        await addEvento(partidaId, formData);
      }}
      className="grid gap-3 sm:grid-cols-2"
    >
      <div>
        <Label htmlFor="tipo">Tipo de evento</Label>
        <Select id="tipo" name="tipo" defaultValue="GOL" required>
          {tipos.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label htmlFor="minuto">Minuto</Label>
        <Input id="minuto" name="minuto" type="number" min={0} max={90} required />
      </div>

      <div>
        <Label htmlFor="timeId">Time</Label>
        <Select
          id="timeId"
          name="timeId"
          value={timeId}
          onChange={(e) => setTimeId(e.target.value)}
        >
          <option value={timeCasa.id}>{timeCasa.nome}</option>
          <option value={timeFora.id}>{timeFora.nome}</option>
        </Select>
      </div>

      <div>
        <Label htmlFor="atletaId">Atleta (opcional)</Label>
        <Select id="atletaId" name="atletaId" defaultValue="">
          <option value="">Não especificado</option>
          {atletas.map((a) => (
            <option key={a.id} value={a.id}>
              #{a.numero} {a.nome}
            </option>
          ))}
        </Select>
      </div>

      <div className="sm:col-span-2">
        <Label htmlFor="descricao">Observação (opcional)</Label>
        <Input id="descricao" name="descricao" placeholder="Detalhes do lance" />
      </div>

      <div className="sm:col-span-2">
        <Button type="submit">Registrar evento</Button>
      </div>
    </form>
  );
}
