import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { idToken } = body;

    if (!idToken) {
      return NextResponse.json({ error: 'idToken required' }, { status: 400 });
    }

    // For demo: decode basic info from idToken (normally would verify with Google)
    // In production, verify the token with Google's API
    let email = 'tech@wise2.net';
    try {
      const parts = idToken.split('.');
      if (parts.length === 3) {
        const decoded = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        email = decoded.email || email;
      }
    } catch (e) {
      // Fall back to default email
    }

    const accessToken = Buffer.from(`${email}:google:${Date.now()}`).toString('base64');
    const refreshToken = Buffer.from(`refresh:google:${email}:${Date.now()}`).toString('base64');

    return NextResponse.json({
      accessToken,
      refreshToken,
      user: {
        id: Buffer.from(email).toString('base64').slice(0, 8),
        email,
        firstName: email.split('@')[0],
        lastName: 'Tech',
        role: 'TECHNICIAN',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Google login failed' }, { status: 500 });
  }
}
