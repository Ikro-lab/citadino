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

O lembrete de partida (X minutos antes) depende de um disparo periódico externo —
veja `vercel.json` (`/api/cron/lembretes`, a cada minuto) ou configure outro agendador
apontando para essa rota em produção.

## Variáveis de ambiente (`.env`)

- `DATABASE_URL` — caminho do SQLite (`file:./dev.db`)
- `AUTH_SECRET` — chave de assinatura de sessão do Auth.js
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` / `VAPID_SUBJECT` — Web Push
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — credenciais usadas pelo `db:seed`
- `CRON_SECRET` (opcional) — protege `/api/cron/lembretes` com `Authorization: Bearer`
