import { NextResponse } from 'next/server';
import { buildReview, confirmDraft, initialState, openDraft } from '@/lib/store';
import { ACTION_TYPES, type ActionType } from '@/lib/types';

export async function POST(request: Request) {
  const body = (await request.json()) as { conversationId?: string; type?: ActionType; confirm?: boolean };
  if (!body.conversationId || !body.type || !ACTION_TYPES.includes(body.type)) {
    return NextResponse.json({ error: 'conversationId and a valid type are required' }, { status: 400 });
  }
  if (!body.confirm) {
    return NextResponse.json({
      simulated: true,
      status: 'awaiting_confirmation',
      notice: 'Confirmation is required before a simulated action can succeed.',
    });
  }

  let state = initialState();
  const conversation = state.catalog.conversations.find((row) => row.id === body.conversationId);
  const customer = state.catalog.customers.find((row) => row.id === conversation?.customerId);
  if (!conversation || !customer) {
    return NextResponse.json({ error: 'Conversation unavailable' }, { status: 404 });
  }
  const review = buildReview(conversation, customer.name, customer.phone, body.type);
  state = openDraft(state, review, customer.phone);
  state = await confirmDraft(state);
  const updated = state.catalog.conversations.find((row) => row.id === conversation.id);
  return NextResponse.json({
    simulated: true,
    status: updated?.status,
    audit: state.catalog.audit[0],
  });
}
