import { NextRequest, NextResponse } from 'next/server';
import { buildProspectPayload, type IntakeSubmission } from '@/lib/wise-imp/intake-mapping';

// Same base URL + real backend endpoint used by the working
// apps/website/app/api/prospects/route.ts proxy — calling packages/api's
// POST /v1/prospects directly (not the client-side /api/v1/prospects path
// used by app/contact/page.tsx, which doesn't resolve to any route in this
// app and would 404; that's a pre-existing bug out of scope here).
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function POST(request: NextRequest) {
  let body: IntakeSubmission;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const result = buildProspectPayload(body);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  try {
    const response = await fetch(`${API_BASE_URL}/v1/prospects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(15_000),
      body: JSON.stringify(result.payload),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      console.error('Wise Imp intake: prospects API error:', errorBody);
      return NextResponse.json(
        { error: errorBody.message || 'Failed to submit intake' },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, prospectId: data?.id ?? null }, { status: 201 });
  } catch (error) {
    console.error('Wise Imp intake route error:', error);
    return NextResponse.json({ error: 'Failed to reach the WISE² backend' }, { status: 502 });
  }
}
