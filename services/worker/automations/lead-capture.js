/**
 * AUTOMATION 1: Lead Capture
 *
 * Trigger: New lead submitted
 * Flow:
 *   - Validate lead data
 *   - Create/update customer record
 *   - Classify lead quality
 *   - Assign status
 *   - Create activity log
 *   - Notify owner
 *   - Update Command Center
 *
 * Status: DRAFT
 */

const Redis = require('ioredis');
const postgres = require('pg').Pool;

const redis = new Redis(process.env.REDIS_URL || 'redis://redis:6379');
const db = new postgres({
  host: process.env.DB_HOST || 'postgres',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'wise2_prod_user',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'wise2_core_prod',
});

/**
 * Process a new lead
 */
async function processLead(leadData) {
  const { id, name, email, phone, source, message } = leadData;

  try {
    console.log(`[Lead Capture] Processing lead: ${name} (${email})`);

    // 1. Validate lead data
    if (!name || !email) {
      throw new Error('Lead missing required fields: name, email');
    }

    // 2. Create/update customer record
    const customer = await db.query(
      `INSERT INTO customers (name, email, phone, source, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       ON CONFLICT (email) DO UPDATE SET
         name = EXCLUDED.name,
         phone = EXCLUDED.phone,
         updated_at = NOW()
       RETURNING id`,
      [name, email, phone || null, source || 'web', 'lead']
    );

    const customerId = customer.rows[0].id;
    console.log(`[Lead Capture] Customer record: ${customerId}`);

    // 3. Classify lead quality
    const quality = classifyLead({ name, email, phone, message });
    console.log(`[Lead Capture] Lead quality: ${quality}`);

    // 4. Create activity log
    await db.query(
      `INSERT INTO activities (customer_id, type, description, metadata, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [customerId, 'lead_created', `New lead from ${source || 'web'}`, JSON.stringify({ quality })]
    );

    // 5. Notify owner (broadcast to Command Center)
    await redis.publish('automation:notifications', JSON.stringify({
      type: 'lead_created',
      customerId,
      name,
      email,
      quality,
      timestamp: new Date().toISOString(),
    }));

    // 6. Update Command Center status
    await redis.publish('command-center:updates', JSON.stringify({
      event: 'lead_captured',
      data: { customerId, name, email, quality },
    }));

    console.log(`[Lead Capture] ✓ Completed for ${name}`);
    return { success: true, customerId, quality };

  } catch (error) {
    console.error(`[Lead Capture] ✗ Error processing lead:`, error.message);

    // Log failure for retry
    await redis.lpush('jobs:failed', JSON.stringify({
      type: 'lead_capture',
      data: leadData,
      error: error.message,
      timestamp: new Date().toISOString(),
    }));

    throw error;
  }
}

/**
 * Classify lead quality
 */
function classifyLead({ name, email, phone, message }) {
  let score = 0;

  // Phone presence = high quality
  if (phone) score += 3;

  // Message length indicates engagement
  if (message && message.length > 50) score += 2;
  if (message && message.length > 200) score += 1;

  // Email domain (not free provider) = higher quality
  if (email && !['gmail.com', 'hotmail.com', 'yahoo.com'].includes(email.split('@')[1])) {
    score += 1;
  }

  if (score >= 5) return 'high';
  if (score >= 3) return 'medium';
  return 'low';
}

/**
 * Main worker loop
 */
async function run() {
  console.log('[Lead Capture Worker] Starting...');

  while (true) {
    try {
      const jobData = await redis.lpop('jobs:lead_capture');

      if (jobData) {
        const job = JSON.parse(jobData);
        await processLead(job.data);
      }

      await new Promise(r => setTimeout(r, 1000));

    } catch (error) {
      console.error('[Lead Capture Worker] Error:', error.message);
      await new Promise(r => setTimeout(r, 5000));
    }
  }
}

module.exports = { processLead, classifyLead, run };

// Start if run directly
if (require.main === module) {
  run().catch(console.error);
}
