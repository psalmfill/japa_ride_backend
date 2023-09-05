-- AlterEnum
ALTER TYPE "PaymentMethod" ADD VALUE 'wallet';

-- AlterTable
ALTER TABLE "VehicleCategory" ADD COLUMN     "pricePerKilometer" DECIMAL(65,30) NOT NULL DEFAULT 100;
