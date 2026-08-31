import { assessConversation, compareQueueItems, isClosedStatus } from '../priority/score.ts';
import type {
  CommandMetrics,
  Conversation,
  ConversationDetail,
  Customer,
  Equipment,
  Location,
  Opportunity,
  QueueFilter,
  QueueItem,
  RecommendedAction,
  ServiceEvent,
  ActionAttempt,
  AuditEvent,
} from '../types.ts';
import { recommendAction } from '../recommend.ts';

export type Catalog = {
  conversations: Conversation[];
  customers: Customer[];
  locations: Location[];
  equipment: Equipment[];
  serviceEvents: ServiceEvent[];
  opportunities: Opportunity[];
  actions: ActionAttempt[];
  audit: AuditEvent[];
};

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function digits(value: string): string {
  return value.replace(/\D/g, '');
}

export function matchesSearch(
  item: Pick<QueueItem, 'conversation' | 'customer' | 'location' | 'equipment'>,
  query: string,
): boolean {
  const q = normalize(query);
  if (!q) return true;
  const haystacks = [
    item.customer.name,
    item.customer.phone,
    item.customer.email ?? '',
    item.location?.address ?? '',
    item.conversation.issue,
    item.equipment?.category ?? '',
    item.equipment?.manufacturer ?? '',
    item.equipment?.model ?? '',
  ];
  if (haystacks.some((field) => normalize(field).includes(q))) return true;
  const qDigits = digits(q);
  return qDigits.length >= 3 && digits(item.customer.phone).includes(qDigits);
}

export function matchesFilter(item: QueueItem, filter: QueueFilter): boolean {
  const { status } = item.conversation;
  switch (filter) {
    case 'all':
      return true;
    case 'emergency':
      return item.assessment.band === 'critical' && !isClosedStatus(status) && status !== 'scheduled';
    case 'needs_action':
      return (
        (status === 'new' || status === 'needs_review' || status === 'callback_due') &&
        !isClosedStatus(status)
      );
    case 'scheduled':
      return status === 'scheduled' || status === 'dispatched';
    case 'completed':
      return status === 'completed' || status === 'deferred';
    default:
      return true;
  }
}

export function buildQueueItem(
  conversation: Conversation,
  catalog: Catalog,
  evaluatedAt?: string,
): QueueItem {
  const customer = catalog.customers.find((row) => row.id === conversation.customerId);
  if (!customer) {
    throw new Error(`Missing customer ${conversation.customerId}`);
  }
  const location = catalog.locations.find((row) => row.customerId === conversation.customerId) ?? null;
  const equipment = location
    ? catalog.equipment.find((row) => row.locationId === location.id) ?? null
    : null;
  const opportunity = catalog.opportunities.find((row) => row.conversationId === conversation.id) ?? null;
  const assessment = assessConversation(conversation, evaluatedAt);
  const recommended = recommendAction(conversation, assessment, opportunity);
  return {
    conversation,
    customer,
    location,
    equipment,
    opportunity,
    assessment,
    recommended,
    rank: 0,
  };
}

export function rankQueue(items: QueueItem[]): QueueItem[] {
  return [...items].sort(compareQueueItems).map((item, index) => ({ ...item, rank: index + 1 }));
}

export function queryQueue(
  catalog: Catalog,
  filter: QueueFilter,
  search: string,
  evaluatedAt?: string,
): QueueItem[] {
  const items = catalog.conversations.map((conversation) =>
    buildQueueItem(conversation, catalog, evaluatedAt),
  );
  return rankQueue(items.filter((item) => matchesFilter(item, filter) && matchesSearch(item, search)));
}

export function buildDetail(conversationId: string, catalog: Catalog): ConversationDetail | null {
  const conversation = catalog.conversations.find((row) => row.id === conversationId);
  if (!conversation) return null;
  const item = buildQueueItem(conversation, catalog);
  return {
    ...item,
    serviceHistory: catalog.serviceEvents
      .filter((event) => event.customerId === conversation.customerId)
      .sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt)),
    actions: catalog.actions
      .filter((action) => action.conversationId === conversationId)
      .sort((a, b) => Date.parse(b.requestedAt) - Date.parse(a.requestedAt)),
    audit: catalog.audit
      .filter((event) => event.objectId === conversationId || event.metadata.conversationId === conversationId)
      .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp)),
  };
}

export function commandMetrics(items: QueueItem[]): CommandMetrics {
  const open = items.filter((item) => !isClosedStatus(item.conversation.status));
  return {
    urgentItems: open.filter((item) => item.assessment.band === 'critical').length,
    unbookedOpportunities: open.filter(
      (item) =>
        item.opportunity &&
        item.conversation.status !== 'scheduled' &&
        item.conversation.status !== 'dispatched' &&
        item.conversation.status !== 'quoted',
    ).length,
    callbacksDue: open.filter((item) => item.conversation.status === 'callback_due').length,
    scheduledValueCents: items
      .filter((item) => item.conversation.status === 'scheduled' || item.conversation.status === 'dispatched')
      .reduce((sum, item) => sum + (item.opportunity?.highEstimate ?? 0), 0),
  };
}

export function emptyQueueMessage(filter: QueueFilter, search: string): string {
  if (search.trim()) {
    return `No conversations match “${search.trim()}”. Try a customer name, phone, address, issue, or equipment.`;
  }
  switch (filter) {
    case 'emergency':
      return 'No critical emergencies are waiting. Remaining items are below the critical band.';
    case 'needs_action':
      return 'No conversations currently need dispatcher action.';
    case 'scheduled':
      return 'No scheduled or dispatched jobs in this queue.';
    case 'completed':
      return 'No completed or deferred conversations yet.';
    default:
      return 'The simulated inbox is empty.';
  }
}

export type { RecommendedAction };
