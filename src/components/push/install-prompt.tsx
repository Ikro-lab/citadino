import { Share, SquarePlus, Bell } from "lucide-react";
import { Card } from "@/components/ui/card";

/**
 * No iPhone/iPad o Safari só manda notificações para o site instalado na tela
 * inicial. Em vez de "não suportado", mostra como instalar; aberto pelo ícone,
 * o mesmo convite de ativar aparece e funciona.
 */
export function InstallPrompt() {
  return (
    <Card>
      <h2 className="mb-1 font-semibold">No iPhone, instale o app primeiro</h2>
      <p className="mb-3 text-sm text-muted">
        O iPhone só manda os avisos de gols e resultados para o site instalado na tela inicial. Leva 10 segundos:
      </p>
      <ol className="flex flex-col gap-2 text-sm">
        <li className="flex items-center gap-2">
          <Share size={18} className="shrink-0 text-accent" aria-hidden />
          <span>
            1. No Safari, toque em <strong>Compartilhar</strong> (o quadrado com a seta para cima).
          </span>
        </li>
        <li className="flex items-center gap-2">
          <SquarePlus size={18} className="shrink-0 text-accent" aria-hidden />
          <span>
            2. Toque em <strong>Adicionar à Tela de Início</strong> e depois em <strong>Adicionar</strong>.
          </span>
        </li>
        <li className="flex items-center gap-2">
          <Bell size={18} className="shrink-0 text-accent" aria-hidden />
          <span>
            3. Abra o Citadino pelo novo ícone e toque em <strong>Ativar avisos</strong>.
          </span>
        </li>
      </ol>
    </Card>
  );
}
