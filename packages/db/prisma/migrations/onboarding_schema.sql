-- Onboarding tracking
CREATE TABLE IF NOT EXISTS "Onboarding" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL UNIQUE REFERENCES "User"(id) ON DELETE CASCADE,
  "currentStep" INTEGER NOT NULL DEFAULT 1,
  "steps" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "startedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- AI Phone configuration
CREATE TABLE IF NOT EXISTS "AIPhoneConfig" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL UNIQUE REFERENCES "User"(id) ON DELETE CASCADE,
  "greeting" TEXT NOT NULL DEFAULT 'Hello! Thanks for calling.',
  "businessHours" JSONB NOT NULL DEFAULT '{"monday": "9:00-17:00", "tuesday": "9:00-17:00", "wednesday": "9:00-17:00", "thursday": "9:00-17:00", "friday": "9:00-17:00"}'::jsonb,
  "timezone" VARCHAR(50) DEFAULT 'America/New_York',
  "recordCalls" BOOLEAN DEFAULT true,
  "transcribeCalls" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Dashboard configuration
CREATE TABLE IF NOT EXISTS "DashboardConfig" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL UNIQUE REFERENCES "User"(id) ON DELETE CASCADE,
  "widgets" JSONB NOT NULL DEFAULT '["calls", "bookings", "revenue"]'::jsonb,
  "theme" VARCHAR(20) DEFAULT 'dark',
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Integrations tracking
CREATE TABLE IF NOT EXISTS "Integration" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "provider" VARCHAR(50) NOT NULL,
  "accountId" VARCHAR(255),
  "accessToken" TEXT,
  "refreshToken" TEXT,
  "expiresAt" TIMESTAMP,
  "status" VARCHAR(20) DEFAULT 'connected',
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("userId", "provider")
);

-- Create indexes
CREATE INDEX "idx_onboarding_userId" ON "Onboarding"("userId");
CREATE INDEX "idx_aiPhoneConfig_userId" ON "AIPhoneConfig"("userId");
CREATE INDEX "idx_dashboardConfig_userId" ON "DashboardConfig"("userId");
CREATE INDEX "idx_integration_userId" ON "Integration"("userId");
