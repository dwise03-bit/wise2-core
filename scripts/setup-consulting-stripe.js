#!/usr/bin/env node
/**
 * Setup Consulting Products in Stripe & Database
 *
 * Usage:
 *   export STRIPE_SECRET_KEY=<your-stripe-secret-key>
 *   export DATABASE_URL=postgresql://...
 *   node scripts/setup-consulting-stripe.js
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const CONSULTING_PRODUCTS = [
  {
    id: 'audit',
    name: 'AI Business Audit',
    description: '60-minute complete business audit and AI opportunity identification',
    amount: 14900, // $149.00 in cents
    recurring: false,
  },
  {
    id: 'live-build',
    name: 'WISE² Live Build Session',
    description: '60-minute real-time implementation session - Build with us LIVE',
    amount: 49700, // $497.00 in cents
    recurring: false,
    featured: true,
  },
  {
    id: 'impl-day',
    name: 'AI Implementation Day',
    description: 'Full-day (6 hour) implementation and deployment',
    amount: 99700, // $997.00 in cents
    recurring: false,
  },
  {
    id: 'management',
    name: 'WISE² Management',
    description: 'Monthly ongoing management and optimization',
    amount: 29700, // $297.00 in cents
    recurring: true,
    interval: 'month',
  },
];

async function setupConsultingProducts() {
  console.log('🚀 Setting up WISE² Consulting Products\n');

  const priceIds = {};

  for (const product of CONSULTING_PRODUCTS) {
    try {
      console.log(`Creating Stripe product: ${product.name}...`);

      // Create Stripe product
      const stripeProduct = await stripe.products.create({
        name: product.name,
        description: product.description,
        metadata: {
          consulting_service_id: product.id,
        },
      });

      // Create price
      const priceData = {
        product: stripeProduct.id,
        unit_amount: product.amount,
        currency: 'usd',
      };

      if (product.recurring) {
        priceData.recurring = {
          interval: product.interval,
        };
      }

      const price = await stripe.prices.create(priceData);
      priceIds[product.id] = price.id;

      console.log(`✅ Created: ${product.name}`);
      console.log(`   Stripe Product ID: ${stripeProduct.id}`);
      console.log(`   Stripe Price ID: ${price.id}\n`);
    } catch (error) {
      console.error(`❌ Failed to create ${product.name}:`, error.message);
      process.exit(1);
    }
  }

  // Seed database with ConsultingService records
  console.log('\n📊 Seeding ConsultingService records in database...\n');

  for (const product of CONSULTING_PRODUCTS) {
    try {
      const priceId = priceIds[product.id];
      const featured = product.featured || false;
      const isRecurring = product.recurring || false;
      const isManagementTier = product.id === 'management';

      const query = `
        INSERT INTO "ConsultingService"
        (id, name, description, "hourlyRate", tags, "stripePriceId", featured, "isRecurring", "isManagementTier", "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET
          "stripePriceId" = $6,
          "featured" = $7,
          "isRecurring" = $8,
          "isManagementTier" = $9,
          "updatedAt" = NOW()
      `;

      const hourlyRate = Math.floor(product.amount / 100);
      const tags = ['consulting'];
      if (product.featured) tags.push('featured');

      await pool.query(query, [
        product.id,
        product.name,
        product.description,
        hourlyRate,
        tags,
        priceId,
        featured,
        isRecurring,
        isManagementTier,
      ]);

      console.log(`✅ Seeded: ${product.name}`);
      console.log(`   Price ID: ${priceId}\n`);
    } catch (error) {
      console.error(`❌ Failed to seed ${product.name}:`, error.message);
      process.exit(1);
    }
  }

  console.log('═══════════════════════════════════════════════════════');
  console.log('✅ SETUP COMPLETE!\n');
  console.log('📋 Consulting Products Created:');
  console.log('   • AI Business Audit ($149)');
  console.log('   • WISE² Live Build Session ($497) - FEATURED');
  console.log('   • AI Implementation Day ($997)');
  console.log('   • WISE² Management ($297/month)\n');

  console.log('🔑 Price IDs for Reference:');
  Object.entries(priceIds).forEach(([id, priceId]) => {
    console.log(`   ${id}: ${priceId}`);
  });

  console.log('\n✨ Next steps:');
  console.log('   1. Add Stripe price IDs to environment variables (optional)');
  console.log('   2. Create email templates (12 templates)');
  console.log('   3. Implement worker jobs for automation');
  console.log('   4. Test intake form at /intake\n');

  await pool.end();
}

setupConsultingProducts().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
