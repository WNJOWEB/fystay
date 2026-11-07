-- CreateEnum
CREATE TYPE "DeliveryFailureKind" AS ENUM ('EMAIL', 'WEBHOOK');

-- CreateTable
CREATE TABLE "DeliveryFailure" (
    "id" TEXT NOT NULL,
    "kind" "DeliveryFailureKind" NOT NULL,
    "label" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "DeliveryFailure_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DeliveryFailure_resolvedAt_createdAt_idx" ON "DeliveryFailure"("resolvedAt", "createdAt");


-- Deny-all for the Supabase API roles, like every other table.
ALTER TABLE "DeliveryFailure" ENABLE ROW LEVEL SECURITY;
