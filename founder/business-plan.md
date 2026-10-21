# Citadino · Business plan

**Verdict: Not yet**

- ✓ Each cidade-mês de campeonato novo (preço médio da tabela por porte: R$ 3.460 por temporada de 4 meses) earns $400.60 before fixed costs (46% contribution).
- ✓ Year 1 operating profit: $14,545.
- ✓ Break-even is 0 cidade-mês de campeonato novo (preço médio da tabela por porte: R$ 3.460 por temporada de 4 meses)s a day against a capacity of 6.
- ✗ 9 of 100 simulated buyers buy (9%, the bar is 25%).

| key number | |
| --- | ---: |
| Price | $865.00 a cidade-mês de campeonato novo (preço médio da tabela por porte: R$ 3.460 por temporada de 4 meses) |
| Profit margin at plan | 53% per cidade-mês de campeonato novo (preço médio da tabela por porte: R$ 3.460 por temporada de 4 meses) |
| Break-even | 0 cidade-mês de campeonato novo (preço médio da tabela por porte: R$ 3.460 por temporada de 4 meses)s a day |
| Year 1 operating profit | $14,545 |
| Startup spend | $2,800 |
| Cash needed before it pays for itself | $2,800 |
| Startup money earned back | month 6 |
| Buyer panel | 9 buy · 91 pass |

## The idea

- What it is: a mobile-first, multi-tenant web platform (PWA) to run municipal futsal championships end to end: team and athlete registration, live match sheets, automatic standings (round-robin or groups + knockout), top-scorer and suspension tracking, athlete public profiles, "best of the round" polls, rules PDF and push notifications.
- Who it is for: municipal governments (prefeituras) and their sports departments (secretarias de esporte) that organise the city's championship. End users are coaches, athletes and the local public following the games.
- What it sells, at what price: the hosted platform, one tenant per championship/city. Current offer ("Temporada Ao Vivo", see founder/offer.md and founder/pricing.md): per season of up to 4 months, priced by city size (R$ 2,400 up to 20k inhabitants, R$ 3,500 for 20k-100k, R$ 5,000 above 100k), or a full sports year (R$ 6,000 / R$ 8,400 / R$ 12,000), with a free pilot of one category. First contract: R$ 500/month, 12 months (R$ 6,000/year), equivalent to the small-city sports year.
- Where and how: Brazil, online (web + PWA installable on phones). Sold directly to municipalities; discovered through the organiser's own championship (fans, coaches and athletes use the public site). The product is already built (Next.js, Prisma, push notifications, uploads, super-admin for multiple tenants).
- Budget and constraints: one paid contract signed (R$ 500/month, 12 months) with a municipality for a championship starting in a few days. The live match sheet is filled in by the championship organiser (the municipality's own person in charge of the app), not by the founder. No other budget, team size or runway stated.

## Summary

**Veredito: Not yet.** Ele é calculado pelo `compile.py`. Três dos quatro testes passam. Reprova o painel de compradores: 9 de 100 compram (9%), e o mínimo é 25%.

**O que precisa mudar e quem muda:**
- Esse painel testou a **oferta antiga** (contrato de 12 meses a R$ 6.000).
- A oferta atual (temporada, piloto grátis e tabela por porte) só passou por um re-teste rápido. Nele, **7 de 20 compraram (35%)**, acima do mínimo, mas 20 compradores é pouco e a ferramenta não usa o re-teste.
- **Para o teste contar, é preciso um painel completo de 100 com o pitch atual (`/founder-consumer`).** O que decide de verdade é real: 2 de 3 pilotos virando temporada paga até 31/03/2027 (`founder/launch.md`).

**O negócio.** O Citadino é uma plataforma que roda o campeonato municipal de futsal: súmula no celular, tabela e suspensos automáticos, gol em vídeo e notificação para o torcedor, com a cara da prefeitura. É vendido a secretarias de esporte, por temporada, numa tabela por porte de cidade (R$ 2.400, R$ 3.500 ou R$ 5.000).

**Os números** (projeção do `/founder-cfo`):

| | |
|---|---|
| Contribuição por cidade-mês de campeonato | R$ 400,60 (53% de margem no plano) |
| Ponto de equilíbrio | o contrato atual já cobre todos os custos fixos (Vercel Pro e domínio). Capacidade: 6 |
| Lucro operacional no ano 1 | R$ 14.545; R$ 11.745 depois do investimento inicial, que volta no mês 6 |

**Onde o conselho e o painel concordaram:**
- O problema é confiança e caminho de compra, não o produto.
- Faltam referência de outra prefeitura e um formato de contrato que a secretaria consiga defender.

**Onde discordaram:**
- O conselho temia o preço e a cópia pelos concorrentes.
- O painel mostrou que preço era só o 3º motivo de recusa.
- O medo que dominou o re-teste foi "é uma pessoa só no suporte" (95%).

**O maior risco.** Documentos e comprovantes de residência dos atletas, muitos deles menores, estão salvos como **arquivos públicos**. Isso vale para o campeonato que está começando agora. O plano é passá-los para armazenamento privado, com acesso só para quem está logado (`founder/ops.md`).

**O que é preciso para começar:**
- R$ 2.800 de caixa: advogado, kit de contratação e visitas.
- Migrar para o Vercel Pro.
- Faturar pelo CNPJ da empresa onde você trabalha (ME com permissão para software), com um acordo escrito sobre repasse, dono do código e saída. Confirmar em nome de quem está o contrato atual.
- O primeiro teste: 3 pilotos até 31/12/2026.

**A coisa a fazer esta semana:** tornar privados os documentos dos atletas, antes que o campeonato atual junte mais arquivos.

*O painel é de compradores simulados e os números são projeções. Clientes reais e orçamentos reais confirmam ou derrubam. Não é aconselhamento financeiro, jurídico ou tributário.*

## What the board said

Memorandos completos em `founder/board/` (offers.md, monopoly.md, product.md). Briefing em `founder/board/brief.md`.

### 1. Votação

**3 FUND IF, 0 FUND, 0 PASS.** Nota média: **5,0 / 10** (Offers 5, Monopoly 4, Product 6).

Nenhum membro financia como está. Nenhum rejeita. Os três condicionam a aposta a provas que ainda não existem, e as três listas de condições apontam para os mesmos buracos.

### 2. Riscos levantados por mais de um membro

1. ~~**Ninguém sabe se o primeiro contrato é pago, nem quanto.**~~ (Offers, Monopoly) **Respondido após a reunião:** o contrato é pago, R$ 500/mês por 12 meses (R$ 6.000/ano). Isso responde a condição número um das lentes Offers e Monopoly. A pergunta que sobra é se R$ 6.000/ano cobre hospedagem, suporte e o custo de vender a próxima cidade, e se esse valor cabe no teto de dispensa de licitação de outras prefeituras. `/founder-cfo` e `/founder-pricing`.
2. **A venda para prefeitura não tem caminho repetível.** (Offers, Monopoly, Product) Ciclo de venda, limite de dispensa de licitação, quem assina, custo de chegar lá: tudo desconhecido. A lente Monopoly trata isso como o risco número um; a Offers chama o mercado de "fraco em dinheiro e facilidade de compra".
3. **A súmula ao vivo depende de uma pessoa na beira da quadra.** (Offers, Product) **Respondido em parte:** quem preenche é o organizador do campeonato, o responsável pelo app na prefeitura. Isso resolve "quem", mas não resolve o risco: é uma pessoa só, sem plano B, e a dependência de sinal no ginásio continua. Se essa pessoa faltar ou o sinal cair, o feed fica vazio e o produto vira uma planilha bonita.
4. **Sem preço e sem concorrentes mapeados, vira commodity.** (Offers, Monopoly) A comparação natural é com planilha e WhatsApp, que custam zero, e qualquer agência local copia a funcionalidade em meses.
5. **Quem compra não é quem vive o produto.** (Product, Offers) O torcedor vê o Sofascore; a secretaria vê burocracia de cadastro e validação de documentos. Se o painel admin der mais trabalho que a planilha, não há renovação.

Desacordo que vale registrar: a lente Product considera o produto pronto um ativo forte e dá a maior nota; a Monopoly dá a menor porque vê nele "melhoria incremental", não tecnologia 10x. A Offers fica no meio: o resultado-sonho é claro, mas o mercado pode não ter dinheiro.

### 3. Condições, mescladas

Checklist para o restante do pacote. Cada item diz qual skill o resolve.

- [x] **Confirmar se o contrato atual é pago e quanto.** R$ 500/mês, 12 meses. Falta: quem assinou e por qual via (dispensa, convite, contrato direto). (Offers 1, Monopoly 1)
- [ ] **Mapear concorrentes e substitutos**, incluindo "não fazer nada" (planilha e WhatsApp), apps genéricos de torneio e sistemas de federação. `/founder-competitors` (Monopoly 5, Offers 3, Product)
- [ ] **Mapa de compra municipal**: como a prefeitura compra, teto de dispensa de licitação, quem assina, quanto tempo leva. Baseado em pelo menos três conversas reais com secretarias. `/founder-competitors` + `/founder-consumer` (Monopoly 2, Offers 4)
- [ ] **Validar a dor com pelo menos 10 secretarias**: dor, verba, forma de compra. Se menos da metade compra software hoje, a lente Offers vira PASS. `/founder-consumer` (Offers 4)
- [ ] **Definir modelo e preço antes da segunda venda**, acima da faixa commodity, com custo por tenant calculado. `/founder-pricing` + `/founder-cfo` (Monopoly 1, Offers 3)
- [ ] **Custo de hospedar e dar suporte a um tenant por temporada**, e custo de adquirir uma prefeitura. `/founder-cfo` (Offers, Monopoly 3)
- [ ] **Definir a oferta**: nome, preço por temporada, garantia concreta ligada à primeira rodada (ex.: "tabela no ar na primeira rodada ou não paga"), um bônus barato (treinamento do mesário, modelo de regulamento). `/founder-offer` (Offers 3)
- [ ] **Transformar o primeiro campeonato em caso e laboratório.** Estar nos jogos. Medir: % de partidas com súmula lançada ao vivo, latência real do feed, acessos do público por rodada, inscritos no push, cada ponto que exigiu intervenção manual. `/founder-launch` (Offers 2, Product 1)
- [ ] **Resolver a costura da súmula antes da segunda cidade**: já se sabe quem registra (o organizador). Falta: com qual aparelho, caminho offline, e plano B quando o organizador não está no jogo. `/founder-ops` (Product 3)
- [ ] **Declarar a única coisa e cortar o resto.** Escolher entre "campeonato ao vivo para o torcedor" e "gestão sem dor para a secretaria" como núcleo. `/founder-brand` + `/founder-marketing` (Product 2)
- [ ] **Identidade visual por prefeitura via configuração, não via código.** `/founder-ops` (Product 4)
- [ ] **Dez cidades-alvo nomeadas**, com plano de chegada e custo estimado por cliente. `/founder-marketing` (Monopoly 3)
- [ ] **Uma fonte de defesa escolhida e construída**: a aposta mais plausível é o histórico local de atletas e times atravessando temporadas, com meta concreta de renovação do primeiro cliente. `/founder-plan` (Monopoly 4)
- [ ] **Pitch em uma frase**, testado com uma secretaria que não conhece o produto. `/founder-brand` (Product 5)

### 4. A versão mais forte deste negócio

A versão mais forte não é "software de campeonato de futsal" vendido cidade a cidade. É **o registro oficial do esporte amador de uma região**: a mesma plataforma rodando futsal, society e vôlei da prefeitura, temporada após temporada, acumulando histórico de atletas, times, artilharia e suspensões que ninguém mais tem e que fica caro abandonar. O comprador continua sendo a secretaria, mas a venda passa a ser "tudo que a cidade organiza, num lugar só, com memória", e a expansão vai por cidades vizinhas onde os mesmos times e atletas já aparecem. O torcedor seguindo ao vivo é a vitrine que faz o prefeito querer; a gestão sem planilha é o motivo de a secretaria renovar. Isso difere do pitch atual em dois pontos: o produto precisa ser vendido como plataforma multi-modalidade, não como ferramenta de futsal, e a métrica que importa não é "cidades vendidas" e sim "cidades que renovaram". Antes disso, o primeiro campeonato precisa provar que a súmula ao vivo funciona com gente de verdade num ginásio de verdade.

## The competition

Pesquisa feita em 2026-10-20, só com fontes públicas. Tabela completa em `founder/competitors.csv`. Cada fato tem link; o que não foi possível ler está marcado.

### 1. Quem está lá

Ordenado de quem compete mais diretamente (vende para prefeitura) para quem menos compete.

| # | Nome | Tipo | O que vende | Preço comparável | Avaliação |
|---|------|------|-------------|------------------|-----------|
| 1 | [Placarsoft](https://placarsoft.com.br/lp/para-prefeituras) | Direto | Gestão esportiva municipal: inscrições, tabelas, gerador de confrontos e súmulas, histórico do atleta, app de resultados, portal do atleta | Sem preço público. No [PNCP](https://pncp.gov.br/app/contratos/18666750000162/2026/16): R$ 4.800 a R$ 64.584/ano (115 contratos) | Sem app nas lojas |
| 2 | [APP Esportivo](https://appesportivo.com.br/para-prefeituras.html) | Direto | Campeonatos multiesporte: tabela automática, súmula online pelo mesário em tablet, artilharia, suspensões, carteirinha, app público iOS/Android | Sem preço público | [Play 4,41 (700)](https://play.google.com/store/apps/details?id=com.placaresportivoamador.app&hl=pt_BR) / [iOS 4,0 (41)](https://apps.apple.com/br/app/app-esportivo/id824228264) |
| 3 | [GZL Sports](https://gzlsports.com.br/) | Direto | SaaS para secretarias: atletas, turmas, reservas, campeonatos com súmula digital em tempo real, inscrições, bolsa atleta, tribunal; banco isolado por organização | Sem preço público, "sem custo de contrato mínimo" | Sem app (PWA) |
| 4 | [InfoVR / Apolo Esporte](https://www.infovrtecnologia.com.br/sistemas/sistema-de-controle-de-esportes-4.html) | Direto | Controle de campeonatos para prefeituras pequenas de SC (6 cidades nomeadas) | Sem preço público | Sem app |
| 5 | [SG Sports](https://sgsports.com.br/) | Direto | Sistema de gestão para secretarias e ligas | Não lido (site não carrega sem JavaScript) | Não lido |
| 6 | [iFut](https://www.ifut.com.br/) | Indireto | Campeonato amador self-service: tabela, inscrições, site e app; súmula impressa ou upload pós-jogo; ranking de atletas | Prata R$ 99, Ouro R$ 159 (+ R$ 69 a 79 por categoria extra), Elite R$ 300/mês; grátis até 64 times | [Play 4,72 (549)](https://play.google.com/store/apps/details?id=org.ifut.camp.app&hl=pt_BR) / [iOS 4,1 (84)](https://apps.apple.com/br/app/ifut/id1389984816) |
| 7 | [Copa Fácil](https://copafacil.com/pt) | Indireto | Web e app self-service: sorteio, tabela, classificação, artilharia, súmulas para consultar ou imprimir, inscrição por link | R$ 25/mês (300 jogadores) ou R$ 55/mês; in-app R$ 20,90 a R$ 122,90 | [Play 4,85 (163.733, 5 mi+ instalações)](https://play.google.com/store/apps/details?id=com.copafacil&hl=pt_BR) / [iOS 4,9 (~39 mil)](https://apps.apple.com/br/app/copa-facil/id1444543396) |
| 8 | [Futebol Café](https://futebolcafe.com.br/organizadores) | Indireto | Multiesporte: tabela, súmula pelo celular durante a partida, artilharia, pagamento de inscrições, app Android; white label no Pro III | R$ 20, R$ 45, R$ 120 ou R$ 250/mês; Pix, sem fidelidade | [Play sem nota, 10+ instalações](https://play.google.com/store/apps/details?id=br.com.futebolcafe.app&hl=pt_BR) |
| 9 | [FutLeague](https://futleague.app.br/planos) | Indireto | Campeonatos, times e jogadores em site e app; alertas no app | R$ 30, R$ 100 ou R$ 150/mês | [iOS 5,0 (2)](https://apps.apple.com/br/app/fut-league/id6761315713) |
| 10 | [Jogafácil](https://campeonato.jogafacilapp.com/) | Indireto | Site para organizador e app para times | Sem preço público | [iOS 3,4 (35)](https://apps.apple.com/br/app/jogafacil/id1512608768) |
| 11 | Planilha + grupo de WhatsApp | Substituto | Tabela à mão, resultado cobrado no grupo, ficha impressa, súmula em papel | R$ 0 | [TCC IF Farroupilha 2025](https://arandu.iffarroupilha.edu.br/bitstream/itemid/820/1/TCC%20MATHEUS%20NAZIAZENO%20-%202023318409.pdf) |
| 12 | Instagram da prefeitura + súmula em papel | Substituto | Card de resultado depois do jogo, tabela em imagem, PDF no site | R$ 0 | [TR São José dos Ausentes/RS](https://www.saojosedosausentes.rs.gov.br/wp-content/uploads/2025/06/TERMO-DE-REFERENCIA.pdf) |

Não encontrado no PNCP: nenhum contrato público de GZL Sports, APP Esportivo, InfoVR, SG Sports ou iFut com prefeituras. Só a Placarsoft aparece, e aparece muito.

### 2. Faixa de preço

Há dois mercados com preços diferentes, e o Citadino está entre eles.

**Apps self-service para organizador (indiretos), por mês:**

| | Valor |
|---|---|
| Mais baixo | R$ 20 (Futebol Café Básico, 1 campeonato, 8 times) |
| Mediana | R$ 99 a R$ 100 (iFut Prata, FutLeague Essencial) |
| Mais alto | R$ 300 (iFut Elite, único mensal) |

**Contratos com prefeituras (direto, só Placarsoft tem dados públicos), por ano:**

| | Valor | Equivalente mensal |
|---|---|---|
| Mais baixo | R$ 4.800 (Fortaleza dos Valos/RS, [inexigibilidade](https://pncp.gov.br/app/contratos/89708051000186/2026/8)) | R$ 400 |
| Mediana (6 contratos) | ~R$ 18.000 (entre Itaí R$ 11.997 e São Sebastião R$ 24.000) | ~R$ 1.500 |
| Mais alto | R$ 64.584 (Tangará da Serra/MT, [inexigibilidade](https://pncp.gov.br/app/contratos/03788239000166/2026/126)) | R$ 5.382 |

O contrato do Citadino (R$ 500/mês, R$ 6.000/ano) fica na ponta de baixo da faixa Placarsoft e bem acima de qualquer app self-service. O modelo de Itaí/SP ([edital](https://www.itai.sp.gov.br/public/admin/globalarq/licitacao/arquivo/9f8e204c503c0ea10a6d928d1dde90c2.pdf)) é cobrança por cadastro: R$ 0,50 por atleta por mês, 2.000 cadastros.

**Como a prefeitura compra:** o teto de dispensa de licitação para serviços em 2026 é R$ 65.492,11 ([Decreto 12.807/2025](https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2025/decreto/D12807.htm), art. 75, II da Lei 14.133). Todos os contratos encontrados foram por dispensa ou inexigibilidade, nenhum por pregão. Isso significa que a venda a R$ 6.000/ano não precisa de licitação e o contrato pode ser direto. Municípios com até 20 mil habitantes têm até abril de 2027 para aderir à licitação eletrônica obrigatória (art. 176).

### 3. Mapa de posicionamento

Eixos que importam para a secretaria: **quem opera** (self-service pelo organizador vs. fornecedor que implanta e dá suporte) e **o que o torcedor vê** (tabela estática atualizada depois vs. jogo ao vivo no celular).

```
                     TORCEDOR VÊ AO VIVO
                            |
                            |   [Citadino]
                            |   (push, minuto a minuto,
                            |    perfil de atleta)
          GZL Sports        |
          (súmula tempo     |
           real, sem app)   |
                            |
FORNECEDOR ------------------------------------------- SELF-SERVICE
IMPLANTA                    |                           ORGANIZADOR
                            |          Futebol Café
  Placarsoft   APP Esportivo|          (súmula no celular,
  (115 contratos,  (súmula  |           app Android, 0 reviews)
   sem app)        tablet)  |
                            |   Copa Fácil (5 mi+, súmula
  InfoVR / SG Sports        |   para imprimir, sem offline)
  (pequenas de SC)          |
                            |   iFut (upload pós-jogo,
                            |   "demora uma semana")
                            |
              Planilha + WhatsApp + Instagram (resultado em card)
                            |
                     TORCEDOR VÊ DEPOIS
```

O quadrante superior esquerdo (fornecedor que implanta **e** torcedor acompanha ao vivo no celular) está praticamente vazio. GZL promete tempo real mas não tem app nem push. Placarsoft tem a distribuição e nenhum app nas lojas.

### 4. O que os clientes reclamam

Fonte: 900 reviews recentes do Copa Fácil, 200 do APP Esportivo e 183 do iFut no Google Play, mais feeds da App Store. Reclame Aqui bloqueou o acesso (HTTP 403). Placarsoft e Futebol Café não têm reviews públicos. Contagem = reviews de 1 a 4 estrelas lidas com o tema.

1. **Resultado demora a aparecer** (APP Esportivo 19, iFut 9). "demora muiiito pra atualizar campeonatos" ([Play, 14/09/2025](https://play.google.com/store/apps/details?id=com.placaresportivoamador.app&hl=pt_BR)); "ele atualiza mais ou menos uma semana depois do jogo" ([iFut, Play, 20/06/2024](https://play.google.com/store/apps/details?id=org.ifut.camp.app&hl=pt_BR)). Em 13 respostas o APP Esportivo culpa o organizador: "a responsabilidade pela inserção dos resultados é da organização do evento". O iFut responde o mesmo: "Quem cuida dos dados não somos nós do iFut, é o organizador".
2. **Trava, "algo deu errado", não abre** (Copa Fácil 24 + ~8 iOS, APP Esportivo 11, iFut 5). "Trava o gerenciamento de campeonatos, e perdi um campeonato por causa disso" ([Copa Fácil, Play, 04/07/2026](https://play.google.com/store/apps/details?id=com.copafacil&hl=pt_BR)); "aplicativo demora uma eternidade pra abrir, e as vezes nem abre" ([APP Esportivo, Play, 10/11/2025](https://play.google.com/store/apps/details?id=com.placaresportivoamador.app&hl=pt_BR)).
3. **Login, conta e senha** (Copa Fácil 15, iFut 10). "Não há opção 'esqueci minha senha' no app. Se uma pessoa perder a senha, já era." ([Copa Fácil, Play, 09/07/2025](https://play.google.com/store/apps/details?id=com.copafacil&hl=pt_BR)).
4. **Anúncios** (Copa Fácil 13 + 3 iOS). "Depois da atualização do app onde incluíram anúncios, o app ficou muito ruim" ([App Store, 06/05/2025](https://apps.apple.com/br/app/copa-facil/id1444543396)).
5. **Pagamento não libera, sem Pix** (Copa Fácil 11). "comprei o plano e não estou conseguindo liberar a função de inscrição de jogadores" ([Play, 01/10/2026](https://play.google.com/store/apps/details?id=com.copafacil&hl=pt_BR)); "não aceitar pix é de lascar" (Play, 05/06/2025).
6. **Atualização piorou o app** (Copa Fácil 5 + 4 iOS). "A cada atualização piora, escudos de clubes somem sozinhos, MUITO MAIS DEMORA pra computar resultados" ([Play, 18/09/2026](https://play.google.com/store/apps/details?id=com.copafacil&hl=pt_BR)).
7. **Sem modo offline** (Copa Fácil 6). "quando o servidor ou a nossa Internet cai simplesmente o aplicativo fica inoperante" ([Play, 28/06/2025](https://play.google.com/store/apps/details?id=com.copafacil&hl=pt_BR)).
8. **Dados errados: gol para quem não jogou** (iFut 6). "goleiros ganhando gols e etc" ([Play, 06/07/2023](https://play.google.com/store/apps/details?id=org.ifut.camp.app&hl=pt_BR)).
9. Fracos (menos de 3): layout torto no APP Esportivo, documento difícil de anexar, suporte sem resposta, difícil de aprender.

**Substitutos.** Não há reclamações de organizadores em fóruns. A dor da planilha aparece em TCCs e no marketing dos próprios concorrentes: "Pare de refazer classificação no Excel e de cobrar resultado no grupo do WhatsApp" ([Futebol Café](https://futebolcafe.com.br/)); "uso de listas impressas, planilhas e anotações dispersas ... favorece erros" ([TCC IF Farroupilha, 2025](https://arandu.iffarroupilha.edu.br/bitstream/itemid/820/1/TCC%20MATHEUS%20NAZIAZENO%20-%202023318409.pdf)); "sorteio dos grupos são utilizados métodos sujeitos a alterações que possam beneficiar determinada equipe" ([TCC UNIFAL, 2017](https://www.unifal-mg.edu.br/dcc/wp-content/uploads/sites/221/2022/01/TCC_AlissonJoseOliveiraDeFaria.pdf)).

### 5. A lacuna

Existe, e é específica: **ninguém que vende para prefeitura entrega o jogo ao vivo no celular do torcedor, e ninguém que entrega ao vivo vende para prefeitura.**

- A reclamação número um dos apps de acompanhamento é resultado atrasado, e os fornecedores respondem que a culpa é do organizador. Isso é o oposto do que o Citadino faz: a súmula minuto a minuto no celular, à beira da quadra, com push para o torcedor. É a dor mais citada e nenhum concorrente a trata como problema de produto.
- Placarsoft tem a distribuição (115 contratos públicos) mas não tem app nas lojas nem push. APP Esportivo tem app e súmula em tablet, mas sem push e com 11 reclamações de travar. GZL promete tempo real, sem app.
- Os self-service (Copa Fácil, iFut, Futebol Café) são baratos e bons para o organizador de várzea, mas a secretaria não quer anúncio, não quer "esqueci a senha" sem saída e não quer o nome da cidade dentro de um app genérico. Nenhum deles aparece em contrato público.
- Perfil público de atleta, enquete de melhor da rodada, identidade visual da prefeitura e push por time: nenhum concorrente lido anuncia os quatro juntos.

O que a lacuna **não** cobre: operação. Placarsoft e GZL vendem implantação assistida, treinamento e módulos que o Citadino não tem (reservas de ginásio, bolsa atleta, programas e incentivos, tribunal). A secretaria que quer "gestão esportiva completa" vai comparar com eles e o Citadino perde. A secretaria que quer "o campeonato bonito e ao vivo" não tem com quem comparar.

Duas ressalvas de evidência: Reclame Aqui não foi lido, e Placarsoft e GZL não têm reviews públicos, então as reclamações contra os diretos são desconhecidas. O que se sabe deles vem do próprio site e dos contratos.

### 6. A ameaça

**Quem copia mais rápido: a Placarsoft.** Já tem 115 contratos, já está dentro das prefeituras, já cobra por cadastro, e o que falta (app nas lojas, push, súmula ao vivo) é trabalho de engenharia de meses, não de anos. Se uma secretaria pedir "quero igual ao Citadino", a Placarsoft adiciona o módulo e vende para a base existente sem custo de aquisição. O APP Esportivo vem em segundo: já tem súmula em tablet e app público, falta só push e estabilidade.

**Como se defende:** não é pela funcionalidade, que é copiável. É pelo que o conselho já apontou: histórico local acumulado (atletas, times, temporadas) que fica caro abandonar, e pela prova pública de que o feed funciona ao vivo num ginásio de verdade, com métricas (% de súmulas lançadas ao vivo, acessos por rodada, inscritos no push) que a Placarsoft não pode mostrar porque não tem app.

### Próximo

- `/founder-consumer`: usar as oito reclamações acima como objeções reais no painel de compradores (secretários de esporte), em especial "resultado demora", "trava no jogo" e "sem offline".
- `/founder-pricing`: a faixa de referência é R$ 4.800 a R$ 65.000/ano por prefeitura (Placarsoft), com o modelo de R$ 0,50 por atleta/mês como alternativa; o teto de dispensa (R$ 65.492,11) é o limite prático.

## The buyer panel

**9 buy · 91 pass** (9% buy) out of 100 simulated buyers. Seed 242407, so the same cards can be dealt again.

These are simulated buyers, not customers. Use this to find objections and weak spots, then confirm the big ones with real people before you spend.

### By segment

| group | buyers | buy rate |
| --- | ---: | ---: |
| Secretário de esportes de cidade grande ou polo regional (100 a 500 mil habitantes), verba anual acima de R$ 400 mil, já usa ou já cotou sistema de gestão esportiva, compra passa por TI e procuradoria | 15 | 13% |
| Diretor ou coordenador de esportes de cidade média (20 a 100 mil habitantes), verba anual de eventos entre R$ 80 mil e R$ 400 mil, equipe de 3 a 8 pessoas, precisa convencer o secretário e o setor de compras | 35 | 11% |
| Secretário de esportes de cidade pequena (até 20 mil habitantes), verba anual de eventos esportivos entre R$ 20 mil e R$ 80 mil, um ou dois funcionários, ele mesmo organiza o campeonato | 40 | 8% |
| Organizador terceirizado (liga, associação ou pessoa física) contratado pela prefeitura para tocar o campeonato, ganha por evento e paga as ferramentas do próprio bolso | 10 | 0% |

### By buying behaviour

| group | buyers | buy rate |
| --- | ---: | ---: |
| Entusiasta de tecnologia | 8 | 88% |
| Político de resultado | 15 | 7% |
| Planilha e WhatsApp | 28 | 4% |
| Cauteloso com compras | 12 | 0% |
| Cliente de fornecedor de gestão esportiva | 12 | 0% |
| Já usa app grátis | 18 | 0% |
| Fim de mandato | 7 | 0%  (thin) |

### By income

| group | buyers | buy rate |
| --- | ---: | ---: |
| $103,000 and up | 34 | 18% |
| $74,000 to $103,000 | 35 | 9% |
| under $74,000 | 31 | 0% |

### Why they pass

| reason | buyers | in their words |
| --- | ---: | --- |
| trust | 30 | "R$ 6 mil por ano não pesa na minha verba, mas eu não contrato nada de um fornecedor que eu nunca ouvi falar sem referência de outra prefeitura e sem saber o que acontece com o site e com os dados dos atletas se a empresa sumir no meio do campeonato. Já passei por isso e já levei bronca do controle interno por menos." (P001) · "Não levo pro secretário um contrato de 12 meses com fornecedor que nunca vi funcionando em cidade nenhuma, pra um campeonato que dura quatro meses. A planilha dá trabalho, mas o problema dela sou eu, e eu sei resolver; se o site cair no meio da rodada, o problema vira meu nome na secretaria." (P003) |
| habit | 29 | "A prefeitura já paga um sistema de gestão esportiva que cobre escolinhas, ginásio, corrida de rua, jogos escolares e o campeonato. Isso aqui resolve só o futsal, e para colocar um segundo fornecedor eu teria que passar por TI e procuradoria para justificar uma coisa que, no papel, já está contratada." (P002) · "A prefeitura já paga Placarsoft para gestão esportiva e o contrato está em vigor. Para trocar ou somar mais um fornecedor eu preciso levar justificativa ao secretário e ao setor de compras, e pelo que li aqui não consigo explicar o que o Citadino faz que o sistema atual não faz, só que é mais bonito no celular." (P005) |
| price | 18 | "R$ 6.000 por ano é entre 8% e 30% de toda a minha verba de eventos, que paga arbitragem, troféu e bola. O que eu faço hoje com Excel, WhatsApp e Canva dá trabalho, mas custa zero, e meu campeonato dura três ou quatro meses, não doze." (P010) · "Meu campeonato dura uns quatro meses e eu teria que pagar doze. Seis mil por ano é dinheiro que hoje eu uso em bola, arbitragem e premiação, e a tabela no Excel com o grupo dos treinadores já resolve, dá trabalho mas é meu trabalho." (P011) |
| timing | 12 | "Meu campeonato começa em duas semanas e eu já estou com ele montado no Copa Fácil de graça; não vou parar tudo para abrir processo de contratação, mandar pro jurídico, empenhar e ainda ensinar os treinadores a cadastrar documento pelo link agora. Site no ar em 5 dias úteis é promessa de vocês, mas o contrato dentro da prefeitura não sai em 5 dias." (P015) · "Meu campeonato começa em duas semanas e só pra passar contrato de 12 meses pelo secretário e pelo setor de compras já vai mais que isso; 5 dias úteis depois da assinatura não me salva. Este ano eu fecho na planilha e no Canva de novo e penso nisso pro próximo." (P031) |
| need | 2 | "Seis mil por ano não é o problema, minha verba aguenta. O problema é que isso resolve só o futsal, e eu toco futebol de campo, vôlei, corrida de rua, jogos escolares; já cotei sistema que cobre a secretaria inteira e não vou abrir mais um processo na TI e na procuradoria por um pedaço do que eu preciso." (P013) · "O que o prefeito vê é abertura, troféu e o card no Instagram da prefeitura, e isso aqui não fala nada de gerar card nem vídeo pra rede social. Site com súmula e classificação é coisa que só os times olham, e R$ 6 mil por ano pra trocar uma planilha que já funciona eu não levo pro secretário agora." (P075) |

### Why they buy

| reason | buyers | in their words |
| --- | ---: | --- |
| need | 9 | "R$ 6 mil por ano é troco perto da minha verba e cabe na dispensa sem dor de cabeça; o que me pega é a súmula ao vivo com classificação que não quebra por WO e o site com a cara da prefeitura, que é exatamente o que eu refaço no Excel e posto no Instagram hoje. Já cotei sistema antes e esse é mais barato do que o que me mostraram." (P012) · "Já refiz classificação na mão por causa de um WO que não entrou na conta, e R$ 6 mil por ano na minha verba é troco perto do que eu pago no sistema que já tenho e que não faz jogo ao vivo. Quero ser a primeira cidade da região com o campeonato no celular do torcedor, com notificação de gol, e isso o app grátis de tabela não entrega." (P014) |

### What would flip a no

- Duas ou três prefeituras de porte parecido usando há pelo menos uma temporada, que eu possa ligar, mais uma minuta de contrato com SLA, cláusula de propriedade e exportação dos dados e tratamento de LGPD que a minha procuradoria aprove.
- Se cobrisse todas as modalidades da secretaria (não só futsal) a ponto de substituir o fornecedor atual, com resposta pronta de LGPD e hospedagem dos dados para a TI, e um piloto de um campeonato sem me amarrar em 12 meses.
- Rodar um campeonato inteiro de teste sem contrato de 12 meses (ou contrato só pelo tempo do campeonato), com uma cidade vizinha de referência pra eu ligar e perguntar como foi, e a súmula podendo ser lançada depois do jogo a partir do papel, não obrigatoriamente ao vivo.
- Uma prefeitura vizinha já usando, com o contrato e o empenho dela pra eu copiar o modelo, e contrato amarrado à duração do campeonato em vez de 12 meses fechados.
- Rodar um campeonato inteiro da minha cidade como piloto, sem contrato de 12 meses, para eu mostrar ao secretário o site no ar com a cara da prefeitura e o torcedor recebendo notificação. Se o Instagram da secretaria parar de depender do meu card no Canva, aí eu tenho argumento para o compras.
- Cobrar por campeonato ou por temporada (uns R$ 2 mil pela edição inteira) ou me deixar rodar uma categoria de graça nesta edição para eu mostrar ao secretário a torcida usando.
- Contrato por temporada (três ou quatro meses) com cláusula escrita de que o site e os dados dos atletas são da prefeitura e eu consigo baixar tudo no fim.
- Ver o sistema rodando uma temporada inteira numa cidade do meu porte, com o secretário de lá me dizendo que o suporte continuou depois do campeonato e que os mesários conseguiram operar a súmula.
- Cláusula escrita de que os dados e o site são da prefeitura com exportação garantida no fim, mais o telefone de um secretário de outra cidade que use há mais de um ano e me diga que o suporte não sumiu.
- Cobrar por campeonato (algo em torno de R$ 1.500 a R$ 2.000 pela edição inteira) em vez de contrato anual, ou me deixar rodar esta edição de graça para eu mostrar ao prefeito funcionando antes de assinar.
- Contrato por campeonato, uns quatro ou cinco meses, com a súmula funcionando sem internet e sincronizando depois. Aí eu levo pro prefeito como o site da prefeitura e dá pra mostrar no relatório do ano.
- Cobrir as outras modalidades da secretaria (campo, vôlei, basquete, jogos escolares) e vir com termo de tratamento de dados pronto pra passar na TI e na procuradoria; aí eu levo pro prefeito como vitrine da secretaria.

Buyers say they would buy **1.0 times** in the first month on average.

100 buyers gave all four price answers. Run founder-pricing's van_westendorp.py on the answers folder.

### Leitura do moderador (contagem por palavra-chave, 91 que passaram)

O que viraria o "não", contando objeção + "would_change_my_mind" (um comprador pode citar mais de um):

| tema | compradores |
| --- | ---: |
| Contrato por temporada / sem fidelidade de 12 meses | 58 |
| Piloto ou teste grátis num campeonato ou categoria | 56 |
| Referência de outra prefeitura do mesmo porte, com contato | 44 |
| Dados da prefeitura, exportação no fim, LGPD | 16 |
| Súmula que funcione sem internet e sincronize depois | 12 |
| Card de resultado pronto para o Instagram | 5 |
| Cobrir outras modalidades além do futsal | 2 |

Observações:
- Preço sozinho barra só 18 de 91. Para cidade média e grande, os R$ 6.000/ano "cabem fácil"; o bloqueio é confiança e formato do contrato.
- Os 9 que compram têm o mesmo perfil: entusiasta de tecnologia (7 de 8 nesse comportamento compram) ou cidade com verba alta. Nenhum cliente de Placarsoft, nenhum usuário de app grátis, nenhum cauteloso e nenhum terceirizado comprou.
- Unidades de preço: a maioria respondeu em R$/mês, mas alguns responderam em R$/ano (P001, P027, P054, P055, P073, P079, P087, P091) e alguns por campeonato (P063, P066, P099). O /founder-pricing precisa normalizar antes de rodar o Van Westendorp.

## Pricing

Fontes: curva de preço em `founder/pricing-curve.md` e `founder/pricing-data/`, concorrentes em `founder/competitors.md`, margem em `founder/cfo.md`. Data: 2026-10-21.

### 1. O preço: uma tabela por porte de cidade

| Porte (população IBGE) | Temporada (1 campeonato, até 4 meses) | Ano esportivo (todos os campeonatos de futsal do ano) |
|---|---:|---:|
| Pequena, até 20 mil | **R$ 2.400** | R$ 6.000 |
| Média, 20 a 100 mil | **R$ 3.500** | R$ 8.400 |
| Grande, acima de 100 mil | **R$ 5.000** | R$ 12.000 |

Todos os valores estão bem abaixo do teto de dispensa de licitação de 2026 (R$ 65.492,11).

**Por que uma tabela e não um preço só.** Os 120 compradores simulados aceitam faixas muito diferentes conforme o porte. Respostas convertidas para valor por temporada:

| Porte | n | Faixa aceitável (PMC a PME) | Indiferença (IPP) | "Caro" mediano | "Caro demais" mediano |
|---|---:|---|---:|---:|---:|
| Pequena | 48 | R$ 425 a R$ 2.397 | R$ 1.174 | R$ 2.000 | R$ 3.200 |
| Média | 42 | R$ 641 a R$ 3.974 | R$ 1.504 | R$ 3.200 | R$ 6.000 |
| Grande | 18 | R$ 1.180 a R$ 10.008 | R$ 2.518 | R$ 6.000 | R$ 12.000 |
| Terceirizado | 12 | R$ 403 a R$ 2.002 | R$ 998 | R$ 1.600 | R$ 2.800 |
| Todos | 120 | R$ 596 a R$ 3.580 | R$ 1.279 | R$ 2.800 | R$ 4.800 |

Um preço único de R$ 2.000 ficava dentro da faixa de todos, mas deixava a margem em 11%. Um preço único de R$ 3.500 sairia da faixa das cidades pequenas.

**Onde cada preço cai:**
- **Pequena, R$ 2.400:** no limite de cima da faixa aceitável (PME R$ 2.397). É o preço mais arriscado da tabela, por isso é o primeiro a testar.
- **Média, R$ 3.500:** dentro da faixa, abaixo do "caro demais" mediano de R$ 6.000.
- **Grande, R$ 5.000:** dentro da faixa e acima do ponto em que o preço parece barato demais (R$ 1.180). Um comprador do re-teste avisou que o preço "é tão baixo perto do que já me cotaram que a procuradoria vai perguntar o que está faltando".

**Contra os concorrentes:**
- Apps self-service custam de R$ 20 a R$ 300 por mês, ou R$ 80 a R$ 1.200 em 4 meses. Não fazem implantação, não têm contrato com prefeitura, têm anúncio ou resultado atrasado. A tabela fica acima deles.
- A Placarsoft tem contratos públicos de R$ 4.800 a R$ 64.584 por ano, com mediana perto de R$ 18.000. O ano esportivo do Citadino, de R$ 6.000 a R$ 12.000, fica na parte de baixo dessa faixa.
- O contrato atual (R$ 500 por mês por 12 meses, ou R$ 6.000) já é exatamente o "Ano esportivo" de cidade pequena. Não muda nada para esse cliente.

**A margem (ferramenta do CFO, `founder/cfo.md`):**

| Preço por temporada | Contribuição por cidade-mês | Margem | Lucro ano 1 | Após R$ 3.300 iniciais | Volta do inicial |
|---|---:|---:|---:|---:|---:|
| R$ 2.000 (oferta anterior) | R$ 57,50 | 24% | R$ 4.596 | R$ 1.796 | mês 9 |
| R$ 2.400 (pequena) | R$ 151,50 | 35% | R$ 7.322 | R$ 4.522 | mês 7 |
| R$ 3.500 (média) | R$ 410 | 54% | R$ 14.818 | R$ 12.018 | mês 6 |
| R$ 5.000 (grande) | R$ 762,50 | 66% | R$ 25.040 | R$ 22.240 | mês 5 |
| **Média da tabela, R$ 3.460** (3 pequenas, 3 médias, 2 grandes) | **R$ 400,60** | **53%** | **R$ 14.545** | **R$ 11.745** | **mês 6** |
| Média da tabela com volume 20% menor | R$ 400,60 | — | R$ 12.222 | R$ 9.422 | — |

Cada linha supõe que todas as temporadas vendidas no ano sejam daquele preço. Os valores foram recalculados em 2026-10-21 sem contador e sem abertura de CNPJ, porque o faturamento vai pelo CNPJ da empresa onde o fundador trabalha (`founder/cfo.md`). `founder/numbers.json` usa a média da tabela.

### 2. A escada

- **Temporada:** um campeonato, até 4 meses, todas as categorias. Paga só nos meses de jogo, sem fidelidade. É a porta de entrada depois do piloto.
- **Ano esportivo:** todos os campeonatos de futsal da prefeitura no ano (municipal, veteranos, base, torneio de verão), com o histórico de atletas e times contínuo e o relatório anual para o prefeito. **Motivo para subir:** a partir de 2 campeonatos por ano, sai mais barato que temporadas avulsas (pequena: 2 × R$ 2.400 = R$ 4.800; 3 × R$ 2.400 = R$ 7.200, contra R$ 6.000 do ano). É também o degrau que constrói a defesa que o conselho pediu: o histórico local que fica caro abandonar.
- Não há terceiro degrau agora. Um pacote regional (consórcio de cidades vizinhas) faz sentido depois de 3 cidades próximas, não antes.

### 3. A oferta de abertura

**Preço de fundação:** as prefeituras que assinarem a primeira temporada ou o ano esportivo **até 31/03/2027** mantêm o mesmo preço na renovação de 2028, sem reajuste.

- Não é desconto e não ensina a esperar promoção. O preço é o da tabela, e o que se ganha é a garantia de não subir.
- Tem data real de fim.
- O número de cidades de fundação deve ser o limite de capacidade que você definir. O CFO estimou 6 cidades em campeonato ao mesmo tempo para uma pessoa só. Não anuncie um número que você não vá cumprir.
- O piloto grátis de uma categoria continua valendo e não conta como fundação.

### 4. O que testar com compradores reais

| Teste | Preço A | Preço B | Como |
|---|---:|---:|---|
| Cidade pequena | R$ 2.000 | R$ 2.400 | Alternar a proposta pela lista de cidades-alvo (ímpar A, par B). Medir quantas aceitam o piloto e quantos pilotos viram temporada paga. |
| Cidade média | R$ 3.000 | R$ 3.500 | O mesmo, nas cidades médias. |
| Cidade grande | R$ 5.000 | R$ 6.000 | O mesmo. Anotar se alguém acha barato demais. |

- Na conversa de fim de piloto, faça as quatro perguntas de preço ao secretário: a partir de quanto ficaria barato demais para confiar, quanto seria uma pechincha, quanto começaria a ficar caro e a partir de quanto não compraria. Grave as respostas num CSV com as colunas `too_cheap, cheap, expensive, too_expensive` e rode o `van_westendorp.py`. Respostas reais valem mais que as simuladas.
- Com poucas cidades por grupo, o teste não terá significância estatística. Ele serve para descobrir se o preço B gera recusas que o A não gera.

### 5. As três objeções de preço do painel, nas palavras dos compradores simulados

1. **Verba curta:** "R$ 6.000 por ano é entre 8% e 30% de toda a minha verba de eventos, que paga arbitragem, troféu e bola. O que eu faço hoje com Excel, WhatsApp e Canva dá trabalho, mas custa zero, e meu campeonato dura três ou quatro meses, não doze." (painel original, P010)
2. **App grátis:** "Eu já monto o campeonato no Copa Fácil de graça. Tem anúncio e às vezes atrasa, e já refiz classificação na mão por causa de WO, mas R$ 6 mil por ano sai da mesma verba que paga arbitragem, troféu e lanche, e isso eu não consigo justificar para o prefeito." (painel original, P053)
3. **Barato demais para cidade grande:** "E o preço é tão baixo perto do que já me cotaram que a procuradoria vai perguntar o que está faltando." (re-teste, P016)

A primeira e a segunda foram respondidas pelo formato por temporada; o re-teste derrubou a objeção dos 12 meses de 72% para 5%. A terceira é respondida pela tabela por porte. São falas simuladas, não depoimentos.

**Ressalva:** as faixas vêm de compradores simulados, com unidades padronizadas por mim (mensal × 4, anual × 4/12, por campeonato sem mudança; a lista de quem respondeu em cada unidade está em `founder/panel/results.md`). Servem para escolher o que testar, não provam nada.

## The offer

Construída com a lente Offers (`founder-board/lenses.md`), a partir das 91 recusas do painel (`founder/panel/results.md`), das reclamações dos concorrentes (`founder/competitors.md`) e das condições do conselho (`founder/board.md`).

**Aviso sobre custos:** `founder/numbers.json` ainda não existe (o `/founder-cfo` não rodou). Os custos abaixo são estimativas em horas do fundador e precisam ser confirmados pelo CFO antes de qualquer promessa sair do papel.

**Aviso sobre o que o produto faz hoje (conferido no código em 2026-10-21):**
- Existe: súmula com lances enquanto a partida está agendada ou ao vivo; classificação, artilharia, pendurados e suspensos automáticos; link da live do YouTube com vídeo automático de cada gol; upload de vídeo por lance; push; enquete; perfil de atleta; multi-tenant.
- Não existe: exportação de dados pela tela, modo offline da súmula, relatório de temporada, card para Instagram. Tudo que a oferta promete nessas áreas é **serviço manual do fundador**, não funcionalidade.

### 1. Lista de problemas (na voz do comprador)

Antes de comprar:
1. "R$ 6 mil por ano por um campeonato de 3 ou 4 meses? Vou pagar 8 meses de site parado." (objeção nº 1 do painel, 58 citações)
2. "Nunca vi isso funcionando em outra cidade." (44)
3. "É uma pessoa só. E se o cara sumir no meio do campeonato?"
4. "Preciso de três orçamentos e justificativa de preço para o setor de compras."
5. "A Placarsoft já atende. Por que um segundo sistema?"
6. "Tem app grátis que faz tabela."
7. "Quem fica com os documentos e comprovantes dos atletas, inclusive menores? A TI e a procuradoria vão perguntar de LGPD." (16)
8. "Meu campeonato começa em duas semanas, não dá tempo de contratar."
9. "Estou no último ano da gestão, não assino nada que passa da eleição."
10. "R$ 6 mil é 10% a 30% da minha verba de eventos."
11. "O prefeito quer foto, vídeo, abertura. Tabela no site só os times olham."

Durante:
12. "Meu mesário mal usa o celular."
13. "Se o sinal cair no ginásio, o jogo não aparece e a torcida reclama comigo." (12)
14. "Os treinadores não vão cadastrar atleta com documento pelo link."
15. "Se travar no sábado à noite, quem atende?" (reclamação nº 2 dos apps concorrentes: trava em dia de jogo)
16. "Resultado demora a aparecer." (reclamação nº 1 dos apps concorrentes)
17. "Implantar no meio do campeonato vai bagunçar o que já está montado."

Depois:
18. "No fim do contrato, perco o histórico."
19. "Não tenho como provar ao prefeito que valeu a pena."
20. "Já vi sistema da prefeitura ficar sem suporte depois de seis meses."

### 2. Soluções, pontuadas

Valor para o comprador e custo de entrega de 1 a 5. Custo é estimativa, a confirmar no `/founder-cfo`.

| # | Solução | Resolve | Valor | Custo | Fica? |
|---|---|---|---:|---:|---|
| A | **Contrato por temporada**: paga só os meses do campeonato, todas as categorias, sem fidelidade | 1, 9, 10 | 5 | 1 | Sim (núcleo) |
| B | **Piloto grátis** de uma categoria no campeonato atual, rodando ao lado do que já existe, sem contrato | 2, 5, 6, 8, 17 | 5 | 2 | Sim (bônus) |
| C | **Kit de contratação**: proposta, minuta de termo de referência e justificativa de preço com contratos públicos comparáveis do PNCP | 4 | 4 | 1 | Sim (bônus) |
| D | **Dados da prefeitura**: cláusula escrita, planilha completa no fim da temporada, exclusão se pedir, termo de LGPD para TI e procuradoria | 7, 18 | 4 | 1 | Sim (garantia) |
| E | **Gol com vídeo**: com a live do YouTube (um celular basta), cada gol vira clipe no feed do torcedor | 11 | 4 | 0 (já existe) | Sim (núcleo) |
| F | **Primeira rodada acompanhada**: treinamento de 1 hora por vídeo com o organizador, guia de uma página, fundador online na primeira rodada | 12, 14, 15 | 4 | 2 | Sim (bônus) |
| G | **Plano B do sinal**: lances podem ser lançados depois, do papel, enquanto a partida segue aberta; classificação recalcula sozinha | 13 | 3 | 0 (já existe) | Sim (no texto) |
| H | **Relatório de fim de temporada** para o prefeito: atletas, times, jogos, gols, inscritos nas notificações, votos na enquete | 19 | 4 | 1 | Sim (bônus) |
| I | **Rescisão sem multa** se o suporte não responder em dia de jogo | 3, 15, 20 | 4 | 1* | Sim (garantia) |
| J | Súmula offline de verdade | 13 | 4 | 4 | Não agora (backlog) |
| K | Card automático para Instagram | 11 | 3 | 3 | Não agora (5 citações) |
| L | Outras modalidades além do futsal | 5 | 3 | 5 | Não (2 citações, foge do foco) |
| M | Referência de outra prefeitura | 2 | 5 | 0 | **Ainda não existe.** Só vira oferta depois que o primeiro campeonato terminar e a prefeitura aceitar ser citada |

\* O custo real de I é o fundador estar disponível em dia de jogo. Com uma pessoa só, isso limita quantas cidades dá para atender ao mesmo tempo.

### 3. A pilha

**Nome:** Temporada Ao Vivo.

**Núcleo:** o campeonato da cidade ao vivo no celular de cada torcedor, com o gol em vídeo, a tabela certa sozinha e a cara da prefeitura. Cobrado só enquanto o campeonato roda (A + E + G).

**Bônus:**
1. **Piloto grátis** (B): uma categoria do campeonato atual, sem contrato, ao lado do sistema que já existe. Mata "nunca vi funcionar", "já tenho Placarsoft", "tem app grátis" e "começa em duas semanas".
2. **Kit de contratação** (C): mata "três orçamentos" e "justificativa de preço". Os contratos do PNCP (R$ 4.800 a R$ 64.584 por ano) servem de referência de preço. Não é assessoria jurídica; o setor de compras decide.
3. **Primeira rodada acompanhada** (F): mata "meu mesário não usa celular" e "quem atende no sábado".
4. **Relatório para o prefeito** (H): mata "não tenho como provar que valeu".

**Garantia:**
- **Dados da prefeitura** (D): no fim da temporada, planilha com tudo; se pedir, apagamos. Termo de LGPD pronto para a procuradoria.
- **Site no ar ou não paga**: se o site não estiver no ar com a identidade e as categorias configuradas em até 5 dias úteis após a assinatura, a prefeitura não paga a temporada. Só cobre o que o fundador controla; o cadastro pelos treinadores não entra.
- **Rescisão sem multa** (I) se o suporte não responder em até 2 horas em dia de jogo.

Custo da garantia "no ar ou não paga" em caso de acionamento: perde uma temporada de receita. A taxa de acionamento deve ser baixa, porque a implantação depende só do fundador e o multi-tenant já existe. O CFO precisa confirmar.

**Urgência e escassez (só o que é verdade):**
- O suporte é feito pelo próprio desenvolvedor. Por isso há poucos pilotos ao mesmo tempo. **O fundador precisa decidir o número** antes de usar isso em venda.
- Urgência natural: o piloto só funciona se começar antes da próxima rodada do campeonato.

**Preço final:** definido no `/founder-pricing` como tabela por porte de cidade (R$ 2.400, R$ 3.500 ou R$ 5.000 por temporada; ano esportivo de R$ 6.000 a R$ 12.000). Ver `founder/pricing.md`. O re-teste abaixo usou o preço provisório:

**Preço usado no re-teste:**
- **Temporada:** R$ 2.000 por campeonato de até 4 meses, todas as categorias. É o valor que os próprios compradores sugeriram (R$ 1.500 a R$ 2.000).
- **Ano inteiro:** R$ 6.000, para quem roda vários campeonatos de futsal no ano. É o mesmo valor do contrato já assinado.

Ponto para o CFO: se a maioria escolher a temporada, a receita por cidade cai de R$ 6.000 para cerca de R$ 2.000 por campeonato. O ganho precisa vir de mais cidades.

### 4. Equação de valor

| Elemento | Antes | Depois | O que mudou |
|---|---:|---:|---|
| Resultado sonhado | 6 | 8 | Gol em vídeo no celular do torcedor (E) e relatório para o prefeito (H). Agora entrega visibilidade, não só tabela |
| Probabilidade percebida | 3 | 6 | Piloto grátis (B), garantia de no ar (D) e rodada acompanhada (F). Sobe pouco porque ainda não há referência de outra cidade (M) |
| Tempo até o resultado | 5 | 7 | Piloto começa no campeonato atual, sem esperar contrato |
| Esforço e sacrifício | 3 | 7 | Sem fidelidade (A), kit de contratação (C), rodada acompanhada (F) e dados garantidos (D) |

O limite que sobra é a probabilidade percebida. Só a referência real do primeiro campeonato vai levá-la acima de 6.

### 5. Re-teste

Pitch novo em `founder/pitch.md`; o anterior está em `founder/pitch-v1.md`. Painel rápido de 20 compradores com a mesma semente (242407) em `founder/panel-v2/`. Resultado na seção abaixo.

#### Resultado

| | Painel original (pitch v1) | Re-teste (pitch v2) |
|---|---:|---:|
| Compradores | 100 | 20 |
| Compram | 9 (9%) | 7 (35%) |
| Esperado com as taxas do v1 para o mesmo perfil dos 20 | | 2,2 |

O perfil dos 20 é diferente do dos 100, então a comparação justa é contra o esperado: **7 compras contra 2,2 esperadas, cerca de 3 vezes mais.**

Por comportamento (re-teste, compras/total, contra a taxa do v1):

| Comportamento | v2 | v1 |
|---|---:|---:|
| Político de resultado | 3/3 | 7% |
| Entusiasta de tecnologia | 2/2 | 88% |
| Fim de mandato | 1/1 | 0% |
| Planilha e WhatsApp | 1/6 | 4% |
| Já usa app grátis | 0/4 | 0% |
| Cliente de fornecedor | 0/2 | 0% |
| Cauteloso com compras | 0/2 | 0% |

Quem não comprou continua sendo quem usa app grátis, quem já tem fornecedor, os cautelosos e os terceirizados. Mas **todos os 20 citaram o piloto, e quase todos os que passaram disseram que fariam o piloto grátis.**

Objeções, % dos compradores que citam (por palavra-chave):

| Objeção | v1 | v2 |
|---|---:|---:|
| Contrato de 12 meses, fidelidade, site parado | 72% | 5% |
| Uma pessoa só no suporte, "e se ele sumir" | 23% | **95%** |
| Referência de outra prefeitura | 35% | 45% |
| Sinal no ginásio | 17% | 10% |
| LGPD | 13% | 5% |
| Três orçamentos | 14% | 15% |

Motivos de recusa: no v1, trust 30, habit 29, price 18, timing 12. No v2, trust 7, habit 4, price 2, **timing 0**.

#### Leitura

1. **O formato por temporada matou a objeção nº 1.** "12 meses para um campeonato de 4" caiu de 72% para 5%, e "timing" (fim de mandato, campeonato em duas semanas) sumiu.
2. **O piloto é o que vende, mas "compra" agora quer dizer "piloto e depois paga".** Quase todos os 7 compram condicionados ao piloto rodar bem. A conversão real a medir é piloto para temporada paga.
3. **A frase "o suporte é feito pelo próprio desenvolvedor" virou a nova objeção dominante (95%).** É honesta e precisa continuar, mas sozinha ela grita "risco". A oferta precisa de uma resposta concreta: quem substitui você se você ficar doente no sábado da final. Opções: um segundo técnico de plantão contratado por jogo, código e acesso depositados com a prefeitura, ou página pública de status. Isso é a próxima melhoria da oferta.
4. **A referência continua sendo o limite** (45%). Vários pediram para ligar para "a prefeitura que já contratou". Isso só existe depois do primeiro campeonato e com autorização dela.
5. **Dois avisos novos que o painel levantou:**
   - Cidade grande (P016): R$ 2.000 é tão abaixo do que já cotaram que a procuradoria pode desconfiar. Sinal para o `/founder-pricing` ter um preço diferente por porte.
   - Ano eleitoral (P018): site com a identidade da prefeitura e notificações em período eleitoral pode esbarrar nas regras de publicidade institucional. Não é parecer jurídico; vale perguntar a um advogado antes de 2028.

As respostas de preço do re-teste vieram por temporada, com pechincha em torno de R$ 1.000 e "caro mas compra" entre R$ 4.000 e R$ 5.000 para cidades pequenas e médias. Ficam em `founder/panel-v2/answers/` para o `/founder-pricing`.

Ressalva de sempre: compradores simulados tendem a concordar. Os 35% são teto, e uma amostra de 20 é pequena. O teste real é quantos pilotos viram temporada paga.

## The numbers

**Leitura da saída da ferramenta no fim deste arquivo:** "$" significa R$ e "a day" significa **por mês**. A unidade é um mês de campeonato em uma cidade nova. O contrato atual entra como custo fixo negativo. Todas as estimativas estão em `founder/cfo-sources.md`.

### Atualização após o /founder-pricing (2026-10-21)
O preço adotado está em `founder/pricing.md`. É uma tabela por porte de cidade: R$ 2.400, R$ 3.500 ou R$ 5.000 por temporada. O modelo usa o preço médio dessa tabela para 3 cidades pequenas, 3 médias e 2 grandes: R$ 865 por mês, ou cerca de R$ 3.460 por temporada. A saída da ferramenta no fim deste arquivo já está nesse preço.

| | Antes (R$ 2.000 por temporada) | Agora (tabela por porte) |
|---|---:|---:|
| Contribuição por cidade-mês | R$ 57,50 | R$ 401 |
| Margem com 4 cidades ao mesmo tempo | 11% | 53% |
| Lucro operacional no ano 1 | R$ 1.596 | R$ 14.545 |
| Depois do investimento inicial (R$ 3.300 antes; R$ 2.800 agora) | −R$ 1.704 | R$ 11.745 |
| Volta do dinheiro inicial | não volta | mês 6 |
| Com volume 20% menor, depois do inicial | −R$ 2.038 | R$ 9.422 |
| Caixa necessário | R$ 3.318 | R$ 2.800 |

**Atualização de 2026-10-21: faturamento pelo CNPJ da empresa onde o fundador trabalha.** É uma ME com permissão para venda de software, então saíram do modelo o contador (R$ 259 por mês), a abertura de CNPJ (R$ 500) e o certificado digital (R$ 220), supondo que a empresa já tenha um. Fica a dúvida da alíquota: no Simples, ela depende do faturamento dos últimos 12 meses **da empresa inteira**, não só do Citadino. O modelo usa 6%. Com 10%, o ano 1 fica em R$ 13.542; com 13,5%, em R$ 12.664. Um plantão de segundo dev nos fins de semana de jogo (R$ 400 por mês, fora da base) baixaria o ano 1 para R$ 9.745, ou R$ 6.945 depois do inicial, com volta no mês 7. Ver `founder/ops.md`.

As horas de suporte continuam sendo a linha a observar, mas agora há folga. A análise abaixo, feita a R$ 2.000, foi mantida para mostrar de onde veio a decisão.

### Análise original a R$ 2.000 por temporada

#### A margem
- **A R$ 2.000 por temporada, cada mês de campeonato deixava R$ 57,50** depois de pagar suas horas a R$ 50, o imposto e o rateio dos pilotos. A margem era de **11%** com 4 cidades ao mesmo tempo.
- **Ano 1: lucro operacional de R$ 1.596.** Depois dos R$ 3.300 iniciais, o ano fechava em **−R$ 1.704** e o dinheiro inicial não voltava.
- Na prática, a R$ 2.000 o negócio **pagava sua hora e quase mais nada.** Sem valorizar suas horas, você levaria cerca de R$ 14.900 no ano 1 por umas 266 horas de trabalho, cerca de R$ 56 por hora.
- O contrato atual (R$ 4.290 por ano líquido) praticamente paga sozinho os custos fixos de R$ 363,50 por mês, com Vercel Pro, contador e domínio.

#### A linha a observar: horas de suporte por mês
O modelo supõe 4 horas por mês por cidade em dia de jogo. A R$ 2.000 por temporada:

| Suporte por cidade-mês | Contribuição | Lucro ano 1 |
|---|---:|---:|
| 4 h (base) | R$ 57,50 | R$ 1.596 |
| 8 h | −R$ 142,50 | −R$ 4.204 |

Meça as horas reais no campeonato atual antes de vender a segunda temporada. A conversão dos pilotos pesa quase o mesmo. Se só 1 em 3 pilotos virasse temporada paga, a contribuição cairia para −R$ 17,50 e o ano 1 fecharia em −R$ 580.

#### Caixa
**R$ 3.318** antes de se pagar: os R$ 3.300 iniciais (advogado, CNPJ, kit, visitas) mais o mês 1. Vercel Pro e contador são cobertos pelo contrato atual.

#### Três formas de melhorar a margem (cada uma rodada na ferramenta)

| Mudança | Contribuição | Lucro ano 1 | Após inicial | Volta do inicial |
|---|---:|---:|---:|---:|
| Base: R$ 2.000 por temporada | R$ 57,50 | R$ 1.596 | −R$ 1.704 | não volta |
| 1. Preço de R$ 3.000 por temporada | R$ 292 | R$ 8.410 | R$ 5.110 | mês 8 |
| 1b. R$ 3.000 com volume 20% menor | R$ 292 | R$ 6.714 | R$ 3.414 | mês 9 |
| 2. Exportação e relatório automáticos (11 h para 4 h por temporada) | R$ 145 | R$ 4.133 | R$ 833 | — |
| 3. Preço de R$ 2.500 por temporada | R$ 175 | R$ 5.003 | R$ 1.703 | mês 10 |

O preço era a alavanca maior, e foi a que o `/founder-pricing` usou. Automatizar a exportação e o relatório é a segunda alavanca e se soma ao preço.

### Duas coisas para resolver antes de cobrar a próxima cidade
1. **A Vercel Hobby não permite uso comercial.** Com um contrato pago, o projeto já deveria estar no Vercel Pro, a US$ 20 por mês, e o modelo inclui esse custo.
2. ~~O MEI provavelmente não cobre software.~~ **Resolvido:** o faturamento vai pelo CNPJ de uma ME com permissão para venda de software (ver a atualização no topo).

### Condições de dinheiro do conselho (`founder/board.md`)
- [x] O contrato atual é pago: R$ 500 por mês.
- [x] O custo por tenant está calculado. O marginal é quase zero na infraestrutura; o custo real são suas horas (11 h por temporada mais 4 h por mês de suporte).
- [x] O preço está acima da faixa commodity. A tabela por porte, de R$ 2.400 a R$ 5.000 por temporada, fica acima dos apps self-service e abaixo do menor contrato público da Placarsoft. A margem passa de 11% para 46%.
- [ ] O custo para conquistar uma prefeitura ainda não foi medido. O modelo supõe R$ 800 de visitas e um piloto não convertido por venda.

Isto não é aconselhamento financeiro, tributário ou jurídico. Confirme com quem cuida da contabilidade da empresa a alíquota real e a situação do contrato atual antes de qualquer cobrança nova.

---

## Unit economics: Citadino - Temporada Ao Vivo

Every number below comes from the input file. Nothing is looked up or guessed.

### One cidade-mês de campeonato novo (preço médio da tabela por porte: R$ 3.460 por temporada de 4 meses)

| line | per cidade-mês de campeonato novo (preço médio da tabela por porte: R$ 3.460 por temporada de 4 meses) |
| --- | ---: |
| Price | $865.00 |
| Suporte em dia de jogo: 4 h/mês x R$ 50 (estimativa) | -$200.00 |
| Implantação, treinamento, 1ª rodada, relatório e exportação: 11 h x R$ 50 por temporada, rateado em 4 meses (estimativa) | -$137.50 |
| Piloto grátis que não converte: 1 a cada temporada vendida, 6 h x R$ 50, rateado em 4 meses (estimativa) | -$75.00 |
| Imposto sobre a nota, Simples Nacional da ME da empresa ~6% (estimativa: a alíquota real depende do faturamento de 12 meses da empresa) | -$51.90 |
| **Contribution** (what each cidade-mês de campeonato novo (preço médio da tabela por porte: R$ 3.460 por temporada de 4 meses) leaves to pay the fixed costs) | **$400.60** (46%) |

### The margin that matters

Fixed costs: -$244 a month (Vercel Pro, US$ 20 x R$ 5,50 (obrigatório para uso comercial) $110, Turso, plano gratuito atual $0, Domínio, ~R$ 40/ano $4, Contrato atual (R$ 6.000/ano) menos imposto e horas: 6.000 - 360 - 1.350 = 4.290/ano (estimativa), entra como custo negativo -$358).

- **Break-even: 0 cidade-mês de campeonato novo (preço médio da tabela por porte: R$ 3.460 por temporada de 4 meses)s a day.** Below that you lose money every month.
- **Profit margin at your plan** (4 a day): **53%** of every sale, after every cost.
- Capacity: 6 a day.

### Year 1, month by month

| month | cidade-mês de campeonato novo (preço médio da tabela por porte: R$ 3.460 por temporada de 4 meses)s a day | revenue | profit | cumulative (after $2,800 startup) |
| ---: | ---: | ---: | ---: | ---: |
| 1 | 0 | $0 | $244 | -$2,556 |
| 2 | 0 | $0 | $244 | -$2,312 |
| 3 | 0 | $0 | $244 | -$2,068 |
| 4 | 1 | $865 | $645 | -$1,423 |
| 5 | 2 | $1,730 | $1,045 | -$378 |
| 6 | 3 | $2,595 | $1,446 | $1,068 |
| 7 | 4 | $3,460 | $1,846 | $2,914 |
| 8 | 4 | $3,460 | $1,846 | $4,760 |
| 9 | 4 | $3,460 | $1,846 | $6,607 |
| 10 | 4 | $3,460 | $1,846 | $8,453 |
| 11 | 4 | $3,460 | $1,846 | $10,300 |
| 12 | 3 | $2,595 | $1,446 | $11,745 |

- **Year 1 operating profit: $14,545** on $25,085 of revenue.
- After the $2,800 startup spend: $11,745.
- Startup money earned back: month 6.
- Cash you need before it pays for itself: **$2,800**.

### What if

| scenario | margin at plan | break-even a day | year 1 profit |
| --- | ---: | ---: | ---: |
| Base plan | 53% | 0 | $14,545 |
| Price -10% | 48% | 0 | $12,037 |
| Volume -20% | 55% | 0 | $12,222 |
| Unit costs +15% | 45% | 0 | $12,525 |

No red flags in these numbers. They are only as good as the inputs: check every cost against a real quote.

## Marketing

Base: `founder/panel/results.md` (100 compradores), `founder/panel-v2/` (re-teste com a oferta nova, 20), `founder/competitors.md`, `founder/offer.md`, `founder/pricing.md`, `founder/cfo.md`. Data: 2026-10-21.

O comprador é uma secretaria de esportes, não o torcedor. Por isso este plano não tem anúncio pago em rede social. A venda é direta, cidade por cidade, e o canal mais forte é o campeonato que já está rodando.

### 1. Quem ouve primeiro

Do painel, quem compra:

| Sinal | Evidência |
|---|---|
| **Político de resultado** compra com a oferta nova | 3 de 3 no re-teste (era 7% no painel original) |
| **Entusiasta de tecnologia** compra com qualquer oferta | 7 de 8 no original, 2 de 2 no re-teste |
| **Cidade média e grande** compram mais que a pequena | 11% e 13% contra 8% no original |
| O que eles citam ao comprar (re-teste, 7 compradores) | gol em vídeo 5, prefeito 5, cabe na dispensa 7 |

Quem não compra, em nenhum dos dois painéis: quem usa app grátis, quem já é cliente da Placarsoft ou similar, o comprador cauteloso e o organizador terceirizado. Esses não são o público dos primeiros 30 dias.

**Público dos primeiros 30 dias:** secretários e diretores de esporte de **cidades médias e grandes da região do primeiro cliente**, com perfil de quem quer mostrar resultado ao prefeito e gosta de novidade.

### 2. Posicionamento

**A (recomendada):**
> Para secretarias de esporte que querem mostrar o campeonato da cidade e hoje fazem tabela no Excel e card no Canva, o Citadino é a plataforma do campeonato municipal que põe o jogo ao vivo e o gol em vídeo no celular de cada torcedor, com a cara da prefeitura e cobrada só pela temporada. Os sistemas de gestão esportiva fazem a tabela; o app grátis põe anúncio e atrasa o resultado.

Por que esta: no re-teste, os 7 compradores citaram a dispensa, 5 citaram o gol em vídeo e 5 citaram o prefeito. É também a lacuna do mapa de concorrentes: ninguém que vende para prefeitura entrega o jogo ao vivo no celular, e ninguém que entrega ao vivo vende para prefeitura.

**B (economia de trabalho):**
> Para o secretário que perde a semana refazendo a classificação por causa de um WO e respondendo treinador no WhatsApp, o Citadino é o campeonato que se atualiza sozinho: súmula no celular, tabela, artilharia e suspensos sem planilha.

Evidência: 5 dos 9 compradores do painel original citaram WO ou tabela. É a dor certa, mas compete com o grátis, que também faz tabela.

**C (risco zero):**
> Para a prefeitura que não quer ser cobaia, o Citadino roda grátis numa categoria do seu campeonato antes de você assinar qualquer coisa.

Evidência: todos os 20 do re-teste citaram o piloto. É a melhor **chamada para ação**, não o posicionamento. Use C como fechamento de toda mensagem que comece com A.

### 3. Canais

| Canal | Por que serve para este comprador | Custo | Como saber se funcionou | Começar? |
|---|---|---|---|---|
| **O campeonato atual como vitrine** | Secretários vizinhos, treinadores e atletas veem o site ao vivo. É a única prova real. Precisa da autorização do cliente para ser citado | R$ 0 + suas horas | Métricas da temporada (abaixo) e quem pergunta "que sistema é esse?" | **Sim** |
| **Contato direto: WhatsApp, telefone e visita** | É assim que se vende para prefeitura. Os contratos públicos da Placarsoft mostram venda direta e dispensa | ~R$ 800 de deslocamento (já no inicial do CFO) | Conversas por semana, pilotos marcados | **Sim** |
| **Lista de vencimentos no PNCP** | Os contratos de gestão esportiva são públicos e têm data de fim. Quem vence nos próximos meses está comparando. Ver `founder/competitors.md` | R$ 0 + 2 h | Quantas cidades da lista aceitam conversar | **Sim**, como fonte da lista |
| Associações de municípios e fóruns de gestores de esporte | Um evento reúne dezenas de secretários de uma vez | Inscrição e viagem, a cotar | Contatos por evento | Depois: entra quando houver referência pública |
| Instagram do Citadino | O secretário não compra por post, mas confere antes da reunião | R$ 0 | Visitas ao perfil vindas das conversas | Mínimo: perfil com vídeos reais, sem impulsionar |

**O que não fazer agora:**
- **Anúncio pago em Meta ou Google.** O comprador é um cargo raro e não pesquisa "sistema de campeonato" no Google. Seria pagar para falar com torcedor.
- **Disputar cliente de app grátis ou da Placarsoft.** Foi 0% nos dois painéis. Entram depois, quando houver referência ou contrato vencendo.
- **Vender para organizador terceirizado.** Ele paga do bolso e não quer pagar (0%). Quando ele aparecer, a conversa é com a secretaria que o contrata.

### 4. Antes de começar: prova e permissão

Nada disso é anúncio, mas sem isso o plano não anda.
- **Autorização por escrito do primeiro cliente** para citar o nome da cidade, mostrar o site e dar o contato do secretário. Sem isso, não há referência e não se usa o nome dele em lugar nenhum.
- **Direito de imagem dos atletas**, muitos deles menores. Vídeo de gol e foto de atleta só entram em material de venda com autorização prevista no regulamento ou no termo de inscrição. Na dúvida, mostre a tela sem rosto. Não é parecer jurídico.
- **Medir a temporada.** Hoje o projeto não tem analytics. Ative o Vercel Web Analytics junto com a migração para o Vercel Pro. Os números que valem como prova:
  - % de partidas com súmula lançada ao vivo
  - Visitantes únicos por rodada
  - Inscritos nas notificações push (o banco já registra)
  - Votos na enquete
  - Gols com vídeo
- **Vercel Pro antes de vender**, porque o Hobby não permite uso comercial (`founder/cfo.md`).
- **Kit de contratação pronto:** proposta, minuta de termo de referência e justificativa de preço com os contratos do PNCP.

### 5. Calendário de 30 dias

**Lançamento = segunda-feira, 16/11/2026.** É a data em que a oferta passa a ser apresentada a outras cidades. Escolhi essa data porque, até lá, o campeonato atual terá algumas rodadas com números reais. Se a primeira rodada for depois de 01/11, empurre o calendário inteiro pela mesma diferença.

Ritmo realista para uma pessoa: 5 contatos novos por dia útil na semana de lançamento, 3 nas seguintes. Os sábados são de jogo e de suporte ao cliente atual.

| Data | Canal | O que sai ou o que fazer | Mensagem |
|---|---|---|---|
| seg 02/11 | Interno | Migrar para Vercel Pro e ativar o Web Analytics | — |
| ter 03/11 | Cliente atual | Pedir por escrito a autorização para citar a cidade e passar o contato | "Posso mostrar o campeonato de vocês para outras secretarias?" |
| qua 04/11 | Interno | Montar lista de 30 cidades: vizinhas do cliente, médias e grandes, e contratos de gestão esportiva no PNCP com fim até 06/2027 | — |
| qui 05/11 | Interno | Achar no site de cada prefeitura o nome e o contato do secretário ou diretor de esporte | — |
| sex 06/11 | Interno | Escrever a página "para prefeituras" no site do Citadino: posicionamento A, tabela de preços, piloto | Hook 1 como título |
| sáb 07/11 | Campeonato | Acompanhar a rodada, anotar horas de suporte e problemas | — |
| seg 09/11 | Interno | Fechar o kit de contratação e o termo de LGPD (com advogado) | — |
| ter 10/11 | Interno | Gravar um vídeo de 60 s da tela do site no celular, com um gol em vídeo e uma notificação chegando, com autorização | Hook 2 |
| qua 11/11 | Interno | Uma página com números reais das primeiras rodadas | Hook 6 |
| qui 12/11 | Instagram Citadino | Perfil no ar com o vídeo, sem impulsionar | Hook 2 |
| sex 13/11 | Interno | Ensaiar a ligação de 2 minutos | Posicionamento A + fechamento C |
| sáb 14/11 | Campeonato | Rodada: medir de novo | — |
| **seg 16/11** | WhatsApp + telefone | **Lançamento.** 5 primeiros contatos (lista, prioridade: médias e grandes vizinhas) | Hook 1 + vídeo |
| ter 17/11 | WhatsApp + telefone | +5 contatos; responder quem respondeu | Hook 3 |
| qua 18/11 | WhatsApp + telefone | +5 contatos | Hook 4 |
| qui 19/11 | Visita | 1 ou 2 visitas presenciais a quem respondeu | Mostrar o site ao vivo no celular |
| sex 20/11 | WhatsApp + telefone | +5 contatos; follow-up de segunda | Hook 5 |
| sáb 21/11 | Campeonato | Convidar 1 ou 2 secretários vizinhos para ver uma rodada no ginásio ou no celular | Hook 7 |
| seg 23/11 | WhatsApp + telefone | +3 contatos; segundo follow-up de quem não respondeu | Hook 8 |
| ter 24/11 | Piloto | Marcar o primeiro piloto (uma categoria, ao lado do que eles usam) | Fechamento C |
| qua 25/11 | WhatsApp + telefone | +3 contatos | Hook 9 |
| qui 26/11 | Instagram Citadino | Números da rodada (com autorização) | "Nesta rodada: X gols com vídeo, Y torcedores com notificação" |
| sex 27/11 | WhatsApp + telefone | +3 contatos; enviar o kit a quem pediu proposta | Hook 4 |
| sáb 28/11 | Campeonato | Rodada | — |
| seg 30/11 | Revisão | Ver os três números da semana (seção 7) | — |
| ter 01/12 | WhatsApp + telefone | +3 contatos; avisar a todos da data da oferta de fundação | Hook 10 |
| qua 02/12 | Revisão | Fechar o mês: o que mudar no texto, na lista ou no preço | — |

**Cuidado com dezembro:** muitas prefeituras fecham o ano e não empenham despesa nova. A conversa de dezembro serve para entrar no planejamento dos campeonatos de 2027, que costumam começar no primeiro semestre. A oferta de fundação vale até **31/03/2027**, então dá tempo.

**Quando não houver nada novo para dizer:**
- Os bastidores da súmula: como um WO entra na classificação sozinho, sem planilha
- O placar da rodada do campeonato atual, com autorização
- Uma dúvida de secretário respondida, como "e se cair o sinal no ginásio?"
- Como o kit de contratação monta a justificativa de preço

### 6. Dez hooks

Cada um responde a uma objeção ou usa um motivo de compra do painel. São textos para você usar. Não são falas de clientes.

| # | Formato | Hook | Responde a |
|---|---|---|---|
| 1 | Título da página e abertura no WhatsApp | "O campeonato da sua cidade ao vivo no celular de cada torcedor. Com o gol em vídeo." | motivo de compra: visibilidade (5 de 7 no re-teste) |
| 2 | Primeiros 3 s do vídeo | "Gol aos 12 do segundo tempo. A notificação chega antes de a torcida sentar." | motivo de compra: gol em vídeo |
| 3 | Mensagem de WhatsApp | "Você paga só os meses do campeonato. Acabou a temporada, acabou a cobrança." | objeção nº 1: 12 meses para um campeonato de 4 |
| 4 | Assunto de e-mail ou PDF do kit | "Cabe na dispensa: proposta, termo de referência e justificativa de preço já prontos." | três orçamentos, setor de compras |
| 5 | Mensagem de WhatsApp | "Teste grátis numa categoria do campeonato que já está rolando, sem contrato." | "nunca vi funcionar", timing |
| 6 | Página de números | "[Cidade]: X rodadas, Y gols com vídeo, Z torcedores com notificação." Só com números reais e autorização | referência de outra prefeitura (44 citações) |
| 7 | Convite | "Vem ver uma rodada no sábado. Você acompanha do seu celular." | "nunca vi funcionar" |
| 8 | Resposta pronta | "Caiu o sinal no ginásio? Anota no papel e lança depois. A tabela recalcula sozinha." | sinal no ginásio (12 citações) |
| 9 | Resposta pronta | "Os dados são da prefeitura. No fim, você recebe tudo em planilha, e o termo de LGPD vai pronto para a procuradoria." | LGPD, dados de menores |
| 10 | Último follow-up | "Quem assinar até 31/03/2027 mantém o preço na renovação de 2028." | prazo real da oferta de fundação |

**A objeção que falta responder** é a mais citada no re-teste: "é uma pessoa só no suporte" (95%). Antes do lançamento, defina sua resposta concreta: quem cobre você no sábado, onde ficam o código e os acessos, e qual o prazo de resposta. Um hook só deve existir para ela quando a resposta existir de verdade.

### 7. Orçamento e números

**Orçamento dos 30 dias: cerca de R$ 1.000.**

| Item | Valor | Observação |
|---|---:|---|
| Deslocamento para visitas e rodadas | R$ 800 | já está no inicial do CFO |
| Impressão do resumo de uma página e do kit | R$ 100 | estimativa |
| Vercel Pro (1 mês) | R$ 110 | já está nos fixos do CFO |
| Anúncio pago | R$ 0 | ver "o que não fazer" |
| Advogado para o termo de LGPD | R$ 1.500 | já está no inicial do CFO; precisa estar pronto antes de 16/11 |

**O máximo que dá para pagar para ganhar uma cidade:**
- A contribuição por cidade-mês, na média da tabela, é R$ 401 (`founder/cfo.md`).
- Cada temporada tem 4 meses: 4 × R$ 401 = **R$ 1.604 por temporada vendida**.
- O painel indica 1 compra por comprador no primeiro mês, então o cálculo conta só a primeira temporada, sem renovação.
- O custo do piloto que não converte já está descontado dessa contribuição.
- **Teto:** R$ 1.604 por cidade. **Alvo:** até um terço disso, cerca de **R$ 530 por cidade**, em deslocamento, impressão e eventos. Na cidade pequena (R$ 2.400 por temporada, contribuição de R$ 152 por mês), o teto cai para R$ 608. Por isso o primeiro público é a cidade média e a grande.

**Três números para olhar toda segunda-feira:**

| Número | Meta | Sinal para mudar alguma coisa |
|---|---|---|
| Conversas com secretário (respondeu e falou) | 8 por semana | menos de 4 por duas semanas: mudar a lista ou o hook de abertura |
| Pilotos começados | 1 por semana a partir da 2ª semana | zero em 3 semanas: o problema é a oferta ou o público, não o volume |
| Piloto que vira temporada paga | 50% (premissa do CFO) | menos de 33%: o CFO mostra prejuízo nesse nível. Rever suporte, preço ou critério de piloto |

E um número da vitrine: % de partidas do campeonato atual com súmula lançada ao vivo. Se ficar abaixo de 80%, a prova mais forte do plano enfraquece e o hook 6 não pode ser usado.

### Regras deste plano
- Nenhuma frase do painel simulado entra em material de venda como fala de cliente.
- Nenhum número, nome de cidade ou vídeo do cliente atual sem autorização por escrito.
- Nada de seguidores comprados, depoimentos inventados ou "como visto em".
- Promessas só do que o produto e você entregam hoje (`founder/offer.md`, seção "o que o produto faz hoje").

Próximo: `/founder-brand`, depois `/founder-launch`.

## Brand

Base: posicionamento A de `founder/marketing.md`, motivos de compra do re-teste (`founder/panel-v2/`), concorrentes em `founder/competitors.md`. Data: 2026-10-21.

### 0. A arquitetura: duas marcas, papéis diferentes

- **No site de cada campeonato, quem aparece é a prefeitura.** O sistema já guarda a cor primária, a cor secundária e o escudo de cada cliente (`corPrimaria` e `corSecundaria` no modelo `Tenant`). É isso que a oferta chama de "a cara da prefeitura".
- **A marca Citadino aparece para quem compra:** a secretaria, na proposta, no kit de contratação, na página "para prefeituras" e num rodapé discreto, "feito com Citadino", no site de cada campeonato.
- **As cores atuais do código (laranja, verde-menta e azul-marinho) vieram da identidade da Prefeitura de Cidreira** (README) e hoje são o padrão de todo novo cliente. A marca Citadino não deve usar essas cores, porque elas são de um cliente.

### 1. O nome

#### Dez candidatos

| # | Nome | Estilo | O que diz | Em voz alta | Em placa e ícone | Risco |
|---|---|---|---|---|---|---|
| 1 | **Citadino** (atual) | descritivo | o campeonato da cidade | fácil, três sílabas | bom na placa; no ícone precisa de símbolo | "Citadino" é o nome genérico do campeonato municipal em várias cidades do RS. É fraco como marca e pode ser recusado pelo INPI como descritivo na classe 41 |
| 2 | Quadra Viva | evocativo | jogo ao vivo, quadra | claro | bom | descreve só futsal e vôlei; fecha a porta para o futebol de campo |
| 3 | Arquibancada | evocativo | a torcida, o público | longo, cinco sílabas | longo no ícone | palavra comum, marca fraca |
| 4 | Rodada | descritivo | a rodada do campeonato | curto | ótimo | genérico demais para registrar |
| 5 | Placar da Cidade | descritivo | placar mais cidade | claro | longo | **próximo de "Placarsoft"**, o concorrente direto. Descartar |
| 6 | Jogo da Cidade | descritivo | o jogo da cidade | claro | longo | genérico |
| 7 | Futzo | inventado | nada ainda | curto, estranho no começo | ótimo no ícone | precisa de investimento para ganhar sentido |
| 8 | Ciddo | inventado (cidade) | lembra "cidade" | curto | ótimo | lido como "Cido" (apelido) |
| 9 | Torcida | descritivo | o torcedor | claro | bom | genérico; existem apps com esse nome |
| 10 | Freitas Esportes | nome do fundador | quem está por trás | claro | fraco | prende a marca a uma pessoa, justo a objeção nº 1 do re-teste ("é uma pessoa só") |

#### Lista curta e recomendação

**Recomendação: manter Citadino**, como nome do produto e com um logo próprio, e registrar no INPI a **marca mista** (nome + símbolo), não só a palavra.

Motivos:
- Já existe um contrato pago assinado com esse nome, o código e o site usam o nome, e trocar agora custa a primeira referência.
- O nome fala a língua do comprador. Em várias cidades, o campeonato municipal já se chama "Citadino".
- A fraqueza (ser quase genérico) se reduz registrando nome com símbolo e usando sempre o mesmo logo.

| | Citadino | Quadra Viva | Arquibancada |
|---|---|---|---|
| `.com.br` | **registrado em 13/05/2026** (RDAP registro.br). Se não foi você, alguém registrou há poucos meses | livre | `arquibancada.app.br` livre |
| Outros | `citadino.app.br` registrado em 19/06/2026; `citadino.com` registrado desde 2008; **`citadino.app` livre**; `citadino.esp.br` livre; `citadinoaovivo.com.br` livre | `quadraviva.com` e `quadraviva.app.br` livres | `arquibancada.app` livre |
| Confusão com concorrente | nenhuma | nenhuma | nenhuma |

Checado por consulta RDAP em 2026-10-21. "Livre" quer dizer que não havia registro naquele momento, não que está reservado para você.

**Se os domínios `citadino.com.br` e `citadino.app.br` não forem seus:** registre agora `citadino.app` e `citadino.esp.br`. O `.esp.br` é a categoria do registro.br para esporte e exige CNPJ.

#### O que você precisa checar (só posso fazer buscas públicas)

- **Marca no INPI** (o registro que vale no Brasil): [busca.inpi.gov.br/pePI](https://busca.inpi.gov.br/pePI/). Procure "Citadino" por radical e por semelhança nas classes de Nice:
  - **42**: software como serviço e plataforma online
  - **41**: organização de competições esportivas e informação sobre esporte
  - **9**: software baixável e aplicativo
- **Perfis**: confira à mão se `@citadino` ou `@citadinoapp` estão livres no [Instagram](https://www.instagram.com/citadino/), no [TikTok](https://www.tiktok.com/@citadino), no [X](https://x.com/citadino) e no [YouTube](https://www.youtube.com/@citadino). Não consegui verificar.
- Isto não é parecer jurídico. Só um advogado de marcas confirma se o registro é viável, e nada está protegido até o pedido ser feito no INPI.

### 2. Promessa, slogan e voz

**Promessa** (o que a secretaria pode esperar sempre):
> Todo lance registrado aparece no celular do torcedor na hora, e a tabela nunca precisa de conserto à mão.

**Slogan, três opções:**
1. **O campeonato da cidade, ao vivo.** (recomendado: é o posicionamento em cinco palavras)
2. Cada gol, no celular da cidade.
3. Do apito ao celular.

**Voz:**

| Adjetivo | Faça | Não faça |
|---|---|---|
| **Claro** | Fale como secretário de esporte fala: "súmula", "WO", "pendurado", "dispensa" | Jargão de tecnologia: "plataforma omnichannel", "SaaS", "engajamento" |
| **Concreto** | Números e fatos: "site no ar em 5 dias úteis", "R$ 2.400 por temporada" | Superlativos: "o melhor", "revolucionário", "o mais completo" |
| **Confiável** | Diga o que não faz e o plano B: "se cair o sinal, anota no papel e lança depois" | Prometer o que o produto não faz hoje, como súmula offline ou relatório automático |

**Antes e depois** (primeira frase do `founder/pitch.md`):
- Antes: "Temporada Ao Vivo, do Citadino: o campeonato municipal de futsal da sua cidade ao vivo no celular de cada torcedor, com o gol em vídeo e a cara da prefeitura."
- Depois: "O campeonato da sua cidade, ao vivo. Cada gol vira vídeo no celular do torcedor, no site com o brasão da prefeitura."

### 3. O visual (briefing)

#### Cores da marca Citadino

| Cor | Hex | Função | Contraste (WCAG) |
|---|---|---|---|
| Azul-noite | `#1E2A4A` | base: fundo de proposta, logo, títulos | texto branco sobre ele: 14,1 (AA e AAA) |
| Vermelho ao vivo | `#C81E2E` | só o sinal de "ao vivo" e a chamada principal | texto branco sobre ele: 5,7 (AA). O tom mais claro `#E5283A` dá 4,47 e reprova para texto pequeno; não use |
| Amarelo placar | `#FFD23F` | destaque de número: placar, preço, métrica | texto azul-noite sobre ele: 9,8 (AA e AAA). Nunca texto branco sobre amarelo |
| Fundo | `#F7F8FA` | papel e página | azul-noite sobre ele: 13,3; vermelho sobre ele: 5,4 |

O vermelho ao vivo segue a convenção dos placares ("● AO VIVO") e não colide com as cores do cliente atual. Confira as cores da Placarsoft e do APP Esportivo antes de fechar; eu não comparei os logos deles.

**Problema no produto atual, para corrigir:** o padrão do sistema usa texto branco sobre o laranja `#F5821F`. O contraste é 2,59, e reprova no WCAG AA, que pede 4,5 para texto normal. O mesmo vale para branco sobre o verde `#2FBF8F` (2,34). O texto escuro `#1C2230` sobre o laranja passa (6,13). Como cada prefeitura escolhe a própria cor, o sistema deveria escolher a cor do texto pelo contraste, e não fixar branco.

#### Tipografia

- **Títulos: Barlow Condensed**, peso 600 a 700. Tem cara de placar e já está no projeto.
- **Texto: Onest**. Também já está no projeto.
- As duas são do Google Fonts, com licença SIL Open Font License, livres para uso comercial: [Barlow Condensed](https://fonts.google.com/specimen/Barlow+Condensed) e [Onest](https://fonts.google.com/specimen/Onest).
- O README fala em Nunito, mas o código usa Onest e Barlow Condensed. Atualize o README.

#### Briefing do logo

- **Precisa dizer:** ao vivo, cidade, jogo. Um ponto vermelho de "ao vivo" ligado a uma quadra vista de cima, ou ao "i" de Citadino, funciona como símbolo.
- **Onde precisa funcionar:**
  - Ícone de 32 px no celular, só o símbolo, sem texto
  - Rodapé "feito com Citadino" ao lado do brasão da prefeitura, pequeno e sem competir com ele
  - Capa da proposta em PDF, em preto e branco também
  - Tela do celular mostrada em vídeo
- **O que evitar:**
  - Troféu, bola genérica e chuteira, que são clichês de app de campeonato
  - As cores da prefeitura cliente
  - Qualquer coisa parecida com os logos da Placarsoft, do Copa Fácil, do APP Esportivo ou do Jogafácil
  - Brasão ou estilo de órgão público, para não parecer que o Citadino é a prefeitura
- Se quiser, gero conceitos com uma ferramenta de imagem. Serão conceitos para discutir, não o logo final.

### 4. Os cinco primeiros pontos de contato

1. **Página "para prefeituras"** (a vitrine): título "O campeonato da cidade, ao vivo.", o vídeo de 60 s da tela, a tabela de preços por porte, "piloto grátis numa categoria" como único botão e o contato direto.
2. **Proposta e kit de contratação em PDF** (a embalagem): capa azul-noite com o logo, uma página de resumo com o preço do porte da cidade em amarelo-placar, e depois a minuta do termo de referência e a justificativa de preço com contratos públicos citados por número no PNCP. Sem nenhuma promessa que o produto não cumpra.
3. **Mensagem de "site no ar"** (a confirmação), por WhatsApp e e-mail: "O site do campeonato de [cidade] está no ar: [link]. Próximos passos: 1) mande o link de inscrição aos treinadores; 2) treinamento de 1 hora marcado para [data]; 3) eu acompanho a primeira rodada ao vivo." Assinada com seu nome e telefone.
4. **Primeiro post** (Instagram do Citadino): o vídeo da tela com um gol virando clipe e a notificação chegando, com autorização do cliente e sem rosto de atleta menor. Legenda: "Rodada de sábado em [cidade]. Cada gol, no celular da cidade."
5. **Resposta à primeira reclamação**, por exemplo "a tabela saiu errada no sábado": "Vi. O WO do jogo X não estava lançado e a classificação ficou errada por 40 minutos. Já corrigi, e a tabela está certa desde as 21h10. Para não repetir: [o que mudou]. Se precisar, eu explico aos treinadores." Assume o erro, dá o horário e diz o que mudou, sem culpar o organizador. A reclamação nº 1 dos concorrentes é justamente o fornecedor culpar o organizador.

Próximo: `/founder-ops` e `/founder-launch`.

## Operations

Base: `founder/offer.md`, `founder/numbers.json`, `founder/cfo.md` e o código do projeto (lido em 2026-10-21). Não é aconselhamento jurídico, tributário nem contábil.

### 0. Achado do código que muda a operação

**Os documentos dos atletas estão públicos.** `src/lib/storage.ts` salva todo upload no Vercel Blob com `access: "public"`. Isso inclui documento de identidade e comprovante de residência, muitos de menores. O nome do arquivo é um UUID aleatório, difícil de adivinhar, mas qualquer pessoa com o link abre o arquivo sem login. Links vazam: são encaminhados no WhatsApp, ficam em histórico e aparecem em print.

- Isso contradiz a garantia da oferta ("termo de LGPD pronto para a TI e a procuradoria").
- O Vercel Blob tem armazenamento privado. A correção é salvar documentos como privados e servir por uma rota que checa o login de admin ou treinador. Fotos de perfil e escudos podem continuar públicos.
- **Prioridade 1, antes de vender a próxima cidade e antes de o termo de LGPD ser assinado.** Não mexi no código.

**Não há rotina de backup do banco.** O plano gratuito do Turso restaura só o último dia ([Turso pricing](https://turso.tech/pricing.md)). Um erro apagado no sábado e descoberto na segunda já não volta. Ver a rotina semanal na seção 4.

### 1. O ciclo de trabalho

O negócio não tem "dia" fixo. Tem a **semana do campeonato**, que termina no jogo. (C) marca o que o cliente vê.

**Segunda a sexta:**
1. Conferir os alertas de disponibilidade da semana anterior.
2. Responder as mensagens de secretarias e treinadores. (C)
3. Aprovar ou ajudar a aprovar inscrições e documentos pendentes, se o cliente pedir. (C)
4. Conferir a tabela da próxima rodada: jogos, horários, suspensos. (C)
5. Trabalho de venda (`founder/marketing.md`): contatos, pilotos, propostas.
6. Desenvolvimento e correções, com deploy **até quinta-feira**. Nada de deploy em dia de jogo.

**Dia de jogo** (geralmente sábado à noite):
1. Até 2 horas antes, conferir se o site de cada cidade com jogo está no ar.
2. Ficar disponível no WhatsApp do começo do primeiro jogo ao fim do último, com resposta em até 2 horas (é a garantia da oferta). (C)
3. Acompanhar o feed ao vivo de cada cidade e checar se a súmula está entrando. (C)
4. Depois do último jogo, conferir a classificação, os suspensos e os vídeos dos gols. (C)
5. Anotar as horas gastas e os problemas. É o número que o CFO pediu para medir.

**Fim de temporada:**
1. Relatório para o prefeito. (C)
2. Exportação dos dados em planilha. (C)
3. Exclusão, se a prefeitura pedir. (C)
4. Pedir autorização para usar a cidade como referência.

### 2. Fornecedores

| Item | Fornecedor | Preço público | Observação | No modelo do CFO |
|---|---|---|---|---|
| Hospedagem e deploy | **Vercel Pro** | US$ 20 por usuário/mês, com US$ 20 de crédito de uso ([docs](https://vercel.com/docs/plans/pro-plan/switching)) | Obrigatório: o Hobby é só para uso não comercial ([docs](https://vercel.com/docs/accounts/plans/hobby)) | R$ 110 por mês |
| Arquivos (documentos, fotos, vídeos) | **Vercel Blob** | Pro inclui 5 GB e 100 GB de transferência; depois US$ 0,023 por GB ([docs](https://examples.vercel.com/docs/vercel-blob/usage-and-pricing)) | Vídeos de gol consomem o limite. Acompanhar o uso por cidade | R$ 0 (dentro do incluído) |
| Banco de dados | **Turso** gratuito | 5 GB, 500 milhões de leituras por mês, restauração de 1 dia; sem cobrança extra, só upgrade ([Turso](https://turso.tech/pricing.md)) | Plano Developer a US$ 4,99 por mês se precisar de mais restauração | R$ 0 |
| Alternativa de banco | Turso Developer | US$ 4,99 por mês | Considerar quando houver 5 ou mais cidades | — |
| Contabilidade e nota fiscal | a empresa onde você trabalha (ME com permissão para software) | já existe | Confirmar a alíquota do Simples da empresa | R$ 0 |
| Certificado digital | o da empresa | já existe (suposição) | Se a empresa não tiver: e-CNPJ A1 de R$ 150 a R$ 300 por ano ([Omie](https://www.omie.com.br/blog/qual-e-o-valor-do-certificado-digital-a1-e-a3-em-2026/index.md)) | R$ 0 |
| Nota fiscal de serviço | **Emissor Nacional da NFS-e** | gratuito ([gov.br/nfse](https://www.gov.br/nfse)) | Confirmar se o seu município aderiu | R$ 0 |
| Advogado (contrato e termo de LGPD) | escritório local ou online | sob orçamento | Pedir 2 orçamentos com escopo fechado: minuta de contrato, termo de tratamento de dados e política de privacidade | R$ 1.500 (estimativa) |
| Plantão de segundo dev | freelancer de confiança | sob negociação | Ver seção 3 | Fora da base; cenário com R$ 400 por mês |

O CFO foi rodado de novo sem contador, sem abertura de CNPJ e sem certificado, porque o faturamento vai pelo CNPJ da empresa. Ano 1: lucro operacional de R$ 14.545; depois do inicial, R$ 11.745; o inicial volta no mês 6; caixa necessário de R$ 2.800 (`founder/cfo.md`).

### 3. Pessoas

Só existe você. O re-teste mostrou que esse é o maior medo de quem compra (95% citaram "e se ele sumir"). Por isso a operação precisa de um segundo nome.

| Papel | Quem | Quando | Custo |
|---|---|---|---|
| Venda, implantação, suporte, desenvolvimento | você | o tempo todo | R$ 50 por hora, já no modelo |
| **Plantão de backup** | um dev freelancer com acesso de leitura ao painel, à Vercel e ao Turso, e um roteiro de emergência | fins de semana de jogo | proposta: R$ 100 por fim de semana disponível, mais a hora se for acionado. Com 4 fins de semana: R$ 400 por mês |
| Fiscal e comercial | a empresa onde você trabalha | por nota | dentro da empresa |

Com o plantão, o ano 1 cai de R$ 14.545 para R$ 9.745 de lucro operacional. O inicial passa a voltar no mês 7, em vez do 6. A conta ainda fecha, e o plantão responde à objeção nº 1 com algo real. **Decisão sua.** O valor de R$ 100 por fim de semana é estimativa; negocie.

**Escala semanal:**

| | Mês 1 (só o cliente atual) | No plano (4 a 5 cidades em campeonato) |
|---|---|---|
| Seg a sex | ~4 h de suporte e conferência; o resto em venda e produto | ~10 h de suporte e conferência; ~10 h de venda; ~5 h de implantação de cidade nova |
| Dia de jogo | você, ~1 a 2 h ativas | você, ~4 a 6 h ativas, com 4 a 5 cidades no mesmo horário; backup de plantão |
| Horas de suporte (base do CFO) | 4 h por cidade por mês | 16 a 20 h por mês |

A capacidade estimada pelo CFO é de 6 cidades ao mesmo tempo. Com jogos no mesmo horário, o limite real pode ser menor. Meça no campeonato atual.

### 4. Rotinas (uma página cada)

#### R1. Implantar uma cidade nova (até 5 dias úteis, garantia da oferta)
1. Contrato assinado ou piloto combinado por escrito, com categoria e datas.
2. No super-admin, criar o tenant: slug, nome da prefeitura, cor primária e secundária, escudo. Conferir se o texto sobre a cor primária passa em contraste (ver `founder/brand.md`).
3. Criar campeonato, categorias, formato e prazo de inscrição.
4. Gerar os links de cadastro de treinador e mandar ao organizador.
5. Treinamento de 1 hora com o organizador: lançar lance, encerrar partida, WO, lançar depois do papel se cair o sinal.
6. Mandar a mensagem de "site no ar" (modelo em `founder/brand.md`, item 3).
7. Anotar a data. Se passar de 5 dias úteis por sua causa, a temporada não é cobrada.

#### R2. Dia de jogo
1. Duas horas antes: abrir o site de cada cidade com jogo e conferir o feed e o login de admin.
2. Avisar o backup de plantão: "jogos hoje em X e Y, das 19h às 23h".
3. Durante os jogos: WhatsApp aberto e resposta em até 2 horas. Se o organizador estiver sem sinal: "anota no papel e lança quando o sinal voltar, sem encerrar a partida".
4. Ao fim: conferir a classificação e os suspensos de cada cidade.
5. Registrar horas e problemas na planilha de operação.

#### R3. Reclamação
1. Responder em até 2 horas em dia de jogo e no mesmo dia útil nos outros dias.
2. Reproduzir o problema antes de responder o porquê.
3. Corrigir o dado ou o sistema.
4. Responder com o modelo de `founder/brand.md`, item 5: o que houve, desde quando está certo e o que mudou. Sem culpar o organizador.
5. Se for erro do sistema, registrar a causa e o teste que impede a repetição.

#### R4. Fim de temporada
1. Relatório para o prefeito: atletas, times, jogos, gols, gols com vídeo, inscritos nas notificações, votos na enquete.
2. Exportar os dados em planilha: atletas, times, jogos, súmulas e inscrições.
3. Perguntar por escrito: renovar, manter os dados para a próxima temporada ou excluir?
4. Se for excluir: apagar os registros e os arquivos do Blob, e confirmar a exclusão por escrito.
5. Pedir autorização para citar a cidade como referência.

#### R5. Rotina semanal (segunda-feira)
1. **Backup:** exportar o banco do Turso (`turso db shell <banco> .dump > backup-AAAA-MM-DD.sql`) e guardar criptografado fora da Vercel e do Turso. Testar a restauração uma vez por mês.
2. Conferir o uso do Vercel Blob e da Vercel contra o incluído no plano.
3. Conferir as notas emitidas e os pagamentos recebidos.
4. Os três números de marketing: conversas, pilotos e conversão (`founder/marketing.md`).
5. Atualizar a planilha de horas e comparar com a premissa do CFO de 4 horas por cidade por mês.

### 5. Ferramentas

| Para quê | Ferramenta | Preço | Por quê |
|---|---|---|---|
| Hospedagem, cron, analytics | Vercel Pro + Web Analytics | US$ 20 por mês (o analytics usa o crédito incluído; conferir no painel) | Já é a base do projeto. O analytics mede a prova para o marketing |
| Banco | Turso | grátis | Já é a base; backup semanal manual |
| Arquivos | Vercel Blob | dentro do Pro | Já é a base; mudar documentos para privado |
| Monitoramento | UptimeRobot ou similar | há plano gratuito (conferir) | Aviso no celular se um site cair no sábado |
| Nota fiscal | Emissor Nacional da NFS-e | grátis | Padrão nacional |
| Recebimento | conta PJ digital | há opções sem mensalidade (conferir) | A prefeitura paga por transferência após a nota; não precisa de maquininha |
| Atendimento | WhatsApp Business | grátis | É onde secretário e organizador já estão |
| Horas, problemas e funil | uma planilha | grátis | O suficiente até 6 cidades |
| Código | GitHub | já em uso | — |

### 6. Registros, certidões e regras

As regras variam por município e mudam. Confirme cada item com o órgão ou com quem cuida da contabilidade da empresa.

- [x] **CNPJ para faturar:** a ME onde você trabalha, com permissão para venda de software (informado por você).
- [ ] **Acordo escrito com a empresa** antes da próxima proposta:
  - quem fatura e quanto é repassado a você;
  - de quem é o código do Citadino. Software feito durante um vínculo de emprego pode ser do empregador quando tem a ver com o trabalho ([Lei 9.609, art. 4º](https://www.planalto.gov.br/ccivil_03/leis/l9609.htm));
  - o que acontece com os contratos das prefeituras se você sair da empresa.
  Não é parecer jurídico; pergunte ao advogado que já vai revisar o contrato.
- [ ] **Contrato atual:** confirmar em nome de quem foi assinado. Se foi em nome do seu MEI, ele não passa sozinho para a empresa. Contrato público não troca de contratado sem termo aditivo ou novo contrato.
- [x] **Inscrição municipal e NFS-e:** a empresa já emite. Confirme só se a atividade de software está na inscrição municipal dela.
- [ ] **Certidões para contratar com prefeitura.** Mesmo na dispensa, a habilitação fiscal e trabalhista é exigida (Lei 14.133, art. 68, [texto](https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2021/lei/l14133.htm)). Tirar e renovar, em nome da empresa, antes de cada proposta:
  - [ ] Certidão conjunta federal ([Receita](https://servicos.receitafederal.gov.br/servico/certidoes/))
  - [ ] FGTS ([Caixa](https://consulta-crf.caixa.gov.br/))
  - [ ] Trabalhista ([TST](https://cndt-certidao.tst.jus.br/))
  - [ ] Estadual e municipal, no site da Sefaz e da prefeitura
- [ ] **LGPD** ([Lei 13.709](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)). A prefeitura é a controladora e o Citadino é o operador dos dados dos atletas. Itens:
  - [ ] Contrato de tratamento de dados
  - [ ] Política de privacidade
  - [ ] Canal para o titular pedir acesso ou exclusão
  - [ ] Documentos privados (seção 0)
  - [ ] Atenção especial a dados de crianças e adolescentes (art. 14)
  - Regras para agentes de pequeno porte: [ANPD](https://www.gov.br/anpd/)
- [ ] **Imagem de atletas menores:** autorização dos responsáveis no termo de inscrição antes de publicar foto ou vídeo ([ECA](https://www.planalto.gov.br/ccivil_03/leis/l8069.htm), arts. 17 e 100).
- [ ] **Ano eleitoral (2028):** perguntar ao advogado se o site com a identidade da prefeitura e as notificações entram nas restrições de publicidade institucional nos três meses antes da eleição ([Lei 9.504](https://www.planalto.gov.br/ccivil_03/leis/l9504.htm), art. 73).
- [ ] Seguro de responsabilidade civil profissional ou cyber: opcional; pedir cotação depois de 3 ou mais cidades.

### 7. Registro de riscos

| # | Risco | Chance | Impacto | Plano |
|---|---|---|---|---|
| 1 | **Link de documento de atleta vaza** (arquivos públicos hoje) | média | alto: LGPD, dados de menores, contrato e reputação | Mudar documentos para Blob privado com rota autenticada antes da próxima venda; rever os links já existentes |
| 2 | **Você fica doente ou indisponível num sábado de jogo** | média ao longo de uma temporada | alto: quebra a garantia de 2 horas | Backup de plantão com roteiro (seção 3); o organizador sabe lançar depois do papel |
| 3 | **Dado perdido ou apagado** (restauração de 1 dia no Turso) | baixa | alto | Backup semanal fora do Turso com teste mensal (R5) |
| 4 | **Sinal ruim no ginásio**, feed parado | alta | médio | Plano B do papel no treinamento; súmula offline no roteiro do produto (`founder/offer.md`, item J) |
| 5 | **Deploy quebra o sistema no dia de jogo** | baixa a média | alto | Nada de deploy entre sexta e domingo; testar a súmula antes de cada deploy |
| 6 | **Acordo com a empresa não fica por escrito** (quem fatura, quanto repassa, de quem é o software, o que acontece se você sair) | média | alto: o contrato com a prefeitura fica em nome da empresa | Acordo escrito antes da próxima proposta (seção 6) |
| 7 | **Certidão vencida trava o pagamento** da prefeitura | média | médio | Calendário de validade das certidões na rotina semanal |
| 8 | **Suporte passa de 4 h por cidade por mês** | média | alto: com 8 h, cada cidade dava prejuízo ao preço antigo | Medir no campeonato atual; com a tabela nova há folga, mas revisar o preço se passar de 6 h |
| 9 | **Vídeos de gol estouram o limite do Blob** | baixa no começo | baixo | Conferir o uso semanalmente; os vídeos vêm do YouTube, os uploads manuais são o risco |
| 10 | **Prefeitura atrasa o pagamento** (empenho, fim de ano) | média, sobretudo em dezembro | médio no caixa | Contrato com datas de pagamento; caixa de reserva de R$ 2.800 (CFO); não implantar sem empenho, exceto no piloto |

Próximo: `/founder-launch`.

## Launch plan

Base: `founder/offer.md`, `founder/pricing.md`, `founder/marketing.md`, `founder/ops.md`, `founder/cfo.md`. Hoje: 2026-10-21.

"Lançamento" aqui é o dia em que a oferta começa a ser apresentada a outras prefeituras: **segunda-feira, 16/11/2026**, a data de `founder/marketing.md`. O campeonato do primeiro cliente, que começa nos próximos dias, funciona como a abertura branda: é onde tudo é testado antes de ser mostrado.

### 1. O teste antes de gastar

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

### 2. A contagem regressiva

Responsáveis: **V** = você (Vitor), **E** = a empresa que fatura, **A** = advogado, **P** = primeiro cliente (a prefeitura).
**[CR]** = caminho crítico: se atrasar, o lançamento de 16/11 atrasa junto.

#### Semana 1: qua 21/10 a dom 25/10, base legal e campeonato atual
| Tarefa | Resp. | Prazo |
|---|---|---|
| Migrar o projeto para o Vercel Pro (uso comercial) | V | 22/10 **[CR]** |
| Ativar o Vercel Web Analytics | V | 22/10 |
| Primeiro backup do banco Turso fora do Turso; testar a restauração | V | 23/10 |
| Acordo escrito com a empresa: faturamento, repasse, dono do código, saída; e em nome de quem está o contrato atual | V + E | 24/10 **[CR]** |
| Pedir 2 orçamentos de advogado: contrato, termo de tratamento de dados, política de privacidade, autorização de imagem | V + A | 24/10 **[CR]** |
| Campeonato atual: primeira rodada acompanhada (rotina R2), anotar as horas | V | primeira rodada |

#### Semana 2: seg 26/10 a dom 01/11, proteger os dados
| Tarefa | Resp. | Prazo |
|---|---|---|
| **Mudar documentos e comprovantes para Vercel Blob privado**, com rota que exige login de admin ou treinador; revisar os arquivos já enviados | V | 30/10 **[CR]** |
| Se o contrato atual estiver em nome do seu MEI: combinar com a prefeitura o aditivo ou novo contrato em nome da empresa | V + E + P | 30/10 |
| Contratar o advogado e enviar o escopo | V + A | 28/10 |
| Corrigir o contraste do texto sobre a cor do cliente (`founder/brand.md`) | V | 31/10 |
| Monitoramento de disponibilidade com aviso no celular | V | 31/10 |
| Pedir ao primeiro cliente, por escrito, autorização para citar a cidade, mostrar o site e dar o contato | V + P | 30/10 **[CR]** |

#### Semana 3: seg 02/11 a dom 08/11, preparação do marketing (calendário de `founder/marketing.md`)
| Tarefa | Resp. | Prazo |
|---|---|---|
| Lista de 30 cidades (vizinhas, médias e grandes, contratos no PNCP vencendo até 06/2027) com contatos | V | 05/11 |
| Página "para prefeituras" no site | V | 06/11 |
| Confirmar que a empresa tem certificado digital e inscrição municipal com atividade de software | V + E | 06/11 |
| Termo de LGPD e minuta de contrato entregues pelo advogado | A | 06/11 **[CR]** |
| Certidões da empresa: federal, FGTS, trabalhista, estadual e municipal | V + E | 06/11 |

#### Semana 4: seg 09/11 a dom 15/11, kit e prova
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

### 3. Dia do lançamento: segunda-feira, 16/11/2026

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

### 4. Os primeiros 30 dias (16/11 a 16/12)

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

_The panel is simulated buyers and the numbers are projections from your inputs. Confirm demand with real customers and costs with real quotes before you spend. Not financial, legal or tax advice._
