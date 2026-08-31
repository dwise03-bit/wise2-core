-- CreateTable
CREATE TABLE "BusinessOsLeadClaim" (
    "id"        TEXT         NOT NULL,
    "leadId"    TEXT         NOT NULL,
    "claimedBy" TEXT         NOT NULL,
    "claimedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BusinessOsLeadClaim_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BusinessOsLeadClaim_leadId_key" ON "BusinessOsLeadClaim"("leadId");

-- CreateIndex
CREATE INDEX "BusinessOsLeadClaim_claimedBy_idx" ON "BusinessOsLeadClaim"("claimedBy");
