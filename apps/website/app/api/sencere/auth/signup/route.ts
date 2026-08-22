import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName, phone, company } = body;

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // TODO: In production, save customer to database and hash password
    // For now, return success response
    return NextResponse.json({
      success: true,
      customer: {
        id: `cust_${Date.now()}`,
        email,
        firstName,
        lastName,
        phone: phone || null,
        company: company || null,
      },
      token: `token_${Date.now()}`, // In production, create JWT
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Signup failed' },
      { status: 500 }
    );
  }
}
