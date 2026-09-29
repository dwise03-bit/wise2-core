CREATE TABLE IF NOT EXISTS "cjays_customers" ("id" TEXT NOT NULL,"tenant_id" UUID NOT NULL,"client_id" TEXT NOT NULL,"name" TEXT NOT NULL,"phone" TEXT NOT NULL,"email" TEXT NOT NULL DEFAULT '',"server_version" INTEGER NOT NULL DEFAULT 1,"created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updated_at" TIMESTAMP(3) NOT NULL,CONSTRAINT "cjays_customers_pkey" PRIMARY KEY ("id"),CONSTRAINT "cjays_customers_workspace_fkey" FOREIGN KEY ("tenant_id") REFERENCES "workspaces"("id") ON DELETE CASCADE);
CREATE UNIQUE INDEX IF NOT EXISTS "cjays_customers_tenant_id_client_id_key" ON "cjays_customers"("tenant_id","client_id");
CREATE INDEX IF NOT EXISTS "cjays_customers_tenant_id_phone_idx" ON "cjays_customers"("tenant_id","phone");

CREATE TABLE IF NOT EXISTS "cjays_vehicles" ("id" TEXT NOT NULL,"tenant_id" UUID NOT NULL,"client_id" TEXT NOT NULL,"customer_client_id" TEXT,"qr_tag_id" TEXT NOT NULL,"vin" TEXT NOT NULL,"year" TEXT NOT NULL DEFAULT '',"make" TEXT NOT NULL DEFAULT '',"model" TEXT NOT NULL DEFAULT '',"color" TEXT NOT NULL DEFAULT '',"server_version" INTEGER NOT NULL DEFAULT 1,"created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updated_at" TIMESTAMP(3) NOT NULL,CONSTRAINT "cjays_vehicles_pkey" PRIMARY KEY ("id"),CONSTRAINT "cjays_vehicles_workspace_fkey" FOREIGN KEY ("tenant_id") REFERENCES "workspaces"("id") ON DELETE CASCADE);
CREATE UNIQUE INDEX IF NOT EXISTS "cjays_vehicles_tenant_id_client_id_key" ON "cjays_vehicles"("tenant_id","client_id");
CREATE UNIQUE INDEX IF NOT EXISTS "cjays_vehicles_tenant_id_vin_key" ON "cjays_vehicles"("tenant_id","vin");

CREATE TABLE IF NOT EXISTS "cjays_jobs" ("id" TEXT NOT NULL,"tenant_id" UUID NOT NULL,"client_id" TEXT NOT NULL,"vehicle_client_id" TEXT NOT NULL,"service" TEXT NOT NULL,"status" TEXT NOT NULL DEFAULT 'In Progress',"price" TEXT NOT NULL DEFAULT '',"checklist" JSONB NOT NULL DEFAULT '[]',"notes" TEXT NOT NULL DEFAULT '',"payment_method" TEXT NOT NULL DEFAULT '',"paid_amount" TEXT NOT NULL DEFAULT '',"payment_status" TEXT NOT NULL DEFAULT 'unpaid',"stripe_checkout_session_id" TEXT,"stripe_payment_intent_id" TEXT,"receipt_url" TEXT NOT NULL DEFAULT '',"invoice_number" TEXT NOT NULL DEFAULT '',"before_photos" JSONB NOT NULL DEFAULT '[]',"after_photos" JSONB NOT NULL DEFAULT '[]',"server_version" INTEGER NOT NULL DEFAULT 1,"created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updated_at" TIMESTAMP(3) NOT NULL,CONSTRAINT "cjays_jobs_pkey" PRIMARY KEY ("id"),CONSTRAINT "cjays_jobs_workspace_fkey" FOREIGN KEY ("tenant_id") REFERENCES "workspaces"("id") ON DELETE CASCADE);
CREATE UNIQUE INDEX IF NOT EXISTS "cjays_jobs_tenant_id_client_id_key" ON "cjays_jobs"("tenant_id","client_id");
CREATE INDEX IF NOT EXISTS "cjays_jobs_tenant_id_status_idx" ON "cjays_jobs"("tenant_id","status");

CREATE TABLE IF NOT EXISTS "cjays_sync_events" ("id" TEXT NOT NULL,"tenant_id" UUID NOT NULL,"request_id" TEXT NOT NULL,"user_id" TEXT NOT NULL,"record_counts" JSONB NOT NULL,"created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,CONSTRAINT "cjays_sync_events_pkey" PRIMARY KEY ("id"),CONSTRAINT "cjays_sync_events_workspace_fkey" FOREIGN KEY ("tenant_id") REFERENCES "workspaces"("id") ON DELETE CASCADE);
CREATE UNIQUE INDEX IF NOT EXISTS "cjays_sync_events_tenant_id_request_id_key" ON "cjays_sync_events"("tenant_id","request_id");
CREATE INDEX IF NOT EXISTS "cjays_sync_events_tenant_id_created_at_idx" ON "cjays_sync_events"("tenant_id","created_at");

ALTER TABLE "cjays_vehicles" ADD COLUMN IF NOT EXISTS "qr_tag_id" TEXT;
UPDATE "cjays_vehicles" SET "qr_tag_id" = "client_id" WHERE "qr_tag_id" IS NULL OR "qr_tag_id" = '';
ALTER TABLE "cjays_vehicles" ALTER COLUMN "qr_tag_id" SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "cjays_vehicles_tenant_id_qr_tag_id_key" ON "cjays_vehicles"("tenant_id", "qr_tag_id");

ALTER TABLE "cjays_jobs" ADD COLUMN IF NOT EXISTS "payment_status" TEXT NOT NULL DEFAULT 'unpaid';
ALTER TABLE "cjays_jobs" ADD COLUMN IF NOT EXISTS "stripe_checkout_session_id" TEXT;
ALTER TABLE "cjays_jobs" ADD COLUMN IF NOT EXISTS "stripe_payment_intent_id" TEXT;
ALTER TABLE "cjays_jobs" ADD COLUMN IF NOT EXISTS "receipt_url" TEXT NOT NULL DEFAULT '';
ALTER TABLE "cjays_jobs" ADD COLUMN IF NOT EXISTS "invoice_number" TEXT NOT NULL DEFAULT '';
CREATE UNIQUE INDEX IF NOT EXISTS "cjays_jobs_stripe_checkout_session_id_key" ON "cjays_jobs"("stripe_checkout_session_id");
