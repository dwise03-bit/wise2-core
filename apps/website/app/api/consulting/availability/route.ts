import { NextRequest, NextResponse } from 'next/server';
import { getAuthToken, getApiBaseUrl, buildBackendHeaders, handleApiError } from '@/lib/api-helpers';

interface TimeSlot {
  date: string;
  time: string;
  available: boolean;
}

/**
 * GET /api/consulting/availability
 * Fetch available time slots for a consultant
 * Query params: consultantId, timezone (optional), days (optional)
 * Note: Authentication is optional for public availability viewing
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const consultantId = searchParams.get('consultantId');
    const timezone = searchParams.get('timezone') || 'America/New_York';
    const days = searchParams.get('days') || '14';

    if (!consultantId) {
      return NextResponse.json(
        { error: 'consultantId is required' },
        { status: 400 }
      );
    }

    // Validate days parameter
    const daysNum = parseInt(days);
    if (isNaN(daysNum) || daysNum < 1 || daysNum > 90) {
      return NextResponse.json(
        { error: 'days must be between 1 and 90' },
        { status: 400 }
      );
    }

    // Get auth token if available (optional)
    const token = getAuthToken(request);

    // Call backend API to get availability
    const apiUrl = new URL(`${getApiBaseUrl()}/v1/consulting/availability`);
    apiUrl.searchParams.set('consultantId', consultantId);
    apiUrl.searchParams.set('timezone', timezone);
    apiUrl.searchParams.set('days', daysNum.toString());

    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: buildBackendHeaders(token),
    });

    if (!response.ok) {
      const error = await handleApiError(response);
      console.error('Backend API error:', error);
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Consultant not found' },
          { status: 404 }
        );
      }
      // Return mock data for demo purposes on error
      return NextResponse.json(generateMockTimeSlots());
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching availability:', error);
    // Return mock data on error for demo
    return NextResponse.json(generateMockTimeSlots());
  }
}

/**
 * Generate mock time slots for demo/development
 * Returns 30-minute increments for the next 14 days
 */
function generateMockTimeSlots(): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Generate slots for next 14 days
  for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
    const date = new Date(today);
    date.setDate(date.getDate() + dayOffset);

    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    // Generate 30-min increments from 9 AM to 5 PM
    const dayStr = date.toISOString().split('T')[0];

    for (let hour = 9; hour < 17; hour++) {
      for (let minutes of [0, 30]) {
        const timeStr = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

        // Random availability (80% chance of being available)
        const isAvailable = Math.random() > 0.2;

        slots.push({
          date: dayStr,
          time: timeStr,
          available: isAvailable,
        });
      }
    }
  }

  return slots;
}
