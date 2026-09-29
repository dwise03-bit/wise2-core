import { NextResponse } from 'next/server';
import { buildDetail } from '@/lib/conversations/queue';
import { createSeedCatalog } from '@/lib/seed';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const detail = buildDetail(params.id, createSeedCatalog());
  if (!detail) {
    return NextResponse.json({ simulated: true, error: 'Conversation unavailable' }, { status: 404 });
  }
  return NextResponse.json({
    simulated: true,
    conversation: {
      id: detail.conversation.id,
      status: detail.conversation.status,
      issue: detail.conversation.issue,
      statement: detail.conversation.customerStatement,
      customer: detail.customer.name,
      score: detail.assessment.score,
      factors: detail.assessment.factors,
      recommended: detail.recommended,
    },
  });
}
