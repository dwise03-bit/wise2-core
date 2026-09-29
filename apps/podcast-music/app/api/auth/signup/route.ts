import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createJWT } from '@/lib/jwt';
import { signupSchema } from '@/lib/validations';
import {
  successResponse,
  errorResponse,
  hashPassword,
  ApiError,
} from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = signupSchema.safeParse(body);
    if (!validationResult.success) {
      return errorResponse(validationResult.error, 400);
    }

    const { email, name, password } = validationResult.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ApiError(409, 'Email already registered', 'USER_EXISTS');
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        role: 'CUSTOMER',
      },
    });

    // Create subscription record (free tier initially)
    await prisma.subscription.create({
      data: {
        userId: user.id,
        status: 'TRIALING', // Start with trial period
        plan: 'STARTER',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 day trial
      },
    });

    // Generate JWT token
    const token = await createJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return successResponse(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        token,
      },
      201
    );
  } catch (error) {
    console.error('Signup error:', error);
    return errorResponse(error);
  }
}
