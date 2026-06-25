-- CreateEnum
CREATE TYPE "Entitlement" AS ENUM ('free', 'self_serve', 'done_with_you');

-- CreateEnum
CREATE TYPE "IssueSeverity" AS ENUM ('high', 'med', 'low');

-- CreateEnum
CREATE TYPE "IssueStatus" AS ENUM ('todo', 'progress', 'done');

-- CreateEnum
CREATE TYPE "AccountCategory" AS ENUM ('vendor_net30', 'secured_card', 'credit_card', 'funding');

-- CreateEnum
CREATE TYPE "AccountTier" AS ENUM ('ready', 'unlock_next');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "entitlement" "Entitlement" NOT NULL DEFAULT 'free',
    "stripeCustomerId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Business" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "website" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Business_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scan" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readinessScore" INTEGER NOT NULL,
    "grade" TEXT NOT NULL,
    "signalsTotal" INTEGER NOT NULL,
    "signalsClean" INTEGER NOT NULL,

    CONSTRAINT "Scan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Issue" (
    "id" TEXT NOT NULL,
    "scanId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    "severity" "IssueSeverity" NOT NULL,
    "impactRank" INTEGER NOT NULL,
    "status" "IssueStatus" NOT NULL DEFAULT 'todo',

    CONSTRAINT "Issue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountMatch" (
    "id" TEXT NOT NULL,
    "scanId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "AccountCategory" NOT NULL,
    "tier" "AccountTier" NOT NULL,
    "reason" TEXT NOT NULL,
    "unlockReason" TEXT,
    "faceBg" TEXT NOT NULL,

    CONSTRAINT "AccountMatch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Business_userId_idx" ON "Business"("userId");

-- CreateIndex
CREATE INDEX "Scan_businessId_idx" ON "Scan"("businessId");

-- CreateIndex
CREATE INDEX "Issue_scanId_idx" ON "Issue"("scanId");

-- CreateIndex
CREATE INDEX "Issue_key_idx" ON "Issue"("key");

-- CreateIndex
CREATE INDEX "AccountMatch_scanId_idx" ON "AccountMatch"("scanId");

-- CreateIndex
CREATE INDEX "AccountMatch_category_idx" ON "AccountMatch"("category");

-- CreateIndex
CREATE INDEX "AccountMatch_tier_idx" ON "AccountMatch"("tier");

-- AddForeignKey
ALTER TABLE "Business" ADD CONSTRAINT "Business_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scan" ADD CONSTRAINT "Scan_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_scanId_fkey" FOREIGN KEY ("scanId") REFERENCES "Scan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountMatch" ADD CONSTRAINT "AccountMatch_scanId_fkey" FOREIGN KEY ("scanId") REFERENCES "Scan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
