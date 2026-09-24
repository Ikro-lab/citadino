import { CheckCircle2, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { formatHora } from "@/lib/date-utils";
import { extrairYoutubeId } from "@/lib/youtube";
import {
  setLinkTransmissao,
  marcarInicioLiveAgora,
  sincronizarInicioLive,
} from "@/lib/actions/partidas";

/**
 * Link da live + estado dos clipes automáticos. Com a live do YouTube
 * sincronizada, cada gol registrado já ganha o vídeo no minuto do lance.
 */
export function TransmissaoCard({
  partida,
}: {
  partida: {
    id: string;
    status: string;
    linkTransmissaoUrl: string | null;
    transmissaoInicioEm: Date | null;
  };
}) {
  const ehYoutube = extrairYoutubeId(partida.linkTransmissaoUrl) !== null;
  const podeMarcarInicio = partida.status === "AO_VIVO" || partida.status === "AGENDADA";

  return (
    <Card>
      <h2 className="mb-1 font-semibold">Transmissão ao vivo</h2>
      <p className="mb-3 text-sm text-muted">
        Com a live no YouTube, cada gol registrado já ganha o vídeo do lance.
      </p>

      <form action={setLinkTransmissao.bind(null, partida.id)} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Label htmlFor="linkTransmissaoUrl">Link da live</Label>
          <Input
            id="linkTransmissaoUrl"
            name="linkTransmissaoUrl"
            type="url"
            inputMode="url"
            autoCapitalize="none"
            placeholder="https://youtube.com/live/..."
            defaultValue={partida.linkTransmissaoUrl ?? ""}
          />
        </div>
        <Button type="submit" variant="secondary">
          Salvar link
        </Button>
      </form>

      {partida.linkTransmissaoUrl && !ehYoutube && (
        <p className="mt-3 flex items-start gap-2 text-sm text-muted">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          O vídeo automático dos gols só funciona com links do YouTube.
        </p>
      )}

      {ehYoutube && partida.transmissaoInicioEm && (
        <p className="mt-3 flex items-start gap-2 text-sm text-success">
          <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
          <span>
            Vídeo dos gols ativo. A live começou às{" "}
            <span className="font-semibold tabular-nums">{formatHora(partida.transmissaoInicioEm)}</span>.
          </span>
        </p>
      )}

      {ehYoutube && !partida.transmissaoInicioEm && (
        <div className="mt-3 rounded-lg bg-accent-soft p-3">
          <p className="flex items-start gap-2 text-sm">
            <AlertCircle size={16} className="mt-0.5 shrink-0 text-accent-dark" />
            A live ainda não começou, ou o YouTube não informou o horário de início. Quando ela entrar no ar,
            toque em um dos botões:
          </p>
          {podeMarcarInicio && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <form action={sincronizarInicioLive.bind(null, partida.id)}>
                <Button type="submit" variant="secondary" className="w-full">
                  Verificar de novo
                </Button>
              </form>
              <form action={marcarInicioLiveAgora.bind(null, partida.id)}>
                <Button type="submit" className="w-full">
                  A live começou agora
                </Button>
              </form>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
