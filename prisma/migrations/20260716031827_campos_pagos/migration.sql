/*
  Warnings:

  - A unique constraint covering the columns `[stripeEventId]` on the table `Plan` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Plan" ADD COLUMN     "cardBrand" TEXT,
ADD COLUMN     "cardLast4" TEXT,
ADD COLUMN     "paymentMethod" TEXT,
ADD COLUMN     "receiptUrl" TEXT,
ADD COLUMN     "stripeEventId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Plan_stripeEventId_key" ON "Plan"("stripeEventId");
