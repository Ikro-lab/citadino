-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Tenant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "corPrimaria" TEXT NOT NULL DEFAULT '#f5821f',
    "corSecundaria" TEXT NOT NULL DEFAULT '#2fbf8f',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "patrocinadoresAnimados" BOOLEAN NOT NULL DEFAULT true,
    "patrocinadoresTamanho" TEXT NOT NULL DEFAULT 'MEDIO',
    "patrocinadoresPosicao" TEXT NOT NULL DEFAULT 'AMBOS',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Tenant" ("ativo", "corPrimaria", "corSecundaria", "createdAt", "id", "nome", "patrocinadoresAnimados", "patrocinadoresTamanho", "slug", "updatedAt") SELECT "ativo", "corPrimaria", "corSecundaria", "createdAt", "id", "nome", "patrocinadoresAnimados", "patrocinadoresTamanho", "slug", "updatedAt" FROM "Tenant";
DROP TABLE "Tenant";
ALTER TABLE "new_Tenant" RENAME TO "Tenant";
CREATE UNIQUE INDEX "Tenant_slug_key" ON "Tenant"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
