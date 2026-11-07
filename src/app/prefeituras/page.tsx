import type { Metadata } from "next";
import Link from "next/link";
import {
  BarChart3,
  Check,
  Clapperboard,
  FileCheck2,
  MessageCircle,
  Radio,
  Smartphone,
  Trophy,
  Users,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Flamula } from "@/components/brand/flamula";

export const metadata: Metadata = {
  title: "Citadino para prefeituras — Campeonato Municipal com placar ao vivo e gols em vídeo",
  description:
    "O site oficial do campeonato municipal: placar ao vivo, tabela, artilharia e os gols em vídeo da transmissão. Contratação por dispensa de licitação.",
};

// Os números da vitrine mudam a cada rodada; uma hora de cache basta.
export const revalidate = 3600;

const WHATSAPP = "5551989391520";
const MENSAGEM =
  "Olá! Sou da Secretaria de Esporte de [município] e quero conhecer o Citadino para o nosso campeonato municipal.";

const FAIXAS = [
  { porte: "Até 20 mil habitantes", mensal: 500 },
  { porte: "20 a 50 mil habitantes", mensal: 900 },
  { porte: "50 a 100 mil habitantes", mensal: 1500 },
  { porte: "Mais de 100 mil habitantes", mensal: 2500 },
];

const RECURSOS = [
  {
    icone: Radio,
    titulo: "Placar ao vivo",
    texto: "A mesa lança gols e cartões pelo celular e a cidade acompanha em tempo real.",
  },
  {
    icone: Clapperboard,
    titulo: "Gols em vídeo",
    texto: "Cada gol é recortado da transmissão e vai para um feed que a população assiste, curte e compartilha.",
  },
  {
    icone: BarChart3,
    titulo: "Tabela que se atualiza sozinha",
    texto: "Classificação por pontos corridos ou grupos e mata-mata, artilharia, pendurados e suspensos.",
  },
  {
    icone: Users,
    titulo: "Inscrição sem papel",
    texto: "O treinador cadastra os atletas e a Secretaria só aprova. Documentos ficam em área restrita.",
  },
  {
    icone: Smartphone,
    titulo: "Com a cara do município",
    texto: "Nome, cores e brasão da prefeitura. Abre no celular, sem instalar nada, com notificações.",
  },
  {
    icone: Trophy,
    titulo: "Engajamento toda semana",
    texto: "Enquete do melhor da rodada e perfil de cada atleta: o campeonato vira assunto na cidade.",
  },
];

const PASSOS = [
  "Demonstração de 15 minutos com o campeonato de vocês.",
  "Enviamos proposta, certidões e atestado de capacidade técnica.",
  "Contratação por dispensa de licitação pelo valor (Lei 14.133, art. 75, II).",
  "Site no ar em poucos dias, com treinamento da equipe da Secretaria.",
];

function brl(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

async function numerosReais() {
  // O campeonato com mais jogos é o da vitrine; os números são só dele.
  const vitrine = await prisma.tenant.findFirst({
    where: { ativo: true },
    orderBy: { partidas: { _count: "desc" } },
    select: { id: true, slug: true, nome: true },
  });
  if (!vitrine) return { times: 0, atletas: 0, partidas: 0, golsEmVideo: 0, vitrine: null };
  const tenantId = vitrine.id;
  const [times, atletas, partidas, golsEmVideo] = await Promise.all([
    prisma.time.count({ where: { tenantId } }),
    prisma.atleta.count({ where: { tenantId } }),
    prisma.partida.count({ where: { tenantId, status: "ENCERRADA" } }),
    prisma.eventoPartida.count({ where: { tenantId, tipo: "GOL", videoUrl: { not: null } } }),
  ]);
  return { times, atletas, partidas, golsEmVideo, vitrine };
}

export default async function PrefeiturasPage() {
  const { times, atletas, partidas, golsEmVideo, vitrine } = await numerosReais();
  const whatsapp = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(MENSAGEM)}`;
  const numeros = [
    { valor: times, rotulo: "times" },
    { valor: atletas, rotulo: "atletas" },
    { valor: partidas, rotulo: "jogos encerrados" },
    { valor: golsEmVideo, rotulo: "gols em vídeo" },
  ].filter((n) => n.valor > 0);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-16 pt-8">
      <header className="mb-10 flex items-center gap-2">
        <Flamula nome="Citadino" size={28} />
        <span className="font-display text-2xl font-bold leading-none tracking-tight">Citadino</span>
        <span className="ml-1 rounded-full bg-field px-2.5 py-1 text-xs font-semibold text-muted">
          para prefeituras
        </span>
      </header>

      <section className="mb-12">
        <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
          O campeonato municipal da sua cidade, ao vivo no celular de todo mundo.
        </h1>
        <p className="mt-4 text-lg text-muted">
          Placar ao vivo, tabela, artilharia e os gols em vídeo da transmissão, num site com o nome e as cores
          da prefeitura. A Secretaria de Esporte organiza; a população acompanha e compartilha.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 items-center gap-2 rounded-full bg-accent px-6 font-semibold text-accent-foreground hover:bg-accent-dark"
          >
            <MessageCircle size={18} />
            Agendar demonstração
          </a>
          {vitrine && (
            <Link
              href={`/${vitrine.slug}/gols`}
              className="inline-flex h-12 items-center rounded-full bg-field px-6 font-semibold hover:bg-border"
            >
              Ver um campeonato rodando
            </Link>
          )}
        </div>
      </section>

      {numeros.length > 0 && vitrine && (
        <section className="mb-12 rounded-2xl bg-surface p-5 dark:border dark:border-border">
          <p className="mb-4 text-sm font-semibold text-muted">Em uso hoje em {vitrine.nome}</p>
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {numeros.map((n) => (
              <div key={n.rotulo}>
                <dt className="sr-only">{n.rotulo}</dt>
                <dd className="font-display text-3xl font-bold leading-none">{n.valor.toLocaleString("pt-BR")}</dd>
                <dd className="mt-1 text-sm text-muted">{n.rotulo}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <section className="mb-12">
        <h2 className="mb-4 font-display text-2xl font-bold">O que a Secretaria ganha</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {RECURSOS.map(({ icone: Icone, titulo, texto }) => (
            <li key={titulo} className="rounded-2xl bg-surface p-4 dark:border dark:border-border">
              <Icone size={22} className="mb-2 text-accent" />
              <h3 className="font-semibold">{titulo}</h3>
              <p className="mt-1 text-sm text-muted">{texto}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="mb-4 font-display text-2xl font-bold">Como contratar</h2>
        <ol className="flex flex-col gap-3">
          {PASSOS.map((passo, i) => (
            <li key={passo} className="flex items-start gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
                {i + 1}
              </span>
              <span className="pt-0.5">{passo}</span>
            </li>
          ))}
        </ol>
        <p className="mt-4 flex items-start gap-2 text-sm text-muted">
          <FileCheck2 size={18} className="mt-0.5 shrink-0" />
          Empresa com certidões em dia e atestado de capacidade técnica emitido por prefeitura cliente.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="mb-1 font-display text-2xl font-bold">Preço pelo porte do município</h2>
        <p className="mb-4 text-sm text-muted">Contrato anual, tudo incluído, sem limite de categorias ou times.</p>
        <div className="overflow-hidden rounded-2xl bg-surface dark:border dark:border-border">
          <table className="w-full text-left">
            <thead className="text-sm text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Município</th>
                <th className="px-4 py-3 text-right font-semibold">Mensal</th>
                <th className="hidden px-4 py-3 text-right font-semibold sm:table-cell">Anual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {FAIXAS.map((f) => (
                <tr key={f.porte}>
                  <td className="px-4 py-3">{f.porte}</td>
                  <td className="px-4 py-3 text-right font-semibold">{brl(f.mensal)}</td>
                  <td className="hidden px-4 py-3 text-right text-muted sm:table-cell">{brl(f.mensal * 12)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          {[
            "Implantação e treinamento",
            "Suporte por WhatsApp nos dias de jogo",
            "Gols em vídeo da transmissão",
            "Valor dentro do limite de dispensa",
          ].map((item) => (
            <li key={item} className="flex items-center gap-2">
              <Check size={16} className="shrink-0 text-accent" />
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl bg-accent p-6 text-accent-foreground">
        <h2 className="font-display text-2xl font-bold">Vamos colocar o campeonato da sua cidade no ar?</h2>
        <p className="mt-2 opacity-90">
          Fale direto com a gente no WhatsApp. Mostramos em 15 minutos como fica com a cara do seu município.
        </p>
        <a
          href={whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 font-semibold text-neutral-900 hover:bg-white/90"
        >
          <MessageCircle size={18} />
          Chamar no WhatsApp
        </a>
      </section>
    </div>
  );
}
