import { NextRequest, NextResponse } from 'next/server';
import { notifyFormSubmission } from '@/lib/discord';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  type?: 'contact' | 'inquiry' | 'support';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message, type = 'contact' } =
      body as ContactFormData;

    // Validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Validate message length
    if (message.length > 5000) {
      return NextResponse.json(
        { error: 'Message is too long (max 5000 characters)' },
        { status: 400 }
      );
    }

    // Send Discord notification (don't wait for response)
    notifyFormSubmission({
      name,
      email,
      subject,
      message,
      type,
    }).catch((err) => console.error('Failed to notify Discord:', err));

    return NextResponse.json(
      {
        success: true,
        message: 'Thank you! We received your message and will get back to you soon.',
        submittedAt: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Contact form submission error:', error);
    return NextResponse.json(
      {
        error: 'Failed to submit form',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
