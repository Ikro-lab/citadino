/*
  Warnings:

  - Added the required column `fotoUrl` to the `InscricaoAtleta` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EventoPartida" ADD COLUMN "videoUrl" TEXT;

-- AlterTable
ALTER TABLE "Partida" ADD COLUMN "linkTransmissaoUrl" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_InscricaoAtleta" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    CONSTRAINT "InscricaoAtleta_timeId_fkey" FOREIGN KEY ("timeId") REFERENCES "Time" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "InscricaoAtleta_atletaId_fkey" FOREIGN KEY ("atletaId") REFERENCES "Atleta" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_InscricaoAtleta" ("atletaId", "comprovanteEnderecoUrl", "createdAt", "dataNascimento", "documentoUrl", "id", "instagram", "nome", "revisadoEm", "status", "timeId") SELECT "atletaId", "comprovanteEnderecoUrl", "createdAt", "dataNascimento", "documentoUrl", "id", "instagram", "nome", "revisadoEm", "status", "timeId" FROM "InscricaoAtleta";
DROP TABLE "InscricaoAtleta";
ALTER TABLE "new_InscricaoAtleta" RENAME TO "InscricaoAtleta";
CREATE UNIQUE INDEX "InscricaoAtleta_atletaId_key" ON "InscricaoAtleta"("atletaId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
