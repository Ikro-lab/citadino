"use client";

import { Card } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { calcularIdade } from "@/lib/utils";
import { aprovarInscricao, recusarInscricao } from "@/lib/actions/inscricoes";
import type { Posicao } from "@prisma/client";

const posicoes: Posicao[] = ["GOLEIRO", "FIXO", "ALA", "PIVO", "LINHA"];

type Inscricao = {
  id: string;
  nome: string;
  dataNascimento: Date;
  instagram: string | null;
  documentoUrl: string;
  comprovanteEnderecoUrl: string;
};

export function InscricoesPendentes({ inscricoes }: { inscricoes: Inscricao[] }) {
  if (inscricoes.length === 0) return null;

  return (
    <Card>
      <h2 className="mb-3 font-semibold">
        Inscrições pendentes ({inscricoes.length})
      </h2>
      <div className="flex flex-col gap-3">
        {inscricoes.map((inscricao) => (
          <form
            key={inscricao.id}
            action={aprovarInscricao.bind(null, inscricao.id)}
            className="flex flex-wrap items-end gap-2 rounded-xl bg-surface p-3"
          >
            <div className="min-w-[160px] flex-1">
              <p className="text-sm font-medium">{inscricao.nome}</p>
              <p className="text-xs text-muted">
                {calcularIdade(inscricao.dataNascimento)} anos
                {inscricao.instagram && ` · @${inscricao.instagram.replace(/^@/, "")}`}
              </p>
              <div className="mt-1 flex gap-2 text-xs">
                <a
                  href={inscricao.documentoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent underline"
                >
                  Ver documento
                </a>
                <a
                  href={inscricao.comprovanteEnderecoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent underline"
                >
                  Ver comprovante
                </a>
              </div>
            </div>

            <div className="w-16">
              <Label htmlFor={`numero-${inscricao.id}`}>Nº</Label>
              <Input id={`numero-${inscricao.id}`} name="numero" type="number" min={0} required />
            </div>

            <div className="w-32">
              <Label htmlFor={`posicao-${inscricao.id}`}>Posição</Label>
              <Select id={`posicao-${inscricao.id}`} name="posicao" defaultValue="LINHA">
                {posicoes.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </Select>
            </div>

            <Button type="submit" size="sm">
              Aprovar
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => recusarInscricao(inscricao.id)}
            >
              Recusar
            </Button>
          </form>
        ))}
      </div>
    </Card>
  );
}
