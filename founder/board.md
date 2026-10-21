# Conselho: Citadino

Memorandos completos em `founder/board/` (offers.md, monopoly.md, product.md). Briefing em `founder/board/brief.md`.

## 1. Votação

**3 FUND IF, 0 FUND, 0 PASS.** Nota média: **5,0 / 10** (Offers 5, Monopoly 4, Product 6).

Nenhum membro financia como está. Nenhum rejeita. Os três condicionam a aposta a provas que ainda não existem, e as três listas de condições apontam para os mesmos buracos.

## 2. Riscos levantados por mais de um membro

1. ~~**Ninguém sabe se o primeiro contrato é pago, nem quanto.**~~ (Offers, Monopoly) **Respondido após a reunião:** o contrato é pago, R$ 500/mês por 12 meses (R$ 6.000/ano). Isso responde a condição número um das lentes Offers e Monopoly. A pergunta que sobra é se R$ 6.000/ano cobre hospedagem, suporte e o custo de vender a próxima cidade, e se esse valor cabe no teto de dispensa de licitação de outras prefeituras. `/founder-cfo` e `/founder-pricing`.
2. **A venda para prefeitura não tem caminho repetível.** (Offers, Monopoly, Product) Ciclo de venda, limite de dispensa de licitação, quem assina, custo de chegar lá: tudo desconhecido. A lente Monopoly trata isso como o risco número um; a Offers chama o mercado de "fraco em dinheiro e facilidade de compra".
3. **A súmula ao vivo depende de uma pessoa na beira da quadra.** (Offers, Product) **Respondido em parte:** quem preenche é o organizador do campeonato, o responsável pelo app na prefeitura. Isso resolve "quem", mas não resolve o risco: é uma pessoa só, sem plano B, e a dependência de sinal no ginásio continua. Se essa pessoa faltar ou o sinal cair, o feed fica vazio e o produto vira uma planilha bonita.
4. **Sem preço e sem concorrentes mapeados, vira commodity.** (Offers, Monopoly) A comparação natural é com planilha e WhatsApp, que custam zero, e qualquer agência local copia a funcionalidade em meses.
5. **Quem compra não é quem vive o produto.** (Product, Offers) O torcedor vê o Sofascore; a secretaria vê burocracia de cadastro e validação de documentos. Se o painel admin der mais trabalho que a planilha, não há renovação.

Desacordo que vale registrar: a lente Product considera o produto pronto um ativo forte e dá a maior nota; a Monopoly dá a menor porque vê nele "melhoria incremental", não tecnologia 10x. A Offers fica no meio: o resultado-sonho é claro, mas o mercado pode não ter dinheiro.

## 3. Condições, mescladas

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

## 4. A versão mais forte deste negócio

A versão mais forte não é "software de campeonato de futsal" vendido cidade a cidade. É **o registro oficial do esporte amador de uma região**: a mesma plataforma rodando futsal, society e vôlei da prefeitura, temporada após temporada, acumulando histórico de atletas, times, artilharia e suspensões que ninguém mais tem e que fica caro abandonar. O comprador continua sendo a secretaria, mas a venda passa a ser "tudo que a cidade organiza, num lugar só, com memória", e a expansão vai por cidades vizinhas onde os mesmos times e atletas já aparecem. O torcedor seguindo ao vivo é a vitrine que faz o prefeito querer; a gestão sem planilha é o motivo de a secretaria renovar. Isso difere do pitch atual em dois pontos: o produto precisa ser vendido como plataforma multi-modalidade, não como ferramenta de futsal, e a métrica que importa não é "cidades vendidas" e sim "cidades que renovaram". Antes disso, o primeiro campeonato precisa provar que a súmula ao vivo funciona com gente de verdade num ginásio de verdade.
