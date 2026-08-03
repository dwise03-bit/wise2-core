-- CreateEnum
CREATE TYPE "AuditStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'ANALYZED');

-- CreateEnum
CREATE TYPE "AnalysisStatus" AS ENUM ('PENDING', 'ANALYZING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "FindingCategory" AS ENUM ('COST_LEAK', 'PROCESS_GAP', 'AUTOMATION_OPPORTUNITY', 'SECURITY_RISK', 'COMPLIANCE_ISSUE', 'DATA_QUALITY_ISSUE', 'OTHER');

-- CreateEnum
CREATE TYPE "FindingSeverity" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "ProposalStatus" AS ENUM ('DRAFT', 'SENT', 'VIEWED', 'ACCEPTED', 'DECLINED');

-- AlterTable
ALTER TABLE "Prospect" ADD COLUMN "auditSessionId" TEXT;

-- CreateTable
CREATE TABLE "AuditSession" (
    "id" TEXT NOT NULL,
    "prospectId" TEXT NOT NULL,
    "status" "AuditStatus" NOT NULL DEFAULT 'SCHEDULED',
    "transcriptUrl" TEXT,
    "transcript" TEXT,
    "auditNotes" TEXT,
    "auditedAt" TIMESTAMP(3),
    "analysisStatus" "AnalysisStatus" NOT NULL DEFAULT 'PENDING',
    "analysisErrorMsg" TEXT,
    "analyzedAt" TIMESTAMP(3),
    "aiReadinessScore" INTEGER,
    "scoreDetails" JSONB,
    "totalMoneyLeaks" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "estimatedROI" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuditSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Finding" (
    "id" TEXT NOT NULL,
    "auditSessionId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "FindingCategory" NOT NULL,
    "severity" "FindingSeverity" NOT NULL,
    "evidenceSnippet" TEXT,
    "evidenceUrl" TEXT,
    "estimatedAnnualImpact" DOUBLE PRECISION,
    "implementationDays" INTEGER,
    "recommendedAction" TEXT NOT NULL,
    "isCustom" BOOLEAN NOT NULL DEFAULT false,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Finding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceCatalogItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "setupPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "monthlyPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "annualPrice" DOUBLE PRECISION,
    "implementationDays" INTEGER,
    "expectedOutcomes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceCatalogItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Proposal" (
    "id" TEXT NOT NULL,
    "prospectId" TEXT NOT NULL,
    "auditSessionId" TEXT,
    "title" TEXT NOT NULL,
    "status" "ProposalStatus" NOT NULL DEFAULT 'DRAFT',
    "summary" TEXT NOT NULL,
    "problemStatement" TEXT NOT NULL,
    "proposedSolution" TEXT NOT NULL,
    "expectedOutcomes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "totalSetupPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalMonthlyPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "setupPriceDiscount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "monthlyPriceDiscount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "estimatedROI" DOUBLE PRECISION,
    "paybackPeriodMonths" DOUBLE PRECISION,
    "sentAt" TIMESTAMP(3),
    "viewedAt" TIMESTAMP(3),
    "acceptedAt" TIMESTAMP(3),
    "declinedAt" TIMESTAMP(3),
    "declineReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Proposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProposalLineItem" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "serviceId" TEXT,
    "serviceName" TEXT NOT NULL,
    "setupPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "monthlyPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "description" TEXT,
    "implementationDays" INTEGER,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProposalLineItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AuditSession_prospectId_key" ON "AuditSession"("prospectId");

-- CreateIndex
CREATE INDEX "AuditSession_prospectId_idx" ON "AuditSession"("prospectId");

-- CreateIndex
CREATE INDEX "AuditSession_status_idx" ON "AuditSession"("status");

-- CreateIndex
CREATE INDEX "AuditSession_analysisStatus_idx" ON "AuditSession"("analysisStatus");

-- CreateIndex
CREATE INDEX "Finding_auditSessionId_idx" ON "Finding"("auditSessionId");

-- CreateIndex
CREATE INDEX "Finding_category_idx" ON "Finding"("category");

-- CreateIndex
CREATE INDEX "Finding_severity_idx" ON "Finding"("severity");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceCatalogItem_name_key" ON "ServiceCatalogItem"("name");

-- CreateIndex
CREATE INDEX "ServiceCatalogItem_category_idx" ON "ServiceCatalogItem"("category");

-- CreateIndex
CREATE INDEX "ServiceCatalogItem_isActive_idx" ON "ServiceCatalogItem"("isActive");

-- CreateIndex
CREATE INDEX "Proposal_prospectId_idx" ON "Proposal"("prospectId");

-- CreateIndex
CREATE INDEX "Proposal_auditSessionId_idx" ON "Proposal"("auditSessionId");

-- CreateIndex
CREATE INDEX "Proposal_status_idx" ON "Proposal"("status");

-- CreateIndex
CREATE INDEX "Proposal_createdAt_idx" ON "Proposal"("createdAt");

-- CreateIndex
CREATE INDEX "ProposalLineItem_proposalId_idx" ON "ProposalLineItem"("proposalId");

-- CreateIndex
CREATE INDEX "ProposalLineItem_serviceId_idx" ON "ProposalLineItem"("serviceId");

-- AddForeignKey
ALTER TABLE "AuditSession" ADD CONSTRAINT "AuditSession_prospectId_fkey" FOREIGN KEY ("prospectId") REFERENCES "Prospect"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Finding" ADD CONSTRAINT "Finding_auditSessionId_fkey" FOREIGN KEY ("auditSessionId") REFERENCES "AuditSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_prospectId_fkey" FOREIGN KEY ("prospectId") REFERENCES "Prospect"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_auditSessionId_fkey" FOREIGN KEY ("auditSessionId") REFERENCES "AuditSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposalLineItem" ADD CONSTRAINT "ProposalLineItem_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
