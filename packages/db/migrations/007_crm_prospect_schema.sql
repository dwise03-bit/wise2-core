-- Migration 007: CRM Prospect Schema
-- Adds core prospect management for revenue funnel
-- Non-destructive: Creates new table, enum, and indexes

-- Create ProspectStatus enum
CREATE TYPE "ProspectStatus" AS ENUM (
  'NEW',
  'CONTACTED',
  'QUALIFIED',
  'AUDIT_SCHEDULED',
  'AUDIT_COMPLETE',
  'PROPOSAL_SENT',
  'WON',
  'LOST'
);

-- Create Prospect table
CREATE TABLE "Prospect" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "businessName" TEXT NOT NULL,
  "contactName" TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  website TEXT,
  industry TEXT,
  "primaryProblem" TEXT NOT NULL,
  "leadSource" TEXT DEFAULT 'DIRECT',
  "estimatedOpportunity" DOUBLE PRECISION DEFAULT 0,
  status "ProspectStatus" DEFAULT 'NEW',
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  "auditScheduledAt" TIMESTAMP WITH TIME ZONE,
  "auditCompletedAt" TIMESTAMP WITH TIME ZONE,
  "proposalSentAt" TIMESTAMP WITH TIME ZONE,
  "wonAt" TIMESTAMP WITH TIME ZONE,
  "lostAt" TIMESTAMP WITH TIME ZONE,
  "lostReason" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for common queries
CREATE INDEX "idx_prospect_status" ON "Prospect"(status);
CREATE INDEX "idx_prospect_email" ON "Prospect"(email);
CREATE INDEX "idx_prospect_createdAt" ON "Prospect"("createdAt" DESC);
CREATE INDEX "idx_prospect_estimatedOpportunity" ON "Prospect"("estimatedOpportunity" DESC);
