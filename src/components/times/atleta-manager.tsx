"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FotoInput } from "@/components/ui/foto-input";
import { DeleteButton } from "@/components/ui/delete-button";
import { FormError } from "@/components/ui/form-error";
import { createAtleta, updateAtleta, deleteAtleta, type UpdateAtletaState } from "@/lib/actions/atletas";
import { AtletaAvatar } from "@/components/atletas/atleta-avatar";
import { paths } from "@/lib/tenant-path";
import { posicaoLabel, posicoes } from "@/lib/labels";
import type { Posicao } from "@prisma/client";

type Atleta = {
  id: string;
  nome: string;
  numero: number;
  posicao: Posicao;
  fotoUrl: string | null;
  instagram?: string | null;
  dataNascimento?: Date | null;
  documentoUrl?: string | null;
  comprovanteEnderecoUrl?: string | null;
};

/** Links de verificação dos anexos — só renderizado para o admin. */
function AnexosAtleta({ atleta }: { atleta: Atleta }) {
  const itens = [
    { rotulo: "Documento", url: atleta.documentoUrl },
    { rotulo: "Comprovante", url: atleta.comprovanteEnderecoUrl },
  ];
  return (
    <div className="mt-1 flex flex-wrap gap-1.5">
      {itens.map(({ rotulo, url }) =>
        url ? (
          <a
            key={rotulo}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent hover:underline"
          >
            ✔ {rotulo}
          </a>
        ) : (
          <span key={rotulo} className="rounded-md bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-500">
            ✖ Sem {rotulo.toLowerCase()}
          </span>
        )
      )}
    </div>
  );
}

function toDateInputValue(date?: Date | null) {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
}

/** Campos comuns de cadastro/edição: nº + nome, posição + nascimento, Instagram. */
function CamposAtleta({ prefixo, atleta }: { prefixo: string; atleta?: Atleta }) {
  return (
    <>
      <div className="grid grid-cols-[5rem_1fr] gap-3">
        <div>
          <Label htmlFor={`${prefixo}-numero`}>Nº</Label>
          <Input
            id={`${prefixo}-numero`}
            name="numero"
            type="number"
            min={0}
            defaultValue={atleta?.numero}
            required
          />
        </div>
        <div>
          <Label htmlFor={`${prefixo}-nome`}>Nome</Label>
          <Input id={`${prefixo}-nome`} name="nome" defaultValue={atleta?.nome} autoComplete="off" required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor={`${prefixo}-posicao`}>Posição</Label>
          <Select id={`${prefixo}-posicao`} name="posicao" defaultValue={atleta?.posicao ?? "LINHA"}>
            {posicoes.map((p) => (
              <option key={p} value={p}>
                {posicaoLabel[p]}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor={`${prefixo}-nascimento`}>Nascimento</Label>
          <Input
            id={`${prefixo}-nascimento`}
            name="dataNascimento"
            type="date"
            defaultValue={toDateInputValue(atleta?.dataNascimento)}
          />
        </div>
      </div>
      <div>
        <Label htmlFor={`${prefixo}-instagram`}>Instagram (opcional)</Label>
        <Input
          id={`${prefixo}-instagram`}
          name="instagram"
          placeholder="@usuario"
          autoCapitalize="none"
          defaultValue={atleta?.instagram ?? ""}
        />
      </div>
    </>
  );
}

function EditarAtleta({ atleta, timeId, onFechar }: { atleta: Atleta; timeId: string; onFechar: () => void }) {
  const [state, formAction, pending] = useActionState(
    async (prev: UpdateAtletaState, formData: FormData) => {
      const res = await updateAtleta(atleta.id, timeId, prev, formData);
      if (res?.ok) onFechar();
      return res;
    },
    undefined
  );

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-xl border border-accent/40 bg-field p-3">
      <CamposAtleta prefixo={atleta.id} atleta={atleta} />
      <div>
        <Label htmlFor={`${atleta.id}-foto`}>Foto de perfil</Label>
        <div className="flex items-center gap-3">
          <AtletaAvatar nome={atleta.nome} fotoUrl={atleta.fotoUrl} size={48} />
          <div className="min-w-0 flex-1">
            <FotoInput id={`${atleta.id}-foto`} name="foto" accept="image/*" />
          </div>
        </div>
        <p className="mt-1 text-xs text-muted">
          {atleta.fotoUrl ? "Escolha uma imagem só se quiser trocar a foto atual." : "Atleta sem foto: escolha uma imagem."}
        </p>
      </div>
      <FormError message={state?.error} />
      <div className="grid grid-cols-2 gap-2 sm:flex">
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : "Salvar"}
        </Button>
        <Button type="button" variant="secondary" onClick={onFechar} disabled={pending}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

function AtletaRow({
  atleta,
  timeId,
  tenantSlug,
  mostrarAnexos,
}: {
  atleta: Atleta;
  timeId: string;
  tenantSlug: string;
  mostrarAnexos: boolean;
}) {
  const [editando, setEditando] = useState(false);

  if (editando) {
    return <EditarAtleta atleta={atleta} timeId={timeId} onFechar={() => setEditando(false)} />;
  }

  return (
    <div className="flex items-center justify-between gap-2 rounded-xl border border-border px-3 py-2">
      <div className="flex min-w-0 items-center gap-3">
        <Link href={paths.atleta(tenantSlug, atleta.id)} className="shrink-0">
          <AtletaAvatar nome={atleta.nome} fotoUrl={atleta.fotoUrl} size={36} />
        </Link>
        <div className="min-w-0">
          <Link href={paths.atleta(tenantSlug, atleta.id)} className="block">
            <p className="truncate text-sm font-medium hover:text-accent">
              <span className="tabular-nums">#{atleta.numero}</span> {atleta.nome}
            </p>
            <p className="text-xs text-muted">{posicaoLabel[atleta.posicao]}</p>
          </Link>
          {mostrarAnexos && <AnexosAtleta atleta={atleta} />}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={() => setEditando(true)}
          className="h-10 rounded-lg px-3 text-sm font-semibold text-accent hover:bg-accent-soft"
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
  mostrarAnexos = false,
}: {
  timeId: string;
  atletas: Atleta[];
  /** Exibe o status/links de documento e comprovante. Apenas a página do admin liga isto. */
  mostrarAnexos?: boolean;
}) {
  const { tenant: tenantSlug } = useParams<{ tenant: string }>();
  const [state, formAction, pending] = useActionState(
    createAtleta.bind(null, timeId),
    undefined
  );
  const [adicionando, setAdicionando] = useState(false);

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="font-semibold">
          Elenco <span className="font-normal text-muted tabular-nums">({atletas.length})</span>
        </h2>
        {!adicionando && (
          <Button size="sm" onClick={() => setAdicionando(true)}>
            Adicionar atleta
          </Button>
        )}
      </div>

      {adicionando && (
        <form action={formAction} className="mb-4 flex flex-col gap-3 rounded-xl border border-border bg-field p-3">
          <CamposAtleta prefixo="novo" />
          <div>
            <Label htmlFor="foto">Foto do atleta</Label>
            <FotoInput id="foto" name="foto" accept="image/*" required />
          </div>
          <div>
            <Label htmlFor="documento">Foto do documento de identidade</Label>
            <FotoInput id="documento" name="documento" accept="image/*" required />
          </div>
          <div>
            <Label htmlFor="comprovanteEndereco">Comprovante de endereço</Label>
            <FotoInput id="comprovanteEndereco" name="comprovanteEndereco" accept="image/*,application/pdf" required />
          </div>

          <FormError message={state?.error} />

          <div className="grid grid-cols-2 gap-2 sm:flex">
            <Button type="submit" disabled={pending}>
              {pending ? "Adicionando..." : "Adicionar"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setAdicionando(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      )}

      <div className="flex flex-col gap-2">
        {atletas.map((a) => (
          <AtletaRow key={a.id} atleta={a} timeId={timeId} tenantSlug={tenantSlug} mostrarAnexos={mostrarAnexos} />
        ))}
        {atletas.length === 0 && (
          <p className="text-sm text-muted">
            Nenhum atleta no elenco. Adicione aqui ou envie o link de convite para os atletas se inscreverem.
          </p>
        )}
      </div>
    </Card>
  );
}
