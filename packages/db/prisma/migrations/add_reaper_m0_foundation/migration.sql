-- REAPER V1 M0 Foundation Tables

-- Organizations (multi-tenant root)
CREATE TABLE IF NOT EXISTS "reaper_organizations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL UNIQUE,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "reaper_organizations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE
);

CREATE INDEX "reaper_organizations_userId_idx" ON "reaper_organizations"("userId");

-- Organization Members
CREATE TABLE IF NOT EXISTS "reaper_organization_members" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "reaper_organization_members_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "reaper_organizations" ("id") ON DELETE CASCADE,
    CONSTRAINT "reaper_organization_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE,
    CONSTRAINT "reaper_organization_members_organizationId_userId_key" UNIQUE("organizationId", "userId")
);

CREATE INDEX "reaper_organization_members_organizationId_idx" ON "reaper_organization_members"("organizationId");
CREATE INDEX "reaper_organization_members_userId_idx" ON "reaper_organization_members"("userId");

-- Prospects (inbound opportunities)
CREATE TABLE IF NOT EXISTS "reaper_prospects" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "companyName" TEXT NOT NULL,
    "contactName" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DISCOVERY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "reaper_prospects_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "reaper_organizations" ("id") ON DELETE CASCADE
);

CREATE INDEX "reaper_prospects_organizationId_idx" ON "reaper_prospects"("organizationId");
CREATE INDEX "reaper_prospects_status_idx" ON "reaper_prospects"("status");
CREATE INDEX "reaper_prospects_companyName_idx" ON "reaper_prospects"("companyName");

-- Businesses (normalized business entity)
CREATE TABLE IF NOT EXISTS "reaper_businesses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "prospectId" TEXT UNIQUE,
    "name" TEXT NOT NULL,
    "industry" TEXT,
    "description" TEXT,
    "annualRevenue" INTEGER,
    "employeeCount" INTEGER,
    "yearsInBusiness" INTEGER,
    "website" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "reaper_businesses_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "reaper_organizations" ("id") ON DELETE CASCADE,
    CONSTRAINT "reaper_businesses_prospectId_fkey" FOREIGN KEY ("prospectId") REFERENCES "reaper_prospects" ("id") ON DELETE SET NULL
);

CREATE INDEX "reaper_businesses_organizationId_idx" ON "reaper_businesses"("organizationId");
CREATE INDEX "reaper_businesses_name_idx" ON "reaper_businesses"("name");

-- Business Locations
CREATE TABLE IF NOT EXISTS "reaper_business_locations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "businessId" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT,
    "postalCode" TEXT,
    "country" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "reaper_business_locations_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "reaper_businesses" ("id") ON DELETE CASCADE
);

CREATE INDEX "reaper_business_locations_businessId_idx" ON "reaper_business_locations"("businessId");

-- Websites
CREATE TABLE IF NOT EXISTS "reaper_websites" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "businessId" TEXT,
    "url" TEXT NOT NULL UNIQUE,
    "domain" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "lastCrawledAt" TIMESTAMP(3),
    "httpStatus" INTEGER,
    "isAccessible" BOOLEAN NOT NULL DEFAULT true,
    "desktopScreenshot" TEXT,
    "mobileScreenshot" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "reaper_websites_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "reaper_organizations" ("id") ON DELETE CASCADE,
    CONSTRAINT "reaper_websites_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "reaper_businesses" ("id") ON DELETE SET NULL
);

CREATE INDEX "reaper_websites_organizationId_idx" ON "reaper_websites"("organizationId");
CREATE INDEX "reaper_websites_businessId_idx" ON "reaper_websites"("businessId");
CREATE INDEX "reaper_websites_domain_idx" ON "reaper_websites"("domain");

-- Website Pages
CREATE TABLE IF NOT EXISTS "reaper_website_pages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "websiteId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "h1" TEXT,
    "contentPreview" TEXT,
    "hasContactForm" BOOLEAN NOT NULL DEFAULT false,
    "hasPhoneNumber" BOOLEAN NOT NULL DEFAULT false,
    "hasEmailAddress" BOOLEAN NOT NULL DEFAULT false,
    "ctas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "reaper_website_pages_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "reaper_websites" ("id") ON DELETE CASCADE,
    CONSTRAINT "reaper_website_pages_websiteId_path_key" UNIQUE("websiteId", "path")
);

CREATE INDEX "reaper_website_pages_websiteId_idx" ON "reaper_website_pages"("websiteId");

-- Audit Runs (long-running jobs)
CREATE TABLE IF NOT EXISTS "reaper_audit_runs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "prospectId" TEXT,
    "businessId" TEXT,
    "websiteId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "auditType" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "reaper_audit_runs_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "reaper_organizations" ("id") ON DELETE CASCADE,
    CONSTRAINT "reaper_audit_runs_prospectId_fkey" FOREIGN KEY ("prospectId") REFERENCES "reaper_prospects" ("id") ON DELETE SET NULL,
    CONSTRAINT "reaper_audit_runs_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "reaper_businesses" ("id") ON DELETE SET NULL,
    CONSTRAINT "reaper_audit_runs_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "reaper_websites" ("id") ON DELETE SET NULL
);

CREATE INDEX "reaper_audit_runs_organizationId_idx" ON "reaper_audit_runs"("organizationId");
CREATE INDEX "reaper_audit_runs_status_idx" ON "reaper_audit_runs"("status");
CREATE INDEX "reaper_audit_runs_auditType_idx" ON "reaper_audit_runs"("auditType");

-- Audit Jobs
CREATE TABLE IF NOT EXISTS "reaper_audit_jobs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "auditRunId" TEXT NOT NULL,
    "jobType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "reaper_audit_jobs_auditRunId_fkey" FOREIGN KEY ("auditRunId") REFERENCES "reaper_audit_runs" ("id") ON DELETE CASCADE
);

CREATE INDEX "reaper_audit_jobs_auditRunId_idx" ON "reaper_audit_jobs"("auditRunId");
CREATE INDEX "reaper_audit_jobs_status_idx" ON "reaper_audit_jobs"("status");

-- Evidence (raw observations)
CREATE TABLE IF NOT EXISTS "reaper_evidence" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "auditRunId" TEXT,
    "auditJobId" TEXT,
    "websitePageId" TEXT,
    "sourceType" TEXT NOT NULL,
    "sourceValue" TEXT NOT NULL,
    "observation" TEXT NOT NULL,
    "confidence" INTEGER NOT NULL DEFAULT 100,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "reaper_evidence_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "reaper_organizations" ("id") ON DELETE CASCADE,
    CONSTRAINT "reaper_evidence_auditRunId_fkey" FOREIGN KEY ("auditRunId") REFERENCES "reaper_audit_runs" ("id") ON DELETE SET NULL,
    CONSTRAINT "reaper_evidence_auditJobId_fkey" FOREIGN KEY ("auditJobId") REFERENCES "reaper_audit_jobs" ("id") ON DELETE SET NULL,
    CONSTRAINT "reaper_evidence_websitePageId_fkey" FOREIGN KEY ("websitePageId") REFERENCES "reaper_website_pages" ("id") ON DELETE SET NULL
);

CREATE INDEX "reaper_evidence_organizationId_idx" ON "reaper_evidence"("organizationId");
CREATE INDEX "reaper_evidence_auditRunId_idx" ON "reaper_evidence"("auditRunId");

-- Findings (normalized insights)
CREATE TABLE IF NOT EXISTS "reaper_findings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "auditRunId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'INFO',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "recommendation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "reaper_findings_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "reaper_organizations" ("id") ON DELETE CASCADE,
    CONSTRAINT "reaper_findings_auditRunId_fkey" FOREIGN KEY ("auditRunId") REFERENCES "reaper_audit_runs" ("id") ON DELETE CASCADE
);

CREATE INDEX "reaper_findings_organizationId_idx" ON "reaper_findings"("organizationId");
CREATE INDEX "reaper_findings_auditRunId_idx" ON "reaper_findings"("auditRunId");
CREATE INDEX "reaper_findings_category_idx" ON "reaper_findings"("category");

-- Scores (calculated metrics with versions)
CREATE TABLE IF NOT EXISTS "reaper_scores" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "businessId" TEXT,
    "websiteId" TEXT,
    "scoreType" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "rawScore" DOUBLE PRECISION NOT NULL,
    "confidence" INTEGER NOT NULL DEFAULT 60,
    "components" TEXT NOT NULL,
    "reasoning" TEXT NOT NULL,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "reaper_scores_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "reaper_organizations" ("id") ON DELETE CASCADE,
    CONSTRAINT "reaper_scores_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "reaper_businesses" ("id") ON DELETE SET NULL,
    CONSTRAINT "reaper_scores_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "reaper_websites" ("id") ON DELETE SET NULL,
    CONSTRAINT "reaper_scores_organizationId_businessId_websiteId_scoreType_version_key" UNIQUE("organizationId", "businessId", "websiteId", "scoreType", "version")
);

CREATE INDEX "reaper_scores_organizationId_idx" ON "reaper_scores"("organizationId");
CREATE INDEX "reaper_scores_businessId_idx" ON "reaper_scores"("businessId");
CREATE INDEX "reaper_scores_scoreType_idx" ON "reaper_scores"("scoreType");

-- Notes (human annotations)
CREATE TABLE IF NOT EXISTS "reaper_notes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "prospectId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "reaper_notes_prospectId_fkey" FOREIGN KEY ("prospectId") REFERENCES "reaper_prospects" ("id") ON DELETE CASCADE
);

CREATE INDEX "reaper_notes_prospectId_idx" ON "reaper_notes"("prospectId");
