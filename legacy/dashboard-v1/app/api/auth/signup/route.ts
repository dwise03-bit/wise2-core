import { NextRequest, NextResponse } from 'next/server';
import { createUser, getUser } from '@/lib/db';
import { hashPassword, createToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, password, experience_level, goals } = body;

    // Validate required fields
    if (!email || !name || !password) {
      return NextResponse.json(
        { error: 'Missing required fields: email, name, password' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await getUser(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash the password
    const passwordHash = await hashPassword(password);

    // Parse name into first and last name
    const nameParts = name.trim().split(/\s+/);
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '';

    // Create the user
    const user = await createUser(
      email,
      passwordHash,
      firstName,
      lastName || undefined,
      undefined,
      experience_level,
      goals
    );

    // Create JWT token
    const token = createToken(user.id, user.email);

    // Return success response
    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: `${user.first_name}${user.last_name ? ' ' + user.last_name : ''}`,
          tier: user.tier || 'free',
        },
        token,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
