import { NextResponse } from 'next/server';
import { queryQueue } from '@/lib/conversations/queue';
import { createSeedCatalog, SIMULATION_NOW } from '@/lib/seed';
import type { QueueFilter } from '@/lib/types';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const filter = (url.searchParams.get('filter') ?? 'all') as QueueFilter;
  const search = url.searchParams.get('search') ?? '';
  const queue = queryQueue(createSeedCatalog(), filter, search, SIMULATION_NOW);
  return NextResponse.json({
    simulated: true,
    filter,
    search,
    items: queue.map((item) => ({
      id: item.conversation.id,
      rank: item.rank,
      score: item.assessment.score,
      band: item.assessment.band,
      status: item.conversation.status,
      customer: item.customer.name,
      issue: item.conversation.issue,
    })),
  });
}
