/*
  Warnings:

  - The required column `conviteToken` was added to the `Time` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "Atleta" ADD COLUMN "dataNascimento" DATETIME;
ALTER TABLE "Atleta" ADD COLUMN "instagram" TEXT;

-- AlterTable
ALTER TABLE "Campeonato" ADD COLUMN "regulamentoUrl" TEXT;

-- CreateTable
CREATE TABLE "Grupo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "categoriaId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Grupo_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InscricaoAtleta" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "timeId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "dataNascimento" DATETIME NOT NULL,
    "instagram" TEXT,
    "documentoUrl" TEXT NOT NULL,
    "comprovanteEnderecoUrl" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "atletaId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revisadoEm" DATETIME,
    CONSTRAINT "InscricaoAtleta_timeId_fkey" FOREIGN KEY ("timeId") REFERENCES "Time" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "InscricaoAtleta_atletaId_fkey" FOREIGN KEY ("atletaId") REFERENCES "Atleta" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Enquete" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "categoriaId" TEXT NOT NULL,
    "rodada" INTEGER NOT NULL,
    "pergunta" TEXT NOT NULL DEFAULT 'Melhor Jogador da Rodada',
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Enquete_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EnqueteOpcao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "enqueteId" TEXT NOT NULL,
    "atletaId" TEXT NOT NULL,
    CONSTRAINT "EnqueteOpcao_enqueteId_fkey" FOREIGN KEY ("enqueteId") REFERENCES "Enquete" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EnqueteOpcao_atletaId_fkey" FOREIGN KEY ("atletaId") REFERENCES "Atleta" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EnqueteVoto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "enqueteId" TEXT NOT NULL,
    "opcaoId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EnqueteVoto_enqueteId_fkey" FOREIGN KEY ("enqueteId") REFERENCES "Enquete" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EnqueteVoto_opcaoId_fkey" FOREIGN KEY ("opcaoId") REFERENCES "EnqueteOpcao" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Categoria" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "campeonatoId" TEXT NOT NULL,
    "formato" TEXT NOT NULL DEFAULT 'PONTOS_CORRIDOS',
    "classificadosPorGrupo" INTEGER,
    "cartoesParaSuspensao" INTEGER NOT NULL DEFAULT 3,
    "jogosSuspensao" INTEGER NOT NULL DEFAULT 1,
    "regulamentoUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Categoria_campeonatoId_fkey" FOREIGN KEY ("campeonatoId") REFERENCES "Campeonato" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Categoria" ("campeonatoId", "createdAt", "id", "nome") SELECT "campeonatoId", "createdAt", "id", "nome" FROM "Categoria";
DROP TABLE "Categoria";
ALTER TABLE "new_Categoria" RENAME TO "Categoria";
CREATE UNIQUE INDEX "Categoria_campeonatoId_nome_key" ON "Categoria"("campeonatoId", "nome");
CREATE TABLE "new_Partida" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Partida_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Partida_timeCasaId_fkey" FOREIGN KEY ("timeCasaId") REFERENCES "Time" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Partida_timeForaId_fkey" FOREIGN KEY ("timeForaId") REFERENCES "Time" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Partida" ("categoriaId", "createdAt", "dataHora", "golsCasaDetalhe", "id", "local", "placarCasa", "placarFora", "rodada", "status", "timeCasaId", "timeForaId", "updatedAt") SELECT "categoriaId", "createdAt", "dataHora", "golsCasaDetalhe", "id", "local", "placarCasa", "placarFora", "rodada", "status", "timeCasaId", "timeForaId", "updatedAt" FROM "Partida";
DROP TABLE "Partida";
ALTER TABLE "new_Partida" RENAME TO "Partida";
CREATE TABLE "new_Time" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "escudoUrl" TEXT,
    "categoriaId" TEXT NOT NULL,
    "grupoId" TEXT,
    "treinadorId" TEXT,
    "conviteToken" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Time_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Time_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "Grupo" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Time_treinadorId_fkey" FOREIGN KEY ("treinadorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Time" ("categoriaId", "createdAt", "escudoUrl", "id", "nome", "treinadorId") SELECT "categoriaId", "createdAt", "escudoUrl", "id", "nome", "treinadorId" FROM "Time";
DROP TABLE "Time";
ALTER TABLE "new_Time" RENAME TO "Time";
CREATE UNIQUE INDEX "Time_conviteToken_key" ON "Time"("conviteToken");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Grupo_categoriaId_nome_key" ON "Grupo"("categoriaId", "nome");

-- CreateIndex
CREATE UNIQUE INDEX "InscricaoAtleta_atletaId_key" ON "InscricaoAtleta"("atletaId");

-- CreateIndex
CREATE UNIQUE INDEX "EnqueteOpcao_enqueteId_atletaId_key" ON "EnqueteOpcao"("enqueteId", "atletaId");

-- CreateIndex
CREATE UNIQUE INDEX "EnqueteVoto_enqueteId_deviceId_key" ON "EnqueteVoto"("enqueteId", "deviceId");
