import { NextRequest, NextResponse } from 'next/server';
import { leadProvider, type QuoteRequest } from '@/lib/sencere/lead-provider';

export async function POST(req: NextRequest) {
  const body = (await req.json()) as QuoteRequest;

  if (!body?.customer?.email || !body?.customer?.name) {
    return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 });
  }

  const result = await leadProvider.submitQuote(body);
  return NextResponse.json(result, { status: 201 });
}
