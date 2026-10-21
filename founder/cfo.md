# Nota do CFO

**Leitura da saída da ferramenta no fim deste arquivo:** "$" significa R$ e "a day" significa **por mês**. A unidade é um mês de campeonato em uma cidade nova. O contrato atual entra como custo fixo negativo. Todas as estimativas estão em `founder/cfo-sources.md`.

## Atualização após o /founder-pricing (2026-10-21)
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

## Análise original a R$ 2.000 por temporada

### A margem
- **A R$ 2.000 por temporada, cada mês de campeonato deixava R$ 57,50** depois de pagar suas horas a R$ 50, o imposto e o rateio dos pilotos. A margem era de **11%** com 4 cidades ao mesmo tempo.
- **Ano 1: lucro operacional de R$ 1.596.** Depois dos R$ 3.300 iniciais, o ano fechava em **−R$ 1.704** e o dinheiro inicial não voltava.
- Na prática, a R$ 2.000 o negócio **pagava sua hora e quase mais nada.** Sem valorizar suas horas, você levaria cerca de R$ 14.900 no ano 1 por umas 266 horas de trabalho, cerca de R$ 56 por hora.
- O contrato atual (R$ 4.290 por ano líquido) praticamente paga sozinho os custos fixos de R$ 363,50 por mês, com Vercel Pro, contador e domínio.

### A linha a observar: horas de suporte por mês
O modelo supõe 4 horas por mês por cidade em dia de jogo. A R$ 2.000 por temporada:

| Suporte por cidade-mês | Contribuição | Lucro ano 1 |
|---|---:|---:|
| 4 h (base) | R$ 57,50 | R$ 1.596 |
| 8 h | −R$ 142,50 | −R$ 4.204 |

Meça as horas reais no campeonato atual antes de vender a segunda temporada. A conversão dos pilotos pesa quase o mesmo. Se só 1 em 3 pilotos virasse temporada paga, a contribuição cairia para −R$ 17,50 e o ano 1 fecharia em −R$ 580.

### Caixa
**R$ 3.318** antes de se pagar: os R$ 3.300 iniciais (advogado, CNPJ, kit, visitas) mais o mês 1. Vercel Pro e contador são cobertos pelo contrato atual.

### Três formas de melhorar a margem (cada uma rodada na ferramenta)

| Mudança | Contribuição | Lucro ano 1 | Após inicial | Volta do inicial |
|---|---:|---:|---:|---:|
| Base: R$ 2.000 por temporada | R$ 57,50 | R$ 1.596 | −R$ 1.704 | não volta |
| 1. Preço de R$ 3.000 por temporada | R$ 292 | R$ 8.410 | R$ 5.110 | mês 8 |
| 1b. R$ 3.000 com volume 20% menor | R$ 292 | R$ 6.714 | R$ 3.414 | mês 9 |
| 2. Exportação e relatório automáticos (11 h para 4 h por temporada) | R$ 145 | R$ 4.133 | R$ 833 | — |
| 3. Preço de R$ 2.500 por temporada | R$ 175 | R$ 5.003 | R$ 1.703 | mês 10 |

O preço era a alavanca maior, e foi a que o `/founder-pricing` usou. Automatizar a exportação e o relatório é a segunda alavanca e se soma ao preço.

## Duas coisas para resolver antes de cobrar a próxima cidade
1. **A Vercel Hobby não permite uso comercial.** Com um contrato pago, o projeto já deveria estar no Vercel Pro, a US$ 20 por mês, e o modelo inclui esse custo.
2. ~~O MEI provavelmente não cobre software.~~ **Resolvido:** o faturamento vai pelo CNPJ de uma ME com permissão para venda de software (ver a atualização no topo).

## Condições de dinheiro do conselho (`founder/board.md`)
- [x] O contrato atual é pago: R$ 500 por mês.
- [x] O custo por tenant está calculado. O marginal é quase zero na infraestrutura; o custo real são suas horas (11 h por temporada mais 4 h por mês de suporte).
- [x] O preço está acima da faixa commodity. A tabela por porte, de R$ 2.400 a R$ 5.000 por temporada, fica acima dos apps self-service e abaixo do menor contrato público da Placarsoft. A margem passa de 11% para 46%.
- [ ] O custo para conquistar uma prefeitura ainda não foi medido. O modelo supõe R$ 800 de visitas e um piloto não convertido por venda.

Isto não é aconselhamento financeiro, tributário ou jurídico. Confirme com quem cuida da contabilidade da empresa a alíquota real e a situação do contrato atual antes de qualquer cobrança nova.

---

# Unit economics: Citadino - Temporada Ao Vivo

Every number below comes from the input file. Nothing is looked up or guessed.

## One cidade-mês de campeonato novo (preço médio da tabela por porte: R$ 3.460 por temporada de 4 meses)

| line | per cidade-mês de campeonato novo (preço médio da tabela por porte: R$ 3.460 por temporada de 4 meses) |
| --- | ---: |
| Price | $865.00 |
| Suporte em dia de jogo: 4 h/mês x R$ 50 (estimativa) | -$200.00 |
| Implantação, treinamento, 1ª rodada, relatório e exportação: 11 h x R$ 50 por temporada, rateado em 4 meses (estimativa) | -$137.50 |
| Piloto grátis que não converte: 1 a cada temporada vendida, 6 h x R$ 50, rateado em 4 meses (estimativa) | -$75.00 |
| Imposto sobre a nota, Simples Nacional da ME da empresa ~6% (estimativa: a alíquota real depende do faturamento de 12 meses da empresa) | -$51.90 |
| **Contribution** (what each cidade-mês de campeonato novo (preço médio da tabela por porte: R$ 3.460 por temporada de 4 meses) leaves to pay the fixed costs) | **$400.60** (46%) |

## The margin that matters

Fixed costs: -$244 a month (Vercel Pro, US$ 20 x R$ 5,50 (obrigatório para uso comercial) $110, Turso, plano gratuito atual $0, Domínio, ~R$ 40/ano $4, Contrato atual (R$ 6.000/ano) menos imposto e horas: 6.000 - 360 - 1.350 = 4.290/ano (estimativa), entra como custo negativo -$358).

- **Break-even: 0 cidade-mês de campeonato novo (preço médio da tabela por porte: R$ 3.460 por temporada de 4 meses)s a day.** Below that you lose money every month.
- **Profit margin at your plan** (4 a day): **53%** of every sale, after every cost.
- Capacity: 6 a day.

## Year 1, month by month

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

## What if

| scenario | margin at plan | break-even a day | year 1 profit |
| --- | ---: | ---: | ---: |
| Base plan | 53% | 0 | $14,545 |
| Price -10% | 48% | 0 | $12,037 |
| Volume -20% | 55% | 0 | $12,222 |
| Unit costs +15% | 45% | 0 | $12,525 |

No red flags in these numbers. They are only as good as the inputs: check every cost against a real quote.
