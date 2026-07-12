import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getSession, bookSession } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Extract and verify auth token
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized: No token provided' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid token' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { sessionId } = body;

    // Validate sessionId
    if (!sessionId || typeof sessionId !== 'number') {
      return NextResponse.json(
        { error: 'Invalid sessionId' },
        { status: 400 }
      );
    }

    // Verify session exists
    const session = await getSession(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Check if student is already booked
    if (session.student_ids && session.student_ids.includes(payload.userId)) {
      return NextResponse.json(
        { error: 'Already booked for this session' },
        { status: 400 }
      );
    }

    // Book the session
    const bookedSession = await bookSession(sessionId, payload.userId);

    return NextResponse.json(
      {
        success: true,
        message: 'Session booked successfully!',
        session: {
          id: bookedSession.id,
          title: bookedSession.title,
          time: bookedSession.scheduled_time,
          type: bookedSession.type,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Booking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
