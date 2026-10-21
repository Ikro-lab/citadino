# Operação: Temporada Ao Vivo (Citadino)

Base: `founder/offer.md`, `founder/numbers.json`, `founder/cfo.md` e o código do projeto (lido em 2026-10-21). Não é aconselhamento jurídico, tributário nem contábil.

## 0. Achado do código que muda a operação

**Os documentos dos atletas estão públicos.** `src/lib/storage.ts` salva todo upload no Vercel Blob com `access: "public"`. Isso inclui documento de identidade e comprovante de residência, muitos de menores. O nome do arquivo é um UUID aleatório, difícil de adivinhar, mas qualquer pessoa com o link abre o arquivo sem login. Links vazam: são encaminhados no WhatsApp, ficam em histórico e aparecem em print.

- Isso contradiz a garantia da oferta ("termo de LGPD pronto para a TI e a procuradoria").
- O Vercel Blob tem armazenamento privado. A correção é salvar documentos como privados e servir por uma rota que checa o login de admin ou treinador. Fotos de perfil e escudos podem continuar públicos.
- **Prioridade 1, antes de vender a próxima cidade e antes de o termo de LGPD ser assinado.** Não mexi no código.

**Não há rotina de backup do banco.** O plano gratuito do Turso restaura só o último dia ([Turso pricing](https://turso.tech/pricing.md)). Um erro apagado no sábado e descoberto na segunda já não volta. Ver a rotina semanal na seção 4.

## 1. O ciclo de trabalho

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

## 2. Fornecedores

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

## 3. Pessoas

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

## 4. Rotinas (uma página cada)

### R1. Implantar uma cidade nova (até 5 dias úteis, garantia da oferta)
1. Contrato assinado ou piloto combinado por escrito, com categoria e datas.
2. No super-admin, criar o tenant: slug, nome da prefeitura, cor primária e secundária, escudo. Conferir se o texto sobre a cor primária passa em contraste (ver `founder/brand.md`).
3. Criar campeonato, categorias, formato e prazo de inscrição.
4. Gerar os links de cadastro de treinador e mandar ao organizador.
5. Treinamento de 1 hora com o organizador: lançar lance, encerrar partida, WO, lançar depois do papel se cair o sinal.
6. Mandar a mensagem de "site no ar" (modelo em `founder/brand.md`, item 3).
7. Anotar a data. Se passar de 5 dias úteis por sua causa, a temporada não é cobrada.

### R2. Dia de jogo
1. Duas horas antes: abrir o site de cada cidade com jogo e conferir o feed e o login de admin.
2. Avisar o backup de plantão: "jogos hoje em X e Y, das 19h às 23h".
3. Durante os jogos: WhatsApp aberto e resposta em até 2 horas. Se o organizador estiver sem sinal: "anota no papel e lança quando o sinal voltar, sem encerrar a partida".
4. Ao fim: conferir a classificação e os suspensos de cada cidade.
5. Registrar horas e problemas na planilha de operação.

### R3. Reclamação
1. Responder em até 2 horas em dia de jogo e no mesmo dia útil nos outros dias.
2. Reproduzir o problema antes de responder o porquê.
3. Corrigir o dado ou o sistema.
4. Responder com o modelo de `founder/brand.md`, item 5: o que houve, desde quando está certo e o que mudou. Sem culpar o organizador.
5. Se for erro do sistema, registrar a causa e o teste que impede a repetição.

### R4. Fim de temporada
1. Relatório para o prefeito: atletas, times, jogos, gols, gols com vídeo, inscritos nas notificações, votos na enquete.
2. Exportar os dados em planilha: atletas, times, jogos, súmulas e inscrições.
3. Perguntar por escrito: renovar, manter os dados para a próxima temporada ou excluir?
4. Se for excluir: apagar os registros e os arquivos do Blob, e confirmar a exclusão por escrito.
5. Pedir autorização para citar a cidade como referência.

### R5. Rotina semanal (segunda-feira)
1. **Backup:** exportar o banco do Turso (`turso db shell <banco> .dump > backup-AAAA-MM-DD.sql`) e guardar criptografado fora da Vercel e do Turso. Testar a restauração uma vez por mês.
2. Conferir o uso do Vercel Blob e da Vercel contra o incluído no plano.
3. Conferir as notas emitidas e os pagamentos recebidos.
4. Os três números de marketing: conversas, pilotos e conversão (`founder/marketing.md`).
5. Atualizar a planilha de horas e comparar com a premissa do CFO de 4 horas por cidade por mês.

## 5. Ferramentas

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

## 6. Registros, certidões e regras

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

## 7. Registro de riscos

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
