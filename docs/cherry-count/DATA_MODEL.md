# Cherry Count™ — Data Model

All models are tenant-scoped (`tenantId` → `Tenant.id`).

---

## Product

| Field | Type | Notes |
|-------|------|-------|
| id | cuid | Primary key |
| tenantId | string | FK → Tenant |
| name | string | Product name |
| description | text? | Optional |
| sku | string | Unique per tenant |
| barcode | string? | Scannable |
| qrCode | string? | Generated QR identifier |
| category | string? | e.g. Tops, Accessories |
| collection | string? | e.g. Summer Drop |
| vendor | string? | Supplier name |
| cost | decimal? | Unit cost |
| retailPrice | decimal | List price |
| salePrice | decimal? | Promotional price |
| images | json | Array of image URLs |
| status | string | ACTIVE, ARCHIVED, DRAFT |
| tags | string[] | Freeform tags |

---

## Product Variant

| Field | Type | Notes |
|-------|------|-------|
| id | cuid | Primary key |
| tenantId | string | FK → Tenant |
| productId | string | FK → Product |
| size | string? | S, M, L, XL |
| color | string? | Lavender, Black |
| material | string? | Cotton, Fleece |
| edition | string? | Limited Drop |
| quantity | int | On-hand stock |
| reservedQuantity | int | Allocated to events |
| damagedQuantity | int | Unsellable |
| minimumStock | int | Alert threshold |
| reorderPoint | int | Reorder trigger |
| bin | string? | Storage bin label |
| rack | string? | Rack label |
| shelf | string? | Shelf label |
| tote | string? | Tote label |
| vehicle | string? | Vehicle storage |
| storageLocation | string? | Freeform location |
| qrCode | string? | Variant-level QR |

---

## Container (Bins, Racks, Totes)

| Field | Type | Notes |
|-------|------|-------|
| id | cuid | Primary key |
| tenantId | string | FK → Tenant |
| name | string | "Pink Bin #1" |
| type | enum | BIN, RACK, SHELF, TOTE, DISPLAY, VEHICLE |
| color | string? | Visual label |
| qrCode | string? | Container QR |
| description | string? | Contents summary |
| location | string? | Warehouse, garage |

---

## Inventory Transaction (Audit Trail)

| Field | Type | Notes |
|-------|------|-------|
| id | cuid | Primary key |
| tenantId | string | FK → Tenant |
| variantId | string | FK → Variant |
| type | enum | ADJUSTMENT, SALE, RETURN, TRANSFER, DAMAGE, RESTOCK, EVENT_ASSIGN, EVENT_RETURN |
| quantityDelta | int | Positive or negative |
| quantityBefore | int | Snapshot before |
| quantityAfter | int | Snapshot after |
| reason | string? | Human note |
| referenceId | string? | Sale ID, Event ID, etc. |
| userId | string | Who made the change |

**Rule:** Never overwrite stock without recording a transaction.

---

## Pop-Up Event

| Field | Type | Notes |
|-------|------|-------|
| id | cuid | Primary key |
| tenantId | string | FK → Tenant |
| name | string | Event name |
| date | datetime | Event date |
| venue | string | Venue name |
| address | string? | Full address |
| arrivalTime | datetime? | Arrival |
| setupTime | datetime? | Setup start |
| notes | text? | Internal notes |
| expectedAttendance | int? | Estimate |
| revenueGoal | decimal? | Target |
| status | enum | PLANNED, PACKING, LIVE, CLOSED |

---

## Event Inventory

| Field | Type | Notes |
|-------|------|-------|
| eventId | string | FK → Event |
| variantId | string | FK → Variant |
| quantityAssigned | int | Sent to event |
| quantityPacked | int | Confirmed packed |
| quantitySold | int | Sold at event |
| quantityReturned | int | Returned after |
| packingStatus | enum | NOT_PACKED, PACKED, LOADED, DISPLAYED, RETURNED |

---

## Sale

| Field | Type | Notes |
|-------|------|-------|
| id | cuid | Primary key |
| tenantId | string | FK → Tenant |
| eventId | string? | Optional event link |
| customerId | string? | Optional customer |
| paymentMethod | enum | CASH, CARD, CASH_APP, VENMO, SQUARE, SHOPIFY, OTHER |
| subtotal | decimal | Pre-tax |
| tax | decimal | Tax amount |
| total | decimal | Final total |
| costTotal | decimal? | COGS for margin |
| profit | decimal? | Estimated profit |
| notes | string? | Sale notes |

### Sale Line Item

| Field | Type |
|-------|------|
| saleId | string |
| variantId | string |
| quantity | int |
| unitPrice | decimal |
| unitCost | decimal? |
| lineTotal | decimal |

---

## Customer (CRM)

| Field | Type | Notes |
|-------|------|-------|
| id | cuid | Primary key |
| tenantId | string | FK → Tenant |
| name | string | Full name |
| phone | string? | |
| email | string? | |
| instagram | string? | Handle |
| birthday | date? | |
| preferredSize | string? | |
| favoriteColors | string[] | |
| favoriteProducts | string[] | Product IDs or names |
| wishlist | json | Wishlist items |
| vipStatus | boolean | VIP flag |
| lifetimeValue | decimal | Running total |
| notes | text? | Freeform |

---

## QR System

QR codes generated for:
- Products (product-level)
- Variants (size/color level)
- Containers (bins, racks, totes, shelves, displays)

Scan actions:
- View Item / Open Container
- Adjust Stock
- Move Inventory
- Record Sale
- Restock
- Pack Event
