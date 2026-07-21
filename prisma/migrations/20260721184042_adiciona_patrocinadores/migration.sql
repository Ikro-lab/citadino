-- CreateTable
CREATE TABLE "Patrocinador" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "logoUrl" TEXT NOT NULL,
    "linkUrl" TEXT,
    "nivel" TEXT NOT NULL DEFAULT 'PRATA',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "campeonatoId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Patrocinador_campeonatoId_fkey" FOREIGN KEY ("campeonatoId") REFERENCES "Campeonato" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
