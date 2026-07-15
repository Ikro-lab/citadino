# Citadino — Campeonato Municipal de Futsal

Site mobile-first para gerenciar o Campeonato Citadino: times, atletas, partidas,
súmulas ao vivo, tabela de classificação automática e notificações push (PWA).

## Stack

- Next.js 16 (App Router, Turbopack), React 19, TypeScript
- Tailwind CSS v4
- Prisma 7 + SQLite (via `@prisma/adapter-better-sqlite3`)
- Auth.js (NextAuth v5, beta) com login por credenciais e papéis (ADMIN / TREINADOR)
- Web Push (VAPID) + manifest PWA para notificações e instalação na tela inicial

## Como rodar

```bash
npm install
npx prisma migrate dev   # já aplicado neste repo; roda de novo se apagar dev.db
npm run db:seed          # popula dados de exemplo
npm run dev
```

Abra http://localhost:3000.

### Contas de exemplo (criadas pelo seed)

| Papel      | E-mail                     | Senha         |
|------------|-----------------------------|---------------|
| Admin      | admin@citadino.local         | admin123      |
| Treinador  | treinador@citadino.local     | treinador123  |

O treinador de exemplo já está vinculado ao time "Real Bairro FC" (Masculino Livre).

## Estrutura

- `/` — feed de partidas do dia, por categoria
- `/partida/[id]` — detalhes da partida (placar, linha do tempo, escalações)
- `/classificacao` — tabela de classificação por categoria
- `/notificacoes` — ativar notificações push por categoria/time (sem login)
- `/login`, `/cadastro` — login e cadastro self-service de treinador
- `/admin/*` — painel administrativo (protegido, papel ADMIN)
- `/treinador/*` — painel do treinador (protegido, papel TREINADOR ou ADMIN)

## Notificações push

As chaves VAPID de desenvolvimento já estão no `.env`. Para gerar novas:

```bash
npx web-push generate-vapid-keys
```

Notificações push exigem HTTPS (ou `localhost`) e permissão do navegador. Para testar
localmente com HTTPS: `npx next dev --experimental-https`.

Um resumo diário ("hoje tem jogo do seu time/categoria") é enviado 1x por dia via
`/api/cron/resumo-diario`. O `vercel.json` já agenda esse cron às 22h UTC (19h em
horário de Brasília) — o plano Hobby da Vercel só permite cron 1x/dia, por isso
essa rota não faz mais o lembrete "X minutos antes" (que exigiria rodar a cada
minuto). Para lembretes de proximidade real, chame essa mesma rota com mais
frequência a partir de um agendador externo gratuito (ex: cron-job.org, GitHub
Actions agendado) ou faça upgrade para o plano Pro da Vercel.

## Variáveis de ambiente (`.env`)

- `DATABASE_URL` — caminho do SQLite (`file:./dev.db`)
- `AUTH_SECRET` — chave de assinatura de sessão do Auth.js
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` / `VAPID_SUBJECT` — Web Push
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — credenciais usadas pelo `db:seed`
- `CRON_SECRET` (opcional) — protege `/api/cron/resumo-diario` com `Authorization: Bearer`
