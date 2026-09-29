import { AgentType } from '@prisma/client';

/**
 * The WISE² AI workforce (Phase 5).
 *
 * Agent definitions for the revenue OS, extending base configuration with
 * business-specific capability requirements and guardrails.
 *
 * Capability requirements are declared per agent so an agent whose providers
 * are unconfigured reports NEEDS_CONFIG instead of running and failing.
 */

export type AgentCapability =
  | 'messaging'
  | 'telephony'
  | 'calendar'
  | 'review';

export interface RevenueAgentDefinition {
  id: string;
  type: AgentType;
  name: string;
  promptPath: string;
  tools: string[];
  purpose: string;
  requires: AgentCapability[];
  /** Behaviour the agent must never exhibit; enforced in review and tests. */
  guardrails: string[];
}

/**
 * Rules that bind every agent in the workforce. They exist because each one
 * is a way an AI can cost a business real money or trust: quoting a price it
 * invented, promising a technician who is not scheduled, or messaging a
 * customer who asked to be left alone.
 */
export const GLOBAL_AGENT_RULES: string[] = [
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

export const AGENT_DEFINITIONS: RevenueAgentDefinition[] = [
  {
    id: 'wise-receptionist',
    type: AgentType.RECEPTIONIST,
    name: 'WISE Receptionist',
    promptPath: 'promptos/agents/revenue-os/receptionist.md',
    tools: ['lookup_customer', 'create_lead', 'classify_intent', 'safety_gate', 'book_appointment', 'transfer_to_human'],
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
    tools: ['normalize_contact', 'dedupe_customer', 'classify_intent', 'safety_gate', 'check_consent', 'send_sms', 'place_call', 'book_appointment'],
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
    tools: ['list_open_estimates', 'check_consent', 'send_sms', 'record_objection', 'escalate_to_human'],
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

export const AGENT_DEFINITION_BY_TYPE = new Map<AgentType, RevenueAgentDefinition>(
  AGENT_DEFINITIONS.map((d) => [d.type, d]),
);
