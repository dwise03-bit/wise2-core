import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.businessName) {
      return NextResponse.json({ error: 'Business name is required' }, { status: 400 });
    }

    const response = await fetch(`${API_BASE_URL}/v1/digital-twins/intake`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json({ error: data.message || data.error || 'Failed to submit intake' }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Digital Twin intake error:', error);
    return NextResponse.json({ error: 'Failed to submit Digital Twin intake' }, { status: 500 });
  }
}
