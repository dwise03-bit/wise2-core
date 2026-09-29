import { NextRequest, NextResponse } from 'next/server';
import { exchangeGoogleIdToken } from '@/lib/wise2-api';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { idToken } = body;

    if (!idToken) {
      return NextResponse.json({ error: 'idToken required' }, { status: 400 });
    }

    const auth = await exchangeGoogleIdToken(idToken);
    return NextResponse.json(auth);
  } catch (error) {
    console.error('Google login proxy error:', error);
    return NextResponse.json({ error: 'Google login failed' }, { status: 502 });
  }
}
