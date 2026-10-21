# Preço: Temporada Ao Vivo (Citadino)

Fontes: curva de preço em `founder/pricing-curve.md` e `founder/pricing-data/`, concorrentes em `founder/competitors.md`, margem em `founder/cfo.md`. Data: 2026-10-21.

## 1. O preço: uma tabela por porte de cidade

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

## 2. A escada

- **Temporada:** um campeonato, até 4 meses, todas as categorias. Paga só nos meses de jogo, sem fidelidade. É a porta de entrada depois do piloto.
- **Ano esportivo:** todos os campeonatos de futsal da prefeitura no ano (municipal, veteranos, base, torneio de verão), com o histórico de atletas e times contínuo e o relatório anual para o prefeito. **Motivo para subir:** a partir de 2 campeonatos por ano, sai mais barato que temporadas avulsas (pequena: 2 × R$ 2.400 = R$ 4.800; 3 × R$ 2.400 = R$ 7.200, contra R$ 6.000 do ano). É também o degrau que constrói a defesa que o conselho pediu: o histórico local que fica caro abandonar.
- Não há terceiro degrau agora. Um pacote regional (consórcio de cidades vizinhas) faz sentido depois de 3 cidades próximas, não antes.

## 3. A oferta de abertura

**Preço de fundação:** as prefeituras que assinarem a primeira temporada ou o ano esportivo **até 31/03/2027** mantêm o mesmo preço na renovação de 2028, sem reajuste.

- Não é desconto e não ensina a esperar promoção. O preço é o da tabela, e o que se ganha é a garantia de não subir.
- Tem data real de fim.
- O número de cidades de fundação deve ser o limite de capacidade que você definir. O CFO estimou 6 cidades em campeonato ao mesmo tempo para uma pessoa só. Não anuncie um número que você não vá cumprir.
- O piloto grátis de uma categoria continua valendo e não conta como fundação.

## 4. O que testar com compradores reais

| Teste | Preço A | Preço B | Como |
|---|---:|---:|---|
| Cidade pequena | R$ 2.000 | R$ 2.400 | Alternar a proposta pela lista de cidades-alvo (ímpar A, par B). Medir quantas aceitam o piloto e quantos pilotos viram temporada paga. |
| Cidade média | R$ 3.000 | R$ 3.500 | O mesmo, nas cidades médias. |
| Cidade grande | R$ 5.000 | R$ 6.000 | O mesmo. Anotar se alguém acha barato demais. |

- Na conversa de fim de piloto, faça as quatro perguntas de preço ao secretário: a partir de quanto ficaria barato demais para confiar, quanto seria uma pechincha, quanto começaria a ficar caro e a partir de quanto não compraria. Grave as respostas num CSV com as colunas `too_cheap, cheap, expensive, too_expensive` e rode o `van_westendorp.py`. Respostas reais valem mais que as simuladas.
- Com poucas cidades por grupo, o teste não terá significância estatística. Ele serve para descobrir se o preço B gera recusas que o A não gera.

## 5. As três objeções de preço do painel, nas palavras dos compradores simulados

1. **Verba curta:** "R$ 6.000 por ano é entre 8% e 30% de toda a minha verba de eventos, que paga arbitragem, troféu e bola. O que eu faço hoje com Excel, WhatsApp e Canva dá trabalho, mas custa zero, e meu campeonato dura três ou quatro meses, não doze." (painel original, P010)
2. **App grátis:** "Eu já monto o campeonato no Copa Fácil de graça. Tem anúncio e às vezes atrasa, e já refiz classificação na mão por causa de WO, mas R$ 6 mil por ano sai da mesma verba que paga arbitragem, troféu e lanche, e isso eu não consigo justificar para o prefeito." (painel original, P053)
3. **Barato demais para cidade grande:** "E o preço é tão baixo perto do que já me cotaram que a procuradoria vai perguntar o que está faltando." (re-teste, P016)

A primeira e a segunda foram respondidas pelo formato por temporada; o re-teste derrubou a objeção dos 12 meses de 72% para 5%. A terceira é respondida pela tabela por porte. São falas simuladas, não depoimentos.

**Ressalva:** as faixas vêm de compradores simulados, com unidades padronizadas por mim (mensal × 4, anual × 4/12, por campeonato sem mudança; a lista de quem respondeu em cada unidade está em `founder/panel/results.md`). Servem para escolher o que testar, não provam nada.
