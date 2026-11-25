CREATE TABLE IF NOT EXISTS "Wise2TextMessage" (
  "id" TEXT PRIMARY KEY,
  "provider_event_id" TEXT NOT NULL UNIQUE,
  "occurred_at" TIMESTAMPTZ NOT NULL,
  "from_number" TEXT NOT NULL,
  "to_number" TEXT NOT NULL,
  "body" TEXT NOT NULL DEFAULT '',
  "media" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "raw_event" JSONB NOT NULL,
  "routing_state" TEXT NOT NULL DEFAULT 'received' CHECK ("routing_state" IN ('received', 'queued', 'routed', 'failed')),
  "routing_error" TEXT,
  "hermes_receipt" JSONB,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "Wise2TextMessage_from_number_occurred_at_idx"
  ON "Wise2TextMessage" ("from_number", "occurred_at" DESC);
CREATE INDEX IF NOT EXISTS "Wise2TextMessage_routing_state_idx"
  ON "Wise2TextMessage" ("routing_state");
