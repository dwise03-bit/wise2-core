import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      );
    }

    // TODO: In production, fetch customer from database and verify password
    // For now, return success response
    return NextResponse.json({
      success: true,
      customer: {
        id: `cust_${Date.now()}`,
        email,
        firstName: 'Customer',
        lastName: 'User',
      },
      token: `token_${Date.now()}`, // In production, create JWT
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
