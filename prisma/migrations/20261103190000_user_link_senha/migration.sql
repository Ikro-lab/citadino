-- AlterTable
ALTER TABLE "User" ADD COLUMN "senhaTokenHash" TEXT;
ALTER TABLE "User" ADD COLUMN "senhaTokenExpiraEm" DATETIME;

-- CreateIndex
CREATE UNIQUE INDEX "User_senhaTokenHash_key" ON "User"("senhaTokenHash");
