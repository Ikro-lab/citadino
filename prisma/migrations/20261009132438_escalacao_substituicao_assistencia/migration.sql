-- AlterTable
ALTER TABLE "Partida" ADD COLUMN "escalacaoCasa" TEXT;
ALTER TABLE "Partida" ADD COLUMN "escalacaoFora" TEXT;

-- AlterTable: coluna nova com chave estrangeira, sem recriar a tabela de eventos.
ALTER TABLE "EventoPartida" ADD COLUMN "atletaEntraId" TEXT REFERENCES "Atleta" ("id") ON DELETE SET NULL ON UPDATE CASCADE;
