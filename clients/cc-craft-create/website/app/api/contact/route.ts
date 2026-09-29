import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ success: false, error: 'All fields are required' }, { status: 400 });
    }

    console.log('[CC Contact]', { name, email, subject, message, receivedAt: new Date().toISOString() });

    return NextResponse.json({
      success: true,
      message: 'Message received. CC will respond within 1-2 business days.',
      demo: process.env.NEXT_PUBLIC_DEMO_MODE === 'true',
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to send message' }, { status: 500 });
  }
}
