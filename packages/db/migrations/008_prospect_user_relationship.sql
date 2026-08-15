-- Migration 008: Link Prospect to User for conversion tracking
-- Allows tracking which Prospect converted to which paying customer

ALTER TABLE "Prospect" 
ADD COLUMN "userId" TEXT;

-- Add foreign key relationship (soft)
ALTER TABLE "Prospect"
ADD CONSTRAINT "Prospect_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE SET NULL;

-- Create index for lookups
CREATE INDEX "idx_prospect_userId" ON "Prospect"("userId");

-- Add status tracking for conversion
ALTER TABLE "Prospect"
ADD COLUMN "convertedAt" TIMESTAMP WITH TIME ZONE;

-- Indices for the customer journey
CREATE INDEX "idx_prospect_converted" ON "Prospect"("convertedAt" DESC);
