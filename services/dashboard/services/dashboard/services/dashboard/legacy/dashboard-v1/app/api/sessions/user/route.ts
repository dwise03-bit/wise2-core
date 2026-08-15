import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getStudentBookedSessions } from '@/lib/db';

export async function GET(request: NextRequest) {
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

    // Get student's booked sessions
    const sessions = await getStudentBookedSessions(payload.userId);

    // Format response
    const formattedSessions = sessions.map((session) => ({
      id: session.id,
      date: session.scheduled_time
        ? new Date(session.scheduled_time).toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          })
        : 'N/A',
      time: session.scheduled_time
        ? new Date(session.scheduled_time).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          })
        : 'N/A',
      type: session.type || 'general',
      status: session.status,
      title: session.title,
      description: session.description,
    }));

    return NextResponse.json(formattedSessions, { status: 200 });
  } catch (error) {
    console.error('Error fetching user sessions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
