-- AlterTable
ALTER TABLE "Atleta" ADD COLUMN "aceiteOrigem" TEXT;
ALTER TABLE "Atleta" ADD COLUMN "aceiteResponsavel" TEXT;
ALTER TABLE "Atleta" ADD COLUMN "aceiteTermoEm" DATETIME;
ALTER TABLE "Atleta" ADD COLUMN "aceiteVersao" TEXT;

-- AlterTable
ALTER TABLE "InscricaoAtleta" ADD COLUMN "aceiteOrigem" TEXT;
ALTER TABLE "InscricaoAtleta" ADD COLUMN "aceiteResponsavel" TEXT;
ALTER TABLE "InscricaoAtleta" ADD COLUMN "aceiteTermoEm" DATETIME;
ALTER TABLE "InscricaoAtleta" ADD COLUMN "aceiteVersao" TEXT;

-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN "privacidadeEmail" TEXT;
ALTER TABLE "Tenant" ADD COLUMN "privacidadeOrgao" TEXT;
