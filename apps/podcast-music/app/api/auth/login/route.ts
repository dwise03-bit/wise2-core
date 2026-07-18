import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createJWT } from '@/lib/jwt';
import { loginSchema } from '@/lib/validations';
import {
  successResponse,
  errorResponse,
  verifyPassword,
  ApiError,
} from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      return errorResponse(validationResult.error, 400);
    }

    const { email, password } = validationResult.data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new ApiError(401, 'Invalid email or password', 'AUTH_FAILED');
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid email or password', 'AUTH_FAILED');
    }

    // Generate JWT token
    const token = await createJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Get subscription info
    const subscription = await prisma.subscription.findUnique({
      where: { userId: user.id },
    });

    return successResponse({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
      subscription: subscription
        ? {
            plan: subscription.plan,
            status: subscription.status,
            currentPeriodEnd: subscription.currentPeriodEnd,
          }
        : null,
    });
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse(error);
  }
}
