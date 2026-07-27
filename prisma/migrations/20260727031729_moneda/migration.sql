/*
  Warnings:

  - You are about to drop the column `currency` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Plan` table. All the data in the column will be lost.
  - Added the required column `priceUsd` to the `Plan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Plan" DROP COLUMN "currency",
DROP COLUMN "price",
ADD COLUMN     "priceUsd" INTEGER NOT NULL;
