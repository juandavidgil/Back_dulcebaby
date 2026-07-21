-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('PLAN', 'GUIDE');

-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('CONSULTATION', 'GUIDE');

-- AlterTable
ALTER TABLE "Plan" ADD COLUMN     "pdfFile" TEXT,
ADD COLUMN     "type" "PlanType" NOT NULL DEFAULT 'CONSULTATION';
