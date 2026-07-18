import { NextRequest, NextResponse } from 'next/server';
import { notifyFormSubmission } from '@/lib/discord';

/**
 * POST /api/webhooks/discord
 * Handle incoming webhooks and send Discord notifications
 * Currently handles form submissions
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    if (!type || !data) {
      return NextResponse.json(
        { error: 'Missing type or data' },
        { status: 400 }
      );
    }

    let success = false;

    switch (type) {
      case 'form_submission':
        success = await notifyFormSubmission({
          name: data.name || 'Unknown',
          email: data.email,
          subject: data.subject || 'No subject',
          message: data.message || 'No message',
          type: data.formType || 'contact',
        });
        break;

      default:
        return NextResponse.json(
          { error: `Unknown webhook type: ${type}` },
          { status: 400 }
        );
    }

    if (!success) {
      return NextResponse.json(
        { warning: 'Discord notification could not be sent' },
        { status: 206 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
    });
  } catch (error) {
    console.error('Discord webhook error:', error);
    const message = error instanceof Error ? error.message : 'Webhook processing failed';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/webhooks/discord
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'discord-webhook',
    timestamp: new Date().toISOString(),
  });
}
