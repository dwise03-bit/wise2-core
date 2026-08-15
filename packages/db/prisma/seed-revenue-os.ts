/**
 * WISE² Revenue OS — tenant seed (Phase 13).
 *
 * Creates the minimum a Revenue OS deployment needs to exist:
 *   1. The `wise-hvac` tenant (Wise HVAC Solutions), feature-gated OFF.
 *   2. The `wise2` tenant, so WISE²'s own consulting data has a home. The
 *      tenant ROW ONLY — no existing record is migrated or backfilled here.
 *   3. The seven AI agents for `wise-hvac`, seeded DISABLED / NEEDS_CONFIG.
 *
 * The seed is idempotent and safe to run on every deploy. It never deletes,
 * never re-enables an agent an operator paused, and never writes customer,
 * lead, job, estimate or campaign data unless demo mode is explicitly on
 * (see `demoModeReason()` below).
 *
 * Run:  DATABASE_URL=... npx ts-node prisma/seed-revenue-os.ts
 */

import {
  AgentStatus,
  AgentType,
  LeadStatus,
  LeadUrgency,
  PrismaClient,
  Prisma,
} from '@prisma/client';

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Agent definitions
// ---------------------------------------------------------------------------
// SOURCE OF TRUTH: packages/api/src/revenue-os/agents/agent-definitions.ts
// and AgentsService.seedForTenant().
//
// They are duplicated here rather than imported because @wise2/db must not
// depend on the API package. The row shape below mirrors seedForTenant()
// exactly: same name, same disabled/NEEDS_CONFIG state, and the same
// `config` payload of { agentId, promptPath, tools, requires }.
// Keep the two in sync when an agent is added or its tools change.
// ---------------------------------------------------------------------------

/** Capability names must match AgentCapability in agent-definitions.ts. */
type AgentCapability = 'messaging' | 'telephony' | 'calendar' | 'review';

interface SeedAgentDefinition {
  id: string;
  type: AgentType;
  name: string;
  promptPath: string;
  tools: string[];
  purpose: string;
  requires: AgentCapability[];
  guardrails: string[];
}

const GLOBAL_AGENT_RULES: string[] = [
  'Never invent prices.',
  'Never invent financing terms.',
  'Never invent rebates.',
  'Never invent warranties.',
  'Never invent availability — offer only slots returned by the calendar provider.',
  'Never invent technician arrival times.',
  'Never invent review links.',
  'Never invent membership pricing.',
  'Honour opt-out immediately and permanently.',
  'Log every AI-handled interaction.',
  'Always allow handoff to a human.',
  'On a safety trigger, stop the sales flow and use tenant-approved language only.',
];

const AGENT_DEFINITIONS: SeedAgentDefinition[] = [
  {
    id: 'wise-receptionist',
    type: AgentType.RECEPTIONIST,
    name: 'WISE Receptionist',
    promptPath: 'promptos/agents/revenue-os/receptionist.md',
    tools: [
      'lookup_customer',
      'create_lead',
      'classify_intent',
      'safety_gate',
      'book_appointment',
      'transfer_to_human',
    ],
    purpose:
      '24/7 inbound front desk. Identify caller, intent, customer status and urgency, then book or route.',
    requires: ['telephony', 'calendar'],
    guardrails: [
      'Runs the safety gate before any diagnosis or booking discussion.',
      'Never diagnoses a fault; describes symptoms and books a technician.',
      'Transfers to a human on request, without argument.',
    ],
  },
  {
    id: 'wise-speed-to-lead',
    type: AgentType.SPEED_TO_LEAD,
    name: 'WISE Speed-to-Lead',
    promptPath: 'promptos/agents/revenue-os/speed-to-lead.md',
    tools: [
      'normalize_contact',
      'dedupe_customer',
      'classify_intent',
      'safety_gate',
      'check_consent',
      'send_sms',
      'place_call',
      'book_appointment',
    ],
    purpose:
      'Work inbound Meta/Google/web leads immediately: contact, qualify and drive to a booking.',
    requires: ['messaging', 'telephony', 'calendar'],
    guardrails: [
      'Checks consent before the first outbound message or call.',
      'Stops the cadence the moment an opt-out arrives.',
      'Does not quote a price to win the booking.',
    ],
  },
  {
    id: 'wise-booking',
    type: AgentType.BOOKING,
    name: 'WISE Booking',
    promptPath: 'promptos/agents/revenue-os/booking.md',
    tools: ['available_slots', 'create_appointment', 'confirm_appointment'],
    purpose: 'Offer valid appointment slots and create appointments.',
    requires: ['calendar'],
    guardrails: [
      'Offers only slots returned by the calendar provider.',
      'Reports no availability rather than inventing a slot when the provider returns none.',
      'Never promises a technician arrival time beyond the booked window.',
    ],
  },
  {
    id: 'wise-recovery',
    type: AgentType.RECOVERY,
    name: 'WISE Recovery',
    promptPath: 'promptos/agents/revenue-os/recovery.md',
    tools: [
      'list_open_estimates',
      'check_consent',
      'send_sms',
      'record_objection',
      'escalate_to_human',
    ],
    purpose:
      'Follow up unsold estimates, capture objections, and hand pricing negotiation to a human.',
    requires: ['messaging'],
    guardrails: [
      'Escalates every pricing exception and technical question to a human.',
      'Never discounts, and never implies a discount is available.',
      'Stops when the estimate is sold, declined, or the customer opts out.',
    ],
  },
  {
    id: 'wise-membership',
    type: AgentType.MEMBERSHIP,
    name: 'WISE Membership',
    promptPath: 'promptos/agents/revenue-os/membership.md',
    tools: ['check_eligibility', 'describe_membership', 'record_interest', 'check_consent'],
    purpose: 'Offer approved maintenance-plan opportunities.',
    requires: ['messaging'],
    guardrails: [
      'Offers only the tenant-configured membership; never a plan it composed.',
      'Never states membership pricing that is not configured for the tenant.',
    ],
  },
  {
    id: 'wise-review',
    type: AgentType.REVIEW,
    name: 'WISE Review',
    promptPath: 'promptos/agents/revenue-os/review.md',
    tools: ['collect_satisfaction', 'review_link', 'create_recovery_task'],
    purpose:
      'Request feedback after completed jobs; route unhappy customers to service recovery.',
    requires: ['messaging', 'review'],
    guardrails: [
      'Does not review-gate: every customer is asked the same question.',
      'Negative feedback creates an internal recovery task and is preserved, never suppressed.',
      'Sends only a configured review link, never a constructed URL.',
    ],
  },
  {
    id: 'wise-reactivation',
    type: AgentType.REACTIVATION,
    name: 'WISE Reactivation',
    promptPath: 'promptos/agents/revenue-os/reactivation.md',
    tools: ['build_cohort', 'check_consent', 'send_sms', 'record_attribution'],
    purpose:
      'Re-engage dormant customers based on service history, maintenance due date, equipment age and season.',
    requires: ['messaging'],
    guardrails: [
      'Excludes opted-out and do-not-contact customers from every cohort.',
      'Never claims a maintenance visit is overdue unless service history says so.',
    ],
  },
];

function instructionsFor(definition: SeedAgentDefinition): string {
  return [definition.purpose, '', 'Rules:', ...GLOBAL_AGENT_RULES, ...definition.guardrails].join(
    '\n',
  );
}

// ---------------------------------------------------------------------------
// Tenants
// ---------------------------------------------------------------------------

const WISE_HVAC_SLUG = process.env.WISE_HVAC_TENANT_SLUG || 'wise-hvac';
const WISE2_SLUG = 'wise2';

/**
 * Tenants are upserted on `slug`, which is unique. `update` deliberately
 * carries only the descriptive fields: `revenueOsEnabled` is an operator
 * decision (Phase 16 rollout) and re-running the seed must never flip a
 * tenant that has been switched on back off, nor switch one on.
 *
 * `safetyScript` is likewise left alone. The AI must use tenant-APPROVED
 * language on a safety trigger; a seed cannot approve copy on the operator's
 * behalf, so it stays null until a human writes it.
 */
async function seedTenants() {
  const hvac = await prisma.tenant.upsert({
    where: { slug: WISE_HVAC_SLUG },
    update: {
      name: 'Wise HVAC Solutions',
      vertical: 'hvac',
      timezone: 'America/New_York',
    },
    create: {
      slug: WISE_HVAC_SLUG,
      name: 'Wise HVAC Solutions',
      vertical: 'hvac',
      timezone: 'America/New_York',
      revenueOsEnabled: false,
    },
  });
  console.log(`  tenant ${hvac.slug} (${hvac.id}) — revenueOsEnabled=${hvac.revenueOsEnabled}`);

  // WISE²'s own tenant. Per the Phase 13 decision, WISE²'s existing
  // consulting records conceptually belong here — but this seed creates the
  // tenant row ONLY. No existing row is migrated, re-pointed or backfilled;
  // that is a separate, reviewed data migration.
  const wise2 = await prisma.tenant.upsert({
    where: { slug: WISE2_SLUG },
    update: { name: 'WISE²' },
    create: {
      slug: WISE2_SLUG,
      name: 'WISE²',
      vertical: 'consulting',
      timezone: 'America/New_York',
      revenueOsEnabled: false,
    },
  });
  console.log(`  tenant ${wise2.slug} (${wise2.id}) — revenueOsEnabled=${wise2.revenueOsEnabled}`);

  return { hvac, wise2 };
}

// ---------------------------------------------------------------------------
// Agents
// ---------------------------------------------------------------------------

/**
 * Seeds the seven agents for a tenant, upserting on the unique
 * [tenantId, type] pair.
 *
 * On UPDATE we refresh only the definition-derived fields (name,
 * instructions, config) so a redeploy picks up new tools or guardrails.
 * `enabled` and `status` are never written on update: if an operator paused
 * an agent, or the API moved it to ONLINE/ERROR, the seed leaves that alone.
 */
async function seedAgents(tenantId: string) {
  let created = 0;
  let refreshed = 0;

  for (const definition of AGENT_DEFINITIONS) {
    const config: Prisma.InputJsonValue = {
      agentId: definition.id,
      promptPath: definition.promptPath,
      tools: definition.tools,
      requires: definition.requires,
    };

    const existing = await prisma.agentConfig.findUnique({
      where: { tenantId_type: { tenantId, type: definition.type } },
      select: { id: true },
    });

    await prisma.agentConfig.upsert({
      where: { tenantId_type: { tenantId, type: definition.type } },
      update: {
        name: definition.name,
        instructions: instructionsFor(definition),
        config,
        // enabled / status intentionally omitted — operator state is sacred.
      },
      create: {
        tenantId,
        type: definition.type,
        name: definition.name,
        enabled: false,
        status: AgentStatus.NEEDS_CONFIG,
        instructions: instructionsFor(definition),
        config,
      },
    });

    if (existing) {
      refreshed += 1;
    } else {
      created += 1;
    }
  }

  console.log(`  agents: ${created} created, ${refreshed} refreshed (enabled/status untouched)`);
  return { created, refreshed };
}

// ---------------------------------------------------------------------------
// Demo fixtures — OFF unless explicitly requested
// ---------------------------------------------------------------------------

/**
 * Returns why demo mode is on, or null when it is off.
 *
 * Demo data is fake. Fake leads in a production pipeline corrupt every
 * revenue number the Command Center reports and can cause an enabled agent
 * to contact a phone number that is not a customer. So it requires an
 * explicit opt-in AND is refused outright when NODE_ENV is 'production'.
 */
function demoModeReason(): string | null {
  const nodeEnv = process.env.NODE_ENV;
  const flag = process.env.SEED_DEMO === 'true';

  if (nodeEnv === 'production') {
    if (flag) {
      throw new Error(
        'SEED_DEMO=true refused: NODE_ENV=production. Demo data must never be written to production.',
      );
    }
    return null;
  }

  if (flag) return 'SEED_DEMO=true';
  if (nodeEnv === 'development') return "NODE_ENV=development";
  return null;
}

/**
 * A deliberately tiny fixture set for local UI work: one campaign, one
 * customer, one lead. Every record is prefixed DEMO and uses a fixed id, so
 * re-running updates the same three rows instead of multiplying them, and so
 * they are trivially identifiable in a database.
 *
 * No consent record is created: nothing here is contactable, by design.
 */
async function seedDemoData(tenantId: string) {
  const campaign = await prisma.campaign.upsert({
    where: {
      tenantId_platform_externalCampaignId: {
        tenantId,
        platform: 'demo',
        externalCampaignId: 'demo-campaign-1',
      },
    },
    update: { campaignName: 'DEMO — Local Fixture Campaign', active: false },
    create: {
      tenantId,
      platform: 'demo',
      campaignName: 'DEMO — Local Fixture Campaign',
      externalCampaignId: 'demo-campaign-1',
      spend: 0,
      active: false,
    },
  });

  const customer = await prisma.revenueCustomer.upsert({
    where: { id: 'demo-wise-hvac-customer-1' },
    update: {},
    create: {
      id: 'demo-wise-hvac-customer-1',
      tenantId,
      firstName: 'DEMO',
      lastName: 'Fixture (not a real customer)',
      // 555-01xx is the reserved fictional range; it cannot be dialled.
      phone: '+15555550100',
      email: 'demo-fixture@example.invalid',
      city: 'Springfield',
      state: 'NY',
      systemType: 'split-system',
      tags: ['demo'],
      notes: 'Local development fixture. Do not contact. Safe to delete.',
    },
  });

  await prisma.lead.upsert({
    where: { id: 'demo-wise-hvac-lead-1' },
    update: {},
    create: {
      id: 'demo-wise-hvac-lead-1',
      tenantId,
      customerId: customer.id,
      campaignId: campaign.id,
      source: 'demo',
      serviceType: 'no cooling',
      urgency: LeadUrgency.FLEXIBLE,
      status: LeadStatus.NEW,
      summary: 'DEMO fixture lead for local UI development. Not a real enquiry.',
    },
  });

  console.log('  demo: 1 campaign, 1 customer, 1 lead (all prefixed DEMO)');
}

// ---------------------------------------------------------------------------

async function main() {
  console.log('WISE² Revenue OS seed');
  console.log('---------------------');

  const { hvac } = await seedTenants();
  await seedAgents(hvac.id);

  const demo = demoModeReason();
  if (demo) {
    console.warn('');
    console.warn('  ####################################################');
    console.warn(`  #  DEMO DATA MODE ACTIVE (${demo})`);
    console.warn('  #  Writing FAKE fixture records. Never do this in');
    console.warn('  #  a production database.');
    console.warn('  ####################################################');
    console.warn('');
    await seedDemoData(hvac.id);
  } else {
    console.log('  demo data: skipped (set SEED_DEMO=true in a non-production env to enable)');
  }

  console.log('');
  console.log('Done. Next steps:');
  console.log('  - Create a TenantMembership row linking your auth user id to a tenant.');
  console.log('  - Set Tenant.safetyScript with operator-approved safety language.');
  console.log('  - Configure providers (see docs/revenue-os/PROVIDERS.md).');
  console.log('  - Flip REVENUE_OS_ENABLED and Tenant.revenueOsEnabled when ready.');
}

main()
  .catch((err) => {
    console.error('Revenue OS seed failed:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
