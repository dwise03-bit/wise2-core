import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    // Mock authentication - accept any email/password combo for demo
    const accessToken = Buffer.from(`${email}:${Date.now()}`).toString('base64');
    const refreshToken = Buffer.from(`refresh:${email}:${Date.now()}`).toString('base64');

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
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
