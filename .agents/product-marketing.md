# Product Marketing Context

**Document version:** v2
**Last updated:** 2026-07-22

## Product Overview
**One-liner:** O feed oficial do seu campeonato — não só um grupo de WhatsApp.
**What it does:** Citadino dá a campeonatos amadores de futsal/futebol uma "casa própria" online: feed de partidas ao vivo, classificação por grupo e mata-mata, artilharia, enquete "Melhor da Rodada", cadastro self-service de treinador (com aprovação do organizador) e vitrine de patrocinadores em todas as páginas — tudo que hoje se perde em grupo de WhatsApp, ficha de papel e caderno.
**Product category:** Software de gestão e feed ao vivo para campeonatos amadores de futsal/futebol (society, liga, copa de bairro).
**Product type:** SaaS web self-serve, por assinatura mensal, multi-tenant (cada organizador tem seu próprio campeonato/instância, com cores, logo e possivelmente nome de exibição próprios).
**Sobre o nome:** "Citadino" não é uma referência a Cidreira — vem de "campeonato da cidade" (citadino = da cidade). Por isso a marca já é genérica e escalável por natureza: não é necessário trocar de nome para vender a outras cidades/organizadores. O que muda por tenant é a identidade visual (cores, logo, e opcionalmente um nome de exibição customizado para aquele campeonato específico), não a marca-produto em si.
**Business model:** Assinatura mensal por tier de nº de equipes, cobrança combinada via WhatsApp (não checkout automatizado ainda):
- **Copa da Vila** — R$40/mês, até 8 equipes, feed ao vivo, classificação por grupo e mata-mata.
- **Liga Society** — R$90/mês (plano em destaque), até 32 equipes, múltiplas categorias/grupos, artilharia + cartões + enquete da rodada, cadastro de treinador com aprovação.
- **Arena / rede de quadras** — sob consulta, campeonatos ilimitados, vitrine de patrocinadores destacada, suporte direto via WhatsApp.

## Target Audience
**Target companies/perfis:** Organizadores independentes de campeonato amador — donos de arena/quadra society, organizadores de liga amadora, organizadores de copa de bairro/vila. Explicitamente **não** é o público de secretaria de esporte/prefeitura ("sem secretaria, sem equipe, sem verba pública — mas com o mesmo trabalho").
**Decisores:** O próprio organizador — geralmente pessoa única, sem comitê de compra, contato direto por WhatsApp para assinar.
**Uso principal:** Substituir grupo de WhatsApp + caderno/ficha de papel por um feed ao vivo público, classificação automática e vitrine para vender cota de patrocínio.
**Jobs to be done:**
- Parar de responder "quem tá jogando" e "quanto tá o jogo" toda hora no grupo
- Ter uma tabela de classificação confiável que atualiza sozinha por rodada/mata-mata
- Ter onde mostrar a logo do patrocinador para justificar/vender a cota
**Use cases:**
- Copa de bairro pequena (até 8 times, orçamento apertado)
- Liga society com múltiplas categorias/grupos rodando ao mesmo tempo
- Rede de arenas/quadras hospedando vários campeonatos simultâneos com necessidade de suporte dedicado

## Personas
| Persona | Cares about | Challenge | Value we promise |
|---------|-------------|-----------|------------------|
| Organizador (comprador) | Parecer profissional, vender patrocínio, parar de ser bombardeado de perguntas no grupo | Faz tudo sozinho — inscrição, tabela, comunicação — manualmente | Casa própria do campeonato pronta "em minutos", sem equipe nem verba |
| Treinador (usuário, não comprador) | Gerenciar elenco do próprio time sem burocracia | Cadastro manual repetitivo, sem visibilidade de pendências | Autoatendimento: cria conta, gerencia elenco, entra com aprovação do organizador |
| Torcedor/família (usuário final, não pagante) | Saber quando/onde é o jogo do seu time, acompanhar em tempo real | Informação perdida em 200 mensagens de grupo | Feed ao vivo mobile-first + notificação push sem precisar criar conta |

## Problems & Pain Points
**Core problem:** Campeonatos amadores particulares (sem apoio de secretaria/verba pública) são geridos manualmente — grupo de WhatsApp, caderno, ficha de papel — e isso trava tanto a organização quanto a monetização via patrocínio.
**Why alternatives fall short:**
- Ficha de inscrição se perde no meio de centenas de mensagens no grupo
- Tabela feita no caderno muda toda rodada e ninguém mais entende os critérios
- Patrocinador paga a cota e não tem onde aparecer
- Concorrentes de mercado (iFut, APP Esportivo, GZL Sports, Copa Fácil, Webcup) cobrem cadastro/tabela mas não priorizam a experiência de feed "ao vivo" nem a vitrine de patrocinador como motor de venda de cota
**What it costs them:** Tempo do organizador respondendo a mesma pergunta repetidamente; dificuldade de vender/renovar cota de patrocínio por falta de vitrine; credibilidade quando a tabela do caderno sai errada.
**Emotional tension:** Sobrecarga do organizador voluntário/solo que faz tudo sem equipe; frustração de "trabalho de secretaria sem ser secretaria."

## Competitive Landscape
**Direct:** iFut, APP Esportivo, GZL Sports, Copa Fácil, Webcup — cobrem cadastro de times/tabela/artilharia para organizador amador, mas sem foco forte em feed ao vivo estilo app grande nem em vitrine de patrocinador como argumento de venda.
**Adjacent (não é o público-alvo atual):** Placarsoft — vende para prefeituras/secretarias de esporte; segmento explicitamente fora do foco do Citadino hoje.
**Indireto (o "concorrente" real hoje):** Grupo de WhatsApp + caderno/ficha de papel — é o que a própria landing page usa como contraste central ("não só grupo").

## Differentiation
**Key differentiators:**
- Feed de partidas ao vivo com cara de app grande de futebol (placar, filtro "Ao vivo")
- Classificação automática por grupo e mata-mata, atualizada a cada jogo
- Artilharia + enquete "Melhor da Rodada" — motor de retenção semanal do torcedor
- Cadastro self-service de treinador com aprovação do organizador
- Vitrine de patrocinador em todas as páginas do campeonato — ajuda a vender/justificar cota
**How we do it differently:** Prioriza a experiência do torcedor final (ao vivo, mobile-first) e a necessidade comercial do organizador (vitrine de patrocínio) tanto quanto a ferramenta administrativa básica que os concorrentes já oferecem.
**Why that's better:** Campeonato com mais visibilidade pública facilita renovar/vender patrocínio e reduz o trabalho manual de responder torcedor.
**Why customers choose us:** "Bola rolando em minutos" — sem precisar de equipe, verba ou conhecimento técnico; assina pelo WhatsApp e já sobe o campeonato.

## Objections
| Objection | Response |
|-----------|----------|
| "Meu grupo de WhatsApp já resolve" | Grupo não tem feed ao vivo, tabela confiável nem vitrine pra patrocinador — e você para de responder pergunta repetida |
| "Não tenho verba pra isso" | Planos a partir de R$40/mês, sem infraestrutura própria, cancela quando quiser |
| "Não tenho equipe técnica" | Self-service: organizador sobe o campeonato sozinho, treinador cadastra o próprio elenco |

**Anti-persona:** Secretarias/prefeituras buscando um sistema formal de gestão pública (segmento adjacente, fora do foco atual); campeonatos profissionais/federados com exigência de compliance e broadcast avançado.

## Switching Dynamics
**Push:** Ficha perdida no grupo, tabela do caderno errada/confusa, patrocinador sem vitrine, torcedor perguntando toda hora.
**Pull:** Feed ao vivo pronto "em minutos", vitrine de patrocínio, imagem profissional do campeonato.
**Habit:** "Sempre foi de fichinha e caneta" / grupo de WhatsApp já é hábito estabelecido.
**Anxiety:** Medo de complexidade técnica para organizador leigo; dúvida se compensa o custo mensal para um campeonato pequeno/informal.

## Customer Language
**How they describe the problem:**
- "Ficha de inscrição perdida no meio de 200 mensagens no grupo"
- "Tabela feita no caderno que muda toda rodada e ninguém mais entende"
- "Quem tá jogando agora?" / "Quanto tá o jogo?"
**How they describe us:**
- "Hoje o time abre o feed e já sabe o horário, o placar em tempo real e a classificação — ninguém mais me liga perguntando." (depoimento ilustrativo)
- "Consegui vender cota de patrocínio de novo porque agora tenho onde mostrar a logo da empresa." (depoimento ilustrativo)
**Words to use:** feed ao vivo, casa própria do campeonato, bola rolando, vitrine de patrocinador, "não só grupo"
**Words to avoid:** linguagem corporativa/institucional pesada, jargão de "gestão pública" ou "licitação" (não é o público atual)
**Glossary:**
| Term | Meaning |
|------|---------|
| Súmula | Registro de gols, cartões e eventos de uma partida |
| Pendurado/suspenso | Atleta que atingiu o limite de cartões e fica fora da próxima partida |
| Mata-mata | Fase eliminatória (oitavas, quartas, semifinal, final) |

## Brand Voice
**Tone:** Direto, popular, energia de quadra/vestiário — nada corporativo.
**Style:** Frases curtas, gírias de campo ("bola rolando em minutos", "manda o link pro grupo"), CTA sempre via WhatsApp.
**Personality:** Confiável, ágil, "de bairro" mas com cara de app grande de futebol.
**Visual (landing institucional):** Verde escuro tipo campo (`#0F3D36`) + laranja/âmbar (`#F5821F`) de destaque; tipografia cartaz (Anton, caixa alta) para headlines + monoespaçada (Space Mono) para dados tipo placar. *Observação: essa identidade é diferente da usada no app da instância de Cidreira (laranja + verde-menta + azul-marinho, inspirada na Prefeitura de Cidreira) — a landing de vendas tem identidade própria, separada da identidade de cada instância de campeonato.*

## Proof Points
**Metrics:** Nenhuma pública ainda — campeonato de Cidreira ainda não iniciou as rodadas.
**Customers:** Cidreira/RS é o primeiro cliente real pagante (não piloto gratuito) e serve de base/template para a arquitetura multi-tenant — cada novo tenant herdará a estrutura de Cidreira com identidade visual própria. Ainda não é um case público (sem métricas/depoimento reais até o campeonato começar a rodar).
**Testimonials:**
> "Rodava tudo no caderno. Hoje o time abre o feed e já sabe o horário, o placar em tempo real e a classificação — ninguém mais me liga perguntando." — Dono de arena society, interior de SP *(ilustrativo)*
> "Consegui vender cota de patrocínio de novo porque agora tenho onde mostrar a logo da empresa em todas as rodadas." — Organizador de liga amadora, região Sul *(ilustrativo)*
> "A copa do bairro sempre foi de fichinha e caneta. Esse ano os treinadores se cadastraram no app e a artilharia virou assunto todo domingo." — Organizador de copa de bairro, Nordeste *(ilustrativo)*

*Os três depoimentos acima são ilustrativos (declarado na própria landing page) — substituir por avaliações verificadas assim que houver clientes reais.*

**Value themes:**
| Theme | Proof |
|-------|-------|
| Fim do caos no grupo de WhatsApp | Pain points 01–04 da landing (ficha perdida, tabela confusa, patrocinador sem vitrine, torcedor perguntando) |
| Vitrine de patrocínio como motor comercial | Feature "Vitrine de patrocinadores" + depoimento sobre venda de cota |
| Retenção semanal do torcedor | Artilharia + enquete "Melhor da Rodada" |

## Goals
**Business goal:** Usar Cidreira (primeiro cliente pagante) como base da arquitetura multi-tenant e, assim que o campeonato começar a rodar e gerar dados/depoimentos reais, usá-lo como case para converter novos organizadores independentes em assinantes recorrentes (Copa da Vila / Liga Society / Arena) via WhatsApp.
**Conversion action:** Enviar mensagem no WhatsApp (`wa.me/5551989391520`) pedindo para assinar.
**Current metrics:** N/A — Cidreira é cliente pagante, mas o campeonato ainda não iniciou as rodadas.

## Changelog
*Newest first. One line per revision: what changed and why.*
- v2 (2026-07-22) — Confirmado com o usuário: Cidreira é cliente real pagante (não piloto gratuito) e serve de base para a arquitetura multi-tenant (cores/logo/nome de exibição customizáveis por tenant); "Citadino" vem de "campeonato da cidade", não de Cidreira, então a marca já é genérica e não precisa ser trocada para outras cidades; os 3 depoimentos da landing são 100% ilustrativos. Seção "Open questions" resolvida e removida.
- v1 (2026-07-22) — Documento inicial, construído a partir do README, dos prompts de especificação do projeto e da landing page de vendas (`landing-campeonato-futsal.html`), que revelou o posicionamento real: SaaS self-serve por assinatura para organizadores independentes de campeonato amador (não venda B2G a prefeituras, como uma hipótese inicial havia assumido).
