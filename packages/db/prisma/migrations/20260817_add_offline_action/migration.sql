-- Phase 12: Mobile offline-first support

CREATE TABLE "OfflineAction" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "tenantId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "actionType" TEXT NOT NULL,
  "resourceType" TEXT NOT NULL,
  "resourceId" TEXT NOT NULL,
  "payload" JSONB,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "clientTimestamp" TIMESTAMP(3),
  "executedAt" TIMESTAMP(3),
  "failureReason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "OfflineAction_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE
);

-- Indexes for efficient querying
CREATE INDEX "OfflineAction_tenantId_idx" on "OfflineAction"("tenantId");
CREATE INDEX "OfflineAction_tenantId_userId_idx" on "OfflineAction"("tenantId", "userId");
CREATE INDEX "OfflineAction_tenantId_status_idx" on "OfflineAction"("tenantId", "status");
CREATE INDEX "OfflineAction_tenantId_createdAt_idx" on "OfflineAction"("tenantId", "createdAt" DESC);
