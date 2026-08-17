-- Phase 7: Communication model for multi-channel messaging

CREATE TABLE "Communication" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "tenantId" TEXT NOT NULL,
  "channel" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "recipient" TEXT NOT NULL,
  "recipientId" TEXT,
  "recipientType" TEXT NOT NULL DEFAULT 'UNKNOWN',
  "subject" TEXT,
  "message" TEXT,
  "metadata" JSONB,
  "externalId" TEXT,
  "sentAt" TIMESTAMP(3),
  "deliveredAt" TIMESTAMP(3),
  "failedAt" TIMESTAMP(3),
  "failureReason" TEXT,
  "retryCount" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Communication_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE
);

-- Indexes for efficient querying
CREATE INDEX "Communication_tenantId_idx" on "Communication"("tenantId");
CREATE INDEX "Communication_tenantId_channel_idx" on "Communication"("tenantId", "channel");
CREATE INDEX "Communication_tenantId_status_idx" on "Communication"("tenantId", "status");
CREATE INDEX "Communication_tenantId_createdAt_idx" on "Communication"("tenantId", "createdAt" DESC);
CREATE INDEX "Communication_externalId_idx" on "Communication"("externalId");
CREATE UNIQUE INDEX "Communication_channel_externalId_key" on "Communication"("channel", "externalId") WHERE "externalId" IS NOT NULL;
