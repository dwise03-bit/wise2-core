-- WISE2 Commerce Core v1: additive schema, no destructive operations.
-- Review existing schema and back up database before applying.
BEGIN;
CREATE SCHEMA IF NOT EXISTS commerce;
CREATE TABLE IF NOT EXISTS commerce.entities (
 id uuid PRIMARY KEY, legal_name text NOT NULL UNIQUE, status text NOT NULL DEFAULT 'PENDING'
);
CREATE TABLE IF NOT EXISTS commerce.catalog (
 id uuid PRIMARY KEY, entity_id uuid NOT NULL REFERENCES commerce.entities(id),
 sku text NOT NULL, name text NOT NULL, fulfillment_type text NOT NULL,
 lifecycle_status text NOT NULL DEFAULT 'DRAFT',
 compliance_status text NOT NULL DEFAULT 'PENDING',
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(entity_id,sku), UNIQUE(entity_id,id),
 CHECK(lifecycle_status IN ('DRAFT','APPROVED','ACTIVE','RETIRED'))
);
CREATE TABLE IF NOT EXISTS commerce.prices (
 id uuid PRIMARY KEY, entity_id uuid NOT NULL, catalog_id uuid NOT NULL,
 currency char(3) NOT NULL, amount_minor bigint NOT NULL CHECK(amount_minor>=0),
 version integer NOT NULL CHECK(version>0), active boolean NOT NULL DEFAULT false,
 FOREIGN KEY(entity_id,catalog_id) REFERENCES commerce.catalog(entity_id,id),
 UNIQUE(entity_id,catalog_id,version)
);
CREATE TABLE IF NOT EXISTS commerce.orders (
 id uuid PRIMARY KEY, entity_id uuid NOT NULL REFERENCES commerce.entities(id),
 state text NOT NULL DEFAULT 'DRAFT', currency char(3) NOT NULL,
 amount_minor bigint NOT NULL CHECK(amount_minor>=0),
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(entity_id,id),
 CHECK(state IN ('DRAFT','QUOTED','CONTRACTED','PAYMENT_PENDING','PAYMENT_CONFIRMED','ALLOCATED','FULFILLING','QA_PASSED','DELIVERED','ACCEPTED','CLOSED','FRAUD_REVIEW','BACKORDERED','COMPLIANCE_HOLD','QA_FAILED','PAYMENT_FAILED','CANCELED','REFUND_PENDING','RETURNED','DISPUTED'))
);
CREATE TABLE IF NOT EXISTS commerce.payment_events (
 id uuid PRIMARY KEY, entity_id uuid NOT NULL, order_id uuid NOT NULL,
 provider text NOT NULL, provider_account text NOT NULL, provider_event_id text NOT NULL,
 verified_at timestamptz NOT NULL, amount_minor bigint NOT NULL, currency char(3) NOT NULL,
 payload_digest text NOT NULL, created_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(entity_id,order_id) REFERENCES commerce.orders(entity_id,id),
 UNIQUE(provider,provider_account,provider_event_id)
);
CREATE TABLE IF NOT EXISTS commerce.outbox (
 id uuid PRIMARY KEY, entity_id uuid NOT NULL REFERENCES commerce.entities(id),
 event_type text NOT NULL, aggregate_id uuid NOT NULL, payload jsonb NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), processed_at timestamptz
);
CREATE TABLE IF NOT EXISTS commerce.stock (
 entity_id uuid NOT NULL, catalog_id uuid NOT NULL, location_id uuid NOT NULL,
 on_hand integer NOT NULL DEFAULT 0 CHECK(on_hand>=0),
 reserved integer NOT NULL DEFAULT 0 CHECK(reserved>=0),
 on_order integer NOT NULL DEFAULT 0 CHECK(on_order>=0),
 PRIMARY KEY(entity_id,catalog_id,location_id),
 FOREIGN KEY(entity_id,catalog_id) REFERENCES commerce.catalog(entity_id,id),
 CHECK(reserved<=on_hand)
);
CREATE TABLE IF NOT EXISTS commerce.stock_movements (
 id uuid PRIMARY KEY, entity_id uuid NOT NULL, catalog_id uuid NOT NULL,
 location_id uuid NOT NULL, quantity_delta integer NOT NULL,
 movement_type text NOT NULL, reference_id uuid NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(entity_id,catalog_id,location_id) REFERENCES commerce.stock(entity_id,catalog_id,location_id)
);
-- Defense products are never automatically approved by this migration.
-- Application must enforce entity membership; no broad grants are issued here.
COMMIT;
