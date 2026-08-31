import {
  RULES_VERSION,
  type Conversation,
  type ConversationStatus,
  type DetectedSignals,
  type PriorityAssessment,
  type PriorityBand,
  type PriorityFactor,
} from '../types.ts';

export const SCORE_MIN = 0;
export const SCORE_MAX = 100;

const FACTOR_RULES: Array<{
  code: string;
  label: string;
  points: (signals: DetectedSignals) => number;
}> = [
  {
    code: 'immediate_safety',
    label: 'Immediate safety condition',
    points: (s) => (s.immediateSafety ? 35 : 0),
  },
  {
    code: 'complete_loss',
    label: 'Complete loss of essential service',
    points: (s) => (s.completeLossEssential ? 22 : 0),
  },
  {
    code: 'vulnerable_occupant',
    label: 'Vulnerable occupant or severe indoor condition',
    points: (s) => (s.vulnerableOccupant ? 15 : 0),
  },
  {
    code: 'property_damage',
    label: 'Active property damage',
    points: (s) => (s.activePropertyDamage ? 20 : 0),
  },
  {
    code: 'existing_customer',
    label: 'Existing customer',
    points: (s) => (s.existingCustomer ? 5 : 0),
  },
  {
    code: 'repeat_failure',
    label: 'Repeat failure or relevant equipment history',
    points: (s) => (s.repeatFailure ? 8 : 0),
  },
  {
    code: 'same_day_availability',
    label: 'Same-day technician availability',
    points: (s) => (s.sameDayAvailability ? 5 : 0),
  },
  {
    code: 'high_opportunity',
    label: 'High estimated opportunity',
    points: (s) => clampOpportunity(s.highOpportunityPoints),
  },
  {
    code: 'routine_admin',
    label: 'Routine administrative request',
    points: (s) => (s.routineAdministrative ? -25 : 0),
  },
  {
    code: 'already_handled',
    label: 'Already scheduled or resolved',
    points: (s) => (s.alreadyScheduledOrResolved ? -40 : 0),
  },
];

export function clampOpportunity(points: number): number {
  if (!Number.isFinite(points)) return 0;
  return Math.max(0, Math.min(10, Math.round(points)));
}

export function clampScore(score: number): number {
  if (!Number.isFinite(score)) return SCORE_MIN;
  return Math.max(SCORE_MIN, Math.min(SCORE_MAX, Math.round(score)));
}

export function bandForScore(score: number): PriorityBand {
  const clamped = clampScore(score);
  if (clamped >= 80) return 'critical';
  if (clamped >= 60) return 'high';
  if (clamped >= 35) return 'medium';
  return 'low';
}

export function isClosedStatus(status: ConversationStatus): boolean {
  return status === 'completed' || status === 'deferred';
}

export function signalsForStatus(signals: DetectedSignals, status: ConversationStatus): DetectedSignals {
  if (status === 'scheduled' || status === 'dispatched' || isClosedStatus(status)) {
    return { ...signals, alreadyScheduledOrResolved: true };
  }
  return signals;
}

export function assessConversation(
  conversation: Conversation,
  evaluatedAt = conversation.receivedAt,
): PriorityAssessment {
  if (conversation.priorityOverride !== null) {
    const score = clampScore(conversation.priorityOverride);
    return {
      score,
      band: bandForScore(score),
      factors: [
        {
          code: 'manual_override',
          label: 'Dispatcher manual priority override',
          points: score,
        },
      ],
      evaluatedAt,
      rulesVersion: RULES_VERSION,
    };
  }

  const signals = signalsForStatus(conversation.detectedSignals, conversation.status);
  const factors: PriorityFactor[] = FACTOR_RULES.map((rule) => ({
    code: rule.code,
    label: rule.label,
    points: rule.points(signals),
  })).filter((factor) => factor.points !== 0);

  const raw = factors.reduce((sum, factor) => sum + factor.points, 0);
  const score = clampScore(raw);

  return {
    score,
    band: bandForScore(score),
    factors,
    evaluatedAt,
    rulesVersion: RULES_VERSION,
  };
}

export function compareQueueItems(
  a: { assessment: PriorityAssessment; conversation: Conversation },
  b: { assessment: PriorityAssessment; conversation: Conversation },
): number {
  if (b.assessment.score !== a.assessment.score) {
    return b.assessment.score - a.assessment.score;
  }
  const aTime = Date.parse(a.conversation.receivedAt);
  const bTime = Date.parse(b.conversation.receivedAt);
  if (aTime !== bTime) return aTime - bTime;
  return a.conversation.id.localeCompare(b.conversation.id);
}

export function emptySignals(overrides: Partial<DetectedSignals> = {}): DetectedSignals {
  return {
    immediateSafety: false,
    completeLossEssential: false,
    vulnerableOccupant: false,
    activePropertyDamage: false,
    existingCustomer: false,
    repeatFailure: false,
    sameDayAvailability: false,
    highOpportunityPoints: 0,
    routineAdministrative: false,
    alreadyScheduledOrResolved: false,
    ...overrides,
  };
}
