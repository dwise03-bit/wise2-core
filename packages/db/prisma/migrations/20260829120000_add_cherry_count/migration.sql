-- Cherry Count™ — Mobile Pop-Up Retail OS tables

CREATE TABLE "cherry_count_products" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sku" TEXT NOT NULL,
    "barcode" TEXT,
    "qr_code" TEXT,
    "category" TEXT,
    "collection" TEXT,
    "vendor" TEXT,
    "cost" DECIMAL(10,2),
    "retail_price" DECIMAL(10,2) NOT NULL,
    "sale_price" DECIMAL(10,2),
    "images" JSONB NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "cherry_count_products_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "cherry_count_products_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "cherry_count_products_tenant_id_sku_key" ON "cherry_count_products"("tenant_id", "sku");
CREATE INDEX "cherry_count_products_tenant_id_status_idx" ON "cherry_count_products"("tenant_id", "status");

CREATE TABLE "cherry_count_variants" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "size" TEXT,
    "color" TEXT,
    "material" TEXT,
    "edition" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "reserved_quantity" INTEGER NOT NULL DEFAULT 0,
    "damaged_quantity" INTEGER NOT NULL DEFAULT 0,
    "minimum_stock" INTEGER NOT NULL DEFAULT 0,
    "reorder_point" INTEGER NOT NULL DEFAULT 0,
    "bin" TEXT,
    "rack" TEXT,
    "shelf" TEXT,
    "tote" TEXT,
    "vehicle" TEXT,
    "storage_location" TEXT,
    "qr_code" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "cherry_count_variants_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "cherry_count_variants_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "cherry_count_variants_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "cherry_count_products"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "cherry_count_variants_tenant_id_product_id_idx" ON "cherry_count_variants"("tenant_id", "product_id");
CREATE INDEX "cherry_count_variants_tenant_id_quantity_idx" ON "cherry_count_variants"("tenant_id", "quantity");

CREATE TABLE "cherry_count_containers" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'BIN',
    "color" TEXT,
    "qr_code" TEXT,
    "description" TEXT,
    "location" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "cherry_count_containers_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "cherry_count_containers_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "cherry_count_containers_tenant_id_type_idx" ON "cherry_count_containers"("tenant_id", "type");

CREATE TABLE "cherry_count_inventory_txns" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "variant_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "quantity_delta" INTEGER NOT NULL,
    "quantity_before" INTEGER NOT NULL,
    "quantity_after" INTEGER NOT NULL,
    "reason" TEXT,
    "reference_id" TEXT,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "cherry_count_inventory_txns_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "cherry_count_inventory_txns_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "cherry_count_inventory_txns_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "cherry_count_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "cherry_count_inventory_txns_tenant_id_variant_id_idx" ON "cherry_count_inventory_txns"("tenant_id", "variant_id");
CREATE INDEX "cherry_count_inventory_txns_tenant_id_created_at_idx" ON "cherry_count_inventory_txns"("tenant_id", "created_at");

CREATE TABLE "cherry_count_events" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "venue" TEXT NOT NULL,
    "address" TEXT,
    "arrival_time" TIMESTAMP(3),
    "setup_time" TIMESTAMP(3),
    "notes" TEXT,
    "expected_attendance" INTEGER,
    "revenue_goal" DECIMAL(10,2),
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "cherry_count_events_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "cherry_count_events_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "cherry_count_events_tenant_id_status_idx" ON "cherry_count_events"("tenant_id", "status");
CREATE INDEX "cherry_count_events_tenant_id_date_idx" ON "cherry_count_events"("tenant_id", "date");

CREATE TABLE "cherry_count_customers" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "instagram" TEXT,
    "birthday" TIMESTAMP(3),
    "preferred_size" TEXT,
    "favorite_colors" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "favorite_products" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "wishlist" JSONB NOT NULL DEFAULT '[]',
    "vip_status" BOOLEAN NOT NULL DEFAULT false,
    "lifetime_value" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "cherry_count_customers_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "cherry_count_customers_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "cherry_count_customers_tenant_id_name_idx" ON "cherry_count_customers"("tenant_id", "name");

CREATE TABLE "cherry_count_event_inventory" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "variant_id" TEXT NOT NULL,
    "quantity_assigned" INTEGER NOT NULL DEFAULT 0,
    "quantity_packed" INTEGER NOT NULL DEFAULT 0,
    "quantity_sold" INTEGER NOT NULL DEFAULT 0,
    "quantity_returned" INTEGER NOT NULL DEFAULT 0,
    "packing_status" TEXT NOT NULL DEFAULT 'NOT_PACKED',
    CONSTRAINT "cherry_count_event_inventory_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "cherry_count_event_inventory_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "cherry_count_event_inventory_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "cherry_count_events"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "cherry_count_event_inventory_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "cherry_count_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "cherry_count_event_inventory_event_id_variant_id_key" ON "cherry_count_event_inventory"("event_id", "variant_id");
CREATE INDEX "cherry_count_event_inventory_tenant_id_event_id_idx" ON "cherry_count_event_inventory"("tenant_id", "event_id");

CREATE TABLE "cherry_count_sales" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "event_id" TEXT,
    "customer_id" TEXT,
    "payment_method" TEXT NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "tax" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(10,2) NOT NULL,
    "cost_total" DECIMAL(10,2),
    "profit" DECIMAL(10,2),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "cherry_count_sales_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "cherry_count_sales_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "cherry_count_sales_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "cherry_count_events"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "cherry_count_sales_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "cherry_count_customers"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "cherry_count_sales_tenant_id_created_at_idx" ON "cherry_count_sales"("tenant_id", "created_at");
CREATE INDEX "cherry_count_sales_tenant_id_event_id_idx" ON "cherry_count_sales"("tenant_id", "event_id");

CREATE TABLE "cherry_count_sale_line_items" (
    "id" TEXT NOT NULL,
    "sale_id" TEXT NOT NULL,
    "variant_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "unit_cost" DECIMAL(10,2),
    "line_total" DECIMAL(10,2) NOT NULL,
    CONSTRAINT "cherry_count_sale_line_items_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "cherry_count_sale_line_items_sale_id_fkey" FOREIGN KEY ("sale_id") REFERENCES "cherry_count_sales"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "cherry_count_sale_line_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "cherry_count_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "cherry_count_sale_line_items_sale_id_idx" ON "cherry_count_sale_line_items"("sale_id");
