-- AlterTable: só adiciona colunas (sem recriar a tabela de campeonatos).
ALTER TABLE "Campeonato" ADD COLUMN "inscricoesAbertas" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Campeonato" ADD COLUMN "inscricoesEncerramEm" DATETIME;
