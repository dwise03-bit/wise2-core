-- Rename tenant ownership columns to snake_case so they match the updated Prisma schema.
-- These are metadata-only column renames; Postgres updates dependent indexes and foreign keys.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'TenantMembership'
      AND column_name = 'tenantId'
  ) THEN
    EXECUTE 'ALTER TABLE "TenantMembership" RENAME COLUMN "tenantId" TO "tenant_id"';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'RevenueCustomer'
      AND column_name = 'tenantId'
  ) THEN
    EXECUTE 'ALTER TABLE "RevenueCustomer" RENAME COLUMN "tenantId" TO "tenant_id"';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Lead'
      AND column_name = 'tenantId'
  ) THEN
    EXECUTE 'ALTER TABLE "Lead" RENAME COLUMN "tenantId" TO "tenant_id"';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Conversation'
      AND column_name = 'tenantId'
  ) THEN
    EXECUTE 'ALTER TABLE "Conversation" RENAME COLUMN "tenantId" TO "tenant_id"';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'ServiceJob'
      AND column_name = 'tenantId'
  ) THEN
    EXECUTE 'ALTER TABLE "ServiceJob" RENAME COLUMN "tenantId" TO "tenant_id"';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Estimate'
      AND column_name = 'tenantId'
  ) THEN
    EXECUTE 'ALTER TABLE "Estimate" RENAME COLUMN "tenantId" TO "tenant_id"';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Campaign'
      AND column_name = 'tenantId'
  ) THEN
    EXECUTE 'ALTER TABLE "Campaign" RENAME COLUMN "tenantId" TO "tenant_id"';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'AgentConfig'
      AND column_name = 'tenantId'
  ) THEN
    EXECUTE 'ALTER TABLE "AgentConfig" RENAME COLUMN "tenantId" TO "tenant_id"';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'AutomationRun'
      AND column_name = 'tenantId'
  ) THEN
    EXECUTE 'ALTER TABLE "AutomationRun" RENAME COLUMN "tenantId" TO "tenant_id"';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'WebhookEvent'
      AND column_name = 'tenantId'
  ) THEN
    EXECUTE 'ALTER TABLE "WebhookEvent" RENAME COLUMN "tenantId" TO "tenant_id"';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'ProvisioningRun'
      AND column_name = 'tenantId'
  ) THEN
    EXECUTE 'ALTER TABLE "ProvisioningRun" RENAME COLUMN "tenantId" TO "tenant_id"';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Approval'
      AND column_name = 'tenantId'
  ) THEN
    EXECUTE 'ALTER TABLE "Approval" RENAME COLUMN "tenantId" TO "tenant_id"';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'WorkflowDefinition'
      AND column_name = 'tenantId'
  ) THEN
    EXECUTE 'ALTER TABLE "WorkflowDefinition" RENAME COLUMN "tenantId" TO "tenant_id"';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'FollowUp'
      AND column_name = 'tenantId'
  ) THEN
    EXECUTE 'ALTER TABLE "FollowUp" RENAME COLUMN "tenantId" TO "tenant_id"';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Contract'
      AND column_name = 'tenantId'
  ) THEN
    EXECUTE 'ALTER TABLE "Contract" RENAME COLUMN "tenantId" TO "tenant_id"';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'AuditLog'
      AND column_name = 'tenantId'
  ) THEN
    EXECUTE 'ALTER TABLE "AuditLog" RENAME COLUMN "tenantId" TO "tenant_id"';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'ConsentRecord'
      AND column_name = 'tenantId'
  ) THEN
    EXECUTE 'ALTER TABLE "ConsentRecord" RENAME COLUMN "tenantId" TO "tenant_id"';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'SafetyEvent'
      AND column_name = 'tenantId'
  ) THEN
    EXECUTE 'ALTER TABLE "SafetyEvent" RENAME COLUMN "tenantId" TO "tenant_id"';
  END IF;
END $$;
