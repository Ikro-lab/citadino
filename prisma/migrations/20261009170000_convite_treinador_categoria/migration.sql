-- Link de cadastro de treinadores por categoria: só adiciona colunas (sem
-- recriar tabelas). As categorias que já existem ganham um código aleatório.
ALTER TABLE "Categoria" ADD COLUMN "conviteTreinadorToken" TEXT;
UPDATE "Categoria" SET "conviteTreinadorToken" = lower(hex(randomblob(12))) WHERE "conviteTreinadorToken" IS NULL;
CREATE UNIQUE INDEX "Categoria_conviteTreinadorToken_key" ON "Categoria"("conviteTreinadorToken");

-- Categoria do link usado pelo treinador, até ele criar o time.
ALTER TABLE "User" ADD COLUMN "categoriaConviteId" TEXT;
