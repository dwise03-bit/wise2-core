/**
 * Provision a Cherry Count retail tenant and seed demo data.
 *
 * Usage:
 *   OWNER_EMAIL=dwise03@gmail.com pnpm exec tsx scripts/provision-cherry-count.ts
 *   OWNER_EMAIL=client@example.com TENANT_SLUG=briannas-boutique pnpm exec tsx scripts/provision-cherry-count.ts
 */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  const ownerEmail = process.env.OWNER_EMAIL?.trim().toLowerCase();
  const tenantSlug = process.env.TENANT_SLUG?.trim() || 'briannas-boutique';
  const tenantName = process.env.TENANT_NAME?.trim() || "Brianna's Boutique";
  const ownerPassword = process.env.OWNER_PASSWORD;

  if (!ownerEmail) {
    console.error('OWNER_EMAIL is required');
    process.exit(1);
  }

  let user = await prisma.user.findUnique({ where: { email: ownerEmail } });
  if (!user) {
    if (!ownerPassword || ownerPassword.length < 8) {
      console.error('User not found. Set OWNER_PASSWORD (min 8 chars) to create the account.');
      process.exit(1);
    }
    user = await prisma.user.create({
      data: {
        email: ownerEmail,
        name: tenantName,
        passwordHash: await bcrypt.hash(ownerPassword, 10),
        role: 'CUSTOMER',
      },
    });
    console.log(`Created user: ${user.email}`);
  } else {
    console.log(`Using existing user: ${user.email}`);
  }

  let tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: {
        slug: tenantSlug,
        name: tenantName,
        vertical: 'retail_popup',
        state: 'ACTIVE',
        demoMode: true,
        enabledModules: ['cherry_count', 'inventory', 'crm', 'analytics', 'ai'],
        onboardingStep: 5,
        onboardingCompletedAt: new Date(),
      },
    });
    console.log(`Created tenant: ${tenant.name} (${tenant.id})`);
  } else {
    tenant = await prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        state: 'ACTIVE',
        vertical: 'retail_popup',
        demoMode: true,
        enabledModules: ['cherry_count', 'inventory', 'crm', 'analytics', 'ai'],
      },
    });
    console.log(`Updated tenant: ${tenant.name} (${tenant.id})`);
  }

  const membership = await prisma.tenantMembership.upsert({
    where: { tenantId_userId: { tenantId: tenant.id, userId: user.id } },
    update: { role: 'OWNER' },
    create: { tenantId: tenant.id, userId: user.id, role: 'OWNER' },
  });

  console.log(`Membership: ${membership.role} for ${user.email}`);

  const productCount = await prisma.cherryCountProduct.count({ where: { tenantId: tenant.id } });
  if (productCount === 0) {
    console.log('Seeding Cherry Count demo data...');
    await seedTenant(tenant.id);
    console.log('Seed complete.');
  } else {
    console.log(`Tenant already has ${productCount} products — skipping seed.`);
  }

  console.log('\n--- Cherry Count provisioned ---');
  console.log(`Tenant ID: ${tenant.id}`);
  console.log(`Slug:      ${tenant.slug}`);
  console.log(`Login:     https://wise2.net/cherry-count/login`);
  console.log(`Email:     ${ownerEmail}`);
}

async function seedTenant(tenantId: string) {
  await prisma.cherryCountContainer.createMany({
    data: [
      { tenantId, name: 'Pink Bin #1', type: 'BIN', color: 'Hot Pink', description: 'Accessories', qrCode: 'cc-bin-a1b2c3' },
      { tenantId, name: 'Pink Bin #2', type: 'BIN', color: 'Hot Pink', description: 'Hoodies', qrCode: 'cc-bin-d4e5f6' },
      { tenantId, name: 'Purple Crate', type: 'TOTE', color: 'Royal Plum', description: 'Limited Drops', qrCode: 'cc-tote-g7h8i9' },
      { tenantId, name: 'Rack A', type: 'RACK', color: 'Chrome', description: 'Tops', qrCode: 'cc-rack-j0k1l2' },
    ],
  });

  const hoodie = await prisma.cherryCountProduct.create({
    data: {
      tenantId,
      name: 'Cherry Bomb Hoodie',
      sku: 'CB-HOOD-001',
      category: 'Hoodies',
      collection: 'Fall Drop',
      cost: 28,
      retailPrice: 70,
      qrCode: 'cc-prod-hoodie',
      variants: {
        create: [
          { tenantId, size: 'S', color: 'Hot Pink', quantity: 4, minimumStock: 3, bin: 'Pink Bin #2' },
          { tenantId, size: 'M', color: 'Hot Pink', quantity: 8, minimumStock: 3, bin: 'Pink Bin #2' },
          { tenantId, size: 'L', color: 'Hot Pink', quantity: 2, minimumStock: 3, bin: 'Pink Bin #2' },
        ],
      },
    },
    include: { variants: true },
  });

  await prisma.cherryCountProduct.create({
    data: {
      tenantId,
      name: 'Lavender Crop Top',
      sku: 'LV-CROP-002',
      category: 'Tops',
      collection: 'Summer Drop',
      cost: 14,
      retailPrice: 40,
      variants: {
        create: [
          { tenantId, size: 'S', color: 'Lavender', quantity: 6, minimumStock: 2, bin: 'Rack A' },
          { tenantId, size: 'M', color: 'Lavender', quantity: 3, minimumStock: 2, bin: 'Rack A' },
        ],
      },
    },
  });

  await prisma.cherryCountProduct.create({
    data: {
      tenantId,
      name: 'Pink Statement Earrings',
      sku: 'PK-EAR-003',
      category: 'Accessories',
      cost: 8,
      retailPrice: 30,
      variants: {
        create: [{ tenantId, size: 'OS', color: 'Pink', quantity: 15, minimumStock: 5, bin: 'Pink Bin #1' }],
      },
    },
  });

  const brianna = await prisma.cherryCountCustomer.create({
    data: {
      tenantId,
      name: 'Brianna R.',
      phone: '(404) 555-0182',
      instagram: '@brianna_styles',
      preferredSize: 'M',
      favoriteColors: ['Lavender', 'Hot Pink'],
      vipStatus: true,
      lifetimeValue: 1240,
      notes: 'Need Medium hoodies',
    },
  });

  await prisma.cherryCountCustomer.create({
    data: {
      tenantId,
      name: 'Jasmine K.',
      instagram: '@jazzyk_fashion',
      preferredSize: 'S',
      lifetimeValue: 380,
    },
  });

  const event = await prisma.cherryCountPopupEvent.create({
    data: {
      tenantId,
      name: 'Downtown Night Market',
      date: new Date('2026-09-06T17:00:00.000Z'),
      venue: 'City Center Plaza',
      address: '123 Main St, Atlanta, GA',
      status: 'PACKING',
      revenueGoal: 3000,
    },
  });

  const hoodM = hoodie.variants.find((v) => v.size === 'M')!;
  await prisma.cherryCountEventInventory.create({
    data: {
      tenantId,
      eventId: event.id,
      variantId: hoodM.id,
      quantityAssigned: 6,
      quantityPacked: 6,
      packingStatus: 'PACKED',
    },
  });

  await prisma.cherryCountSale.create({
    data: {
      tenantId,
      customerId: brianna.id,
      paymentMethod: 'CASH',
      subtotal: 1287,
      total: 1287,
      profit: 600,
      items: {
        create: [{ variantId: hoodM.id, quantity: 18, unitPrice: 70, unitCost: 28, lineTotal: 1260 }],
      },
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
