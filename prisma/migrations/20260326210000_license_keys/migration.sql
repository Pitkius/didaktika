-- CreateEnum
CREATE TYPE "LicenseKeyStatus" AS ENUM ('ACTIVE', 'REVOKED', 'EXHAUSTED', 'EXPIRED');

-- CreateTable
CREATE TABLE "LicenseKey" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "plan" "SubscriptionPlan" NOT NULL,
    "durationDays" INTEGER,
    "maxRedemptions" INTEGER NOT NULL DEFAULT 1,
    "redemptionCount" INTEGER NOT NULL DEFAULT 0,
    "status" "LicenseKeyStatus" NOT NULL DEFAULT 'ACTIVE',
    "note" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LicenseKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LicenseKeyRedemption" (
    "id" TEXT NOT NULL,
    "keyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "schoolId" TEXT,
    "subscriptionId" TEXT,
    "redeemedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LicenseKeyRedemption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LicenseKey_code_key" ON "LicenseKey"("code");
CREATE INDEX "LicenseKey_plan_idx" ON "LicenseKey"("plan");
CREATE INDEX "LicenseKey_status_idx" ON "LicenseKey"("status");
CREATE INDEX "LicenseKey_createdById_idx" ON "LicenseKey"("createdById");
CREATE INDEX "LicenseKey_createdAt_idx" ON "LicenseKey"("createdAt");
CREATE UNIQUE INDEX "LicenseKeyRedemption_keyId_userId_key" ON "LicenseKeyRedemption"("keyId", "userId");
CREATE INDEX "LicenseKeyRedemption_userId_idx" ON "LicenseKeyRedemption"("userId");
CREATE INDEX "LicenseKeyRedemption_keyId_idx" ON "LicenseKeyRedemption"("keyId");
CREATE INDEX "LicenseKeyRedemption_schoolId_idx" ON "LicenseKeyRedemption"("schoolId");

-- AddForeignKey
ALTER TABLE "LicenseKey" ADD CONSTRAINT "LicenseKey_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "LicenseKeyRedemption" ADD CONSTRAINT "LicenseKeyRedemption_keyId_fkey" FOREIGN KEY ("keyId") REFERENCES "LicenseKey"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LicenseKeyRedemption" ADD CONSTRAINT "LicenseKeyRedemption_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
