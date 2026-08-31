import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seeds Cherry Count demo data for an existing tenant.
 * Usage: TENANT_ID=<id> pnpm exec tsx scripts/seed-cherry-count.ts
 */
async function main() {
  const tenantId = process.env.TENANT_ID;
  if (!tenantId) {
    console.error('TENANT_ID environment variable is required');
    process.exit(1);
  }

  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) {
    console.error(`Tenant ${tenantId} not found`);
    process.exit(1);
  }

  console.log(`Seeding Cherry Count demo data for tenant: ${tenant.name}`);

  // Clear existing cherry count data for idempotent re-seed
  await prisma.cherryCountSaleLineItem.deleteMany({ where: { sale: { tenantId } } });
  await prisma.cherryCountSale.deleteMany({ where: { tenantId } });
  await prisma.cherryCountEventInventory.deleteMany({ where: { tenantId } });
  await prisma.cherryCountPopupEvent.deleteMany({ where: { tenantId } });
  await prisma.cherryCountInventoryTransaction.deleteMany({ where: { tenantId } });
  await prisma.cherryCountProductVariant.deleteMany({ where: { tenantId } });
  await prisma.cherryCountProduct.deleteMany({ where: { tenantId } });
  await prisma.cherryCountContainer.deleteMany({ where: { tenantId } });
  await prisma.cherryCountCustomer.deleteMany({ where: { tenantId } });

  // Containers
  const containers = await Promise.all([
    prisma.cherryCountContainer.create({
      data: { tenantId, name: 'Pink Bin #1', type: 'BIN', color: 'Hot Pink', description: 'Accessories', qrCode: 'cc-bin-a1b2c3', location: 'Garage' },
    }),
    prisma.cherryCountContainer.create({
      data: { tenantId, name: 'Pink Bin #2', type: 'BIN', color: 'Hot Pink', description: 'Hoodies', qrCode: 'cc-bin-d4e5f6', location: 'Garage' },
    }),
    prisma.cherryCountContainer.create({
      data: { tenantId, name: 'Purple Crate', type: 'TOTE', color: 'Royal Plum', description: 'Limited Drops', qrCode: 'cc-tote-g7h8i9', location: 'Storage' },
    }),
    prisma.cherryCountContainer.create({
      data: { tenantId, name: 'Rack A', type: 'RACK', color: 'Chrome', description: 'Tops', qrCode: 'cc-rack-j0k1l2', location: 'Garage' },
    }),
  ]);

  // Products + variants
  const hoodie = await prisma.cherryCountProduct.create({
    data: {
      tenantId, name: 'Cherry Bomb Hoodie', sku: 'CB-HOOD-001', category: 'Hoodies', collection: 'Fall Drop',
      vendor: 'LA Streetwear Co', cost: 28, retailPrice: 70, qrCode: 'cc-prod-hoodie',
      variants: {
        create: [
          { tenantId, size: 'S', color: 'Hot Pink', quantity: 4, minimumStock: 3, reorderPoint: 3, bin: 'Pink Bin #2', qrCode: 'cc-var-hood-s' },
          { tenantId, size: 'M', color: 'Hot Pink', quantity: 8, minimumStock: 3, reorderPoint: 3, bin: 'Pink Bin #2', qrCode: 'cc-var-hood-m' },
          { tenantId, size: 'L', color: 'Hot Pink', quantity: 2, minimumStock: 3, reorderPoint: 3, bin: 'Pink Bin #2', qrCode: 'cc-var-hood-l' },
        ],
      },
    },
    include: { variants: true },
  });

  const cropTop = await prisma.cherryCountProduct.create({
    data: {
      tenantId, name: 'Lavender Crop Top', sku: 'LV-CROP-002', category: 'Tops', collection: 'Summer Drop',
      vendor: 'Boutique Basics', cost: 14, retailPrice: 40, qrCode: 'cc-prod-crop',
      variants: {
        create: [
          { tenantId, size: 'S', color: 'Lavender', quantity: 6, minimumStock: 2, bin: 'Rack A', qrCode: 'cc-var-crop-s' },
          { tenantId, size: 'M', color: 'Lavender', quantity: 3, minimumStock: 2, bin: 'Rack A', qrCode: 'cc-var-crop-m' },
        ],
      },
    },
    include: { variants: true },
  });

  const earrings = await prisma.cherryCountProduct.create({
    data: {
      tenantId, name: 'Pink Statement Earrings', sku: 'PK-EAR-003', category: 'Accessories', collection: 'Always On',
      vendor: 'Glam Accessories', cost: 8, retailPrice: 30, qrCode: 'cc-prod-earrings',
      variants: {
        create: [
          { tenantId, size: 'OS', color: 'Pink', quantity: 15, minimumStock: 5, bin: 'Pink Bin #1', qrCode: 'cc-var-ear-os' },
        ],
      },
    },
    include: { variants: true },
  });

  // Customers
  const brianna = await prisma.cherryCountCustomer.create({
    data: {
      tenantId, name: 'Brianna R.', phone: '(404) 555-0182', instagram: '@brianna_styles',
      preferredSize: 'M', favoriteColors: ['Lavender', 'Hot Pink'], vipStatus: true, lifetimeValue: 1240,
      notes: 'Loves limited drops. Always asks about Medium hoodies.',
    },
  });

  await prisma.cherryCountCustomer.create({
    data: {
      tenantId, name: 'Jasmine K.', phone: '(678) 555-0291', instagram: '@jazzyk_fashion',
      preferredSize: 'S', favoriteColors: ['Cherry Red'], lifetimeValue: 380,
      notes: 'Prefers crop tops and accessories.',
    },
  });

  // Pop-up event
  const event = await prisma.cherryCountPopupEvent.create({
    data: {
      tenantId,
      name: 'Downtown Night Market',
      date: new Date('2026-09-06T17:00:00.000Z'),
      venue: 'City Center Plaza',
      address: '123 Main St, Atlanta, GA',
      expectedAttendance: 500,
      revenueGoal: 3000,
      status: 'PACKING',
    },
  });

  const hoodM = hoodie.variants.find((v) => v.size === 'M')!;
  const hoodL = hoodie.variants.find((v) => v.size === 'L')!;
  const cropS = cropTop.variants.find((v) => v.size === 'S')!;
  const earOS = earrings.variants[0];

  await prisma.cherryCountEventInventory.createMany({
    data: [
      { tenantId, eventId: event.id, variantId: hoodM.id, quantityAssigned: 6, quantityPacked: 6, packingStatus: 'PACKED' },
      { tenantId, eventId: event.id, variantId: hoodL.id, quantityAssigned: 4, quantityPacked: 4, packingStatus: 'PACKED' },
      { tenantId, eventId: event.id, variantId: cropS.id, quantityAssigned: 5, quantityPacked: 0, packingStatus: 'NOT_PACKED' },
      { tenantId, eventId: event.id, variantId: earOS.id, quantityAssigned: 10, quantityPacked: 10, packingStatus: 'PACKED' },
    ],
  });

  // Sample sales (today)
  const today = new Date();
  today.setHours(10, 0, 0, 0);

  await prisma.cherryCountSale.create({
    data: {
      tenantId, eventId: event.id, customerId: brianna.id, paymentMethod: 'CASH',
      subtotal: 70, tax: 0, total: 70, costTotal: 28, profit: 42,
      createdAt: today,
      items: {
        create: [{ variantId: hoodM.id, quantity: 1, unitPrice: 70, unitCost: 28, lineTotal: 70 }],
      },
    },
  });

  console.log('Cherry Count seed complete:');
  console.log(`  Products: 3`);
  console.log(`  Containers: ${containers.length}`);
  console.log(`  Customers: 2`);
  console.log(`  Event: ${event.name}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
