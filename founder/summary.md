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
