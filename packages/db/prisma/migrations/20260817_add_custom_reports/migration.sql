-- Phase 11: Custom Reports and Advanced Analytics

CREATE TABLE "CustomReport" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "tenantId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "filters" JSONB,
  "groupBy" TEXT[],
  "metrics" TEXT[],
  "description" TEXT,
  "isPublic" BOOLEAN NOT NULL DEFAULT false,
  "lastRunAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "CustomReport_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE
);

-- Indexes for efficient querying
CREATE INDEX "CustomReport_tenantId_idx" on "CustomReport"("tenantId");
CREATE INDEX "CustomReport_tenantId_type_idx" on "CustomReport"("tenantId", "type");
CREATE UNIQUE INDEX "CustomReport_tenantId_name_key" on "CustomReport"("tenantId", "name");
