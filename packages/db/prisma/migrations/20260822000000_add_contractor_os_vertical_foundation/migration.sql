-- Contractor OS Phase 1 foundation. Purely additive: new nullable/defaulted
-- columns and a new table. Does not touch HvacServiceCategory or any
-- existing HVAC-specific business logic.

-- Per-tenant module flags (e.g. ["crm", "jobs", "team_chat", "storm"]).
-- Empty array means "use the platform default set for this vertical."
ALTER TABLE "Tenant" ADD COLUMN "enabledModules" TEXT[] NOT NULL DEFAULT '{}';

-- Vertical-agnostic lead classification, alongside the HVAC-only hvacCategory.
ALTER TABLE "Lead" ADD COLUMN "serviceCategory" TEXT;

-- Per-vertical estimate/service-category template. Global templates have a
-- NULL tenant_id; a tenant may clone one into its own tenant-scoped copy.
CREATE TABLE "VerticalTemplate" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT,
    "vertical" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "categories" TEXT[] NOT NULL DEFAULT '{}',
    "lineItems" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerticalTemplate_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "VerticalTemplate_tenant_id_vertical_name_key" ON "VerticalTemplate"("tenant_id", "vertical", "name");
CREATE INDEX "VerticalTemplate_vertical_idx" ON "VerticalTemplate"("vertical");

ALTER TABLE "VerticalTemplate" ADD CONSTRAINT "VerticalTemplate_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
