import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, proofImageUrl, proofPdfUrl, proofNotes } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
    }

    const proofToken = randomUUID();

    const proof = {
      id: `proof-${Date.now()}`,
      orderId,
      proofToken,
      status: 'PENDING',
      proofImageUrl: proofImageUrl || null,
      proofPdfUrl: proofPdfUrl || null,
      proofNotes: proofNotes || null,
      sentAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({ proof }, { status: 201 });
  } catch (error) {
    console.error('PrintShop proof creation error:', error);
    return NextResponse.json({ error: 'Failed to create proof' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { proofToken, action, customerResponse } = body;

    if (!proofToken || !action) {
      return NextResponse.json({ error: 'proofToken and action are required' }, { status: 400 });
    }

    const validActions = ['APPROVED', 'REJECTED', 'REVISION_REQUESTED'];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: `Invalid action. Must be one of: ${validActions.join(', ')}` },
        { status: 400 },
      );
    }

    return NextResponse.json({
      proof: {
        proofToken,
        status: action,
        customerResponse: customerResponse || null,
        respondedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('PrintShop proof update error:', error);
    return NextResponse.json({ error: 'Failed to update proof' }, { status: 500 });
  }
}
