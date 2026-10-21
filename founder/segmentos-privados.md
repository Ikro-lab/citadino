# Clientes fora das prefeituras: análise de segmentos

Data: 2026-10-21. Fontes:
- Pesquisa pública com links, resumida abaixo.
- Modelo do CFO (`.claude/skills/founder-cfo/unit_economics.py`).
- Painel de 20 compradores simulados de ligas privadas (`founder/segmentos/ligas-privadas/`).

O painel é de compradores simulados, e os números são projeções. Use isto para escolher o que testar com gente de verdade.

## 1. Os sete segmentos

| Segmento | Quem paga | Dinheiro que circula (exemplos reais) | Como fazem hoje | Encaixe com o Citadino |
|---|---|---|---|---|
| **A. Arenas e quadras de aluguel** com liga própria | dono da arena | R$ 45 a R$ 80 por time por jogo ([Copa Arena Society](https://www.copafacil.com/-lwm1p2vl5tycaqrnclx/info/en), [Arena São Gabriel](https://www.colunapontodevista.com/2025/02/arena-sao-gabriel-recebe-campeonato.html)) | Copa Fácil grátis | fraco: a dor é encher horário, não súmula |
| **B. Ligas privadas pagas** (futsal amador e várzea) | organizador, com inscrição e patrocínio | 16 times × R$ 1.300 ([Copa Gazeta de Futsal](https://gazetasbs.com.br/copa-gazeta-de-futsal-inicia-em-marco-com-mais-de-r-27-mil-em-premiacao/)); R$ 2.000 por time ([Paranaense Amador](https://dcmais.com.br/esportes/campeonato-de-futsal-vai-distribuir-r-300-mil-em-premios-para-amadores/)); várzea de bairro de R$ 300 a R$ 800 | Copa Fácil, planilha, WhatsApp, site próprio | **forte nas ligas grandes**: elegibilidade, suspensões, vitrine para patrocinador |
| **C. Ligas regionais filiadas** | quem paga a inscrição por categoria é a **prefeitura** (R$ 800, [Agrolândia/SC](https://agrolandia.sc.gov.br/uploads/sites/307/2026/03/DOCUMENTOS-COMPROBATORIOS.pdf)) | inscrição por categoria, mais arbitragem por jogo | **já usam sistema** (ex.: Ritmo do Esporte) | forte, mas tem concorrente e o dinheiro é municipal |
| **D. Escolas particulares e ligas escolares** | escola ou família, por atleta (R$ 50 por atleta + R$ 25 por jogo, [Liga Goianiense Escolar](https://painel.sporti.com.br//Documentos/2025/liga-goianiense-de-futsal-escolar-sub-12/Regulamento/liga-goianiense-de-futsal-escolar-sub-12.pdf)) | 25.182 escolas privadas com fundamental ([IBGE](https://anuario.ibge.gov.br/images/aeb/2024/s2/2_pdf/s2t4202.pdf)) | Sporti, PDF | bom: documento e matrícula, pais acompanhando |
| **E. Atléticas e jogos universitários** | produtora do evento; o aluno paga pacote de R$ 200 a R$ 480 | evento de fim de semana; Copa Inter Atléticas com 80 atléticas ([Máquina do Esporte](https://maquinadoesporte.com.br/mercado/copa-inter-atleticas-movimenta-r-35-milhoes-e-busca-profissionalizar-torneios-universitarios)) | produtora, Cheers, YouTube | médio: o dinheiro fica com a produtora, e o evento é curto |
| **F. Corporativo** (SESI, associações empresariais, RH) | empresa | R$ 450 por modalidade ([SESI Jundiaí](https://regional.ciesp.com.br/jundiai/files/2025/03/2-JOGOS-DO-SESI-2025-APRESENTACAO-CIESP.pdf)); R$ 1.200 por equipe ([Copa ACATE](https://acate.com.br/wp-content/uploads/2024/08/Regulamento-COPA-ACATE-SEINFLO-2024.pdf)) | o SESI organiza; o RH improvisa | médio: paga bem, mas é difícil de alcançar e o torneio é "bom ter" |
| **G. Escolinhas e franquias** | pais, pela mensalidade | sem total nacional; redes de 30 a 60 unidades | festivais próprios, copas municipais grátis | médio: perfil e vídeo ajudam a reter o pai pagante |

Vender direto para pais e atletas não tem preço validado no Brasil. Não achei nenhum caso público de pai pagando por estatística amadora.

## 2. A conta que filtra os segmentos

Hoje o produto não tem cadastro próprio do organizador nem cobrança online, e todo campeonato é criado por você no super-admin. O formato vendável agora é a cobrança **por edição**, com você configurando o campeonato.

Modelo do CFO por edição de 4 meses, com 2 h de implantação, R$ 50 por hora e 6% de imposto:

| Preço por edição | Suporte por mês | Sobra por edição |
|---|---|---:|
| R$ 400 | 1 h | R$ 76 |
| R$ 600 | 1 h | R$ 264 |
| R$ 600 | 3 h | −R$ 136 |
| R$ 1.000 | 2 h | R$ 440 |

Para comparar, uma temporada de prefeitura deixa cerca de R$ 1.600 (4 × R$ 401, `founder/cfo.md`).

**O piso prático é R$ 600 por edição, com até 1 hora de suporte por mês.** Abaixo disso, um campeonato privado custa mais em horas do que paga. Os segmentos com teto de preço menor que isso (arenas, várzea de bairro, copa curta) só funcionam depois que existir autoatendimento. Construir o autoatendimento custa cerca de R$ 4.800 em horas, entre cadastro próprio, cobrança online e termos. Com ele, o cenário do CFO dá de R$ 61 a R$ 197 por campeonato por mês, mas depende de volume. Ou seja, depende de marketing que hoje não existe.

## 3. Painel: 20 organizadores de ligas privadas, oferta de R$ 800 por edição

**4 compram e 16 passam (20%).** No painel original das prefeituras, a compra foi de 9%; no re-teste da oferta atual, 35%.

| Grupo | Compram |
|---|---:|
| Liga de futsal amador regional (16 a 32 times, inscrição de R$ 1.000 a R$ 2.000) | **3 de 7** |
| Liga de bairro ou várzea | 1 de 7 |
| Copa curta (verão, feriado) | 0 de 3 |
| Arena com liga própria | 0 de 3 |
| Comportamento "vive de patrocínio" | **3 de 3** |
| Comportamento "já usa Copa Fácil grátis" | 0 de 6 |

**Faixa de preço (Van Westendorp), por edição:**

| | Aceitável | Indiferença | "Caro" mediano | "Caro demais" mediano |
|---|---|---:|---:|---:|
| Ligas regionais (7) | R$ 154 a R$ 1.204 | R$ 499 | R$ 1.000 | R$ 1.800 |
| Demais (13) | R$ 149 a R$ 597 | R$ 351 | R$ 450 | R$ 700 |

Os R$ 800 cabem para a liga regional e ficam acima do teto dos outros. Isso bate com o piso de R$ 600 da conta do CFO: só a liga regional paga o suficiente.

**O que mais apareceu (palavras-chave, entre 20):**
- **18 de 20:** o sistema precisa se pagar com patrocínio no mesmo campeonato. É o argumento que vende, e quem vive de patrocínio comprou.
- **14 de 20:** queriam testar antes ou pagar só depois de funcionar ("rodar a primeira edição e só pagar se vender essa cota").
- **10 de 20:** "os capitães vão mandar o documento no WhatsApp e eu vou cadastrar tudo sozinho".
- **10 de 20:** dúvida se o mesário de várzea vai lançar a súmula no celular.
- **9 de 20:** "uma pessoa só por trás do sistema". É a mesma objeção dominante do re-teste das prefeituras.
- **5 de 20:** preço de liga longa para copa curta não serve; pedem de R$ 250 a R$ 300 por evento.
- **2 de 20:** transmitem pelo Instagram, e o vídeo automático de gol só funciona com YouTube.

O ponto mais útil veio da arena (P009): **cobrar a inscrição dos times por Pix e mostrar quem está devendo**. Também apareceu na pesquisa como a dor nº 1 das arenas. É uma funcionalidade que o produto não tem e que trocaria "custo" por "ferramenta de receita".

## 4. Recomendação

1. **A prefeitura continua sendo o núcleo.** Ela paga cerca de 4 vezes mais por campeonato, e o produto já foi desenhado para ela.
2. **Primeiro segmento privado: ligas de futsal amador regionais** (16 a 32 times, inscrição de R$ 1.000 ou mais, que vivem de patrocínio). A dor é a mesma, o produto serve sem mudar e o preço cabe. A oferta:
   - R$ 800 a R$ 1.000 por edição, com você configurando o campeonato.
   - **Pagamento na metade da edição.** Isso responde a "pagar só depois de funcionar" sem dar o produto de graça.
   - Um **kit de patrocínio**: proposta de cota master e de apoio que a liga mostra ao patrocinador, com os números de acesso e de inscritos no push da edição anterior. Para isso, o analytics precisa estar ligado.
   - **Importação dos atletas** a partir da planilha do organizador na primeira edição. Responde a "vou cadastrar tudo sozinho" e custa umas 2 horas suas.
3. **Segundo, como canal: ligas regionais filiadas.** O dinheiro delas é das prefeituras, e uma liga atende dezenas de municípios. Vender para a liga pode levar o Citadino a várias cidades de uma vez. A dificuldade é que algumas já usam sistema.
4. **Não agora:** arenas, várzea de bairro, copas curtas e atléticas. O teto de preço delas (R$ 350 a R$ 600) fica abaixo do piso de R$ 600 com o produto atual. Elas só fazem sentido depois do autoatendimento e da cobrança de inscrição por Pix.
5. **Para observar:** corporativo, pelo SESI regional e por associações como a ACATE. Paga bem, de R$ 450 a R$ 1.200 por equipe, mas não testei no painel.

## 5. O que testar com gente de verdade

- Fale com 5 organizadores de ligas regionais de futsal, achados pelo Instagram e pelos campeonatos públicos no Copa Fácil, com a oferta acima. Meta: 1 edição paga até 31/03/2027.
- Pergunte a eles se pagariam mais por **cobrança de inscrição por Pix dentro do sistema**. Se a resposta for sim, essa funcionalidade abre os segmentos mais baratos.
- Responda antes a objeção "uma pessoa só". O plantão de backup de `founder/ops.md` vale para os dois públicos.
