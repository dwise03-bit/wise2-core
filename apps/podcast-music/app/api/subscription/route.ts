import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  createSubscriptionSchema,
  cancelSubscriptionSchema,
} from '@/lib/validations';
import {
  successResponse,
  errorResponse,
  extractUserFromHeaders,
  ApiError,
} from '@/lib/utils';
import {
  createStripeCustomer,
  createSubscription,
  cancelSubscription,
  STRIPE_CONFIG,
} from '@/lib/stripe';

export async function GET(request: NextRequest) {
  try {
    const user = extractUserFromHeaders(request.headers);

    // Get subscription
    const subscription = await prisma.subscription.findUnique({
      where: { userId: user.userId },
    });

    if (!subscription) {
      throw new ApiError(
        404,
        'No subscription found',
        'SUBSCRIPTION_NOT_FOUND'
      );
    }

    return successResponse(subscription);
  } catch (error) {
    console.error('Get subscription error:', error);
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = extractUserFromHeaders(request.headers);
    const body = await request.json();

    // Validate input
    const validationResult = createSubscriptionSchema.safeParse(body);
    if (!validationResult.success) {
      return errorResponse(validationResult.error, 400);
    }

    const { priceId } = validationResult.data;

    // Get existing subscription
    const existingSubscription = await prisma.subscription.findUnique({
      where: { userId: user.userId },
    });

    if (!existingSubscription) {
      throw new ApiError(
        404,
        'No subscription record found',
        'NO_SUBSCRIPTION'
      );
    }

    // Check if customer already exists in Stripe
    if (!existingSubscription.stripeCustomerId) {
      // Create Stripe customer
      const stripeCustomer = await createStripeCustomer(
        user.email
      );

      // Update subscription with customer ID
      await prisma.subscription.update({
        where: { userId: user.userId },
        data: {
          stripeCustomerId: stripeCustomer.id,
        },
      });

      existingSubscription.stripeCustomerId = stripeCustomer.id;
    }

    // Create subscription in Stripe
    const priceToUse = priceId || STRIPE_CONFIG.PRICE_ID_MONTHLY;
    if (!priceToUse) {
      throw new ApiError(
        500,
        'Stripe price ID not configured',
        'STRIPE_CONFIG_ERROR'
      );
    }

    const stripeSubscription = await createSubscription(
      existingSubscription.stripeCustomerId,
      priceToUse
    );

    // Update subscription status in database
    const plan = priceToUse === STRIPE_CONFIG.PRICE_ID_MONTHLY ? 'PRO' : 'STARTER';
    const status =
      stripeSubscription.status === 'active'
        ? 'ACTIVE'
        : stripeSubscription.status === 'trialing'
          ? 'TRIALING'
          : 'ACTIVE';

    const updatedSubscription = await prisma.subscription.update({
      where: { userId: user.userId },
      data: {
        stripeSubscriptionId: stripeSubscription.id,
        status: status as 'ACTIVE' | 'TRIALING' | 'CANCELED' | 'PAST_DUE',
        plan,
        currentPeriodStart: new Date(
          stripeSubscription.current_period_start * 1000
        ),
        currentPeriodEnd: new Date(
          stripeSubscription.current_period_end * 1000
        ),
      },
    });

    return successResponse(
      {
        subscription: updatedSubscription,
        message: 'Subscription created successfully',
      },
      201
    );
  } catch (error) {
    console.error('Create subscription error:', error);
    return errorResponse(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = extractUserFromHeaders(request.headers);
    const body = await request.json();

    // Validate input
    const validationResult = cancelSubscriptionSchema.safeParse(body);
    if (!validationResult.success) {
      return errorResponse(validationResult.error, 400);
    }

    // Get subscription
    const subscription = await prisma.subscription.findUnique({
      where: { userId: user.userId },
    });

    if (!subscription) {
      throw new ApiError(
        404,
        'No subscription found',
        'SUBSCRIPTION_NOT_FOUND'
      );
    }

    if (!subscription.stripeSubscriptionId) {
      throw new ApiError(
        400,
        'No active Stripe subscription to cancel',
        'NO_STRIPE_SUBSCRIPTION'
      );
    }

    // Cancel subscription in Stripe
    await cancelSubscription(subscription.stripeSubscriptionId);

    // Update subscription status in database
    const updatedSubscription = await prisma.subscription.update({
      where: { userId: user.userId },
      data: {
        status: 'CANCELED',
        canceledAt: new Date(),
      },
    });

    return successResponse({
      subscription: updatedSubscription,
      message: 'Subscription cancelled successfully',
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    return errorResponse(error);
  }
}
