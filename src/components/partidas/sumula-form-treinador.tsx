"use client";

import { Input, Label, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { addEvento } from "@/lib/actions/partidas";

type Atleta = { id: string; nome: string; numero: number };

const tipos = [
  { value: "GOL", label: "Gol" },
  { value: "CARTAO_AMARELO", label: "Cartão amarelo" },
  { value: "CARTAO_VERMELHO", label: "Cartão vermelho" },
  { value: "SUBSTITUICAO", label: "Substituição" },
];

export function SumulaFormTreinador({
  partidaId,
  timeId,
  atletas,
}: {
  partidaId: string;
  timeId: string;
  atletas: Atleta[];
}) {
  return (
    <form
      action={async (formData) => {
        await addEvento(partidaId, formData);
      }}
      className="grid gap-3 sm:grid-cols-2"
    >
      <input type="hidden" name="timeId" value={timeId} />

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

      <div className="sm:col-span-2">
        <Label htmlFor="atletaId">Atleta</Label>
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
        <Button type="submit">Registrar evento</Button>
      </div>
    </form>
  );
}
