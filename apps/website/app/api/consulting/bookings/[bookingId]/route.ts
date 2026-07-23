import { NextRequest, NextResponse } from 'next/server';
import { getAuthToken, getApiBaseUrl, buildBackendHeaders, handleApiError } from '@/lib/api-helpers';

interface BookingConfirmation {
  id: string;
  serviceId: string;
  consultantId: string;
  consultantName: string;
  consultantEmail: string;
  serviceName: string;
  date: string;
  time: string;
  duration: number;
  timezone: string;
  totalPrice: number;
  meetingLink?: string;
  status: string;
  createdAt: string;
}

interface RescheduleRequest {
  date: string;
  time: string;
  timezone?: string;
}

/**
 * GET /api/consulting/bookings/[bookingId]
 * Fetch booking confirmation details
 * Requires authentication
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  try {
    const token = getAuthToken(request);
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const bookingId = params.bookingId;

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    // Call backend API to get booking details
    const apiUrl = `${getApiBaseUrl()}/v1/consulting/bookings/${bookingId}`;

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: buildBackendHeaders(token),
    });

    if (!response.ok) {
      const error = await handleApiError(response);
      console.error('Backend API error:', error);
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Booking not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json(
      { error: 'Failed to fetch booking' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/consulting/bookings/[bookingId]
 * Reschedule a booking
 * Requires authentication
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  try {
    const token = getAuthToken(request);
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const bookingId = params.bookingId;

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    const body: RescheduleRequest = await request.json();

    // Validate required fields
    if (!body.date || !body.time) {
      return NextResponse.json(
        { error: 'Date and time are required' },
        { status: 400 }
      );
    }

    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(body.date)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    // Validate time format (HH:MM)
    if (!/^\d{2}:\d{2}$/.test(body.time)) {
      return NextResponse.json(
        { error: 'Invalid time format. Use HH:MM' },
        { status: 400 }
      );
    }

    const apiUrl = `${getApiBaseUrl()}/v1/consulting/bookings/${bookingId}`;

    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: buildBackendHeaders(token),
      body: JSON.stringify({
        date: body.date,
        time: body.time,
        timezone: body.timezone || 'America/New_York',
      }),
    });

    if (!response.ok) {
      const error = await handleApiError(response);
      console.error('Backend API error:', error);
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Booking not found' },
          { status: 404 }
        );
      }
      if (response.status === 409) {
        return NextResponse.json(
          { error: 'Time slot is no longer available' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error rescheduling booking:', error);
    return NextResponse.json(
      { error: 'Failed to reschedule booking' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/consulting/bookings/[bookingId]
 * Cancel a booking
 * Requires authentication
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  try {
    const token = getAuthToken(request);
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const bookingId = params.bookingId;

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const reason = searchParams.get('reason') || 'user_cancelled';

    const apiUrl = `${getApiBaseUrl()}/v1/consulting/bookings/${bookingId}`;

    const response = await fetch(apiUrl, {
      method: 'DELETE',
      headers: buildBackendHeaders(token),
      body: JSON.stringify({
        reason,
      }),
    });

    if (!response.ok) {
      const error = await handleApiError(response);
      console.error('Backend API error:', error);
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Booking not found' },
          { status: 404 }
        );
      }
      if (response.status === 410) {
        return NextResponse.json(
          { error: 'Booking has already been completed or cancelled' },
          { status: 410 }
        );
      }
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Booking cancelled successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return NextResponse.json(
      { error: 'Failed to cancel booking' },
      { status: 500 }
    );
  }
}

/**
 * Generate mock booking confirmation for demo/development
 */
function generateMockBookingConfirmation(bookingId: string): BookingConfirmation {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 3);
  const dateStr = tomorrow.toISOString().split('T')[0];

  const consultants = [
    {
      name: 'Sarah Chen',
      email: 'sarah.chen@wise2.net',
    },
    {
      name: 'Marcus Rodriguez',
      email: 'marcus.rodriguez@wise2.net',
    },
    {
      name: 'Elena Volkov',
      email: 'elena.volkov@wise2.net',
    },
  ];

  const services = [
    { name: 'Brand Strategy Consultation' },
    { name: 'AI Implementation Guidance' },
    { name: 'Marketing Automation Setup' },
    { name: 'Business Operations Review' },
  ];

  const consultant = consultants[Math.floor(Math.random() * consultants.length)];
  const service = services[Math.floor(Math.random() * services.length)];
  const duration = 1.5;
  const hourlyRate = 150;

  return {
    id: bookingId,
    serviceId: `svc-${Math.random().toString(36).substr(2, 9)}`,
    consultantId: `con-${Math.random().toString(36).substr(2, 9)}`,
    consultantName: consultant.name,
    consultantEmail: consultant.email,
    serviceName: service.name,
    date: dateStr,
    time: '14:00',
    duration: duration,
    timezone: 'America/New_York',
    totalPrice: duration * hourlyRate,
    meetingLink: `https://meet.wise2.net/${bookingId}`,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  };
}
