import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/leads
 * Submit a demo request or lead form
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const { name, email, phone, message, source } = body;

    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // TODO: Replace with real database save/CRM integration
    // For now, just validate and return success
    console.log('Lead received:', { name, email, phone, message, source, timestamp: new Date() });

    // In production, integrate with:
    // - Database save
    // - CRM (Salesforce, HubSpot, etc.)
    // - Email notification
    // - Webhook to dispatcher

    return NextResponse.json(
      {
        success: true,
        message: 'Demo request received. Our team will contact you shortly.',
        leadId: `lead-${Date.now()}`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Lead submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit lead' },
      { status: 500 }
    );
  }
}
