import type { ActionStatus, ActionType, ConversationStatus } from '../types.ts';

export const CONFIRMATION_REQUIRED: readonly ActionType[] = [
  'call',
  'text',
  'book',
  'dispatch',
  'quote',
  'open_crm',
];

const LEGAL_ACTION: Record<ActionStatus, readonly ActionStatus[]> = {
  draft: ['awaiting_confirmation', 'canceled'],
  awaiting_confirmation: ['simulated_success', 'canceled', 'failed', 'draft'],
  simulated_success: [],
  canceled: [],
  failed: ['draft', 'awaiting_confirmation'],
};

const LEGAL_CONVERSATION: Record<ConversationStatus, readonly ConversationStatus[]> = {
  new: ['needs_review', 'callback_due', 'scheduled', 'dispatched', 'quoted', 'completed', 'deferred'],
  needs_review: ['callback_due', 'scheduled', 'dispatched', 'quoted', 'completed', 'deferred'],
  callback_due: ['needs_review', 'scheduled', 'dispatched', 'quoted', 'completed', 'deferred'],
  scheduled: ['dispatched', 'quoted', 'completed', 'deferred', 'callback_due'],
  dispatched: ['scheduled', 'quoted', 'completed', 'deferred'],
  quoted: ['scheduled', 'dispatched', 'completed', 'deferred', 'callback_due'],
  completed: [],
  deferred: ['needs_review', 'callback_due', 'scheduled'],
};

export function canTransitionAction(from: ActionStatus, to: ActionStatus): boolean {
  return LEGAL_ACTION[from].includes(to);
}

export function canTransitionConversation(
  from: ConversationStatus,
  to: ConversationStatus,
): boolean {
  return from === to || LEGAL_CONVERSATION[from].includes(to);
}

export function requiresConfirmation(type: ActionType): boolean {
  return CONFIRMATION_REQUIRED.includes(type);
}

export function conversationStatusAfterAction(
  type: ActionType,
  current: ConversationStatus,
): ConversationStatus {
  if (current === 'completed') return current;
  switch (type) {
    case 'dispatch':
      return 'dispatched';
    case 'book':
      return 'scheduled';
    case 'quote':
      return 'quoted';
    case 'call':
    case 'text':
      return current === 'new' ? 'needs_review' : current;
    case 'open_crm':
      return current;
    default:
      return current;
  }
}

export function assertActionTransition(from: ActionStatus, to: ActionStatus): void {
  if (!canTransitionAction(from, to)) {
    throw new Error(`Illegal action transition: ${from} -> ${to}`);
  }
}

export function assertConversationTransition(
  from: ConversationStatus,
  to: ConversationStatus,
): void {
  if (!canTransitionConversation(from, to)) {
    throw new Error(`Illegal conversation transition: ${from} -> ${to}`);
  }
}

export function cannotSkipConfirmation(from: ActionStatus, to: ActionStatus): boolean {
  return from === 'draft' && to === 'simulated_success';
}
