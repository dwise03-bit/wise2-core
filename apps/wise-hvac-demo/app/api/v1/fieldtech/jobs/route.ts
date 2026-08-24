import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  // Return empty jobs list by default
  return NextResponse.json([]);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const job = {
      id: Buffer.from(Date.now().toString()).toString('base64').slice(0, 12),
      customerName: body.customerName || 'New Customer',
      address: body.address || 'No address',
      appointmentAt: body.appointmentAt || new Date().toISOString(),
      complaint: body.complaint || 'HVAC service',
      status: 'DISPATCHED' as const,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
  }
}
