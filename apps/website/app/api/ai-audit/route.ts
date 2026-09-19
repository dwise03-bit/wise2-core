import { NextRequest, NextResponse } from 'next/server';
import { buildAuditResult, type AuditInput } from '@/lib/ai-audit';

export async function POST(request: NextRequest) {
  try {
    const input = (await request.json()) as AuditInput;

    if (!input.businessName || !input.contactName || !input.email || !input.industry || !input.primaryProblem) {
      return NextResponse.json({ error: 'Complete the required business and contact fields.' }, { status: 400 });
    }

    const result = buildAuditResult(input);
    const prospectResponse = await fetch(new URL('/api/prospects', request.url), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        businessName: input.businessName,
        contactName: input.contactName,
        email: input.email.trim().toLowerCase(),
        website: input.website || undefined,
        industry: input.industry,
        primaryProblem: `${input.primaryProblem}. Priority workflow: ${input.priorityWorkflow || 'Not specified'}`,
        leadSource: 'WEBSITE',
        estimatedOpportunity: 0,
        notes: `Free AI audit snapshot. Team: ${input.teamSize || 'Not specified'}. Revenue: ${input.revenueRange || 'Not specified'}. Tools: ${input.currentTools || 'Not specified'}.`,
        tags: ['ai-audit', 'free-snapshot'],
      }),
    });

    if (!prospectResponse.ok) {
      const errorBody = await prospectResponse.json().catch(() => ({}));
      return NextResponse.json({ error: errorBody.error || 'We could not save your audit. Please try again.' }, { status: 502 });
    }

    return NextResponse.json({ result }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'We could not generate your audit. Please try again.' }, { status: 500 });
  }
}