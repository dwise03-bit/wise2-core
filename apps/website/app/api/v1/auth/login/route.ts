import { NextRequest, NextResponse } from 'next/server';
import * as jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

/**
 * POST /api/v1/auth/login
 * Login with email and password
 *
 * For demo purposes, accepts any email/password combination
 * In production, validate against database
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Email and password are required' },
        },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Password must be at least 8 characters' },
        },
        { status: 400 }
      );
    }

    // For demo: accept any valid email/password
    // In production: query database and validate with bcrypt
    const user = {
      id: `user_${email.replace(/[^a-z0-9]/gi, '_')}`,
      email,
      firstName: email.split('@')[0],
      lastName: 'User',
      createdAt: new Date().toISOString(),
    };

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    const refreshToken = jwt.sign(
      { userId: user.id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          user,
          tokens: { accessToken, refreshToken },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Login failed' },
      },
      { status: 500 }
    );
  }
}
