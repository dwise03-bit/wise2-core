-- CreateEnum
CREATE TYPE "ConsultingLeadStatus" AS ENUM ('NEW', 'QUALIFYING', 'QUALIFIED', 'BOOKED', 'PAID', 'CONVERTED', 'DISQUALIFIED');

-- CreateEnum
CREATE TYPE "ConsultingFollowUpType" AS ENUM ('INTAKE_CONFIRMATION', 'QUALIFICATION_RESULT', 'PAYMENT_CONFIRMATION', 'BOOKING_CONFIRMATION', 'SESSION_REMINDER_24H', 'SESSION_REMINDER_1H', 'SESSION_COMPLETE', 'DELIVERABLES', 'FOLLOWUP_24H', 'FOLLOWUP_7D', 'FOLLOWUP_30D', 'MANAGEMENT_OFFER', 'CUSTOM_EMAIL', 'CUSTOM_CALL');

-- CreateEnum
CREATE TYPE "ConsultingFollowUpStatus" AS ENUM ('PENDING', 'SENT', 'COMPLETED', 'FAILED');

-- AlterTable: Extend ConsultingService
ALTER TABLE "ConsultingService" ADD COLUMN "stripePriceId" TEXT,
ADD COLUMN "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "isRecurring" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "isManagementTier" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "prepInstructions" TEXT,
ADD COLUMN "confirmationText" TEXT;

-- AlterTable: Extend Booking
ALTER TABLE "Booking" ADD COLUMN "stripeCheckoutSessionId" TEXT,
ADD COLUMN "bookingId" TEXT,
ADD COLUMN "deliverableReportUrl" TEXT,
ADD COLUMN "managementSubscriptionId" TEXT;

-- CreateTable: ConsultingLead
CREATE TABLE "ConsultingLead" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "companyName" TEXT NOT NULL,
    "website" TEXT,
    "industry" TEXT,
    "businessDescription" TEXT,
    "currentProblem" TEXT NOT NULL,
    "desiredBuild" TEXT NOT NULL,
    "currentTools" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "desiredResult" TEXT,
    "timeline" TEXT,
    "budgetRange" TEXT,
    "teamSize" INTEGER,
    "revenueRange" TEXT,
    "crm" TEXT,
    "websitePlatform" TEXT,
    "socialPlatforms" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "existingAutomations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "aiTools" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "leadScore" INTEGER NOT NULL DEFAULT 0,
    "qualificationStatus" "ConsultingLeadStatus" NOT NULL DEFAULT 'NEW',
    "recommendedService" TEXT,
    "recommendedNextAction" TEXT,
    "notes" TEXT,
    "source" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "leadConvertedAt" TIMESTAMP(3),

    CONSTRAINT "ConsultingLead_pkey" PRIMARY KEY ("id")
);

-- CreateTable: ConsultingFollowUp
CREATE TABLE "ConsultingFollowUp" (
    "id" TEXT NOT NULL,
    "leadId" TEXT,
    "bookingId" TEXT,
    "type" "ConsultingFollowUpType" NOT NULL,
    "description" TEXT,
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "status" "ConsultingFollowUpStatus" NOT NULL DEFAULT 'PENDING',
    "sentAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConsultingFollowUp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ConsultingLead_bookingId_key" ON "ConsultingLead"("bookingId");

-- CreateIndex
CREATE INDEX "ConsultingLead_email_idx" ON "ConsultingLead"("email");

-- CreateIndex
CREATE INDEX "ConsultingLead_qualificationStatus_idx" ON "ConsultingLead"("qualificationStatus");

-- CreateIndex
CREATE INDEX "ConsultingLead_leadScore_idx" ON "ConsultingLead"("leadScore");

-- CreateIndex
CREATE INDEX "ConsultingLead_createdAt_idx" ON "ConsultingLead"("createdAt");

-- CreateIndex
CREATE INDEX "ConsultingFollowUp_leadId_idx" ON "ConsultingFollowUp"("leadId");

-- CreateIndex
CREATE INDEX "ConsultingFollowUp_bookingId_idx" ON "ConsultingFollowUp"("bookingId");

-- CreateIndex
CREATE INDEX "ConsultingFollowUp_status_idx" ON "ConsultingFollowUp"("status");

-- CreateIndex
CREATE INDEX "ConsultingFollowUp_scheduledFor_idx" ON "ConsultingFollowUp"("scheduledFor");

-- AddForeignKey
ALTER TABLE "ConsultingLead" ADD CONSTRAINT "ConsultingLead_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsultingFollowUp" ADD CONSTRAINT "ConsultingFollowUp_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "ConsultingLead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsultingFollowUp" ADD CONSTRAINT "ConsultingFollowUp_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;
