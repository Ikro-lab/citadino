-- AlterTable
ALTER TABLE "Atleta" ADD COLUMN "imagemAutorizadaEm" DATETIME;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_InscricaoAtleta" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "timeId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "dataNascimento" DATETIME NOT NULL,
    "instagram" TEXT,
    "fotoUrl" TEXT NOT NULL,
    "documentoUrl" TEXT,
    "comprovanteEnderecoUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "atletaId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revisadoEm" DATETIME,
    "aceiteTermoEm" DATETIME,
    "aceiteVersao" TEXT,
    "aceiteOrigem" TEXT,
    "aceiteResponsavel" TEXT,
    "imagemAutorizadaEm" DATETIME,
    CONSTRAINT "InscricaoAtleta_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "InscricaoAtleta_timeId_fkey" FOREIGN KEY ("timeId") REFERENCES "Time" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "InscricaoAtleta_atletaId_fkey" FOREIGN KEY ("atletaId") REFERENCES "Atleta" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_InscricaoAtleta" ("aceiteOrigem", "aceiteResponsavel", "aceiteTermoEm", "aceiteVersao", "atletaId", "comprovanteEnderecoUrl", "createdAt", "dataNascimento", "documentoUrl", "fotoUrl", "id", "instagram", "nome", "revisadoEm", "status", "tenantId", "timeId") SELECT "aceiteOrigem", "aceiteResponsavel", "aceiteTermoEm", "aceiteVersao", "atletaId", "comprovanteEnderecoUrl", "createdAt", "dataNascimento", "documentoUrl", "fotoUrl", "id", "instagram", "nome", "revisadoEm", "status", "tenantId", "timeId" FROM "InscricaoAtleta";
DROP TABLE "InscricaoAtleta";
ALTER TABLE "new_InscricaoAtleta" RENAME TO "InscricaoAtleta";
CREATE UNIQUE INDEX "InscricaoAtleta_atletaId_key" ON "InscricaoAtleta"("atletaId");
CREATE INDEX "InscricaoAtleta_tenantId_idx" ON "InscricaoAtleta"("tenantId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
