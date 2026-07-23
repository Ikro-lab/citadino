-- CreateTable
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Atleta" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT,
    "nome" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "posicao" TEXT NOT NULL,
    "fotoUrl" TEXT,
    "documentoUrl" TEXT,
    "comprovanteEnderecoUrl" TEXT,
    "dataNascimento" DATETIME,
    "instagram" TEXT,
    "timeId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Atleta_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Atleta_timeId_fkey" FOREIGN KEY ("timeId") REFERENCES "Time" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Atleta" ("comprovanteEnderecoUrl", "createdAt", "dataNascimento", "documentoUrl", "fotoUrl", "id", "instagram", "nome", "numero", "posicao", "timeId") SELECT "comprovanteEnderecoUrl", "createdAt", "dataNascimento", "documentoUrl", "fotoUrl", "id", "instagram", "nome", "numero", "posicao", "timeId" FROM "Atleta";
DROP TABLE "Atleta";
ALTER TABLE "new_Atleta" RENAME TO "Atleta";
CREATE INDEX "Atleta_tenantId_idx" ON "Atleta"("tenantId");
CREATE UNIQUE INDEX "Atleta_timeId_numero_key" ON "Atleta"("timeId", "numero");
CREATE TABLE "new_Campeonato" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT,
    "nome" TEXT NOT NULL,
    "temporada" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "regulamentoUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Campeonato_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Campeonato" ("ativo", "createdAt", "id", "nome", "regulamentoUrl", "temporada", "updatedAt") SELECT "ativo", "createdAt", "id", "nome", "regulamentoUrl", "temporada", "updatedAt" FROM "Campeonato";
DROP TABLE "Campeonato";
ALTER TABLE "new_Campeonato" RENAME TO "Campeonato";
CREATE INDEX "Campeonato_tenantId_idx" ON "Campeonato"("tenantId");
CREATE TABLE "new_Categoria" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT,
    "nome" TEXT NOT NULL,
    "campeonatoId" TEXT NOT NULL,
    "formato" TEXT NOT NULL DEFAULT 'PONTOS_CORRIDOS',
    "classificadosPorGrupo" INTEGER,
    "cartoesParaSuspensao" INTEGER NOT NULL DEFAULT 3,
    "jogosSuspensao" INTEGER NOT NULL DEFAULT 1,
    "regulamentoUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Categoria_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Categoria_campeonatoId_fkey" FOREIGN KEY ("campeonatoId") REFERENCES "Campeonato" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Categoria" ("campeonatoId", "cartoesParaSuspensao", "classificadosPorGrupo", "createdAt", "formato", "id", "jogosSuspensao", "nome", "regulamentoUrl") SELECT "campeonatoId", "cartoesParaSuspensao", "classificadosPorGrupo", "createdAt", "formato", "id", "jogosSuspensao", "nome", "regulamentoUrl" FROM "Categoria";
DROP TABLE "Categoria";
ALTER TABLE "new_Categoria" RENAME TO "Categoria";
CREATE INDEX "Categoria_tenantId_campeonatoId_idx" ON "Categoria"("tenantId", "campeonatoId");
CREATE UNIQUE INDEX "Categoria_campeonatoId_nome_key" ON "Categoria"("campeonatoId", "nome");
CREATE TABLE "new_Enquete" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT,
    "categoriaId" TEXT NOT NULL,
    "rodada" INTEGER NOT NULL,
    "pergunta" TEXT NOT NULL DEFAULT 'Melhor Jogador da Rodada',
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Enquete_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Enquete_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Enquete" ("ativa", "categoriaId", "createdAt", "id", "pergunta", "rodada") SELECT "ativa", "categoriaId", "createdAt", "id", "pergunta", "rodada" FROM "Enquete";
DROP TABLE "Enquete";
ALTER TABLE "new_Enquete" RENAME TO "Enquete";
CREATE INDEX "Enquete_tenantId_idx" ON "Enquete"("tenantId");
CREATE TABLE "new_EnqueteOpcao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT,
    "enqueteId" TEXT NOT NULL,
    "atletaId" TEXT NOT NULL,
    CONSTRAINT "EnqueteOpcao_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EnqueteOpcao_enqueteId_fkey" FOREIGN KEY ("enqueteId") REFERENCES "Enquete" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EnqueteOpcao_atletaId_fkey" FOREIGN KEY ("atletaId") REFERENCES "Atleta" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_EnqueteOpcao" ("atletaId", "enqueteId", "id") SELECT "atletaId", "enqueteId", "id" FROM "EnqueteOpcao";
DROP TABLE "EnqueteOpcao";
ALTER TABLE "new_EnqueteOpcao" RENAME TO "EnqueteOpcao";
CREATE INDEX "EnqueteOpcao_tenantId_idx" ON "EnqueteOpcao"("tenantId");
CREATE UNIQUE INDEX "EnqueteOpcao_enqueteId_atletaId_key" ON "EnqueteOpcao"("enqueteId", "atletaId");
CREATE TABLE "new_EnqueteVoto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT,
    "enqueteId" TEXT NOT NULL,
    "opcaoId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EnqueteVoto_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EnqueteVoto_enqueteId_fkey" FOREIGN KEY ("enqueteId") REFERENCES "Enquete" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EnqueteVoto_opcaoId_fkey" FOREIGN KEY ("opcaoId") REFERENCES "EnqueteOpcao" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_EnqueteVoto" ("createdAt", "deviceId", "enqueteId", "id", "opcaoId") SELECT "createdAt", "deviceId", "enqueteId", "id", "opcaoId" FROM "EnqueteVoto";
DROP TABLE "EnqueteVoto";
ALTER TABLE "new_EnqueteVoto" RENAME TO "EnqueteVoto";
CREATE INDEX "EnqueteVoto_tenantId_idx" ON "EnqueteVoto"("tenantId");
CREATE UNIQUE INDEX "EnqueteVoto_enqueteId_deviceId_key" ON "EnqueteVoto"("enqueteId", "deviceId");
CREATE TABLE "new_EventoPartida" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT,
    "partidaId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "minuto" INTEGER NOT NULL,
    "timeId" TEXT NOT NULL,
    "atletaId" TEXT,
    "descricao" TEXT,
    "videoUrl" TEXT,
    "lancadoPorId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EventoPartida_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EventoPartida_partidaId_fkey" FOREIGN KEY ("partidaId") REFERENCES "Partida" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EventoPartida_timeId_fkey" FOREIGN KEY ("timeId") REFERENCES "Time" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "EventoPartida_atletaId_fkey" FOREIGN KEY ("atletaId") REFERENCES "Atleta" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "EventoPartida_lancadoPorId_fkey" FOREIGN KEY ("lancadoPorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_EventoPartida" ("atletaId", "createdAt", "descricao", "id", "lancadoPorId", "minuto", "partidaId", "timeId", "tipo", "videoUrl") SELECT "atletaId", "createdAt", "descricao", "id", "lancadoPorId", "minuto", "partidaId", "timeId", "tipo", "videoUrl" FROM "EventoPartida";
DROP TABLE "EventoPartida";
ALTER TABLE "new_EventoPartida" RENAME TO "EventoPartida";
CREATE INDEX "EventoPartida_tenantId_idx" ON "EventoPartida"("tenantId");
CREATE TABLE "new_Grupo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT,
    "nome" TEXT NOT NULL,
    "categoriaId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Grupo_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Grupo_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Grupo" ("categoriaId", "createdAt", "id", "nome") SELECT "categoriaId", "createdAt", "id", "nome" FROM "Grupo";
DROP TABLE "Grupo";
ALTER TABLE "new_Grupo" RENAME TO "Grupo";
CREATE INDEX "Grupo_tenantId_idx" ON "Grupo"("tenantId");
CREATE UNIQUE INDEX "Grupo_categoriaId_nome_key" ON "Grupo"("categoriaId", "nome");
CREATE TABLE "new_InscricaoAtleta" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT,
    "timeId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "dataNascimento" DATETIME NOT NULL,
    "instagram" TEXT,
    "fotoUrl" TEXT NOT NULL,
    "documentoUrl" TEXT NOT NULL,
    "comprovanteEnderecoUrl" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "atletaId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revisadoEm" DATETIME,
    CONSTRAINT "InscricaoAtleta_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "InscricaoAtleta_timeId_fkey" FOREIGN KEY ("timeId") REFERENCES "Time" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "InscricaoAtleta_atletaId_fkey" FOREIGN KEY ("atletaId") REFERENCES "Atleta" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_InscricaoAtleta" ("atletaId", "comprovanteEnderecoUrl", "createdAt", "dataNascimento", "documentoUrl", "fotoUrl", "id", "instagram", "nome", "revisadoEm", "status", "timeId") SELECT "atletaId", "comprovanteEnderecoUrl", "createdAt", "dataNascimento", "documentoUrl", "fotoUrl", "id", "instagram", "nome", "revisadoEm", "status", "timeId" FROM "InscricaoAtleta";
DROP TABLE "InscricaoAtleta";
ALTER TABLE "new_InscricaoAtleta" RENAME TO "InscricaoAtleta";
CREATE UNIQUE INDEX "InscricaoAtleta_atletaId_key" ON "InscricaoAtleta"("atletaId");
CREATE INDEX "InscricaoAtleta_tenantId_idx" ON "InscricaoAtleta"("tenantId");
CREATE TABLE "new_Partida" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT,
    "categoriaId" TEXT NOT NULL,
    "timeCasaId" TEXT NOT NULL,
    "timeForaId" TEXT NOT NULL,
    "rodada" INTEGER,
    "fase" TEXT NOT NULL DEFAULT 'GRUPOS',
    "dataHora" DATETIME NOT NULL,
    "local" TEXT,
    "status" TEXT NOT NULL DEFAULT 'AGENDADA',
    "placarCasa" INTEGER NOT NULL DEFAULT 0,
    "placarFora" INTEGER NOT NULL DEFAULT 0,
    "golsCasaDetalhe" INTEGER,
    "linkTransmissaoUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Partida_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Partida_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Partida_timeCasaId_fkey" FOREIGN KEY ("timeCasaId") REFERENCES "Time" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Partida_timeForaId_fkey" FOREIGN KEY ("timeForaId") REFERENCES "Time" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Partida" ("categoriaId", "createdAt", "dataHora", "fase", "golsCasaDetalhe", "id", "linkTransmissaoUrl", "local", "placarCasa", "placarFora", "rodada", "status", "timeCasaId", "timeForaId", "updatedAt") SELECT "categoriaId", "createdAt", "dataHora", "fase", "golsCasaDetalhe", "id", "linkTransmissaoUrl", "local", "placarCasa", "placarFora", "rodada", "status", "timeCasaId", "timeForaId", "updatedAt" FROM "Partida";
DROP TABLE "Partida";
ALTER TABLE "new_Partida" RENAME TO "Partida";
CREATE INDEX "Partida_tenantId_categoriaId_idx" ON "Partida"("tenantId", "categoriaId");
CREATE TABLE "new_Patrocinador" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT,
    "nome" TEXT NOT NULL,
    "logoUrl" TEXT NOT NULL,
    "linkUrl" TEXT,
    "nivel" TEXT NOT NULL DEFAULT 'PRATA',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "campeonatoId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Patrocinador_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Patrocinador_campeonatoId_fkey" FOREIGN KEY ("campeonatoId") REFERENCES "Campeonato" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Patrocinador" ("ativo", "campeonatoId", "createdAt", "id", "linkUrl", "logoUrl", "nivel", "nome", "ordem") SELECT "ativo", "campeonatoId", "createdAt", "id", "linkUrl", "logoUrl", "nivel", "nome", "ordem" FROM "Patrocinador";
DROP TABLE "Patrocinador";
ALTER TABLE "new_Patrocinador" RENAME TO "Patrocinador";
CREATE INDEX "Patrocinador_tenantId_idx" ON "Patrocinador"("tenantId");
CREATE TABLE "new_PushSubscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "categoriaId" TEXT,
    "timeId" TEXT,
    "lembreteMin" INTEGER DEFAULT 30,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PushSubscription_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PushSubscription" ("auth", "categoriaId", "createdAt", "endpoint", "id", "lembreteMin", "p256dh", "timeId") SELECT "auth", "categoriaId", "createdAt", "endpoint", "id", "lembreteMin", "p256dh", "timeId" FROM "PushSubscription";
DROP TABLE "PushSubscription";
ALTER TABLE "new_PushSubscription" RENAME TO "PushSubscription";
CREATE UNIQUE INDEX "PushSubscription_endpoint_key" ON "PushSubscription"("endpoint");
CREATE INDEX "PushSubscription_tenantId_idx" ON "PushSubscription"("tenantId");
CREATE TABLE "new_SolicitacaoTime" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT,
    "nomeTime" TEXT NOT NULL,
    "treinadorId" TEXT NOT NULL,
    "timeId" TEXT,
    "categoriaId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "mensagem" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SolicitacaoTime_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SolicitacaoTime_treinadorId_fkey" FOREIGN KEY ("treinadorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SolicitacaoTime_timeId_fkey" FOREIGN KEY ("timeId") REFERENCES "Time" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_SolicitacaoTime" ("categoriaId", "createdAt", "id", "mensagem", "nomeTime", "status", "timeId", "treinadorId") SELECT "categoriaId", "createdAt", "id", "mensagem", "nomeTime", "status", "timeId", "treinadorId" FROM "SolicitacaoTime";
DROP TABLE "SolicitacaoTime";
ALTER TABLE "new_SolicitacaoTime" RENAME TO "SolicitacaoTime";
CREATE INDEX "SolicitacaoTime_tenantId_idx" ON "SolicitacaoTime"("tenantId");
CREATE TABLE "new_Time" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT,
    "nome" TEXT NOT NULL,
    "escudoUrl" TEXT,
    "categoriaId" TEXT NOT NULL,
    "grupoId" TEXT,
    "treinadorId" TEXT,
    "conviteToken" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Time_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Time_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Time_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "Grupo" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Time_treinadorId_fkey" FOREIGN KEY ("treinadorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Time" ("categoriaId", "conviteToken", "createdAt", "escudoUrl", "grupoId", "id", "nome", "treinadorId") SELECT "categoriaId", "conviteToken", "createdAt", "escudoUrl", "grupoId", "id", "nome", "treinadorId" FROM "Time";
DROP TABLE "Time";
ALTER TABLE "new_Time" RENAME TO "Time";
CREATE UNIQUE INDEX "Time_conviteToken_key" ON "Time"("conviteToken");
CREATE INDEX "Time_tenantId_idx" ON "Time"("tenantId");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'TREINADOR',
    "tenantId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_User" ("createdAt", "email", "id", "name", "passwordHash", "role", "updatedAt") SELECT "createdAt", "email", "id", "name", "passwordHash", "role", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE INDEX "User_tenantId_idx" ON "User"("tenantId");
CREATE UNIQUE INDEX "User_tenantId_email_key" ON "User"("tenantId", "email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_slug_key" ON "Tenant"("slug");
