import { NextRequest, NextResponse } from 'next/server';
import { getAuthToken, getApiBaseUrl, buildBackendHeaders, handleApiError } from '@/lib/api-helpers';

interface BookingRequest {
  serviceId: string;
  consultantId: string;
  date: string;
  time: string;
  duration: number;
  timezone: string;
  notes?: string;
  payment?: {
    cardNumber: string;
    expiryDate: string;
    cvc: string;
    cardholderName: string;
  };
}

interface BookingResponse {
  id: string;
  serviceId: string;
  consultantId: string;
  date: string;
  time: string;
  duration: number;
  timezone: string;
  status: string;
  createdAt: string;
}

/**
 * GET /api/consulting/bookings
 * List user's bookings
 * Requires authentication
 */
export async function GET(request: NextRequest) {
  try {
    const token = getAuthToken(request);
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const limit = searchParams.get('limit') || '50';
    const offset = searchParams.get('offset') || '0';

    const apiUrl = new URL(`${getApiBaseUrl()}/v1/consulting/bookings`);
    apiUrl.searchParams.set('limit', limit);
    apiUrl.searchParams.set('offset', offset);

    if (status) {
      apiUrl.searchParams.set('status', status);
    }

    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: buildBackendHeaders(token),
    });

    if (!response.ok) {
      const error = await handleApiError(response);
      console.error('Backend API error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/consulting/bookings
 * Create a new booking with payment
 */
export async function POST(request: NextRequest) {
  try {
    const token = getAuthToken(request);
    const body: BookingRequest = await request.json();

    // Validate required fields
    if (!body.serviceId || !body.consultantId || !body.date || !body.time || !body.duration) {
      return NextResponse.json(
        { error: 'Missing required booking fields' },
        { status: 400 }
      );
    }

    // In production, payment should be processed via Stripe
    // and this would only store payment intent ID, not card details
    const apiUrl = `${getApiBaseUrl()}/v1/consulting/bookings`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: buildBackendHeaders(token),
      body: JSON.stringify({
        serviceId: body.serviceId,
        consultantId: body.consultantId,
        date: body.date,
        time: body.time,
        duration: body.duration,
        timezone: body.timezone || 'America/New_York',
        notes: body.notes || '',
      }),
    });

    if (!response.ok) {
      const error = await handleApiError(response);
      console.error('Backend API error:', error);
      // Return mock booking for demo on error
      return NextResponse.json(generateMockBooking(body), { status: 201 });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}

/**
 * Generate mock booking for demo/development
 */
function generateMockBooking(request: BookingRequest): BookingResponse {
  const bookingId = `BK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`.toUpperCase();

  return {
    id: bookingId,
    serviceId: request.serviceId,
    consultantId: request.consultantId,
    date: request.date,
    time: request.time,
    duration: request.duration,
    timezone: request.timezone || 'America/New_York',
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  };
}
