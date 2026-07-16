# Citadino — Campeonato Municipal de Futsal

Site mobile-first para gerenciar o Campeonato Citadino: times, atletas, partidas,
súmulas ao vivo, classificação automática (pontos corridos ou grupos + mata-mata),
artilharia com controle de pendurados/suspensos, auto-inscrição de atletas via
convite, perfil público do atleta, enquete "Melhor da Rodada", regulamento em PDF
e notificações push (PWA).

Identidade visual inspirada no site da Prefeitura de Cidreira (laranja + verde-menta
+ azul-marinho, tipografia Nunito, formas orgânicas decorativas), com feed em estilo
Sofascore (faixa de datas, filtro Todos/Ao vivo, minuto ao vivo em tempo real, forma
recente dos times, agrupamento por categoria) e tema claro/escuro com alternância
manual + preferência salva no dispositivo.

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

- `/` — feed de partidas do dia, agrupado por categoria (faixa de datas, filtro
  Todos/Ao vivo, minuto ao vivo, forma recente, favoritos locais)
- `/partida/[id]` — detalhes da partida em abas: Detalhes, Linha do Tempo,
  Escalação, Classificação (com os dois times destacados)
- `/classificacao` — tabela de classificação por categoria (ou grupos + chaveamento
  de mata-mata, conforme o formato configurado)
- `/artilharia` — ranking de gols/cartões e indicação de pendurados/suspensos
- `/atleta/[id]` — perfil público do atleta (stats, idade, Instagram opcional)
- `/enquete` — votação "Melhor Jogador da Rodada" (1 voto por dispositivo)
- `/convite/[token]` — auto-inscrição de atleta em um time via link/QR code
- `/notificacoes` — ativar notificações push por categoria/time (sem login)
- `/login`, `/cadastro` — login e cadastro self-service de treinador
- `/admin/*` — painel administrativo (protegido, papel ADMIN)
- `/treinador/*` — painel do treinador (protegido, papel TREINADOR ou ADMIN)

## Uploads (documentos de atletas e PDFs de regulamento)

Os uploads (documento de identidade, comprovante de endereço na inscrição via
convite, e regulamento em PDF) são salvos em `public/uploads` via
`src/lib/storage.ts`. Isso só funciona com disco persistente (dev local) — a
Vercel é serverless e não tem disco persistente entre requisições. **Antes de
publicar em produção, troque a implementação de `saveUpload()` nesse arquivo por
um provedor de object storage** (Vercel Blob, Cloudinary, S3/R2 etc.) — é a
única função que precisa mudar, todo o resto do app já chama só essa função.

Dados sensíveis (documento e comprovante de endereço) ficam acessíveis apenas
pelo link direto — nunca aparecem em páginas públicas — e só devem ser
consultados por admin/treinador do time durante a aprovação. Não há
criptografia em repouso nem política de retenção/expurgo implementada; ambas
são recomendadas antes de operar com dados reais de menores/pessoas físicas
(LGPD).

## Notificações push

As chaves VAPID de desenvolvimento já estão no `.env`. Para gerar novas:

```bash
npx web-push generate-vapid-keys
```

Notificações push exigem HTTPS (ou `localhost`) e permissão do navegador. Para testar
localmente com HTTPS: `npx next dev --experimental-https`.

Um resumo diário ("hoje tem jogo do seu time/categoria") é enviado 1x por dia via
`/api/cron/resumo-diario`. O `vercel.json` já agenda esse cron às 22h UTC (19h em
horário de Brasília) — o plano Hobby da Vercel só permite cron 1x/dia.

O lembrete "faltam X minutos" (`/api/cron/lembretes`, baseado na preferência
`lembreteMin` de cada inscrito) precisa rodar a cada minuto para não perder
partidas, o que o cron nativo da Vercel não cobre no plano Hobby. Chame essa
rota a cada minuto a partir de um agendador externo gratuito (ex: cron-job.org)
— veja o passo a passo abaixo — ou faça upgrade para o plano Pro da Vercel e
adicione o schedule `* * * * *` no `vercel.json`.

### Passo a passo: cron-job.org (gratuito, roda a cada minuto)

1. Crie uma conta em https://cron-job.org (gratuito, sem cartão).
2. No painel, clique em **"Create cronjob"**.
3. Em **Title**, dê um nome (ex: "Citadino - lembretes").
4. Em **Address**, informe `https://SEU-DOMINIO.vercel.app/api/cron/lembretes`.
5. Em **Schedule**, escolha **"Every minute"** (ou configure manualmente
   `* * * * *`).
6. Salve. O painel do cron-job.org mostra o histórico de execuções e o status
   HTTP de cada chamada — use isso para conferir se está retornando `200`.

Sem `CRON_SECRET` configurado na Vercel, a rota fica pública (qualquer GET
dispara o envio); se quiser restringir, defina `CRON_SECRET` nas env vars do
projeto na Vercel e adicione o header `Authorization: Bearer SEU_CRON_SECRET`
em **Advanced → Request headers** no cron-job.org.

## Limitações conhecidas

- **Suspensão por cartões**: calculada de forma simplificada — cada N cartões
  amarelos acumulados (configurável por categoria) marca o atleta como
  suspenso e o remove da lista de seleção na súmula. Não há um registro de
  "suspensão cumprida" por partida específica; o contador apenas reflete se o
  total atual é múltiplo do limite. Suficiente para o aviso visual e o
  bloqueio na súmula, mas não substitui uma auditoria manual em casos
  extremos (ex: cartões corrigidos/removidos depois).
- **Mata-mata**: os confrontos de cada fase (oitavas, quartas, semifinal...)
  são criados manualmente pelo admin — não há avanço automático de
  vencedores de uma fase para a próxima.
- **Vídeo de gol**: não implementado nesta etapa (gravação/corte no navegador,
  compressão no cliente e upload em segundo plano) — item do prompt mais
  complexo e dependente de infraestrutura de vídeo, deixado para uma etapa
  futura à parte.
- **Minuto ao vivo**: calculado como tempo decorrido desde o horário agendado
  da partida (`dataHora`), sem noção de intervalo/pausa — é uma aproximação,
  não um cronômetro operado pelo admin.
- **Favoritos do feed**: a estrela em cada linha de jogo salva a preferência
  só localmente no navegador (não sincroniza com as notificações push nem
  entre dispositivos); para receber avisos de um time específico, use
  `/notificacoes`.

## Variáveis de ambiente (`.env`)

- `DATABASE_URL` — caminho do SQLite (`file:./dev.db`)
- `AUTH_SECRET` — chave de assinatura de sessão do Auth.js
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` / `VAPID_SUBJECT` — Web Push
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — credenciais usadas pelo `db:seed`
- `CRON_SECRET` (opcional) — protege `/api/cron/resumo-diario` com `Authorization: Bearer`

## Deploy no Vercel (prévia — não usar para dados reais)

`prisma generate` roda automaticamente no `postinstall` (necessário a partir do
Prisma 7, que não gera mais o client sozinho). Configure nas variáveis de
ambiente do projeto na Vercel:

- `DATABASE_URL=file:/tmp/dev.db`
- `AUTH_SECRET`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` (mesmos valores do `.env`, ou gere novos)

**Isso só serve para visualizar a interface no ar.** Funções serverless da
Vercel têm sistema de arquivos somente leitura, exceto `/tmp` — que não é
compartilhado nem persistente entre instâncias/invocações. Para contornar
isso e o deploy pelo menos funcionar visualmente, `src/lib/prisma.ts` copia um
banco SQLite pré-populado (`prisma/seed-template.db`) para `/tmp/dev.db` na
primeira consulta de cada instância fria. Na prática: dados que você grava
(cadastros, resultados, votos) podem sumir a qualquer momento, e requisições
diferentes podem ver estados diferentes do banco. Uploads (documentos de
inscrição, PDFs de regulamento) também não funcionam nesse modo, pelo mesmo
motivo de filesystem.

Para produção de verdade, troque `DATABASE_URL` por um Postgres gerenciado
(Neon, Vercel Postgres, Supabase) — exige adaptar `prisma/schema.prisma`
(`provider = "postgresql"`) e trocar o adapter em `src/lib/prisma.ts` de
`@prisma/adapter-better-sqlite3` para o adapter Postgres correspondente — e
apontar `saveUpload()` em `src/lib/storage.ts` para um object storage (Vercel
Blob, Cloudinary, S3/R2).
