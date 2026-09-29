import { NextRequest, NextResponse } from 'next/server';

const WISE_DEFENSE_API_URL = process.env.WISE_DEFENSE_API_URL || 'http://localhost:3014';
const WISE_DEFENSE_API_KEY = process.env.WISE_DEFENSE_API_KEY || '';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(`${WISE_DEFENSE_API_URL}/api/sdr/spectrum`);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'X-API-Key': WISE_DEFENSE_API_KEY,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Upstream API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Spectrum API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch spectrum data' },
      { status: 500 }
    );
  }
}
