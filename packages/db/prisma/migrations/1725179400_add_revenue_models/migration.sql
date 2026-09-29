-- Revenue models: Offers, Deals, Scoring, Quotes

-- CreateTable "offers"
CREATE TABLE "offers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sku" TEXT,
    "basePrice" DECIMAL(12,2) NOT NULL,
    "minimumPrice" DECIMAL(12,2) NOT NULL,
    "discountCeiling" DECIMAL(5,2) NOT NULL DEFAULT 0.20,
    "setupFee" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurringPrice" DECIMAL(12,2),
    "billingCycle" TEXT,
    "includedFeatures" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "excludedFeatures" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "paymentTerms" TEXT,
    "standardDeliveryDays" INTEGER,
    "aiClosable" BOOLEAN NOT NULL DEFAULT false,
    "aiClosingPrompt" TEXT,
    "allowedIndustries" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "minBudget" DECIMAL(12,2),
    "maxBudget" DECIMAL(12,2),
    "escalationThreshold" DECIMAL(12,2) NOT NULL DEFAULT 10000,
    "requiredDisclosures" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "termsUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "offers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "offers_name_key" ON "offers"("name");

-- CreateIndex
CREATE UNIQUE INDEX "offers_sku_key" ON "offers"("sku");

-- CreateIndex
CREATE INDEX "offers_aiClosable_idx" ON "offers"("aiClosable");

-- CreateIndex
CREATE INDEX "offers_isActive_idx" ON "offers"("isActive");

-- CreateTable "deals"
CREATE TABLE "deals" (
    "id" TEXT NOT NULL,
    "leadId" TEXT,
    "customerId" TEXT,
    "value" DECIMAL(12,2),
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "stage" TEXT NOT NULL DEFAULT 'DISCOVERY',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "serviceType" TEXT,
    "description" TEXT,
    "ownerId" TEXT,
    "discoveredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "quotedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "aiClosableOfferId" TEXT,
    "escalationReason" TEXT,
    "escalatedToHumanAt" TIMESTAMP(3),
    "escalatedToHumanId" TEXT,
    "source" TEXT,
    "campaign" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "deals_leadId_key" ON "deals"("leadId");

-- CreateIndex
CREATE INDEX "deals_ownerId_idx" ON "deals"("ownerId");

-- CreateIndex
CREATE INDEX "deals_stage_idx" ON "deals"("stage");

-- CreateIndex
CREATE INDEX "deals_status_idx" ON "deals"("status");

-- CreateIndex
CREATE INDEX "deals_value_idx" ON "deals"("value");

-- CreateIndex
CREATE INDEX "deals_createdAt_idx" ON "deals"("createdAt");

-- CreateTable "lead_scores"
CREATE TABLE "lead_scores" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "fitScore" INTEGER NOT NULL DEFAULT 0,
    "urgencyScore" INTEGER NOT NULL DEFAULT 0,
    "budgetScore" INTEGER NOT NULL DEFAULT 0,
    "authorityScore" INTEGER NOT NULL DEFAULT 0,
    "timelineScore" INTEGER NOT NULL DEFAULT 0,
    "intentScore" INTEGER NOT NULL DEFAULT 0,
    "engagementScore" INTEGER NOT NULL DEFAULT 0,
    "totalScore" INTEGER NOT NULL DEFAULT 0,
    "level" TEXT NOT NULL DEFAULT 'COLD',
    "recommendedAction" TEXT,
    "recommendedOfferId" TEXT,
    "lastCalculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "formula" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lead_scores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "lead_scores_leadId_key" ON "lead_scores"("leadId");

-- CreateIndex
CREATE INDEX "lead_scores_leadId_idx" ON "lead_scores"("leadId");

-- CreateIndex
CREATE INDEX "lead_scores_level_idx" ON "lead_scores"("level");

-- CreateIndex
CREATE INDEX "lead_scores_totalScore_idx" ON "lead_scores"("totalScore");

-- CreateTable "quotes"
CREATE TABLE "quotes" (
    "id" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "basePrice" DECIMAL(12,2) NOT NULL,
    "discountAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "finalPrice" DECIMAL(12,2) NOT NULL,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "sentAt" TIMESTAMP(3),
    "viewedAt" TIMESTAMP(3),
    "acceptedAt" TIMESTAMP(3),
    "paymentLink" TEXT,
    "invoiceLink" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quotes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "quotes_dealId_idx" ON "quotes"("dealId");

-- CreateIndex
CREATE INDEX "quotes_status_idx" ON "quotes"("status");

-- CreateIndex
CREATE INDEX "quotes_validUntil_idx" ON "quotes"("validUntil");

-- CreateTable "deal_events"
CREATE TABLE "deal_events" (
    "id" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "description" TEXT,
    "details" JSONB,
    "performedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "deal_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "deal_events_dealId_idx" ON "deal_events"("dealId");

-- CreateIndex
CREATE INDEX "deal_events_eventType_idx" ON "deal_events"("eventType");

-- CreateIndex
CREATE INDEX "deal_events_createdAt_idx" ON "deal_events"("createdAt");

-- CreateTable "deal_activities"
CREATE TABLE "deal_activities" (
    "id" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "activityType" TEXT NOT NULL,
    "channel" TEXT,
    "summary" TEXT NOT NULL,
    "notes" TEXT,
    "scheduledFor" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "deal_activities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "deal_activities_dealId_idx" ON "deal_activities"("dealId");

-- CreateIndex
CREATE INDEX "deal_activities_activityType_idx" ON "deal_activities"("activityType");

-- CreateTable "revenue_events"
CREATE TABLE "revenue_events" (
    "id" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "dealId" TEXT,
    "quoteId" TEXT,
    "customerId" TEXT,
    "value" DECIMAL(12,2),
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "revenue_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "revenue_events_eventType_idx" ON "revenue_events"("eventType");

-- CreateIndex
CREATE INDEX "revenue_events_createdAt_idx" ON "revenue_events"("createdAt");

-- CreateTable "follow_up_tasks"
CREATE TABLE "follow_up_tasks" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "channel" TEXT NOT NULL,
    "message" TEXT,
    "template" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "optOut" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "follow_up_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "follow_up_tasks_leadId_idx" ON "follow_up_tasks"("leadId");

-- CreateIndex
CREATE INDEX "follow_up_tasks_status_idx" ON "follow_up_tasks"("status");

-- CreateIndex
CREATE INDEX "follow_up_tasks_scheduledFor_idx" ON "follow_up_tasks"("scheduledFor");

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_aiClosableOfferId_fkey" FOREIGN KEY ("aiClosableOfferId") REFERENCES "offers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_escalatedToHumanId_fkey" FOREIGN KEY ("escalatedToHumanId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_scores" ADD CONSTRAINT "lead_scores_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_scores" ADD CONSTRAINT "lead_scores_recommendedOfferId_fkey" FOREIGN KEY ("recommendedOfferId") REFERENCES "offers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "deals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "offers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deal_events" ADD CONSTRAINT "deal_events_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "deals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deal_activities" ADD CONSTRAINT "deal_activities_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "deals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follow_up_tasks" ADD CONSTRAINT "follow_up_tasks_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
