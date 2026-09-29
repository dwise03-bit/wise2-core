-- CreateEnum
CREATE TYPE "DigitalTwinStatus" AS ENUM (
  'DRAFT',
  'ONBOARDING',
  'TRAINING',
  'TESTING',
  'AWAITING_APPROVAL',
  'ACTIVE',
  'PAUSED',
  'REVOKED',
  'ARCHIVED'
);

-- CreateEnum
CREATE TYPE "DigitalTwinAutonomyLevel" AS ENUM (
  'LEVEL_0',
  'LEVEL_1',
  'LEVEL_2',
  'LEVEL_3'
);

-- CreateEnum
CREATE TYPE "DigitalTwinConsentType" AS ENUM (
  'VOICE_CLONING',
  'VIDEO_LIKENESS',
  'AVATAR_CREATION',
  'SYNTHETIC_SPEECH',
  'PUBLIC_CONTENT',
  'SALES_COMMUNICATION',
  'CUSTOMER_COMMUNICATION'
);

-- CreateTable
CREATE TABLE "DigitalTwin" (
  "id" TEXT NOT NULL,
  "tenant_id" TEXT NOT NULL,
  "owner_user_id" TEXT,
  "package_id" TEXT,
  "name" TEXT NOT NULL,
  "display_name" TEXT,
  "status" "DigitalTwinStatus" NOT NULL DEFAULT 'DRAFT',
  "onboarding_status" TEXT,
  "autonomy_level" "DigitalTwinAutonomyLevel" NOT NULL DEFAULT 'LEVEL_1',
  "business_profile" JSONB,
  "brand_profile" JSONB,
  "writing_profile" JSONB,
  "voice_profile" JSONB,
  "avatar_profile" JSONB,
  "sales_profile" JSONB,
  "support_profile" JSONB,
  "content_profile" JSONB,
  "permissions" JSONB,
  "approval_policy" JSONB,
  "risk_policy" JSONB,
  "activated_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DigitalTwin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DigitalTwinKnowledgeItem" (
  "id" TEXT NOT NULL,
  "tenant_id" TEXT NOT NULL,
  "digital_twin_id" TEXT NOT NULL,
  "source_type" TEXT NOT NULL,
  "source_name" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "version" TEXT,
  "approved" BOOLEAN NOT NULL DEFAULT false,
  "approved_by" TEXT,
  "approved_at" TIMESTAMP(3),
  "metadata" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DigitalTwinKnowledgeItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DigitalTwinConsent" (
  "id" TEXT NOT NULL,
  "tenant_id" TEXT NOT NULL,
  "digital_twin_id" TEXT NOT NULL,
  "consent_type" "DigitalTwinConsentType" NOT NULL,
  "granted" BOOLEAN NOT NULL,
  "granted_by" TEXT,
  "granted_at" TIMESTAMP(3),
  "revoked_at" TIMESTAMP(3),
  "source_asset" TEXT,
  "version" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DigitalTwinConsent_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE INDEX "DigitalTwin_tenant_id_idx" ON "DigitalTwin"("tenant_id");
CREATE INDEX "DigitalTwin_tenant_id_status_idx" ON "DigitalTwin"("tenant_id", "status");
CREATE INDEX "DigitalTwinKnowledgeItem_tenant_id_idx" ON "DigitalTwinKnowledgeItem"("tenant_id");
CREATE INDEX "DigitalTwinKnowledgeItem_tenant_id_status_idx" ON "DigitalTwinKnowledgeItem"("tenant_id", "status");
CREATE INDEX "DigitalTwinKnowledgeItem_digital_twin_id_idx" ON "DigitalTwinKnowledgeItem"("digital_twin_id");
CREATE INDEX "DigitalTwinConsent_tenant_id_idx" ON "DigitalTwinConsent"("tenant_id");
CREATE INDEX "DigitalTwinConsent_digital_twin_id_idx" ON "DigitalTwinConsent"("digital_twin_id");
CREATE INDEX "DigitalTwinConsent_tenant_id_consent_type_idx" ON "DigitalTwinConsent"("tenant_id", "consent_type");

-- Foreign keys
ALTER TABLE "DigitalTwin"
  ADD CONSTRAINT "DigitalTwin_tenant_id_fkey"
  FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DigitalTwinKnowledgeItem"
  ADD CONSTRAINT "DigitalTwinKnowledgeItem_tenant_id_fkey"
  FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DigitalTwinKnowledgeItem"
  ADD CONSTRAINT "DigitalTwinKnowledgeItem_digital_twin_id_fkey"
  FOREIGN KEY ("digital_twin_id") REFERENCES "DigitalTwin"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DigitalTwinConsent"
  ADD CONSTRAINT "DigitalTwinConsent_tenant_id_fkey"
  FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DigitalTwinConsent"
  ADD CONSTRAINT "DigitalTwinConsent_digital_twin_id_fkey"
  FOREIGN KEY ("digital_twin_id") REFERENCES "DigitalTwin"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
