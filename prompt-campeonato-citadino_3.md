# Prompt: Site do Campeonato de Futsal "Citadino"

## Contexto e Objetivo

Crie um site (aplicação web) para gerenciar o **Campeonato Citadino**, um campeonato municipal de futsal. O site deve centralizar o gerenciamento de times, atletas, partidas e resultados, além de servir como um feed público para torcedores acompanharem os jogos do dia e seus detalhes.

**Prioridade de desenvolvimento: Mobile First.** A maior parte dos acessos será via celular, então toda a interface deve ser projetada primeiro para telas pequenas (320–428px) e depois expandida progressivamente para tablet e desktop, usando breakpoints responsivos. Elementos de toque (botões, cards, links) devem ter área mínima confortável para dedo (44x44px), navegação simplificada (ex: bottom navigation bar ou menu hambúrguer), e carregamento leve/rápido.

## Stack Técnica

- **Framework:** Next.js (React), utilizando App Router.
- **Backend/Dados:** API Routes ou Server Actions do próprio Next.js, com um banco de dados relacional (ex: PostgreSQL) via um ORM como Prisma.
- **Autenticação:** sistema de login com controle de papéis (roles) — ver seção de perfis de usuário abaixo.
- **Estilização:** Tailwind CSS, seguindo um design system minimalista.

## Identidade Visual

Estilo inspirado no site da Prefeitura de Cidreira (cidadedecidreira.rs.gov.br), adaptado para o Campeonato Citadino:

- **Estilo geral:** visual limpo e organizado, mas com um toque vivo e amigável — não é um minimalismo estrito de galeria de arte, e sim um minimalismo "acolhedor", com espaço em branco generoso e uso pontual de formas decorativas.
- **Paleta de cores:**
  - **Laranja (cor primária):** ex: `#F5821F` ou similar — usado em botões primários, links ativos, ícones de destaque, badges de "AO VIVO", navegação ativa e no logotipo/nome do campeonato.
  - **Verde-menta/teal (cor secundária):** usado em formas decorativas orgânicas, badges secundários (ex: "Aprovado", "Encerrado") e pequenos acentos visuais, sem competir com o laranja em elementos de ação principal.
  - **Azul-marinho escuro (cor de destaque/contraste):** reservado para blocos de destaque específicos — ex: um banner de divulgação, card de patrocinador, ou seção de "próxima rodada" — para criar contraste pontual sem virar a cor dominante do site.
  - **Neutras:** branco e cinza claro para fundos, cinza escuro/preto para texto, mantendo legibilidade e leveza.
- **Formas orgânicas/ondas:** usar blobs e ondas suaves (SVG) como elementos decorativos de fundo/transição entre seções (ex: separando o topo do feed, atrás do cabeçalho, ou como fundo sutil de cards de destaque) — nos tons de laranja, verde-menta e/ou azul-marinho, sem prejudicar a leitura do conteúdo por cima.
- **Tipografia:** fonte sans-serif arredondada e amigável (ex: Poppins, Nunito ou Quicksand), com pesos mais bold em títulos/nome do campeonato e pesos regulares no corpo do texto.
- **Botões e componentes:** cantos levemente arredondados (não em formato pílula) — ex: `border-radius` de 8–12px, mantendo consistência com cards, inputs e badges. Sombras suaves, ícones simples (ex: lucide-react), sem gradientes pesados.
- **Barra de busca/inputs:** campos com cantos arredondados (mesmo raio dos botões), ícone integrado (ex: lupa para busca de times/jogadores), inspirados na barra de busca do site de referência.

## Perfis de Usuário (Roles)

### 1. Administrador (Admin)
- Acesso total ao painel administrativo.
- Criar, editar e excluir: campeonatos/temporadas, categorias/divisões, times, partidas, rodadas/tabelas.
- Cadastrar times e vincular um treinador responsável a cada time.
- Aprovar/gerenciar solicitações de treinadores que se cadastrarem por conta própria e quiserem criar um time.
- Definir datas, horários e locais das partidas.
- Registrar e editar resultados, súmulas (gols, cartões, momentos da partida) — tanto ao vivo quanto após o jogo.
- Gerenciar usuários (treinadores) e permissões.

### 2. Treinador
- Cadastro próprio (self-service), podendo solicitar a criação de um novo time (sujeito à aprovação do admin) OU ser vinculado a um time já criado pelo admin.
- Após criar/assumir o time, o treinador pode **gerar um link (ou código) de convite** e compartilhá-lo com os atletas para que eles próprios façam a inscrição no time (ver seção "Inscrição de Atletas via Convite").
- Gerenciar o elenco do seu time: revisar/aprovar inscrições recebidas via convite, além de incluir, editar e remover atletas manualmente (nome, número da camisa, posição, foto opcional).
- Visualizar as partidas do seu time (agenda, resultados, estatísticas).
- Registrar/atualizar eventos da partida ao vivo (gols, cartões, substituições) quando autorizado pelo admin para aquela partida, sujeito a validação/edição posterior do admin.

### 3. Torcedor / Público geral (sem login)
- Acesso livre e sem necessidade de conta a todo o conteúdo público: feed de partidas, resultados, tabela de classificação, detalhes de cada partida.
- Não há área restrita para este perfil — toda a navegação pública é aberta.

## Estrutura de Categorias/Divisões

O campeonato deve suportar **múltiplas categorias/divisões simultâneas** (ex: Masculino Livre, Feminino, Sub-17, Master, etc.), cada uma com:
- Sua própria tabela de classificação.
- Seus próprios times, partidas e rodadas.
- Um seletor de categoria visível no feed e na tabela, para o usuário alternar entre elas facilmente (ex: abas ou dropdown no topo, adaptado para mobile).

## Funcionalidades Principais

### Feed de Partidas (página inicial pública)

Inspirado nos padrões de UX e visual do Sofascore, adaptados à identidade do Citadino:

- **Faixa de datas horizontal:** navegação por dias em uma faixa rolável (ex: "Ontem", "Hoje", "Amanhã", com as demais datas visíveis ao lado), mais um ícone de calendário para pular direto para uma data específica. O dia selecionado fica destacado com a cor primária (laranja).
- **Filtro "Todos / Ao vivo":** dois toggles simples no topo do feed — "Todos" mostra a programação completa do dia; "Ao vivo" filtra só as partidas em andamento naquele momento.
- Cada item do feed mostra: escudos/nomes dos times, placar (ou horário, se ainda não iniciada), status (agendada / ao vivo / encerrada), categoria.
- Partidas "ao vivo" destacadas com um indicador pulsante e o **minuto em tempo real** da partida (não apenas um badge estático "AO VIVO").
- **Indicador de forma recente do time:** ao lado do nome de cada time no feed (ou na página do time), uma sequência de pequenas bolinhas coloridas representando os últimos resultados — verde (vitória), cinza (empate), vermelho (derrota) — do mais antigo ao mais recente.
- Clique no card da partida leva à página de detalhes da partida.

**Estilo visual do feed (inspirado no Sofascore):**
- Layout **denso e compacto**, priorizando mostrar várias partidas por tela sem exigir muita rolagem — linhas de jogo enxutas, com bom aproveitamento do espaço vertical (importante no mobile).
- Uso de **cores semânticas consistentes** para resultado: verde para vitória, vermelho para derrota/ao vivo, cinza para empate — aplicadas nos indicadores de forma, minutos ao vivo e badges de status.
- Cards e seções separados por **divisores sutis** (linhas finas ou leve variação de tom de fundo) em vez de bordas pesadas, mantendo a leitura rápida em listas longas.
- Tipografia com **hierarquia clara e compacta**: nomes de times e placares em peso mais forte, horários/metadados em cinza mais claro e fonte menor — seguindo a mesma família tipográfica arredondada definida na Identidade Visual, mas com tamanhos mais enxutos nesta seção específica de listagem.
- Ícones e escudos pequenos e nítidos (avatares circulares para os escudos dos times).
- Jogos agrupados por competição/categoria com uma **seta de expandir/recolher** por grupo.
- **Estrela de favorito** à direita de cada linha de jogo, para seguir o time rapidamente (conecta com as notificações push).

**Tema Claro / Escuro (light/dark mode):**
- O site deve ter **tema claro como padrão**, seguindo a identidade visual já definida (fundo branco/cinza claro, laranja/verde-menta/azul-marinho).
- Deve haver também um **tema escuro opcional**, ativado por um botão de alternância (ícone de sol/lua, visível no cabeçalho), inspirado diretamente no visual do Sofascore:
  - Fundo principal quase preto/azul-marinho bem escuro (ex: `#12141C`), com painéis/cards em um tom ligeiramente mais claro para criar profundidade (ex: `#1B1E29`).
  - Texto principal em branco/quase-branco, texto secundário (horários, status) em cinza claro.
  - A cor laranja da marca se mantém como destaque principal (botões, links ativos, indicadores "ao vivo"), preservando a identidade do Citadino mesmo no modo escuro.
  - Verde-menta e azul-marinho da paleta secundária ajustados para tons ligeiramente mais claros/saturados no escuro, garantindo contraste adequado sobre o fundo escuro.
- A preferência de tema deve ser salva localmente no dispositivo do usuário (sem exigir login), respeitando também a preferência do sistema operacional (`prefers-color-scheme`) na primeira visita.

### Página de Detalhes da Partida
- Navegação em **abas horizontais** no topo (estilo Sofascore): **Detalhes** (placar, times, momentos resumidos) | **Linha do Tempo** (timeline completa de gols, cartões e outros eventos) | **Escalação** (elenco relacionado de cada time) | **Classificação** (tabela da categoria, com destaque para os dois times da partida).
- Aba "Detalhes": placar final e times envolvidos (destacando o vencedor), resumo dos principais momentos.
- Aba "Linha do Tempo": lista cronológica de gols (com autor e minuto), cartões amarelos/vermelhos (com jogador e minuto), outros eventos relevantes. **O nome de cada atleta citado é clicável e leva ao seu perfil público.**
- Aba "Escalação": lista de atletas relacionados de cada time, também com nomes clicáveis para o perfil.
- Aba "Classificação": tabela de classificação da categoria daquela partida, sem precisar sair da tela.
- Estatísticas básicas se disponíveis (ex: escanteios, faltas — opcional, conforme o que for coletado).

### Tabela de Classificação
- Calculada **automaticamente** a partir dos resultados registrados: pontos, jogos, vitórias, empates, derrotas, gols pró, gols contra, saldo de gols.
- Ordenação padrão por pontos, com critérios de desempate (saldo de gols, gols pró, confronto direto — a definir).
- Separada por categoria/divisão.
- Suporte a **múltiplos formatos de disputa**, configuráveis por categoria:
  - Pontos corridos (todos contra todos).
  - Fase de grupos + mata-mata (eliminatórias, com definição de quantos classificam por grupo).
  - Ida e volta.
  - Quando houver fase de mata-mata, exibir um chaveamento visual (bracket) simples, mobile-friendly (rolagem horizontal), mostrando confrontos e avanços.

### Ranking de Artilheiros e Cartões
- Lista pública dos maiores goleadores do campeonato (ou da categoria selecionada), atualizada automaticamente a cada gol registrado.
- Lista/indicador de jogadores **"pendurados"**: atletas próximos de cumprir suspensão automática por acúmulo de cartões amarelos (ex: a cada 3 cartões amarelos, 1 jogo de suspensão — regra configurável pelo admin).
- Indicação visual de atletas suspensos para a próxima partida (não podem ser relacionados na súmula daquele jogo).

### Perfil Público do Atleta
- Página individual de cada atleta, acessível a partir do elenco do time, do ranking de artilheiros e **clicando no nome do atleta em qualquer lugar que ele apareça na partida** (linha do tempo de gols/cartões, escalação, etc.) — o nome deve funcionar como link direto para esse perfil.
- Exibe: nome, foto, número da camisa, posição, time e categoria, além de estatísticas: gols marcados, cartões recebidos, jogos disputados.
- **Instagram do atleta (opcional):** campo configurável pelo próprio atleta (na inscrição via convite) ou pelo treinador/admin, exibido como um ícone/botão no perfil que abre o perfil do Instagram em uma nova aba. Se o campo não for preenchido, o ícone simplesmente não aparece.
- Nunca exibe dados sensíveis do cadastro (documento de identidade, comprovante de endereço, data de nascimento completa — se aplicável, mostrar apenas idade).

### Enquetes da Rodada
- Após cada rodada, disponibilizar uma enquete simples e pública (sem login) para eleger o **"Melhor Jogador da Rodada"**, com opções pré-definidas pelo admin (ex: os atletas que marcaram gols na rodada).
- Resultado da enquete exibido no feed ou em uma seção dedicada, com atualização em tempo real da contagem de votos.
- Mecanismo simples anti-fraude (ex: limite de 1 voto por dispositivo/sessão), já que não há login de torcedor.

### Regulamento do Campeonato
- O admin pode fazer upload de um **PDF do regulamento oficial** do Campeonato Citadino (regras, critérios de desempate, tabela de punições, formato de disputa, etc.), um por campeonato/temporada (podendo variar por categoria, se necessário).
- O regulamento fica acessível publicamente, sem necessidade de login, com um link/botão de destaque (ex: no rodapé do site ou na página da categoria), permitindo visualizar no navegador ou baixar o arquivo.
- O admin pode substituir o PDF a qualquer momento (ex: em caso de retificação de regras), mantendo sempre a versão vigente disponível.

### Painel Administrativo (Admin)
- Dashboard com visão geral (próximas partidas, pendências de resultados, etc.).
- CRUD de: campeonatos/temporadas, categorias, times, treinadores, atletas, partidas.
- Tela de "súmula da partida" para lançar/editar gols, cartões e outros eventos, com opção de fazer isso em tempo real (ao vivo) ou posteriormente.
- Gerenciamento de solicitações de treinadores (aprovar/recusar criação de novos times).

### Painel do Treinador
- Área restrita mostrando apenas o(s) time(s) sob sua responsabilidade.
- Gestão do elenco (adicionar/remover/editar atletas).
- Visualização das partidas do seu time e, quando autorizado, lançamento de eventos ao vivo da partida em andamento.

## Inscrição de Atletas via Convite

Para agilizar a montagem do elenco, o treinador deve poder convidar atletas para se inscreverem sozinhos no time, sem precisar cadastrar cada um manualmente:

- Ao criar o time, o treinador gera um **link (ou código/QR Code) de convite** exclusivo daquele time, compartilhável por WhatsApp ou redes sociais.
- O atleta acessa o link, preenche um formulário de inscrição **sem necessidade de conta/login prévio**, informando obrigatoriamente:
  - Nome completo.
  - Data de nascimento.
  - Foto de um documento de identificação (upload de imagem, ex: RG/CNH).
  - Comprovante de endereço (upload de imagem/PDF).
  - Instagram (opcional), para exibição no perfil público.
- A inscrição enviada fica com status **"pendente"** até ser revisada.
- O **treinador** recebe a inscrição no seu painel e pode aprovar ou recusar, atribuindo número de camisa e posição na aprovação.
- O **admin** tem visibilidade de todas as inscrições pendentes/aprovadas de todos os times, podendo auditar ou revogar uma inscrição se necessário (ex: documentação inconsistente).
- Os documentos enviados (documento de identidade e comprovante de endereço) devem ser armazenados de forma segura. Como envolvem dados sensíveis, considerar: acesso restrito a admin/treinador do próprio time, criptografia em repouso, e conformidade com a LGPD (finalidade declarada, tempo de retenção definido, possibilidade de exclusão a pedido do titular).
- Após aprovado, o atleta passa a compor o elenco do time normalmente, aparecendo no ranking de artilheiros, súmulas e perfil público (exceto os dados sensíveis, que nunca são exibidos publicamente).

## Registro de Eventos da Partida (Ao Vivo + Pós-jogo)

- Interface para registrar, durante o jogo, gols (time, atleta, minuto), cartões (time, atleta, tipo, minuto) e outros eventos, atualizando o placar e o feed público em tempo real (ex: via polling ou websockets/Server-Sent Events).
- Após o encerramento, o admin pode revisar e corrigir qualquer informação lançada.
- Todo evento registrado alimenta automaticamente a tabela de classificação e a página de detalhes da partida.

### Clipe de Vídeo do Gol (duração configurável)
- Ao registrar um **gol**, o treinador/admin deve ter a opção (não obrigatória) de anexar um **clipe curto de vídeo** capturando o momento da jogada, com duração ajustável (ex: padrão de 15 a 30 segundos, configurável pelo admin nas definições do campeonato, com um teto máximo definido para controlar espaço de armazenamento).
- Fluxo de captura:
  - **Gravar na hora**, usando a câmera do celular diretamente pelo navegador/PWA, com corte automático ao atingir a duração máxima configurada.
  - **Enviar da galeria**, permitindo selecionar um vídeo já gravado e recortar (trim) livremente o trecho desejado, dentro do limite definido.
- O upload deve ocorrer em segundo plano (sem travar o registro do gol), com compressão do vídeo no cliente antes de enviar, para economizar dados móveis.
- Armazenamento em um serviço de object storage/CDN adequado para vídeo (ex: Cloudinary, Mux ou S3 + CloudFront), nunca diretamente no banco de dados.
- Exibição do clipe:
  - Inline na linha do tempo de "momentos da partida", junto ao evento do gol (com player de vídeo simples, com play/pause e tela cheia).
  - Também disponível no perfil público do atleta, como um "melhores momentos"/highlights com os gols que possuem clipe.
- Caso o clipe ainda não tenha sido enviado no momento em que o gol é registrado (ex: sem conexão boa em campo), permitir anexar o vídeo posteriormente através da tela de edição da súmula.

## Notificações Push

Mesmo sem exigir login para navegar, o site deve oferecer **notificações push opcionais** para torcedores, usando Web Push (compatível com PWA — instalável na tela inicial do celular). O usuário pode ativar as notificações sem precisar criar conta, apenas concedendo permissão do navegador.

- **Inscrição por preferência:** o torcedor escolhe acompanhar uma categoria e/ou um time específico (ex: "avisar sobre jogos do Time X" ou "avisar sobre todos os jogos da categoria Sub-17"), sem necessidade de login.
- **Gatilhos de notificação:**
  - Início de uma partida do time/categoria acompanhado ("Começou! Time A x Time B").
  - Gol marcado durante a partida ao vivo.
  - Cartão vermelho durante a partida (evento relevante).
  - Fim de partida, com o resultado final.
  - Lembrete configurável antes do início de uma partida agendada (ex: 30 min antes).
- **Painel Admin:** possibilidade de disparar notificações manuais/avisos gerais (ex: "Rodada de sábado adiada por causa da chuva").
- **Aspectos técnicos:** implementação via Service Worker + Web Push API (ou um provedor como Firebase Cloud Messaging), com as inscrições (subscriptions) armazenadas vinculadas às preferências de time/categoria escolhidas pelo dispositivo, e não a uma conta de usuário.

## Requisitos Não-Funcionais

- **Mobile first**, com testes de usabilidade priorizando telas pequenas antes de qualquer ajuste para desktop.
- Performance: carregamento rápido do feed e das páginas de partida (imagens otimizadas, lazy loading).
- Responsivo em todos os breakpoints (mobile, tablet, desktop).
- Acessibilidade básica: contraste adequado (especialmente considerando o laranja sobre fundos claros/escuros), tamanhos de fonte legíveis, navegação por teclado no painel admin.

## Entregáveis Esperados

1. Estrutura de páginas/rotas (públicas e autenticadas).
2. Modelo de dados (entidades: Campeonato, Categoria, Time, Atleta, Treinador, Partida, Evento da Partida, Classificação, Convite de Inscrição, Enquete/Voto).
3. Sistema de autenticação com controle de papéis (Admin / Treinador).
4. Componentes de UI reutilizáveis seguindo o design system minimalista com destaque em laranja.
5. Lógica de cálculo automático da tabela de classificação, incluindo suporte a fase de grupos + mata-mata.
6. Sistema de notificações push (Web Push/PWA) com inscrição por time/categoria, sem exigir login.
7. Fluxo de convite/inscrição de atletas (link ou QR Code), com upload seguro de documentos e aprovação pelo treinador/admin.
8. Ranking de artilheiros, controle de jogadores pendurados/suspensos e perfil público do atleta.
9. Sistema de enquetes da rodada ("Melhor Jogador da Rodada").
10. Captura/upload e reprodução de clipes de vídeo curtos (duração configurável) vinculados a gols, com armazenamento em object storage/CDN.
11. Upload e exibição pública do regulamento do campeonato em PDF, com substituição de versão pelo admin.
12. Alternância de tema claro/escuro (dark mode) no feed e no restante do site, com preferência salva localmente no dispositivo.
