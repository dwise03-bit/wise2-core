import { NextRequest, NextResponse } from 'next/server';
import { getAvailableSessionsByDate } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date');
    const type = searchParams.get('type');

    // Validate date parameter
    if (!date) {
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      );
    }

    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    // Get available sessions
    const sessions = await getAvailableSessionsByDate(date, type || undefined);

    // Format response
    const formattedSessions = sessions.map((session) => ({
      id: session.id,
      date: date,
      time: session.scheduled_time
        ? new Date(session.scheduled_time).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          })
        : 'N/A',
      type: session.type || 'general',
      title: session.title,
      student_ids: session.student_ids || [],
      status: 'available',
    }));

    return NextResponse.json(formattedSessions, { status: 200 });
  } catch (error) {
    console.error('Error fetching available sessions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
