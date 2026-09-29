import type {
  ActionType,
  Conversation,
  Opportunity,
  PriorityAssessment,
  RecommendedAction,
} from './types.ts';

const LABELS: Record<ActionType, string> = {
  call: 'Call',
  text: 'Text',
  book: 'Book',
  dispatch: 'Dispatch',
  quote: 'Quote',
  open_crm: 'Open CRM',
};

export function recommendAction(
  conversation: Conversation,
  assessment: PriorityAssessment,
  opportunity: Opportunity | null,
): RecommendedAction {
  const { detectedSignals: signals, status } = conversation;

  if (signals.immediateSafety || assessment.band === 'critical') {
    return {
      type: 'dispatch',
      label: LABELS.dispatch,
      rationale:
        'Critical risk factors require a human dispatcher to assign a technician and escalate immediately. WISE² is not an emergency-service provider.',
      urgency: 'immediate',
      payloadPreview: {
        assignment: 'Nearest available technician',
        escalation: 'Human review required',
      },
    };
  }

  if (status === 'callback_due') {
    return {
      type: 'call',
      label: LABELS.call,
      rationale: 'Customer is owed a same-day callback. Confirm the issue before booking.',
      urgency: 'today',
      payloadPreview: { purpose: 'Same-day callback' },
    };
  }

  if (!signals.existingCustomer && (opportunity?.highEstimate ?? 0) >= 400000) {
    return {
      type: 'quote',
      label: LABELS.quote,
      rationale: 'New lead with a replacement-range opportunity. Prepare a simulated estimate before dispatch.',
      urgency: 'today',
      payloadPreview: {
        range: formatRange(opportunity),
      },
    };
  }

  if (signals.completeLossEssential || assessment.band === 'high') {
    return {
      type: 'book',
      label: LABELS.book,
      rationale: 'Service is down or high-priority. Book the first same-day window.',
      urgency: 'today',
      payloadPreview: { window: 'Same-day diagnostic' },
    };
  }

  if (signals.routineAdministrative) {
    return {
      type: 'open_crm',
      label: LABELS.open_crm,
      rationale: 'Administrative request. Open the customer record and send the requested document.',
      urgency: 'routine',
      payloadPreview: { record: 'Customer billing profile' },
    };
  }

  return {
    type: 'text',
    label: LABELS.text,
    rationale: 'Low-urgency follow-up. Confirm availability by text before occupying a technician.',
    urgency: 'routine',
    payloadPreview: { channel: 'SMS' },
  };
}

function formatRange(opportunity: Opportunity | null): string {
  if (!opportunity) return 'Unavailable';
  return `$${(opportunity.lowEstimate / 100).toLocaleString()}–$${(opportunity.highEstimate / 100).toLocaleString()}`;
}

export { LABELS as ACTION_LABELS };
