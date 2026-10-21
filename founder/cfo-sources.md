# Fontes dos números (founder/numbers.json)

Data: 2026-10-21. Moeda: R$. Na saída da ferramenta, "$" significa R$ e "a day" significa **por mês** (`days_per_month` = 1).

## Do fundador
- Preço do contrato atual: R$ 500/mês, 12 meses (informado pelo fundador).
- Valor da hora do fundador: R$ 50 (informado pelo fundador).
- Hospedagem atual: Vercel Hobby + Turso gratuito (informado pelo fundador).
- Faturamento: pelo CNPJ da empresa onde o fundador trabalha, uma ME com permissão para venda de software (informado pelo fundador em 2026-10-21). Antes, o fundador tinha informado MEI.
- Meta de vendas: 6 a 12 temporadas pagas no ano 1 (informado pelo fundador). O modelo usa 8.

## Do código do projeto
- Serviços usados: Vercel (`vercel.json`, cron diário), Turso/libSQL (`@libsql/client`), Vercel Blob (`@vercel/blob`), web-push (sem custo de terceiros).

## Públicas
- Vercel Pro: US$ 20 por usuário/mês; Hobby é só para uso não comercial. [Vercel docs, Hobby](https://vercel.com/docs/accounts/plans/hobby) · [Vercel docs, Pro](https://vercel.com/docs/plans/pro-plan/switching) · [comunidade Vercel sobre uso comercial](https://community.vercel.com/t/commerical-projects/7416).
- MEI e software: fontes de contabilidade indicam que desenvolvimento de software e SaaS (CNAE 6201-5/01, 6203-1/00) não estão entre as atividades do MEI. [Contabilizei](https://www.contabilizei.com.br/contabilidade-online/mei-para-programador) · [Agilize](https://agilize.com.br/artigos/melhor-cnae-para-programador-2026) · [contabilidade.com](https://contabilidade.com/blog/desenvolvedor-pode-ser-mei-em-2026-veja-como-abrir-cnpj-escolher-o-cnae-ideal-e-pagar-menos-impostos/). Não é fonte oficial; confirmar com contador.
- Preço por temporada: oferta em `founder/offer.md` (R$ 2.000 por temporada de até 4 meses).

## Estimativas (marcadas como estimativa no arquivo)
- Câmbio US$ 1 = R$ 5,50.
- Simples Nacional ~6% sobre a nota. A alíquota real depende do faturamento de 12 meses da empresa inteira, do Fator R e do CNAE; cenários de 10% e 13,5% em `founder/cfo.md`.
- Contador: fora do modelo; a contabilidade já é da empresa.
- Horas por temporada: implantação 3 h, treinamento 1 h, primeira rodada 3 h, relatório 2 h, exportação 1 h, folga 1 h = 11 h.
- Suporte: 4 h ativas por mês em dia de jogo. Plantão disponível não é contado.
- Piloto: 6 h cada; 1 piloto que não converte para cada temporada vendida (conversão de 50%).
- Contrato atual: R$ 6.000/ano − R$ 360 de imposto − R$ 1.350 de horas (implantação 11 h + 4 meses × 4 h de suporte = 27 h × R$ 50) = R$ 4.290/ano, entra como custo fixo negativo de R$ 357,50/mês.
- Rampa: nenhuma temporada nova nos meses 1 a 3 (o primeiro campeonato precisa virar referência); depois uma temporada nova por mês, do mês 4 ao 11. Com 4 meses de duração, são 29 cidade-mês no ano 1.
- Inicial: advogado R$ 1.500; kit 10 h; visitas R$ 800. Total R$ 2.800. Sem CNPJ nem certificado, que a empresa já tem (suposição).
- Capacidade: 6 cidades em campeonato ao mesmo tempo para uma pessoa só dando suporte em dia de jogo.
