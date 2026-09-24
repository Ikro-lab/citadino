"use client";

import { Card } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { calcularIdade } from "@/lib/utils";
import { posicaoLabel, posicoes } from "@/lib/labels";
import { aprovarInscricao, recusarInscricao } from "@/lib/actions/inscricoes";

type Inscricao = {
  id: string;
  nome: string;
  dataNascimento: Date;
  instagram: string | null;
  documentoUrl: string;
  comprovanteEnderecoUrl: string;
};

const docLinkClass =
  "inline-flex h-9 items-center rounded-lg border border-border px-3 text-xs font-semibold hover:bg-field";

export function InscricoesPendentes({ inscricoes }: { inscricoes: Inscricao[] }) {
  if (inscricoes.length === 0) return null;

  return (
    <Card>
      <h2 className="mb-3 font-semibold">
        Inscrições para aprovar <span className="font-normal text-muted tabular-nums">({inscricoes.length})</span>
      </h2>
      <div className="flex flex-col gap-3">
        {inscricoes.map((inscricao) => (
          <form
            key={inscricao.id}
            action={aprovarInscricao.bind(null, inscricao.id)}
            className="flex flex-col gap-3 rounded-xl border border-border bg-field p-3"
          >
            <div>
              <p className="font-medium">{inscricao.nome}</p>
              <p className="text-xs text-muted">
                {calcularIdade(inscricao.dataNascimento)} anos
                {inscricao.instagram && `, @${inscricao.instagram.replace(/^@/, "")}`}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <a href={inscricao.documentoUrl} target="_blank" rel="noopener noreferrer" className={docLinkClass}>
                  Ver documento
                </a>
                <a
                  href={inscricao.comprovanteEnderecoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={docLinkClass}
                >
                  Ver comprovante
                </a>
              </div>
            </div>

            <div className="grid grid-cols-[5rem_1fr] gap-3">
              <div>
                <Label htmlFor={`numero-${inscricao.id}`}>Nº</Label>
                <Input id={`numero-${inscricao.id}`} name="numero" type="number" min={0} required />
              </div>
              <div>
                <Label htmlFor={`posicao-${inscricao.id}`}>Posição</Label>
                <Select id={`posicao-${inscricao.id}`} name="posicao" defaultValue="LINHA">
                  {posicoes.map((p) => (
                    <option key={p} value={p}>
                      {posicaoLabel[p]}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex">
              <Button type="submit">Aprovar</Button>
              <Button type="button" variant="secondary" onClick={() => recusarInscricao(inscricao.id)}>
                Recusar
              </Button>
            </div>
          </form>
        ))}
      </div>
    </Card>
  );
}
