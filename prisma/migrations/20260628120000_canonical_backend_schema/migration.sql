-- Canonical Verge Five backend schema expansion.
-- Additive only: preserves existing User, Business, Scan, Issue, AccountMatch, and StripeEvent data.

ALTER TYPE "Entitlement" ADD VALUE IF NOT EXISTS 'legacy_imported';
ALTER TYPE "Entitlement" ADD VALUE IF NOT EXISTS 'comped';
ALTER TYPE "Entitlement" ADD VALUE IF NOT EXISTS 'expired';

DO $$ BEGIN CREATE TYPE "BillingStatus" AS ENUM ('none','active_subscription','trialing','past_due','canceled','unpaid','one_time_paid','legacy_imported','manual_override','refunded'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "PurchaseStatus" AS ENUM ('pending','paid','failed','refunded','canceled','disputed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "SubscriptionStatus" AS ENUM ('incomplete','trialing','active','past_due','canceled','unpaid','paused'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "SupportStatus" AS ENUM ('new','open','pending','resolved','closed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "SupportPriority" AS ENUM ('low','normal','high','urgent'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "EmailTemplateStatus" AS ENUM ('draft','active','archived'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "EmailCampaignStatus" AS ENUM ('draft','active','paused','completed','archived'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "EmailLeadStatus" AS ENUM ('imported','sent','clicked','registered','do_not_contact','bounced'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "EmailSendStatus" AS ENUM ('pending','sent','failed','delivered','opened','clicked','bounced'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "AdminRole" AS ENUM ('owner','admin','support','viewer'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "AffiliateStatus" AS ENUM ('pending','active','paused','disabled'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "CommissionStatus" AS ENUM ('pending','payable','paid','canceled'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "ImportStatus" AS ENUM ('pending','processing','completed','failed','skipped'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "ReadinessLockStatus" AS ENUM ('clear','settling','review','locked'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastLoginAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailVerifiedAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "authProvider" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "billingStatus" "BillingStatus" NOT NULL DEFAULT 'none';
CREATE INDEX IF NOT EXISTS "User_entitlement_idx" ON "User"("entitlement");
CREATE INDEX IF NOT EXISTS "User_billingStatus_idx" ON "User"("billingStatus");
CREATE INDEX IF NOT EXISTS "User_stripeCustomerId_idx" ON "User"("stripeCustomerId");

ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "legalName" TEXT;
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "tradeName" TEXT;
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "formationState" TEXT;
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "ein" TEXT;
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "industry" TEXT;
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "Scan" ADD COLUMN IF NOT EXISTS "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Scan" ADD COLUMN IF NOT EXISTS "sourceMode" TEXT;
ALTER TABLE "Scan" ADD COLUMN IF NOT EXISTS "engine" TEXT;
ALTER TABLE "Scan" ADD COLUMN IF NOT EXISTS "findings" JSONB;
ALTER TABLE "Scan" ADD COLUMN IF NOT EXISTS "redFlags" JSONB;
ALTER TABLE "Scan" ADD COLUMN IF NOT EXISTS "evidence" JSONB;
ALTER TABLE "Scan" ADD COLUMN IF NOT EXISTS "signals" JSONB;
ALTER TABLE "Scan" ADD COLUMN IF NOT EXISTS "platformRecommendation" TEXT;
ALTER TABLE "Scan" ADD COLUMN IF NOT EXISTS "disclaimer" TEXT;
CREATE INDEX IF NOT EXISTS "Scan_createdAt_idx" ON "Scan"("createdAt");

ALTER TABLE "Issue" ADD COLUMN IF NOT EXISTS "potentialPoints" INTEGER;
ALTER TABLE "Issue" ADD COLUMN IF NOT EXISTS "completedAt" TIMESTAMP(3);
ALTER TABLE "Issue" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Issue" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
CREATE INDEX IF NOT EXISTS "Issue_status_idx" ON "Issue"("status");

ALTER TABLE "AccountMatch" ADD COLUMN IF NOT EXISTS "catalogAccountId" TEXT;
ALTER TABLE "AccountMatch" ADD COLUMN IF NOT EXISTS "cardTypeLabel" TEXT;
ALTER TABLE "AccountMatch" ADD COLUMN IF NOT EXISTS "prereqLabels" JSONB;
ALTER TABLE "AccountMatch" ADD COLUMN IF NOT EXISTS "recommendedLine" TEXT;
ALTER TABLE "AccountMatch" ADD COLUMN IF NOT EXISTS "reportsNote" TEXT;
ALTER TABLE "AccountMatch" ADD COLUMN IF NOT EXISTS "matchNote" TEXT;
ALTER TABLE "AccountMatch" ADD COLUMN IF NOT EXISTS "helpfulNext" TEXT;
ALTER TABLE "AccountMatch" ADD COLUMN IF NOT EXISTS "researchNote" TEXT;
ALTER TABLE "AccountMatch" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "AccountMatch" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "StripeEvent" ADD COLUMN IF NOT EXISTS "processedAt" TIMESTAMP(3);
ALTER TABLE "StripeEvent" ADD COLUMN IF NOT EXISTS "payload" JSONB;
ALTER TABLE "StripeEvent" ADD COLUMN IF NOT EXISTS "processingError" TEXT;
CREATE INDEX IF NOT EXISTS "StripeEvent_type_idx" ON "StripeEvent"("type");
CREATE INDEX IF NOT EXISTS "StripeEvent_processedAt_idx" ON "StripeEvent"("processedAt");

CREATE TABLE IF NOT EXISTS "ImportBatch" (
  "id" TEXT PRIMARY KEY,
  "sourceSystem" TEXT NOT NULL,
  "filename" TEXT,
  "status" "ImportStatus" NOT NULL DEFAULT 'pending',
  "totalRows" INTEGER NOT NULL DEFAULT 0,
  "importedRows" INTEGER NOT NULL DEFAULT 0,
  "skippedRows" INTEGER NOT NULL DEFAULT 0,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "ImportBatch_sourceSystem_idx" ON "ImportBatch"("sourceSystem");
CREATE INDEX IF NOT EXISTS "ImportBatch_status_idx" ON "ImportBatch"("status");

CREATE TABLE IF NOT EXISTS "ImportedUser" (
  "id" TEXT PRIMARY KEY,
  "importBatchId" TEXT REFERENCES "ImportBatch"("id") ON DELETE SET NULL,
  "linkedUserId" TEXT REFERENCES "User"("id") ON DELETE SET NULL,
  "sourceSystem" TEXT NOT NULL,
  "sourceId" TEXT,
  "originalEmail" TEXT NOT NULL,
  "normalizedEmail" TEXT NOT NULL,
  "firstName" TEXT,
  "lastName" TEXT,
  "businessName" TEXT,
  "phone" TEXT,
  "importedMembershipStatus" TEXT,
  "entitlement" "Entitlement",
  "billingStatus" "BillingStatus",
  "inviteStatus" TEXT,
  "inviteSentAt" TIMESTAMP(3),
  "activatedAt" TIMESTAMP(3),
  "rawData" JSONB,
  "status" "ImportStatus" NOT NULL DEFAULT 'pending',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "ImportedUser_importBatchId_idx" ON "ImportedUser"("importBatchId");
CREATE INDEX IF NOT EXISTS "ImportedUser_linkedUserId_idx" ON "ImportedUser"("linkedUserId");
CREATE INDEX IF NOT EXISTS "ImportedUser_normalizedEmail_idx" ON "ImportedUser"("normalizedEmail");
CREATE INDEX IF NOT EXISTS "ImportedUser_sourceSystem_sourceId_idx" ON "ImportedUser"("sourceSystem", "sourceId");

CREATE TABLE IF NOT EXISTS "Membership" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL UNIQUE REFERENCES "User"("id") ON DELETE CASCADE,
  "entitlement" "Entitlement" NOT NULL DEFAULT 'free',
  "billingStatus" "BillingStatus" NOT NULL DEFAULT 'none',
  "plan" TEXT,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "stripeCustomerId" TEXT,
  "stripeSubscriptionId" TEXT,
  "stripePriceId" TEXT,
  "currentPeriodStart" TIMESTAMP(3),
  "currentPeriodEnd" TIMESTAMP(3),
  "trialEndsAt" TIMESTAMP(3),
  "canceledAt" TIMESTAMP(3),
  "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
  "legacySource" TEXT,
  "manualReason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "Membership_entitlement_idx" ON "Membership"("entitlement");
CREATE INDEX IF NOT EXISTS "Membership_billingStatus_idx" ON "Membership"("billingStatus");
CREATE INDEX IF NOT EXISTS "Membership_stripeCustomerId_idx" ON "Membership"("stripeCustomerId");
CREATE INDEX IF NOT EXISTS "Membership_stripeSubscriptionId_idx" ON "Membership"("stripeSubscriptionId");

CREATE TABLE IF NOT EXISTS "Purchase" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT REFERENCES "User"("id") ON DELETE SET NULL,
  "stripeCustomerId" TEXT,
  "stripeCheckoutSessionId" TEXT UNIQUE,
  "stripePaymentIntentId" TEXT,
  "stripePriceId" TEXT,
  "product" TEXT NOT NULL,
  "plan" TEXT,
  "amountCents" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'usd',
  "status" "PurchaseStatus" NOT NULL DEFAULT 'pending',
  "billingStatus" "BillingStatus" NOT NULL DEFAULT 'none',
  "idempotencyKey" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "Purchase_userId_idx" ON "Purchase"("userId");
CREATE INDEX IF NOT EXISTS "Purchase_stripeCustomerId_idx" ON "Purchase"("stripeCustomerId");
CREATE INDEX IF NOT EXISTS "Purchase_status_idx" ON "Purchase"("status");

CREATE TABLE IF NOT EXISTS "Subscription" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT REFERENCES "User"("id") ON DELETE SET NULL,
  "stripeCustomerId" TEXT,
  "stripeSubscriptionId" TEXT NOT NULL UNIQUE,
  "stripePriceId" TEXT,
  "product" TEXT,
  "plan" TEXT,
  "status" "SubscriptionStatus" NOT NULL DEFAULT 'incomplete',
  "billingStatus" "BillingStatus" NOT NULL DEFAULT 'none',
  "currentPeriodStart" TIMESTAMP(3),
  "currentPeriodEnd" TIMESTAMP(3),
  "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
  "canceledAt" TIMESTAMP(3),
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "Subscription_userId_idx" ON "Subscription"("userId");
CREATE INDEX IF NOT EXISTS "Subscription_stripeCustomerId_idx" ON "Subscription"("stripeCustomerId");
CREATE INDEX IF NOT EXISTS "Subscription_status_idx" ON "Subscription"("status");

CREATE TABLE IF NOT EXISTS "VisibilityAudit" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "businessId" TEXT REFERENCES "Business"("id") ON DELETE SET NULL,
  "mode" TEXT NOT NULL DEFAULT 'before',
  "businessName" TEXT,
  "score" INTEGER,
  "label" TEXT,
  "sourceMode" TEXT,
  "engine" TEXT,
  "findings" JSONB,
  "redFlags" JSONB,
  "evidence" JSONB,
  "signals" JSONB,
  "platformRecommendation" TEXT,
  "resultJson" JSONB NOT NULL,
  "generatedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "VisibilityAudit_userId_mode_createdAt_idx" ON "VisibilityAudit"("userId", "mode", "createdAt");
CREATE INDEX IF NOT EXISTS "VisibilityAudit_businessId_idx" ON "VisibilityAudit"("businessId");

CREATE TABLE IF NOT EXISTS "CatalogAccount" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "category" "AccountCategory" NOT NULL,
  "tier" "AccountTier" NOT NULL DEFAULT 'unlock_next',
  "description" TEXT,
  "reason" TEXT,
  "unlockReason" TEXT,
  "faceBg" TEXT,
  "logoUrl" TEXT,
  "outboundUrl" TEXT,
  "recommendedSignals" JSONB,
  "prerequisites" JSONB,
  "reportsNote" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "CatalogAccount_category_idx" ON "CatalogAccount"("category");
CREATE INDEX IF NOT EXISTS "CatalogAccount_tier_idx" ON "CatalogAccount"("tier");
CREATE INDEX IF NOT EXISTS "CatalogAccount_active_sortOrder_idx" ON "CatalogAccount"("active", "sortOrder");
CREATE INDEX IF NOT EXISTS "AccountMatch_catalogAccountId_idx" ON "AccountMatch"("catalogAccountId");
DO $$ BEGIN ALTER TABLE "AccountMatch" ADD CONSTRAINT "AccountMatch_catalogAccountId_fkey" FOREIGN KEY ("catalogAccountId") REFERENCES "CatalogAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "SupportTicket" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT REFERENCES "User"("id") ON DELETE SET NULL,
  "businessId" TEXT REFERENCES "Business"("id") ON DELETE SET NULL,
  "type" TEXT,
  "category" TEXT,
  "severity" TEXT,
  "priority" "SupportPriority" NOT NULL DEFAULT 'normal',
  "name" TEXT,
  "email" TEXT,
  "pageUrl" TEXT,
  "subject" TEXT,
  "message" TEXT NOT NULL,
  "steps" TEXT,
  "browser" TEXT,
  "source" TEXT,
  "status" "SupportStatus" NOT NULL DEFAULT 'new',
  "resolvedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "SupportTicket_userId_idx" ON "SupportTicket"("userId");
CREATE INDEX IF NOT EXISTS "SupportTicket_status_idx" ON "SupportTicket"("status");
CREATE INDEX IF NOT EXISTS "SupportTicket_createdAt_idx" ON "SupportTicket"("createdAt");

CREATE TABLE IF NOT EXISTS "AdminUser" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT UNIQUE REFERENCES "User"("id") ON DELETE SET NULL,
  "email" TEXT NOT NULL UNIQUE,
  "role" "AdminRole" NOT NULL DEFAULT 'admin',
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "AdminUser_role_idx" ON "AdminUser"("role");
CREATE INDEX IF NOT EXISTS "AdminUser_active_idx" ON "AdminUser"("active");

CREATE TABLE IF NOT EXISTS "AdminNote" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "adminUserId" TEXT REFERENCES "AdminUser"("id") ON DELETE SET NULL,
  "adminEmail" TEXT,
  "note" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "AdminNote_userId_createdAt_idx" ON "AdminNote"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "AdminNote_adminUserId_idx" ON "AdminNote"("adminUserId");

CREATE TABLE IF NOT EXISTS "AdminActivityLog" (
  "id" TEXT PRIMARY KEY,
  "adminUserId" TEXT REFERENCES "AdminUser"("id") ON DELETE SET NULL,
  "adminActorUserId" TEXT REFERENCES "User"("id") ON DELETE SET NULL,
  "adminEmail" TEXT,
  "userId" TEXT REFERENCES "User"("id") ON DELETE SET NULL,
  "action" TEXT NOT NULL,
  "details" JSONB,
  "ipAddress" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "AdminActivityLog_userId_createdAt_idx" ON "AdminActivityLog"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "AdminActivityLog_adminUserId_idx" ON "AdminActivityLog"("adminUserId");
CREATE INDEX IF NOT EXISTS "AdminActivityLog_adminActorUserId_idx" ON "AdminActivityLog"("adminActorUserId");
CREATE INDEX IF NOT EXISTS "AdminActivityLog_adminEmail_createdAt_idx" ON "AdminActivityLog"("adminEmail", "createdAt");
CREATE INDEX IF NOT EXISTS "AdminActivityLog_action_idx" ON "AdminActivityLog"("action");

CREATE TABLE IF NOT EXISTS "EmailTemplate" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "previewText" TEXT,
  "bodyText" TEXT NOT NULL,
  "bodyHtml" TEXT,
  "mergeFields" JSONB,
  "status" "EmailTemplateStatus" NOT NULL DEFAULT 'draft',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "EmailTemplate_category_idx" ON "EmailTemplate"("category");
CREATE INDEX IF NOT EXISTS "EmailTemplate_status_idx" ON "EmailTemplate"("status");

CREATE TABLE IF NOT EXISTS "EmailCampaign" (
  "id" TEXT PRIMARY KEY,
  "templateId" TEXT REFERENCES "EmailTemplate"("id") ON DELETE SET NULL,
  "name" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "previewText" TEXT,
  "message" TEXT NOT NULL,
  "status" "EmailCampaignStatus" NOT NULL DEFAULT 'draft',
  "source" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "EmailCampaign_status_idx" ON "EmailCampaign"("status");
CREATE INDEX IF NOT EXISTS "EmailCampaign_createdAt_idx" ON "EmailCampaign"("createdAt");

CREATE TABLE IF NOT EXISTS "EmailLead" (
  "id" TEXT PRIMARY KEY,
  "campaignId" TEXT NOT NULL REFERENCES "EmailCampaign"("id") ON DELETE CASCADE,
  "importedUserId" TEXT REFERENCES "ImportedUser"("id") ON DELETE SET NULL,
  "userId" TEXT REFERENCES "User"("id") ON DELETE SET NULL,
  "firstName" TEXT,
  "lastName" TEXT,
  "email" TEXT NOT NULL,
  "phone" TEXT,
  "businessName" TEXT,
  "source" TEXT,
  "status" "EmailLeadStatus" NOT NULL DEFAULT 'imported',
  "token" TEXT NOT NULL UNIQUE,
  "emailSentAt" TIMESTAMP(3),
  "emailSendCount" INTEGER NOT NULL DEFAULT 0,
  "clickedAt" TIMESTAMP(3),
  "clickCount" INTEGER NOT NULL DEFAULT 0,
  "registeredAt" TIMESTAMP(3),
  "doNotContact" BOOLEAN NOT NULL DEFAULT false,
  "providerMessageId" TEXT,
  "providerResult" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "EmailLead_campaignId_createdAt_idx" ON "EmailLead"("campaignId", "createdAt");
CREATE INDEX IF NOT EXISTS "EmailLead_email_idx" ON "EmailLead"("email");
CREATE INDEX IF NOT EXISTS "EmailLead_status_idx" ON "EmailLead"("status");

CREATE TABLE IF NOT EXISTS "EmailSend" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT REFERENCES "User"("id") ON DELETE SET NULL,
  "templateId" TEXT REFERENCES "EmailTemplate"("id") ON DELETE SET NULL,
  "campaignId" TEXT REFERENCES "EmailCampaign"("id") ON DELETE SET NULL,
  "leadId" TEXT REFERENCES "EmailLead"("id") ON DELETE SET NULL,
  "toEmail" TEXT NOT NULL,
  "fromEmail" TEXT,
  "replyTo" TEXT,
  "subject" TEXT NOT NULL,
  "bodyTextSnapshot" TEXT,
  "bodyHtmlSnapshot" TEXT,
  "provider" TEXT,
  "providerMessageId" TEXT,
  "status" "EmailSendStatus" NOT NULL DEFAULT 'pending',
  "sentByAdminUserId" TEXT REFERENCES "AdminUser"("id") ON DELETE SET NULL,
  "sentBySystem" BOOLEAN NOT NULL DEFAULT false,
  "sentAt" TIMESTAMP(3),
  "deliveredAt" TIMESTAMP(3),
  "openedAt" TIMESTAMP(3),
  "clickedAt" TIMESTAMP(3),
  "failedReason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "EmailSend_userId_idx" ON "EmailSend"("userId");
CREATE INDEX IF NOT EXISTS "EmailSend_templateId_idx" ON "EmailSend"("templateId");
CREATE INDEX IF NOT EXISTS "EmailSend_campaignId_idx" ON "EmailSend"("campaignId");
CREATE INDEX IF NOT EXISTS "EmailSend_status_idx" ON "EmailSend"("status");
CREATE INDEX IF NOT EXISTS "EmailSend_providerMessageId_idx" ON "EmailSend"("providerMessageId");

CREATE TABLE IF NOT EXISTS "EmailEvent" (
  "id" TEXT PRIMARY KEY,
  "emailSendId" TEXT NOT NULL REFERENCES "EmailSend"("id") ON DELETE CASCADE,
  "providerEventId" TEXT,
  "eventType" TEXT NOT NULL,
  "payload" JSONB,
  "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "EmailEvent_emailSendId_idx" ON "EmailEvent"("emailSendId");
CREATE INDEX IF NOT EXISTS "EmailEvent_eventType_idx" ON "EmailEvent"("eventType");
CREATE INDEX IF NOT EXISTS "EmailEvent_providerEventId_idx" ON "EmailEvent"("providerEventId");

CREATE TABLE IF NOT EXISTS "Affiliate" (
  "id" TEXT PRIMARY KEY,
  "code" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "email" TEXT,
  "status" "AffiliateStatus" NOT NULL DEFAULT 'active',
  "commissionAmountCents" INTEGER NOT NULL DEFAULT 6000,
  "monthlyQualifyingPayments" INTEGER NOT NULL DEFAULT 3,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "Affiliate_status_idx" ON "Affiliate"("status");

CREATE TABLE IF NOT EXISTS "AffiliateReferral" (
  "id" TEXT PRIMARY KEY,
  "affiliateId" TEXT NOT NULL REFERENCES "Affiliate"("id") ON DELETE CASCADE,
  "userId" TEXT NOT NULL UNIQUE REFERENCES "User"("id") ON DELETE CASCADE,
  "referralCode" TEXT NOT NULL,
  "landingPath" TEXT,
  "signupPath" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "AffiliateReferral_affiliateId_idx" ON "AffiliateReferral"("affiliateId");
CREATE INDEX IF NOT EXISTS "AffiliateReferral_referralCode_idx" ON "AffiliateReferral"("referralCode");

CREATE TABLE IF NOT EXISTS "AffiliateCommission" (
  "id" TEXT PRIMARY KEY,
  "affiliateId" TEXT NOT NULL REFERENCES "Affiliate"("id") ON DELETE CASCADE,
  "referralId" TEXT NOT NULL REFERENCES "AffiliateReferral"("id") ON DELETE CASCADE,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "plan" TEXT NOT NULL,
  "amountCents" INTEGER NOT NULL DEFAULT 6000,
  "currency" TEXT NOT NULL DEFAULT 'usd',
  "status" "CommissionStatus" NOT NULL DEFAULT 'pending',
  "qualifyingPaymentsRequired" INTEGER NOT NULL DEFAULT 1,
  "qualifyingPaymentsCount" INTEGER NOT NULL DEFAULT 0,
  "stripeCustomerId" TEXT,
  "stripeSubscriptionId" TEXT,
  "stripeCheckoutSessionId" TEXT,
  "eligibleAt" TIMESTAMP(3),
  "paidAt" TIMESTAMP(3),
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE ("referralId", "plan")
);
CREATE INDEX IF NOT EXISTS "AffiliateCommission_affiliateId_status_idx" ON "AffiliateCommission"("affiliateId", "status");
CREATE INDEX IF NOT EXISTS "AffiliateCommission_stripeSubscriptionId_idx" ON "AffiliateCommission"("stripeSubscriptionId");

CREATE TABLE IF NOT EXISTS "AffiliateInvoiceEvent" (
  "stripeInvoiceId" TEXT PRIMARY KEY,
  "commissionId" TEXT NOT NULL REFERENCES "AffiliateCommission"("id") ON DELETE CASCADE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "AffiliateInvoiceEvent_commissionId_idx" ON "AffiliateInvoiceEvent"("commissionId");

CREATE TABLE IF NOT EXISTS "MemberAccessEvent" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "pagePath" TEXT NOT NULL,
  "eventType" TEXT NOT NULL DEFAULT 'page_view',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "MemberAccessEvent_userId_createdAt_idx" ON "MemberAccessEvent"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "MemberAccessEvent_pagePath_idx" ON "MemberAccessEvent"("pagePath");

CREATE TABLE IF NOT EXISTS "MemberReadinessLock" (
  "userId" TEXT PRIMARY KEY REFERENCES "User"("id") ON DELETE CASCADE,
  "status" "ReadinessLockStatus" NOT NULL DEFAULT 'clear',
  "reason" TEXT,
  "message" TEXT,
  "flaggedAt" TIMESTAMP(3),
  "unlockAfter" TIMESTAMP(3),
  "adminUnlockedAt" TIMESTAMP(3),
  "adminUnlockedBy" TEXT,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "MemberReadinessLock_status_unlockAfter_idx" ON "MemberReadinessLock"("status", "unlockAfter");

CREATE TABLE IF NOT EXISTS "ReportSnapshot" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "scanId" TEXT REFERENCES "Scan"("id") ON DELETE SET NULL,
  "reportType" TEXT NOT NULL,
  "readinessStage" TEXT,
  "summaryJson" JSONB NOT NULL,
  "downloadedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "ReportSnapshot_userId_createdAt_idx" ON "ReportSnapshot"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "ReportSnapshot_scanId_idx" ON "ReportSnapshot"("scanId");

CREATE TABLE IF NOT EXISTS "PasswordResetToken" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "token" TEXT NOT NULL UNIQUE,
  "email" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "consumedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");
CREATE INDEX IF NOT EXISTS "PasswordResetToken_token_idx" ON "PasswordResetToken"("token");

CREATE TABLE IF NOT EXISTS "EmailVerificationToken" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "token" TEXT NOT NULL UNIQUE,
  "email" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "consumedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "EmailVerificationToken_userId_idx" ON "EmailVerificationToken"("userId");
CREATE INDEX IF NOT EXISTS "EmailVerificationToken_token_idx" ON "EmailVerificationToken"("token");

CREATE TABLE IF NOT EXISTS "RateLimit" (
  "bucket" TEXT PRIMARY KEY,
  "count" INTEGER NOT NULL DEFAULT 0,
  "resetAt" TIMESTAMP(3) NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
