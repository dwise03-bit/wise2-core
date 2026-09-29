import { NextRequest, NextResponse } from 'next/server';

/**
 * Dev-only login endpoint for testing authentication flow
 * Creates a mock JWT token and user session for development
 * MUST be disabled in production
 */
export async function POST(req: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Dev login not available in production' },
      { status: 403 }
    );
  }

  const { email = 'dwise03@gmail.com' } = await req.json();

  // Create mock token (in real env, would come from backend)
  const mockToken = `dev_token_${Date.now()}_${Math.random().toString(36).substring(7)}`;

  const mockUser = {
    id: 'dev_user_dwise03',
    email,
    firstName: 'Developer',
    lastName: 'User',
    verified: true,
  };

  return NextResponse.json({
    success: true,
    data: {
      user: mockUser,
      tokens: {
        accessToken: mockToken,
        refreshToken: `dev_refresh_${Date.now()}`,
      },
    },
    message: 'Dev login successful',
  });
}
