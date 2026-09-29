/**
 * WISE² LIVE Demo Scenarios
 *
 * Scenario definitions for different industries.
 * Each scenario is a sequence of events showing a business workflow.
 */

export interface DemoScenarioDefinition {
  key: string;
  name: string;
  description: string;
  icon?: string;
  sequenceNumber: number;
  triggerType: 'manual' | 'automated' | 'scheduled';
  duration: number; // seconds
  eventSequence: string[];
  industry: string;
  applicableRoles: string[];
  dataTemplate?: Record<string, unknown>;
  expectedOutcomes: string[];
}

// Default scenarios (industry-agnostic)
const DEFAULT_SCENARIOS: DemoScenarioDefinition[] = [
  {
    key: 'NEW_LEAD',
    name: 'New Lead Arrives',
    description: 'Customer submits a request via your website',
    icon: '🎯',
    sequenceNumber: 1,
    triggerType: 'manual',
    duration: 60,
    eventSequence: [
      'lead.created',
      'lead.matched',
      'lead.scored',
      'ai.response_generated',
      'sms.sent',
    ],
    industry: 'default',
    applicableRoles: ['owner', 'customer'],
    dataTemplate: {
      customerName: 'Marcus Johnson',
      service: 'AC Repair',
      budget: '$500',
    },
    expectedOutcomes: ['Lead in pipeline', 'AI response sent', 'SMS follow-up'],
  },
  {
    key: 'MISSED_CALL',
    name: 'Missed Call Recovery',
    description: 'Watch what happens when a customer calls while you\'re busy',
    icon: '☎️',
    sequenceNumber: 2,
    triggerType: 'manual',
    duration: 45,
    eventSequence: [
      'call.missed',
      'ai.voicemail_transcribed',
      'sms.sent_to_customer',
      'estimate.generated',
      'appointment.offered',
    ],
    industry: 'default',
    applicableRoles: ['owner'],
    expectedOutcomes: ['Voicemail transcribed', 'Customer followed up', 'Estimate sent'],
  },
  {
    key: 'WEB_FORM',
    name: 'Web Form Submission',
    description: 'Customer fills out service request form on your website',
    icon: '📋',
    sequenceNumber: 3,
    triggerType: 'manual',
    duration: 50,
    eventSequence: [
      'form.submitted',
      'lead.created',
      'contact.verified',
      'crm.record_created',
      'workflow.triggered',
      'email.sent',
    ],
    industry: 'default',
    applicableRoles: ['owner', 'customer'],
    expectedOutcomes: ['Lead captured', 'CRM updated', 'Automated email sent'],
  },
  {
    key: 'QUOTE_REQUEST',
    name: 'Quote Request & Acceptance',
    description: 'Customer requests a quote and you send it through WISE²',
    icon: '💰',
    sequenceNumber: 4,
    triggerType: 'manual',
    duration: 90,
    eventSequence: [
      'estimate.created',
      'estimate.sent',
      'estimate.viewed',
      'estimate.accepted',
      'payment.initiated',
      'appointment.scheduled',
    ],
    industry: 'default',
    applicableRoles: ['owner', 'customer'],
    expectedOutcomes: ['Quote sent', 'Customer accepted', 'Payment confirmed'],
  },
  {
    key: 'BOOKING',
    name: 'Appointment Booking',
    description: 'Customer books an appointment directly in your calendar',
    icon: '📅',
    sequenceNumber: 5,
    triggerType: 'manual',
    duration: 40,
    eventSequence: [
      'appointment.created',
      'confirmation.sent',
      'technician.assigned',
      'reminder.scheduled',
      'job.created',
    ],
    industry: 'default',
    applicableRoles: ['customer'],
    expectedOutcomes: ['Appointment booked', 'Technician assigned', 'Reminder sent'],
  },
  {
    key: 'JOB_COMPLETION',
    name: 'Job Completion & Payment',
    description: 'Technician completes job, payment processed, review requested',
    icon: '✅',
    sequenceNumber: 6,
    triggerType: 'manual',
    duration: 60,
    eventSequence: [
      'job.marked_complete',
      'invoice.generated',
      'payment.processed',
      'review.requested',
      'customer.retention_workflow_triggered',
    ],
    industry: 'default',
    applicableRoles: ['owner'],
    expectedOutcomes: ['Payment received', 'Review request sent', 'Customer recorded'],
  },
  {
    key: 'REVIEW_REQUEST',
    name: 'Review & Referral',
    description: 'Customer leaves a review and you gain referrals',
    icon: '⭐',
    sequenceNumber: 7,
    triggerType: 'manual',
    duration: 35,
    eventSequence: [
      'review.created',
      'review.posted_to_platforms',
      'lead.attributed_to_review',
      'customer.marked_as_repeat',
    ],
    industry: 'default',
    applicableRoles: ['owner'],
    expectedOutcomes: ['Review posted', 'Lead attributed', 'Revenue tracked'],
  },
];

// HVAC-specific scenarios
const HVAC_SCENARIOS: DemoScenarioDefinition[] = [
  ...DEFAULT_SCENARIOS,
  {
    key: 'EMERGENCY_CALL',
    name: 'Emergency After-Hours Service',
    description: 'Customer calls for emergency HVAC repair at 2 AM',
    icon: '🚨',
    sequenceNumber: 8,
    triggerType: 'manual',
    duration: 75,
    eventSequence: [
      'call.received',
      'emergency.routed_to_on_call',
      'dispatch.sent',
      'customer.notified',
      'service.completed',
      'emergency_charge.applied',
    ],
    industry: 'hvac',
    applicableRoles: ['owner'],
    expectedOutcomes: ['Call routed', 'Technician dispatched', 'Emergency charge applied'],
  },
  {
    key: 'MAINTENANCE_PLAN',
    name: 'Maintenance Plan Upsell',
    description: 'Offer customer preventive maintenance agreement',
    icon: '🔄',
    sequenceNumber: 9,
    triggerType: 'manual',
    duration: 50,
    eventSequence: [
      'maintenance_plan.offered',
      'customer.interested',
      'subscription.created',
      'recurring_revenue.recorded',
    ],
    industry: 'hvac',
    applicableRoles: ['owner'],
    expectedOutcomes: ['Plan offered', 'Subscription activated', 'MRR increased'],
  },
];

// Plumbing-specific scenarios
const PLUMBING_SCENARIOS: DemoScenarioDefinition[] = [
  ...DEFAULT_SCENARIOS,
  {
    key: 'EMERGENCY_PLUMBING',
    name: 'Emergency Plumbing Call',
    description: 'Customer has burst pipe; emergency service needed',
    icon: '💧',
    sequenceNumber: 8,
    triggerType: 'manual',
    duration: 80,
    eventSequence: [
      'emergency_call.received',
      'urgency.assessed',
      'technician.prioritized',
      'service.completed',
      'damage_mitigation.recorded',
      'emergency_rate.charged',
    ],
    industry: 'plumbing',
    applicableRoles: ['owner'],
    expectedOutcomes: ['Call triaged', 'Technician rushed', 'Premium service charged'],
  },
];

// Service-specific scenarios
const SERVICE_SCENARIOS: DemoScenarioDefinition[] = [
  ...DEFAULT_SCENARIOS,
  {
    key: 'MEMBERSHIP',
    name: 'Membership/Service Plan',
    description: 'Offer recurring service membership plan',
    icon: '🎫',
    sequenceNumber: 8,
    triggerType: 'manual',
    duration: 45,
    eventSequence: [
      'membership.presented',
      'membership.purchased',
      'recurring_billing.enabled',
      'customer.onboarded_to_plan',
    ],
    industry: 'service',
    applicableRoles: ['owner'],
    expectedOutcomes: ['Membership sold', 'Recurring revenue created', 'Customer retained'],
  },
];

// Build scenario map by industry
export const CORE_DEMO_SCENARIOS: Record<string, DemoScenarioDefinition[]> = {
  default: DEFAULT_SCENARIOS,
  hvac: HVAC_SCENARIOS,
  plumbing: PLUMBING_SCENARIOS,
  'service': SERVICE_SCENARIOS,
  // Add more industries as needed
};

/**
 * Get scenarios for a specific industry
 * Falls back to default if industry not found
 */
export function getScenariosForIndustry(
  industry: string,
): DemoScenarioDefinition[] {
  return CORE_DEMO_SCENARIOS[industry] || CORE_DEMO_SCENARIOS.default;
}

/**
 * Get a specific scenario by key and industry
 */
export function getScenarioByKey(
  industry: string,
  key: string,
): DemoScenarioDefinition | undefined {
  const scenarios = getScenariosForIndustry(industry);
  return scenarios.find((s) => s.key === key);
}
