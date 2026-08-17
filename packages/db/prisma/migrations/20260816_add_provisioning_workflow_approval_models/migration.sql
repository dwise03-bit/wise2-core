-- CreateEnum for TenantState
CREATE TYPE "TenantState" AS ENUM ('PAYMENT_PENDING', 'PROVISIONING', 'ONBOARDING', 'ACTIVE', 'PAST_DUE', 'SUSPENDED', 'CANCELLED', 'ARCHIVED');

-- CreateEnum for Provisioning models
CREATE TYPE "ProvisioningStep" AS ENUM ('CREATE_TENANT', 'CREATE_MEMBERSHIP', 'INITIALIZE_DATABASE', 'LOAD_TEMPLATE', 'CREATE_PIPELINE', 'CREATE_WORKFLOWS', 'INITIALIZE_HERMES', 'PROVISION_DISCORD', 'START_ONBOARDING', 'ACTIVATE');
CREATE TYPE "ProvisioningStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'RETRYING', 'SKIPPED');

-- CreateEnum for Approval
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED', 'EXECUTED', 'FAILED');

-- CreateEnum for Workflow
CREATE TYPE "WorkflowTrigger" AS ENUM ('LEAD_CREATED', 'LEAD_STATUS_CHANGED', 'ESTIMATE_SENT', 'ESTIMATE_VIEWED', 'JOB_CREATED', 'JOB_COMPLETED', 'CONVERSATION_RECEIVED', 'CAMPAIGN_STARTED', 'SCHEDULED_TIME', 'MANUAL');

-- CreateEnum for FollowUp
CREATE TYPE "FollowUpType" AS ENUM ('LEAD_CONTACT', 'ESTIMATE_FOLLOW_UP', 'JOB_SCHEDULING', 'JOB_REMINDER', 'POST_SERVICE', 'REVIEW_REQUEST', 'PAYMENT_REMINDER', 'MAINTENANCE_OPPORTUNITY', 'REACTIVATION');
CREATE TYPE "FollowUpStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED', 'FAILED');

-- AlterTable Tenant
ALTER TABLE "Tenant" ADD COLUMN "state" "TenantState" NOT NULL DEFAULT 'PAYMENT_PENDING',
ADD COLUMN "demoMode" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "stripeCustomerId" TEXT,
ADD COLUMN "stripeSubscriptionId" TEXT,
ADD COLUMN "discordGuildId" TEXT,
ADD COLUMN "discordBotToken" TEXT,
ADD COLUMN "onboardingStep" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "onboardingCompletedAt" TIMESTAMP(3);

-- Create unique constraints on Tenant
CREATE UNIQUE INDEX "Tenant_stripeCustomerId_key" ON "Tenant"("stripeCustomerId");
CREATE UNIQUE INDEX "Tenant_stripeSubscriptionId_key" ON "Tenant"("stripeSubscriptionId");
CREATE UNIQUE INDEX "Tenant_discordGuildId_key" ON "Tenant"("discordGuildId");
CREATE INDEX "Tenant_state_idx" ON "Tenant"("state");
CREATE INDEX "Tenant_stripeCustomerId_idx" ON "Tenant"("stripeCustomerId");

-- CreateTable ProvisioningRun
CREATE TABLE "ProvisioningRun" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "paymentEventId" TEXT,
    "paymentEventType" TEXT,
    "currentStep" "ProvisioningStep" NOT NULL DEFAULT 'CREATE_TENANT',
    "status" "ProvisioningStatus" NOT NULL DEFAULT 'PENDING',
    "completedSteps" "ProvisioningStep"[] DEFAULT ARRAY[]::"ProvisioningStep"[],
    "lastError" TEXT,
    "lastErrorStep" "ProvisioningStep",
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProvisioningRun_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ProvisioningRun_tenantId_key" ON "ProvisioningRun"("tenantId");
CREATE INDEX "ProvisioningRun_status_idx" ON "ProvisioningRun"("status");
CREATE INDEX "ProvisioningRun_tenantId_status_idx" ON "ProvisioningRun"("tenantId", "status");

-- CreateTable Approval
CREATE TABLE "Approval" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "actor" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "payloadHash" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "preview" TEXT NOT NULL,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "approver" TEXT,
    "note" TEXT,
    "approvedAt" TIMESTAMP(3),
    "executedAt" TIMESTAMP(3),
    "executionResult" JSONB,
    "executionError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Approval_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Approval_payloadHash_key" ON "Approval"("payloadHash");
CREATE INDEX "Approval_tenantId_idx" ON "Approval"("tenantId");
CREATE INDEX "Approval_tenantId_status_idx" ON "Approval"("tenantId", "status");
CREATE INDEX "Approval_tenantId_actor_idx" ON "Approval"("tenantId", "actor");
CREATE INDEX "Approval_expiresAt_idx" ON "Approval"("expiresAt");

-- CreateTable WorkflowDefinition
CREATE TABLE "WorkflowDefinition" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "trigger" "WorkflowTrigger" NOT NULL,
    "triggerConditions" JSONB,
    "steps" JSONB NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkflowDefinition_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "WorkflowDefinition_tenantId_trigger_key" ON "WorkflowDefinition"("tenantId", "trigger");
CREATE INDEX "WorkflowDefinition_tenantId_idx" ON "WorkflowDefinition"("tenantId");
CREATE INDEX "WorkflowDefinition_tenantId_enabled_idx" ON "WorkflowDefinition"("tenantId", "enabled");

-- CreateTable WorkflowRun
CREATE TABLE "WorkflowRun" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "triggerEntityType" TEXT NOT NULL,
    "triggerEntityId" TEXT NOT NULL,
    "status" "AutomationRunStatus" NOT NULL DEFAULT 'PENDING',
    "results" JSONB,
    "error" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkflowRun_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "WorkflowRun_workflowId_idx" ON "WorkflowRun"("workflowId");
CREATE INDEX "WorkflowRun_status_idx" ON "WorkflowRun"("status");
CREATE INDEX "WorkflowRun_triggerEntityType_triggerEntityId_idx" ON "WorkflowRun"("triggerEntityType", "triggerEntityId");

-- CreateTable FollowUp
CREATE TABLE "FollowUp" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "followUpType" "FollowUpType" NOT NULL,
    "relatedEntityType" TEXT NOT NULL,
    "relatedEntityId" TEXT NOT NULL,
    "assignedTo" TEXT,
    "message" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "status" "FollowUpStatus" NOT NULL DEFAULT 'PENDING',
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FollowUp_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "FollowUp_tenantId_idx" ON "FollowUp"("tenantId");
CREATE INDEX "FollowUp_tenantId_status_idx" ON "FollowUp"("tenantId", "status");
CREATE INDEX "FollowUp_tenantId_dueAt_idx" ON "FollowUp"("tenantId", "dueAt");
CREATE INDEX "FollowUp_relatedEntityType_relatedEntityId_idx" ON "FollowUp"("relatedEntityType", "relatedEntityId");

-- CreateTable Contract
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "contractValue" DECIMAL(12,2) NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "renewalDate" TIMESTAMP(3) NOT NULL,
    "frequency" TEXT,
    "services" TEXT[] DEFAULT ARRAY[]::"text"[],
    "status" TEXT NOT NULL DEFAULT 'active',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Contract_tenantId_idx" ON "Contract"("tenantId");
CREATE INDEX "Contract_customerId_idx" ON "Contract"("customerId");
CREATE INDEX "Contract_status_idx" ON "Contract"("status");
CREATE INDEX "Contract_renewalDate_idx" ON "Contract"("renewalDate");

-- CreateTable AuditLog
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "actor" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "changesBefore" JSONB,
    "changesAfter" JSONB,
    "traceId" TEXT,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AuditLog_tenantId_idx" ON "AuditLog"("tenantId");
CREATE INDEX "AuditLog_actor_idx" ON "AuditLog"("actor");
CREATE INDEX "AuditLog_resourceType_resourceId_idx" ON "AuditLog"("resourceType", "resourceId");
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- AddForeignKey for ProvisioningRun
ALTER TABLE "ProvisioningRun" ADD CONSTRAINT "ProvisioningRun_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey for Approval
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey for WorkflowDefinition
ALTER TABLE "WorkflowDefinition" ADD CONSTRAINT "WorkflowDefinition_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey for WorkflowRun
ALTER TABLE "WorkflowRun" ADD CONSTRAINT "WorkflowRun_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "WorkflowDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey for FollowUp
ALTER TABLE "FollowUp" ADD CONSTRAINT "FollowUp_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey for Contract
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "RevenueCustomer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey for AuditLog
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
