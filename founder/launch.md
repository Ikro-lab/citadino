# Lançamento: Temporada Ao Vivo (Citadino)

Base: `founder/offer.md`, `founder/pricing.md`, `founder/marketing.md`, `founder/ops.md`, `founder/cfo.md`. Hoje: 2026-10-21.

"Lançamento" aqui é o dia em que a oferta começa a ser apresentada a outras prefeituras: **segunda-feira, 16/11/2026**, a data de `founder/marketing.md`. O campeonato do primeiro cliente, que começa nos próximos dias, funciona como a abertura branda: é onde tudo é testado antes de ser mostrado.

## 1. O teste antes de gastar

**O teste:** pilotos reais que viram temporada paga, no preço da tabela. É o teste de "serviço" do método: clientes reais pagando o preço planejado, com a diferença de que o piloto é grátis e o pagamento vem depois dele.

**Linha de sucesso, escrita antes de começar:**
- **Até 31/12/2026:** 3 pilotos começados em cidades médias ou grandes.
- **Até 31/03/2027** (fim da oferta de fundação): **2 desses pilotos com temporada ou ano esportivo contratado** (empenho emitido) no preço da tabela, sem desconto.

**Como comparar com o painel:**
- No re-teste, 35% dos compradores simulados "compravam", e quase todos só depois do piloto. O CFO supõe que 50% dos pilotos convertem.
- 2 de 3 está dentro do que o CFO supõe.
- **Se for 1 de 3 ou menos:** os compradores reais ficaram bem abaixo do painel. Acredite nos compradores reais. Volte ao `/founder-offer` (falta prova ou confiança) ou ao `/founder-pricing` (preço), antes de visitar mais cidades.
- **Se nenhum piloto começar até 31/12** com 8 conversas por semana: o problema é o público ou a mensagem, não o preço. Reveja `founder/marketing.md`.

**O que não gastar antes do teste:** plantão de backup, eventos de associação de municípios, seguro. Só o inicial do CFO (advogado, kit e visitas, R$ 2.800) entra antes, porque sem ele não há contrato possível.

## 2. A contagem regressiva

Responsáveis: **V** = você (Vitor), **E** = a empresa que fatura, **A** = advogado, **P** = primeiro cliente (a prefeitura).
**[CR]** = caminho crítico: se atrasar, o lançamento de 16/11 atrasa junto.

### Semana 1: qua 21/10 a dom 25/10, base legal e campeonato atual
| Tarefa | Resp. | Prazo |
|---|---|---|
| Migrar o projeto para o Vercel Pro (uso comercial) | V | 22/10 **[CR]** |
| Ativar o Vercel Web Analytics | V | 22/10 |
| Primeiro backup do banco Turso fora do Turso; testar a restauração | V | 23/10 |
| Acordo escrito com a empresa: faturamento, repasse, dono do código, saída; e em nome de quem está o contrato atual | V + E | 24/10 **[CR]** |
| Pedir 2 orçamentos de advogado: contrato, termo de tratamento de dados, política de privacidade, autorização de imagem | V + A | 24/10 **[CR]** |
| Campeonato atual: primeira rodada acompanhada (rotina R2), anotar as horas | V | primeira rodada |

### Semana 2: seg 26/10 a dom 01/11, proteger os dados
| Tarefa | Resp. | Prazo |
|---|---|---|
| **Mudar documentos e comprovantes para Vercel Blob privado**, com rota que exige login de admin ou treinador; revisar os arquivos já enviados | V | 30/10 **[CR]** |
| Se o contrato atual estiver em nome do seu MEI: combinar com a prefeitura o aditivo ou novo contrato em nome da empresa | V + E + P | 30/10 |
| Contratar o advogado e enviar o escopo | V + A | 28/10 |
| Corrigir o contraste do texto sobre a cor do cliente (`founder/brand.md`) | V | 31/10 |
| Monitoramento de disponibilidade com aviso no celular | V | 31/10 |
| Pedir ao primeiro cliente, por escrito, autorização para citar a cidade, mostrar o site e dar o contato | V + P | 30/10 **[CR]** |

### Semana 3: seg 02/11 a dom 08/11, preparação do marketing (calendário de `founder/marketing.md`)
| Tarefa | Resp. | Prazo |
|---|---|---|
| Lista de 30 cidades (vizinhas, médias e grandes, contratos no PNCP vencendo até 06/2027) com contatos | V | 05/11 |
| Página "para prefeituras" no site | V | 06/11 |
| Confirmar que a empresa tem certificado digital e inscrição municipal com atividade de software | V + E | 06/11 |
| Termo de LGPD e minuta de contrato entregues pelo advogado | A | 06/11 **[CR]** |
| Certidões da empresa: federal, FGTS, trabalhista, estadual e municipal | V + E | 06/11 |

### Semana 4: seg 09/11 a dom 15/11, kit e prova
| Tarefa | Resp. | Prazo |
|---|---|---|
| Kit de contratação: proposta por porte, minuta de termo de referência, justificativa de preço com contratos do PNCP | V | 10/11 **[CR]** |
| Vídeo de 60 s da tela, com autorização e sem rosto de menor | V | 10/11 |
| Página com os números reais das primeiras rodadas | V | 11/11 |
| Perfil do Citadino no Instagram com o vídeo | V | 12/11 |
| Ensaiar a ligação de 2 minutos | V | 13/11 |
| Decidir sobre o plantão de backup: só a decisão, sem contratar antes do teste | V | 13/11 |
| **Revisão de prontidão** (abaixo) | V | 13/11 |

**Revisão de prontidão em 13/11:** só lance em 16/11 se os três itens estiverem prontos:
1. Documentos privados.
2. Autorização do primeiro cliente.
3. Termo de LGPD em mãos.

Se faltar algum, adie o lançamento uma semana e mantenha a mesma ordem.

## 3. Dia do lançamento: segunda-feira, 16/11/2026

Você trabalha sozinho, então cada horário é uma tarefa sua.

| Horário | O que fazer |
|---|---|
| 08:00 | Conferir os números da rodada de sábado (analytics, súmulas lançadas ao vivo, inscritos no push). Atualizar a página de números se mudou |
| 08:30 | Conferir se o site do cliente atual e a página "para prefeituras" estão no ar e se o monitoramento está verde |
| 09:00 | Contato 1: ligação para o secretário da cidade média ou grande mais próxima. Hook 1 ("O campeonato da sua cidade ao vivo no celular de cada torcedor. Com o gol em vídeo.") e fechamento com o piloto grátis |
| 09:30 | Contato 2, mesmo roteiro |
| 10:00 | Contato 3 |
| 10:30 | Mandar o vídeo e o link a quem atendeu; WhatsApp a quem não atendeu |
| 11:00 | Contato 4 |
| 11:30 | Contato 5 |
| 12:00 | Anotar na planilha: quem atendeu, quem pediu proposta, quem marcou visita |
| 14:00 | Responder o que chegou; enviar o kit a quem pediu proposta |
| 15:00 | Suporte ao cliente atual (se houver algo da rodada) |
| 16:00 | Marcar 1 ou 2 visitas para quinta, 19/11 |
| 17:00 | Preparar os 5 contatos de amanhã (hook 3) |

**Oferta do dia, igual em toda conversa:**
- Piloto grátis de uma categoria.
- Tabela por porte de cidade.
- Preço de fundação mantido em 2028 para quem assinar até 31/03/2027.

**Se algo quebrar:**
- Site fora do ar enquanto você mostra ao vivo: mostre o vídeo e o resumo de números. Volte à rotina de incidente de `founder/ops.md` depois da ligação.
- Alguém pergunta "e se você sumir?" antes de você ter decidido o plantão: diga o que existe de fato (backup semanal, os dados são da prefeitura, rescisão sem multa). Não prometa um segundo técnico que ainda não existe.
- Pedem uma referência: só o contato autorizado do primeiro cliente. Se ele não autorizou, diga isso e ofereça ver uma rodada ao vivo.

## 4. Os primeiros 30 dias (16/11 a 16/12)

**Números da semana** (de `founder/marketing.md` e `founder/cfo.md`):

| Número | Meta | Sinal para mudar |
|---|---|---|
| Conversas com secretário | 8 por semana | menos de 4 por 2 semanas: mudar a lista ou o hook |
| Pilotos começados | 1 por semana a partir da semana 2 | zero em 3 semanas: mudar a oferta ou o público |
| Piloto que vira temporada paga | 50% (CFO) | menos de 33%: a conta do CFO fica negativa; rever suporte e preço |
| Horas de suporte por cidade por mês | até 4 h (CFO) | mais de 6 h: rever preço ou suporte |
| Súmulas do cliente atual lançadas ao vivo | 80% ou mais | menos de 80%: a prova perde força; o hook 6 sai de uso |

O ponto de equilíbrio do CFO é praticamente coberto pelo contrato atual (`founder/cfo.md`). O número que decide o ano 1 não é o de equilíbrio, é a conversão dos pilotos.

**Revisões:**

- **Dia 7 (seg 23/11):**
  - Quantas conversas? Qual hook rendeu resposta?
  - Alguém pediu algo que a oferta não tem?
  - Quanto tempo levou cada contato?
- **Dia 14 (seg 30/11):**
  - Algum piloto marcado?
  - Qual objeção apareceu mais nas conversas reais, comparada com o painel?
  - As horas de suporte do cliente atual estão dentro de 4 h por mês?
  - Dezembro vai travar empenho? Se sim, mudar o foco para "entrar no planejamento de 2027".
- **Dia 30 (qua 16/12):**
  - Pilotos começados contra a meta de 3 até 31/12.
  - Preço: alguém recusou por preço? Em qual porte?
  - A objeção "uma pessoa só" apareceu? Se sim, contratar o plantão de backup.
  - Atualizar `founder/numbers.json` com as horas reais e rodar o `/founder-cfo` de novo.

Próximo: `/founder-plan` junta tudo no plano de negócio.
