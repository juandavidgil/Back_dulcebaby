/*
  Warnings:

  - You are about to drop the column `cardBrand` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `cardLast4` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `paymentMethod` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `receiptUrl` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `stripeEventId` on the `Plan` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[stripeEventId]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Plan_stripeEventId_key";

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "cardBrand" TEXT,
ADD COLUMN     "cardLast4" TEXT,
ADD COLUMN     "paymentMethod" TEXT,
ADD COLUMN     "receiptUrl" TEXT,
ADD COLUMN     "stripeEventId" TEXT;

-- AlterTable
ALTER TABLE "Plan" DROP COLUMN "cardBrand",
DROP COLUMN "cardLast4",
DROP COLUMN "paymentMethod",
DROP COLUMN "receiptUrl",
DROP COLUMN "stripeEventId";

-- CreateIndex
CREATE UNIQUE INDEX "Payment_stripeEventId_key" ON "Payment"("stripeEventId");
