/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function seedTenant(tenantId) {
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

  const hoodM = hoodie.variants.find((v) => v.size === 'M');
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

const crypto = require('crypto');

function generatePassword(length = 16) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
  return Array.from(crypto.randomBytes(length))
    .map((byte) => alphabet[byte % alphabet.length])
    .join('');
}

async function ensurePhoneService(tenantId) {
  const greeting =
    "Hey love! Thanks for calling Brianna's Boutique. I'm Cherry, Brianna's AI assistant. I can help with sizes, our next pop-up, or hold an item for you. What can I help you with today?";
  const afterHours =
    "We're closed right now, but I can take a message or text you when we're back. Our next pop-up is Downtown Night Market — want me to save you a spot?";
  const businessHours = {
    mon: { open: '10:00', close: '19:00' },
    tue: { open: '10:00', close: '19:00' },
    wed: { open: '10:00', close: '19:00' },
    thu: { open: '10:00', close: '19:00' },
    fri: { open: '10:00', close: '21:00' },
    sat: { open: '11:00', close: '21:00' },
    sun: { closed: true },
  };

  await prisma.aiPhoneConfig.upsert({
    where: { tenantId },
    update: { enabled: true, aiPersona: 'Cherry' },
    create: {
      tenantId,
      enabled: true,
      phoneNumber: '(404) 867-2446',
      greeting,
      afterHoursMessage: afterHours,
      businessHours,
      timezone: 'America/New_York',
      transferNumber: '(404) 555-0182',
      smsEnabled: true,
      voicemailEnabled: true,
      recordingEnabled: true,
      aiPersona: 'Cherry',
    },
  });

  const aiCallCount = await prisma.aiPhoneCall.count({ where: { tenantId } });
  if (aiCallCount > 0) return;

  const legacyCalls = await prisma.cherryCountPhoneCall.findMany({ where: { tenantId } });
  if (legacyCalls.length > 0) {
    await prisma.aiPhoneCall.createMany({
      data: legacyCalls.map((call) => ({
        tenantId,
        callerNumber: call.callerNumber,
        callerName: call.callerName,
        direction: call.direction,
        status: call.status,
        durationSeconds: call.durationSeconds,
        intent: call.intent,
        outcome: call.outcome,
        summary: call.summary,
        transcript: call.transcript,
        startedAt: call.startedAt,
      })),
    });
    return;
  }

  const now = Date.now();
  const hoursAgo = (h) => new Date(now - h * 60 * 60 * 1000);

  await prisma.aiPhoneCall.createMany({
    data: [
      {
        tenantId,
        callerNumber: '(404) 555-0142',
        callerName: 'Sarah M.',
        durationSeconds: 134,
        intent: 'Product availability',
        outcome: 'HOLD_PLACED',
        summary:
          'Asked about Cherry Bomb Hoodie in Medium. Cherry confirmed stock and placed a hold for Downtown Night Market.',
        startedAt: hoursAgo(2),
        status: 'COMPLETED',
      },
      {
        tenantId,
        callerNumber: '(678) 555-0298',
        callerName: 'Imani L.',
        durationSeconds: 182,
        intent: 'Sizing help',
        outcome: 'SMS_SENT',
        summary:
          'Needed sizing advice on Lavender Crop Top. Cherry sent size chart and Instagram DM link.',
        startedAt: hoursAgo(5),
        status: 'COMPLETED',
      },
      {
        tenantId,
        callerNumber: '(770) 555-0311',
        callerName: 'Unknown',
        durationSeconds: 105,
        intent: 'Pop-up info',
        outcome: 'TRANSFERRED',
        summary:
          'Wanted vendor booth details for Downtown Night Market. Transferred to Brianna after capturing name.',
        startedAt: hoursAgo(8),
        status: 'COMPLETED',
      },
      {
        tenantId,
        callerNumber: '(404) 555-0177',
        callerName: 'Taylor K.',
        durationSeconds: 48,
        intent: 'After-hours inquiry',
        outcome: 'VOICEMAIL',
        summary:
          'Asked about restocking Royal Plum Joggers. Voicemail captured and tagged for follow-up.',
        startedAt: hoursAgo(14),
        status: 'COMPLETED',
      },
    ],
  });
}

async function main() {
  const ownerEmail = (
    process.env.OWNER_EMAIL?.trim().toLowerCase() ||
    (process.env.TENANT_SLUG === 'briannas-boutique' || !process.env.TENANT_SLUG
      ? 'brianna@briannasboutique.com'
      : '')
  );
  const tenantSlug = process.env.TENANT_SLUG?.trim() || 'briannas-boutique';
  const tenantName = process.env.TENANT_NAME?.trim() || "Brianna's Boutique";
  const contactName = process.env.CONTACT_NAME?.trim() || 'Brianna';
  const phone = process.env.CLIENT_PHONE?.trim() || '(404) 555-0182';
  const instagram = process.env.CLIENT_INSTAGRAM?.trim() || '@brianna_styles';
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase() || 'wise1ofwise2@gmail.com';
  const plan = (process.env.CLIENT_PLAN?.trim().toUpperCase() || 'PRO');
  const mrr = Number(process.env.CLIENT_MRR || (plan === 'PRO' ? 49 : plan === 'STARTER' ? 19 : 0));
  const demoMode = process.env.DEMO_MODE === 'true';
  let ownerPassword = process.env.OWNER_PASSWORD;
  let generatedPassword = null;

  if (!ownerEmail) throw new Error('OWNER_EMAIL is required');

  let user = await prisma.user.findUnique({ where: { email: ownerEmail } });
  if (!user) {
    if (!ownerPassword || ownerPassword.length < 8) {
      generatedPassword = generatePassword();
      ownerPassword = generatedPassword;
      console.log('Generated temporary password for new client account.');
    }
    user = await prisma.user.create({
      data: {
        email: ownerEmail,
        name: contactName,
        passwordHash: await bcrypt.hash(ownerPassword, 10),
        role: 'CUSTOMER',
      },
    });
    console.log(`Created user: ${user.email}`);
  } else {
    console.log(`Using existing user: ${user.email}`);
    if (contactName && user.name !== contactName) {
      user = await prisma.user.update({ where: { id: user.id }, data: { name: contactName } });
    }
  }

  const prospect = await prisma.prospect.upsert({
    where: { email: ownerEmail },
    update: {
      businessName: tenantName,
      contactName,
      phone,
      industry: 'retail_popup',
      primaryProblem: 'Mobile pop-up inventory, packing, and sales tracking across events.',
      leadSource: 'DIRECT',
      status: 'WON',
      estimatedOpportunity: mrr * 12,
      wonAt: new Date(),
      notes: `Cherry Count client. Instagram: ${instagram}. Tenant: ${tenantSlug}.`,
      tags: ['cherry-count', 'retail-popup', 'wise2-client'],
    },
    create: {
      businessName: tenantName,
      contactName,
      email: ownerEmail,
      phone,
      industry: 'retail_popup',
      primaryProblem: 'Mobile pop-up inventory, packing, and sales tracking across events.',
      leadSource: 'DIRECT',
      status: 'WON',
      estimatedOpportunity: mrr * 12,
      wonAt: new Date(),
      notes: `Cherry Count client. Instagram: ${instagram}. Tenant: ${tenantSlug}.`,
      tags: ['cherry-count', 'retail-popup', 'wise2-client'],
    },
  });
  console.log(`Prospect: ${prospect.status} — ${prospect.businessName}`);

  const customer = await prisma.customer.upsert({
    where: { email: ownerEmail },
    update: {
      businessName: tenantName,
      contactName,
      phone,
      industry: 'retail_popup',
      status: 'ACTIVE',
      mrr,
      userId: user.id,
      prospectId: prospect.id,
      notes: `WISE² Cherry Count tenant: ${tenantSlug}. Instagram: ${instagram}.`,
      tags: ['cherry-count', 'retail-popup', 'wise2-client'],
    },
    create: {
      businessName: tenantName,
      contactName,
      email: ownerEmail,
      phone,
      industry: 'retail_popup',
      status: 'ACTIVE',
      mrr,
      userId: user.id,
      prospectId: prospect.id,
      notes: `WISE² Cherry Count tenant: ${tenantSlug}. Instagram: ${instagram}.`,
      tags: ['cherry-count', 'retail-popup', 'wise2-client'],
    },
  });
  console.log(`CRM customer: ${customer.businessName} (${customer.id})`);

  const trialEnds = new Date();
  trialEnds.setDate(trialEnds.getDate() + 14);
  await prisma.subscription.upsert({
    where: { userId: user.id },
    update: { plan, status: 'TRIALING', trialEndsAt: trialEnds },
    create: { userId: user.id, plan, status: 'TRIALING', trialEndsAt: trialEnds },
  });
  console.log(`Subscription: ${plan} (trialing until ${trialEnds.toISOString().slice(0, 10)})`);

  let tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: {
        slug: tenantSlug,
        name: tenantName,
        vertical: 'retail_popup',
        state: 'ACTIVE',
        demoMode,
        enabledModules: ['cherry_count', 'inventory', 'crm', 'analytics', 'ai', 'ai_phone'],
        onboardingStep: 5,
        onboardingCompletedAt: new Date(),
      },
    });
    console.log(`Created tenant: ${tenant.name} (${tenant.id})`);
  } else {
    tenant = await prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        name: tenantName,
        state: 'ACTIVE',
        vertical: 'retail_popup',
        demoMode,
        enabledModules: ['cherry_count', 'inventory', 'crm', 'analytics', 'ai', 'ai_phone'],
        onboardingStep: 5,
        onboardingCompletedAt: new Date(),
      },
    });
    console.log(`Updated tenant: ${tenant.name} (${tenant.id})`);
  }

  await prisma.tenantMembership.upsert({
    where: { tenantId_userId: { tenantId: tenant.id, userId: user.id } },
    update: { role: 'OWNER' },
    create: { tenantId: tenant.id, userId: user.id, role: 'OWNER' },
  });
  console.log(`Membership: OWNER for ${user.email}`);

  const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (admin && admin.id !== user.id) {
    await prisma.tenantMembership.upsert({
      where: { tenantId_userId: { tenantId: tenant.id, userId: admin.id } },
      update: { role: 'ADMIN' },
      create: { tenantId: tenant.id, userId: admin.id, role: 'ADMIN' },
    });
    console.log(`Membership: ADMIN for ${admin.email}`);
  }

  const productCount = await prisma.cherryCountProduct.count({ where: { tenantId: tenant.id } });
  if (productCount === 0) {
    console.log('Seeding Cherry Count starter data...');
    await seedTenant(tenant.id);
  } else {
    console.log(`Tenant already has ${productCount} products — skipping seed.`);
  }

  await ensurePhoneService(tenant.id);
  console.log('AI Phone service configured.');

  console.log('\n--- WISE² client provisioned ---');
  console.log(JSON.stringify({
    client: tenantName,
    tenantId: tenant.id,
    slug: tenant.slug,
    login: 'https://wise2.net/cherry-count/login',
    email: ownerEmail,
    tempPassword: generatedPassword,
  }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
