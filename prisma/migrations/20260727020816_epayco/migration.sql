/*
  Warnings:

  - You are about to drop the column `cardBrand` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `cardLast4` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `paymentIntentId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `stripeCustomerId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `stripeEventId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `stripeSessionId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `stripeStatus` on the `Payment` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[transactionId]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[reference]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Payment_paymentIntentId_key";

-- DropIndex
DROP INDEX "Payment_stripeEventId_key";

-- DropIndex
DROP INDEX "Payment_stripeSessionId_key";

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "cardBrand",
DROP COLUMN "cardLast4",
DROP COLUMN "paymentIntentId",
DROP COLUMN "stripeCustomerId",
DROP COLUMN "stripeEventId",
DROP COLUMN "stripeSessionId",
DROP COLUMN "stripeStatus",
ADD COLUMN     "gateway" TEXT,
ADD COLUMN     "reference" TEXT,
ADD COLUMN     "transactionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Payment_transactionId_key" ON "Payment"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_reference_key" ON "Payment"("reference");
