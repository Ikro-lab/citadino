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

- **Estilo:** minimalista, limpo, bastante espaço em branco (whitespace), tipografia simples e legível, poucos elementos decorativos.
- **Cor de destaque:** laranja (ex: `#FF6A00` ou similar), usada em botões primários, links ativos, ícones de destaque, badges de "AO VIVO", e estados ativos de navegação.
- **Cores base:** neutras (branco, cinza claro para fundo, cinza escuro/preto para texto), para que o laranja se destaque sem poluir a interface.
- **Componentes:** cards com cantos arredondados, sombras suaves, ícones simples (ex: lucide-react), sem excesso de bordas ou gradientes.

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
- Gerenciar o elenco do seu time: incluir, editar e remover atletas (nome, número da camisa, posição, foto opcional).
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
- Lista as partidas do dia (e permite navegar para dias anteriores/próximos).
- Cada item do feed mostra: escudos/nomes dos times, placar (ou horário, se ainda não iniciada), status (agendada / ao vivo / encerrada), categoria.
- Partidas "ao vivo" destacadas com um indicador visual (badge laranja pulsante, por exemplo).
- Clique no card da partida leva à página de detalhes da partida.

### Página de Detalhes da Partida
- Placar final e times envolvidos (destacando o vencedor).
- Linha do tempo/lista de momentos da partida: gols (com autor e minuto), cartões amarelos/vermelhos (com jogador e minuto), outros eventos relevantes.
- Estatísticas básicas se disponíveis (ex: escanteios, faltas — opcional, conforme o que for coletado).
- Escalação ou lista de atletas relacionados de cada time (opcional/expansível).

### Tabela de Classificação
- Calculada **automaticamente** a partir dos resultados registrados: pontos, jogos, vitórias, empates, derrotas, gols pró, gols contra, saldo de gols.
- Ordenação padrão por pontos, com critérios de desempate (saldo de gols, gols pró, confronto direto — a definir).
- Separada por categoria/divisão.

### Painel Administrativo (Admin)
- Dashboard com visão geral (próximas partidas, pendências de resultados, etc.).
- CRUD de: campeonatos/temporadas, categorias, times, treinadores, atletas, partidas.
- Tela de "súmula da partida" para lançar/editar gols, cartões e outros eventos, com opção de fazer isso em tempo real (ao vivo) ou posteriormente.
- Gerenciamento de solicitações de treinadores (aprovar/recusar criação de novos times).

### Painel do Treinador
- Área restrita mostrando apenas o(s) time(s) sob sua responsabilidade.
- Gestão do elenco (adicionar/remover/editar atletas).
- Visualização das partidas do seu time e, quando autorizado, lançamento de eventos ao vivo da partida em andamento.

## Registro de Eventos da Partida (Ao Vivo + Pós-jogo)

- Interface para registrar, durante o jogo, gols (time, atleta, minuto), cartões (time, atleta, tipo, minuto) e outros eventos, atualizando o placar e o feed público em tempo real (ex: via polling ou websockets/Server-Sent Events).
- Após o encerramento, o admin pode revisar e corrigir qualquer informação lançada.
- Todo evento registrado alimenta automaticamente a tabela de classificação e a página de detalhes da partida.

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
2. Modelo de dados (entidades: Campeonato, Categoria, Time, Atleta, Treinador, Partida, Evento da Partida, Classificação).
3. Sistema de autenticação com controle de papéis (Admin / Treinador).
4. Componentes de UI reutilizáveis seguindo o design system minimalista com destaque em laranja.
5. Lógica de cálculo automático da tabela de classificação.
6. Sistema de notificações push (Web Push/PWA) com inscrição por time/categoria, sem exigir login.
