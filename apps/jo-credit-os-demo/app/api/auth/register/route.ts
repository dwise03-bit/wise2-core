import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Simple in-memory user store (in production, use a database)
// Note: This is a demo. In production, use Prisma with proper database

interface User {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

// In-memory store for demo (persists during server runtime)
const users: Map<string, User> = new Map();

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = Array.from(users.values()).find(u => u.email === email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Create user
    const userId = crypto.randomBytes(16).toString('hex');
    const user: User = {
      id: userId,
      email,
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString(),
    };

    users.set(userId, user);

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: name || 'User',
          createdAt: user.createdAt,
        },
        message: 'Account created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to create account', details: String(error) },
      { status: 500 }
    );
  }
}

// Login endpoint
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      );
    }

    const user = Array.from(users.values()).find(u => u.email === email);
    if (!user || user.passwordHash !== hashPassword(password)) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate session token (in production, use JWT)
    const token = crypto.randomBytes(32).toString('hex');

    return NextResponse.json(
      {
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          createdAt: user.createdAt,
        },
        message: 'Login successful',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed', details: String(error) },
      { status: 500 }
    );
  }
}

// Get users list (debug endpoint - remove in production)
export async function GET() {
  return NextResponse.json({
    totalUsers: users.size,
    users: Array.from(users.values()).map(u => ({
      id: u.id,
      email: u.email,
      createdAt: u.createdAt,
    })),
  });
}
