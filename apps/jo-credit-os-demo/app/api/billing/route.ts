import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch subscription from backend
    const response = await fetch(`${API_BASE_URL}/v1/subscriptions/${userId}`, {
      headers: {
        'Authorization': `Bearer ${request.headers.get('authorization')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch subscription');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Billing API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch billing data' },
      { status: 500 }
    );
  }
}
