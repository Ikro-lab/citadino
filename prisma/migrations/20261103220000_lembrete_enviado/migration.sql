-- CreateTable
CREATE TABLE "LembreteEnviado" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subscriptionId" TEXT NOT NULL,
    "partidaId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LembreteEnviado_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "PushSubscription" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LembreteEnviado_partidaId_fkey" FOREIGN KEY ("partidaId") REFERENCES "Partida" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "LembreteEnviado_subscriptionId_partidaId_key" ON "LembreteEnviado"("subscriptionId", "partidaId");

-- CreateIndex
CREATE INDEX "LembreteEnviado_partidaId_idx" ON "LembreteEnviado"("partidaId");
