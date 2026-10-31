"use client";

import { useCallback, useEffect, useState } from "react";
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

/**
 * - carregando: ainda não leu o navegador (primeira renderização, igual no servidor);
 * - instalar-ios: iPhone/iPad fora da tela inicial; o Safari só libera push
 *   para o site instalado como app;
 * - sem-suporte: navegador sem push;
 * - bloqueado: a pessoa negou a permissão; só volta pelos ajustes do navegador;
 * - inativo / ativo: pode ativar / já está inscrita.
 */
export type EstadoPush = "carregando" | "instalar-ios" | "sem-suporte" | "bloqueado" | "inativo" | "ativo";

export function usePush(tenantId: string) {
  const [estado, setEstado] = useState<EstadoPush>("carregando");
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEstado(isIOS && !standalone ? "instalar-ios" : "sem-suporte");
      return;
    }
    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .then((registration) => registration.pushManager.getSubscription())
      .then((sub) => {
        setSubscription(sub);
        setEstado(sub ? "ativo" : Notification.permission === "denied" ? "bloqueado" : "inativo");
      })
      .catch(() => setEstado("sem-suporte"));
  }, []);

  /** Pede a permissão e inscreve. Sem categoria nem time, recebe todos os jogos. */
  const ativar = useCallback(
    async (prefs: { categoriaId?: string | null; timeId?: string | null } = {}) => {
      try {
        const registration = await navigator.serviceWorker.ready;
        const sub = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
        });
        await subscribeUser(
          JSON.parse(JSON.stringify(sub)),
          { categoriaId: prefs.categoriaId || null, timeId: prefs.timeId || null },
          tenantId
        );
        setSubscription(sub);
        setEstado("ativo");
        return true;
      } catch {
        if (Notification.permission === "denied") setEstado("bloqueado");
        return false;
      }
    },
    [tenantId]
  );

  const desativar = useCallback(async () => {
    const endpoint = subscription?.endpoint;
    await subscription?.unsubscribe();
    if (endpoint) await unsubscribeUser(endpoint);
    setSubscription(null);
    setEstado("inativo");
  }, [subscription]);

  return { estado, ativar, desativar };
}
