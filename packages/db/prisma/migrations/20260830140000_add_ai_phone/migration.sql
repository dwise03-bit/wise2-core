-- WISE² AI Phone — tenant-scoped receptionist config and call log

CREATE TABLE "ai_phone_configs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "phone_number" TEXT,
    "greeting" TEXT NOT NULL DEFAULT 'Thanks for calling. I''m the WISE² assistant. I can look up your account, book a visit, or take a message. How can I help you today?',
    "after_hours_message" TEXT,
    "business_hours" JSONB NOT NULL DEFAULT '{}',
    "timezone" TEXT NOT NULL DEFAULT 'America/New_York',
    "transfer_number" TEXT,
    "sms_enabled" BOOLEAN NOT NULL DEFAULT true,
    "voicemail_enabled" BOOLEAN NOT NULL DEFAULT true,
    "recording_enabled" BOOLEAN NOT NULL DEFAULT true,
    "ai_persona" TEXT NOT NULL DEFAULT 'WISE²',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_phone_configs_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ai_phone_configs_tenant_id_key" UNIQUE ("tenant_id"),
    CONSTRAINT "ai_phone_configs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "ai_phone_configs_phone_number_idx" ON "ai_phone_configs"("phone_number");

CREATE TABLE "ai_phone_calls" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "call_sid" TEXT,
    "session_id" TEXT,
    "caller_number" TEXT NOT NULL,
    "caller_name" TEXT,
    "inbound_number" TEXT,
    "direction" TEXT NOT NULL DEFAULT 'INBOUND',
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "duration_seconds" INTEGER,
    "intent" TEXT,
    "outcome" TEXT,
    "summary" TEXT,
    "transcript" TEXT,
    "customer_id" TEXT,
    "lead_id" TEXT,
    "conversation_id" TEXT,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_phone_calls_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ai_phone_calls_call_sid_key" UNIQUE ("call_sid"),
    CONSTRAINT "ai_phone_calls_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "ai_phone_calls_tenant_id_started_at_idx" ON "ai_phone_calls"("tenant_id", "started_at");
CREATE INDEX "ai_phone_calls_tenant_id_caller_number_idx" ON "ai_phone_calls"("tenant_id", "caller_number");
