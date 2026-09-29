-- Cherry Count AI Phone service tables

CREATE TABLE "cherry_count_phone_configs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "phone_number" TEXT,
    "greeting" TEXT NOT NULL DEFAULT 'Hey love! Thanks for calling. I''m Cherry, your AI boutique assistant.',
    "after_hours_message" TEXT,
    "business_hours" JSONB NOT NULL DEFAULT '{}',
    "transfer_number" TEXT,
    "sms_enabled" BOOLEAN NOT NULL DEFAULT true,
    "voicemail_enabled" BOOLEAN NOT NULL DEFAULT true,
    "ai_persona" TEXT NOT NULL DEFAULT 'Cherry',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "cherry_count_phone_configs_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "cherry_count_phone_configs_tenant_id_key" UNIQUE ("tenant_id"),
    CONSTRAINT "cherry_count_phone_configs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "cherry_count_phone_calls" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "caller_number" TEXT NOT NULL,
    "caller_name" TEXT,
    "direction" TEXT NOT NULL DEFAULT 'INBOUND',
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "duration_seconds" INTEGER,
    "intent" TEXT,
    "outcome" TEXT,
    "summary" TEXT,
    "transcript" TEXT,
    "customer_id" TEXT,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "cherry_count_phone_calls_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "cherry_count_phone_calls_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "cherry_count_phone_calls_tenant_id_started_at_idx" ON "cherry_count_phone_calls"("tenant_id", "started_at");
