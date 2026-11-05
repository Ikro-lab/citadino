-- AlterTable
ALTER TABLE "PushSubscription" ADD COLUMN "userId" TEXT;

-- CreateTable
CREATE TABLE "GolSugerido" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "partidaId" TEXT NOT NULL,
    "timeId" TEXT NOT NULL,
    "placarCasa" INTEGER NOT NULL,
    "placarFora" INTEGER NOT NULL,
    "videoSegundo" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "eventoId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvidoEm" DATETIME,
    CONSTRAINT "GolSugerido_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "GolSugerido_partidaId_fkey" FOREIGN KEY ("partidaId") REFERENCES "Partida" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "GolSugerido_tenantId_idx" ON "GolSugerido"("tenantId");

-- CreateIndex
CREATE INDEX "GolSugerido_partidaId_status_idx" ON "GolSugerido"("partidaId", "status");

-- CreateIndex
CREATE INDEX "PushSubscription_userId_idx" ON "PushSubscription"("userId");

