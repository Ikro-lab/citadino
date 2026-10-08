-- CreateIndex
CREATE INDEX "EventoPartida_partidaId_idx" ON "EventoPartida"("partidaId");

-- CreateIndex
CREATE INDEX "EventoPartida_atletaId_idx" ON "EventoPartida"("atletaId");

-- CreateIndex
CREATE INDEX "Partida_tenantId_dataHora_idx" ON "Partida"("tenantId", "dataHora");

-- CreateIndex
CREATE INDEX "Partida_timeCasaId_dataHora_idx" ON "Partida"("timeCasaId", "dataHora");

-- CreateIndex
CREATE INDEX "Partida_timeForaId_dataHora_idx" ON "Partida"("timeForaId", "dataHora");
