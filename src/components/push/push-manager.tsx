"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label, Select } from "@/components/ui/input";
import { subscribeUser, unsubscribeUser } from "@/lib/actions/push";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PushManager({
  categorias,
  times,
  tenantId,
}: {
  categorias: { id: string; nome: string }[];
  times: { id: string; nome: string; categoriaId: string }[];
  tenantId: string;
}) {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [categoriaId, setCategoriaId] = useState("");
  const [timeId, setTimeId] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsSupported(true);
      navigator.serviceWorker
        .register("/sw.js", { scope: "/", updateViaCache: "none" })
        .then((registration) => registration.pushManager.getSubscription())
        .then((sub) => setSubscription(sub));
    }
  }, []);

  const timesDaCategoria = times.filter((t) => t.categoriaId === categoriaId);

  async function subscribeToPush() {
    setPending(true);
    setMessage(null);
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ),
      });
      setSubscription(sub);
      await subscribeUser(
        JSON.parse(JSON.stringify(sub)),
        {
          categoriaId: categoriaId || null,
          timeId: timeId || null,
        },
        tenantId
      );
      setMessage("Notificações ativadas.");
    } catch {
      setMessage("Não foi possível ativar as notificações neste navegador.");
    } finally {
      setPending(false);
    }
  }

  async function unsubscribeFromPush() {
    setPending(true);
    try {
      const endpoint = subscription?.endpoint;
      await subscription?.unsubscribe();
      setSubscription(null);
      if (endpoint) await unsubscribeUser(endpoint);
      setMessage("Notificações desativadas.");
    } finally {
      setPending(false);
    }
  }

  if (!isSupported) {
    return (
      <Card>
        <p className="text-sm text-muted">
          Notificações push não são suportadas neste navegador.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="mb-1 font-semibold">Notificações</h2>
      <p className="mb-4 text-sm text-muted">
        Receba avisos de início de partida, gols, cartões vermelhos e resultado final —
        sem precisar criar conta.
      </p>

      {subscription ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-success">Você está inscrito para notificações.</p>
          <Button variant="secondary" onClick={unsubscribeFromPush} disabled={pending}>
            Desativar notificações
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
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

          <Button onClick={subscribeToPush} disabled={pending}>
            {pending ? "Ativando..." : "Ativar notificações"}
          </Button>
        </div>
      )}

      {message && <p className="mt-3 text-sm text-muted">{message}</p>}
    </Card>
  );
}
