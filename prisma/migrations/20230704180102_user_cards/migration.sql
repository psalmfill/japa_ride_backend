-- AlterEnum
ALTER TYPE "PaymentStatus" ADD VALUE 'failed';

-- AlterEnum
ALTER TYPE "TransactionStatus" ADD VALUE 'failed';

-- CreateTable
CREATE TABLE "Card" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "authorizationCode" TEXT NOT NULL,
    "bin" TEXT NOT NULL,
    "last4" TEXT NOT NULL,
    "bank" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "signature" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'paystack',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Card_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
