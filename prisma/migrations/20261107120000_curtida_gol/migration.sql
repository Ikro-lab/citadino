-- CreateTable
CREATE TABLE "CurtidaGol" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenantId" TEXT NOT NULL,
    "eventoId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CurtidaGol_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CurtidaGol_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "EventoPartida" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "CurtidaGol_tenantId_idx" ON "CurtidaGol"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "CurtidaGol_eventoId_deviceId_key" ON "CurtidaGol"("eventoId", "deviceId");
