import { auditFromAction, createAuditEvent } from './audit/events.ts';
import {
  assertActionTransition,
  assertConversationTransition,
  cannotSkipConfirmation,
  conversationStatusAfterAction,
} from './actions/transitions.ts';
import type { Catalog } from './conversations/queue.ts';
import { simulatedPorts } from './integrations/simulated.ts';
import { ACTION_LABELS } from './recommend.ts';
import { createSeedCatalog, SIMULATION_NOW, TECHNICIANS } from './seed.ts';
import type {
  ActionAttempt,
  ActionReview,
  ActionType,
  Conversation,
  ConversationStatus,
  QueueFilter,
} from './types.ts';

export type DispatchState = {
  catalog: Catalog;
  selectedId: string | null;
  filter: QueueFilter;
  search: string;
  review: ActionReview | null;
  draft: ActionAttempt | null;
  clock: string;
  error: string | null;
  audioPlaying: boolean;
  audioProgress: number;
};

export function initialState(): DispatchState {
  const catalog = createSeedCatalog();
  return {
    catalog,
    selectedId: null,
    filter: 'all',
    search: '',
    review: null,
    draft: null,
    clock: SIMULATION_NOW,
    error: null,
    audioPlaying: false,
    audioProgress: 0,
  };
}

export function buildReview(
  conversation: Conversation,
  customerName: string,
  destination: string,
  type: ActionType,
): ActionReview {
  return {
    conversationId: conversation.id,
    type,
    customerName,
    destination,
    proposedAction: ACTION_LABELS[type],
    details: reviewDetails(type, conversation),
    simulationNotice:
      'This records a simulated result only. No live call, text, booking, dispatch, quote, or CRM write will occur.',
  };
}

function reviewDetails(type: ActionType, conversation: Conversation): string {
  switch (type) {
    case 'dispatch':
      return `Assign the first available technician to ${conversation.issue}. Human escalation stays required for safety language.`;
    case 'book':
      return `Create a simulated same-day booking for ${conversation.issue}.`;
    case 'quote':
      return `Prepare a simulated estimate for ${conversation.issue}.`;
    case 'call':
      return `Place a simulated callback about ${conversation.issue}.`;
    case 'text':
      return `Send a simulated SMS about ${conversation.issue}.`;
    case 'open_crm':
      return `Open the simulated customer record for ${conversation.issue}.`;
    default:
      return conversation.issue;
  }
}

export async function confirmDraft(state: DispatchState): Promise<DispatchState> {
  const draft = state.draft;
  if (!draft || !state.review) {
    return { ...state, error: 'No action is waiting for confirmation.' };
  }
  if (cannotSkipConfirmation(draft.status, 'simulated_success')) {
    return { ...state, error: 'Confirmation is required before a simulated action can succeed.' };
  }

  assertActionTransition(draft.status, 'simulated_success');

  const conversation = state.catalog.conversations.find((row) => row.id === draft.conversationId);
  if (!conversation) {
    return { ...state, error: 'Conversation is unavailable.' };
  }

  const result = await executeSimulated(draft);
  const confirmedAt = incrementClock(state.clock, 8);
  if (!result.ok) {
    const failed: ActionAttempt = { ...draft, status: 'failed', result: result.error };
    return {
      ...state,
      draft: { ...failed, status: 'awaiting_confirmation' },
      catalog: replaceAction(state.catalog, failed),
      error: result.error,
      clock: confirmedAt,
    };
  }

  const nextStatus = conversationStatusAfterAction(draft.type, conversation.status);
  assertConversationTransition(conversation.status, nextStatus);

  const succeeded: ActionAttempt = {
    ...draft,
    status: 'simulated_success',
    confirmedAt,
    result: result.message,
  };
  const catalog = replaceAction(state.catalog, succeeded);
  catalog.conversations = catalog.conversations.map((row) =>
    row.id === conversation.id ? { ...row, status: nextStatus } : row,
  );
  catalog.audit = [
    auditFromAction(succeeded),
    createAuditEvent({
      action: 'conversation.status',
      objectType: 'conversation',
      objectId: conversation.id,
      timestamp: confirmedAt,
      metadata: { from: conversation.status, to: nextStatus, simulated: 'true' },
    }),
    ...catalog.audit,
  ];

  return {
    ...state,
    catalog,
    draft: null,
    review: null,
    clock: confirmedAt,
    error: null,
    selectedId: conversation.id,
  };
}

export function cancelDraft(state: DispatchState): DispatchState {
  if (!state.draft) return { ...state, review: null };
  const canceled: ActionAttempt = { ...state.draft, status: 'canceled', result: 'Canceled by dispatcher' };
  return {
    ...state,
    catalog: replaceAction(state.catalog, canceled),
    draft: null,
    review: null,
    error: null,
  };
}

export function openDraft(
  state: DispatchState,
  review: ActionReview,
  destination: string,
): DispatchState {
  const requestedAt = incrementClock(state.clock, 2);
  const draft: ActionAttempt = {
    id: `act-${review.type}-${review.conversationId}-${requestedAt}`,
    conversationId: review.conversationId,
    type: review.type,
    status: 'awaiting_confirmation',
    requestedAt,
    confirmedAt: null,
    result: null,
    destination,
    details: review.details,
  };
  return {
    ...state,
    review,
    draft,
    clock: requestedAt,
    error: null,
    catalog: {
      ...state.catalog,
      actions: [draft, ...state.catalog.actions.filter((row) => row.id !== draft.id)],
    },
  };
}

export function setConversationStatus(
  state: DispatchState,
  conversationId: string,
  status: ConversationStatus,
): DispatchState {
  const current = state.catalog.conversations.find((row) => row.id === conversationId);
  if (!current) return state;
  assertConversationTransition(current.status, status);
  const timestamp = incrementClock(state.clock, 3);
  return {
    ...state,
    clock: timestamp,
    catalog: {
      ...state.catalog,
      conversations: state.catalog.conversations.map((row) =>
        row.id === conversationId ? { ...row, status } : row,
      ),
      audit: [
        createAuditEvent({
          action: 'conversation.status',
          objectType: 'conversation',
          objectId: conversationId,
          timestamp,
          metadata: { from: current.status, to: status, simulated: 'true' },
        }),
        ...state.catalog.audit,
      ],
    },
  };
}

async function executeSimulated(draft: ActionAttempt): Promise<{ ok: true; message: string } | { ok: false; error: string }> {
  switch (draft.type) {
    case 'call': {
      const result = await simulatedPorts.phone.placeCallback({
        conversationId: draft.conversationId,
        to: draft.destination,
        purpose: draft.details,
      });
      return result.ok
        ? { ok: true, message: `SIMULATED callback queued (${result.data.callId})` }
        : { ok: false, error: result.error };
    }
    case 'text': {
      const prepared = await simulatedPorts.messaging.prepareMessage({
        conversationId: draft.conversationId,
        to: draft.destination,
        body: draft.details,
      });
      if (!prepared.ok) return { ok: false, error: prepared.error };
      const sent = await simulatedPorts.messaging.sendMessage(prepared.data.draftId);
      return sent.ok
        ? { ok: true, message: `SIMULATED message sent (${sent.data.messageId})` }
        : { ok: false, error: sent.error };
    }
    case 'book': {
      const booking = await simulatedPorts.scheduler.createBooking({
        conversationId: draft.conversationId,
        slot: '2026-08-30T20:00:00.000Z',
        customerId: draft.conversationId,
      });
      return booking.ok
        ? { ok: true, message: `SIMULATED booking ${booking.data.bookingId}` }
        : { ok: false, error: booking.error };
    }
    case 'dispatch': {
      const tech = TECHNICIANS.find((row) => row.availableToday);
      const assignment = await simulatedPorts.dispatch.createAssignment({
        conversationId: draft.conversationId,
        technicianId: tech?.id ?? '',
      });
      return assignment.ok
        ? { ok: true, message: `SIMULATED dispatch ${assignment.data.assignmentId} to ${tech?.name ?? 'unavailable'}` }
        : { ok: false, error: assignment.error };
    }
    case 'quote': {
      const prepared = await simulatedPorts.estimate.prepareEstimate({
        conversationId: draft.conversationId,
        lowEstimate: 0,
        highEstimate: 0,
      });
      if (!prepared.ok) return { ok: false, error: prepared.error };
      const created = await simulatedPorts.estimate.createEstimate(prepared.data.estimateId);
      return created.ok
        ? { ok: true, message: `SIMULATED estimate ${created.data.estimateId}` }
        : { ok: false, error: created.error };
    }
    case 'open_crm': {
      const record = await simulatedPorts.crm.getCustomer(draft.conversationId);
      return record.ok
        ? { ok: true, message: `SIMULATED CRM record ${record.data.recordUrl}` }
        : { ok: false, error: record.error };
    }
    default:
      return { ok: false, error: 'Unknown action type.' };
  }
}

function replaceAction(catalog: Catalog, attempt: ActionAttempt): Catalog {
  const exists = catalog.actions.some((row) => row.id === attempt.id);
  return {
    ...catalog,
    actions: exists
      ? catalog.actions.map((row) => (row.id === attempt.id ? attempt : row))
      : [attempt, ...catalog.actions],
  };
}

function incrementClock(clock: string, seconds: number): string {
  return new Date(Date.parse(clock) + seconds * 1000).toISOString();
}
