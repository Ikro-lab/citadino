"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label, Select } from "@/components/ui/input";
import { InstallPrompt } from "@/components/push/install-prompt";
import { usePush } from "@/components/push/use-push";

export function PushManager({
  categorias,
  times,
  tenantId,
}: {
  categorias: { id: string; nome: string }[];
  times: { id: string; nome: string; categoriaId: string }[];
  tenantId: string;
}) {
  const { estado, ativar, desativar } = usePush(tenantId);
  const [escolher, setEscolher] = useState(false);
  const [categoriaId, setCategoriaId] = useState("");
  const [timeId, setTimeId] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const timesDaCategoria = times.filter((t) => t.categoriaId === categoriaId);

  async function onAtivar() {
    setPending(true);
    setMessage(null);
    const ok = await ativar(escolher ? { categoriaId, timeId } : {});
    setMessage(ok ? "Pronto! Você vai receber os avisos." : "Não foi possível ativar as notificações neste navegador.");
    setPending(false);
  }

  async function onDesativar() {
    setPending(true);
    await desativar();
    setMessage("Notificações desativadas.");
    setPending(false);
  }

  if (estado === "carregando") return null;
  if (estado === "instalar-ios") return <InstallPrompt />;
  if (estado === "sem-suporte") {
    return (
      <Card>
        <p className="text-sm text-muted">
          Este navegador não recebe notificações. No Android, abra o site pelo Chrome.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="mb-1 font-semibold">Avisos dos jogos</h2>
      <p className="mb-4 text-sm text-muted">
        Receba no celular o início das partidas, os gols, cartões vermelhos e o resultado final, sem precisar
        criar conta.
      </p>

      {estado === "ativo" ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-success">Os avisos estão ativos neste aparelho.</p>
          <Button variant="secondary" onClick={onDesativar} disabled={pending}>
            Desativar avisos
          </Button>
        </div>
      ) : estado === "bloqueado" ? (
        <p className="text-sm">
          Os avisos estão bloqueados neste navegador. Para liberar, toque no cadeado ao lado do endereço do site,
          abra <strong>Permissões</strong> e permita <strong>Notificações</strong>. Depois recarregue a página.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          <Button size="lg" onClick={onAtivar} disabled={pending}>
            {pending ? "Ativando..." : "Ativar avisos"}
          </Button>

          {escolher ? (
            <>
              <div>
                <Label htmlFor="push-categoria">Categoria</Label>
                <Select
                  id="push-categoria"
                  value={categoriaId}
                  onChange={(e) => {
                    setCategoriaId(e.target.value);
                    setTimeId("");
                  }}
                >
                  <option value="">Todas as categorias</option>
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </Select>
              </div>

              {categoriaId && (
                <div>
                  <Label htmlFor="push-time">Time (opcional)</Label>
                  <Select id="push-time" value={timeId} onChange={(e) => setTimeId(e.target.value)}>
                    <option value="">Todos os jogos da categoria</option>
                    {timesDaCategoria.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nome}
                      </option>
                    ))}
                  </Select>
                </div>
              )}
            </>
          ) : (
            <button type="button" className="text-sm text-muted underline" onClick={() => setEscolher(true)}>
              Prefere só uma categoria ou um time?
            </button>
          )}
        </div>
      )}

      {message && <p className="mt-3 text-sm text-muted">{message}</p>}
    </Card>
  );
}
