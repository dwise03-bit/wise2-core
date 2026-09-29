import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { GoogleCalendarIntegrationService } from './google-calendar-integration.service';
import { BookingDetails } from '../lib/google-calendar.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

/**
 * Example Controller: Google Calendar Bookings
 *
 * This controller demonstrates how to integrate Google Calendar
 * into your booking/consultation flow.
 *
 * Features:
 * - Create consultation bookings with automatic Google Meet links
 * - Reschedule existing bookings
 * - Cancel bookings
 * - Manage Google Calendar OAuth connection
 * - Check connection status
 *
 * To use this in your app:
 * 1. Import GoogleCalendarModule in your AppModule
 * 2. Inject GoogleCalendarIntegrationService into your controller
 * 3. Use the example methods below as templates
 *
 * NOTE: This is an example - adapt to your actual data models
 */

interface CreateBookingRequest {
  consultantEmail: string;
  title: string;
  description?: string;
  startTime: string; // ISO 8601 date string
  endTime: string; // ISO 8601 date string
  timezone?: string;
  reminderMinutes?: number[];
}

interface RescheduleBookingRequest {
  startTime?: string;
  endTime?: string;
  title?: string;
  description?: string;
}

interface GoogleAuthCallbackRequest {
  code: string;
  state?: string;
}

@Controller('api/v1/bookings')
@UseGuards(JwtAuthGuard)
export class GoogleCalendarExampleController {
  constructor(
    private readonly googleCalendar: GoogleCalendarIntegrationService
  ) {}

  /**
   * Create a new consultation booking
   *
   * POST /api/v1/bookings
   *
   * Example request:
   * {
   *   "consultantEmail": "consultant@example.com",
   *   "title": "Strategy Consultation",
   *   "description": "Initial discovery call",
   *   "startTime": "2024-08-15T14:00:00Z",
   *   "endTime": "2024-08-15T15:00:00Z",
   *   "timezone": "America/New_York",
   *   "reminderMinutes": [15, 60]
   * }
   *
   * Response:
   * {
   *   "success": true,
   *   "eventId": "event-id-123",
   *   "meetingLink": "https://meet.google.com/abc-defg-hij",
   *   "calendarLink": "https://calendar.google.com/calendar/event?eid=...",
   *   "startTime": "2024-08-15T14:00:00Z",
   *   "endTime": "2024-08-15T15:00:00Z"
   * }
   */
  @Post()
  async createBooking(
    @Request() req: any,
    @Body() bookingRequest: CreateBookingRequest
  ) {
    const userId = req.user.id; // From JWT token

    // Validate input
    if (!bookingRequest.consultantEmail) {
      throw new Error('Consultant email is required');
    }

    // Build booking details
    const bookingDetails: BookingDetails = {
      title: bookingRequest.title,
      description: bookingRequest.description,
      startTime: new Date(bookingRequest.startTime),
      endTime: new Date(bookingRequest.endTime),
      timezone: bookingRequest.timezone || 'UTC',
      reminderMinutes: bookingRequest.reminderMinutes || [15, 60],
      conferenceType: 'googleMeet',
    };

    try {
      // Create the booking
      const result = await this.googleCalendar.createBooking(
        userId,
        bookingRequest.consultantEmail,
        bookingDetails
      );

      return {
        success: true,
        data: {
          eventId: result.eventId,
          meetingLink: result.meetingLink,
          calendarLink: result.calendarLink,
          startTime: result.startTime,
          endTime: result.endTime,
        },
        message: 'Booking created successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Reschedule an existing booking
   *
   * PUT /api/v1/bookings/:eventId
   *
   * Example request:
   * {
   *   "startTime": "2024-08-16T15:00:00Z",
   *   "endTime": "2024-08-16T16:00:00Z"
   * }
   */
  @Put(':eventId')
  async rescheduleBooking(
    @Request() req: any,
    @Param('eventId') eventId: string,
    @Body() rescheduleRequest: RescheduleBookingRequest & { consultantEmail: string }
  ) {
    const userId = req.user.id;

    if (!eventId) {
      throw new Error('Event ID is required');
    }

    if (!rescheduleRequest.consultantEmail) {
      throw new Error('Consultant email is required');
    }

    // Build update details
    const updates: Partial<BookingDetails> = {};

    if (rescheduleRequest.startTime) {
      updates.startTime = new Date(rescheduleRequest.startTime);
    }

    if (rescheduleRequest.endTime) {
      updates.endTime = new Date(rescheduleRequest.endTime);
    }

    if (rescheduleRequest.title) {
      updates.title = rescheduleRequest.title;
    }

    if (rescheduleRequest.description) {
      updates.description = rescheduleRequest.description;
    }

    try {
      const result = await this.googleCalendar.rescheduleBooking(
        userId,
        eventId,
        rescheduleRequest.consultantEmail,
        updates
      );

      return {
        success: true,
        data: result,
        message: 'Booking rescheduled successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Cancel a booking
   *
   * DELETE /api/v1/bookings/:eventId
   *
   * Query params:
   * - consultantEmail: Email of the consultant
   * - userEmail: (Optional) User's email to also remove from user's calendar
   */
  @Delete(':eventId')
  async cancelBooking(
    @Request() req: any,
    @Param('eventId') eventId: string,
    @Body() cancelRequest: { consultantEmail: string; userEmail?: string }
  ) {
    const userId = req.user.id;

    if (!eventId) {
      throw new Error('Event ID is required');
    }

    if (!cancelRequest.consultantEmail) {
      throw new Error('Consultant email is required');
    }

    try {
      const result = await this.googleCalendar.cancelBooking(
        userId,
        eventId,
        cancelRequest.consultantEmail,
        cancelRequest.userEmail
      );

      return {
        success: true,
        data: result,
        message: 'Booking canceled successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Get Google Calendar connection status
   *
   * GET /api/v1/bookings/calendar/status
   *
   * Response:
   * {
   *   "connected": true,
   *   "accountName": "user@gmail.com",
   *   "expiresAt": "2024-08-20T10:30:00Z",
   *   "isExpiringSoon": false
   * }
   */
  @Get('calendar/status')
  async getConnectionStatus(@Request() req: any) {
    const userId = req.user.id;

    try {
      const status = await this.googleCalendar.getConnectionStatus(userId);

      return {
        success: true,
        data: status,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Get Google OAuth authorization URL
   *
   * GET /api/v1/bookings/calendar/auth-url
   *
   * Response:
   * {
   *   "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?...",
   *   "message": "Redirect user to this URL to authorize Google Calendar access"
   * }
   */
  @Get('calendar/auth-url')
  getAuthorizationUrl() {
    try {
      const authUrl = this.googleCalendar.getAuthorizationUrl();

      return {
        success: true,
        data: {
          authUrl,
        },
        message: 'Redirect user to this URL to authorize Google Calendar access',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Handle Google OAuth callback
   *
   * POST /api/v1/bookings/calendar/callback
   *
   * Example request:
   * {
   *   "code": "4/0AY-tzBw...",
   *   "state": "state-123"
   * }
   *
   * Response:
   * {
   *   "success": true,
   *   "message": "Google Calendar connected successfully",
   *   "accountName": "user@gmail.com"
   * }
   */
  @Post('calendar/callback')
  async handleGoogleCallback(
    @Request() req: any,
    @Body() callbackRequest: GoogleAuthCallbackRequest
  ) {
    const userId = req.user.id;

    if (!callbackRequest.code) {
      throw new Error('Authorization code is required');
    }

    try {
      const result = await this.googleCalendar.connectGoogleCalendar(
        userId,
        callbackRequest.code
      );

      return {
        success: true,
        data: {
          message: result.message,
          accountName: result.accountName,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Disconnect Google Calendar
   *
   * POST /api/v1/bookings/calendar/disconnect
   *
   * Response:
   * {
   *   "success": true,
   *   "message": "Google Calendar disconnected successfully"
   * }
   */
  @Post('calendar/disconnect')
  async disconnectGoogleCalendar(@Request() req: any) {
    const userId = req.user.id;

    try {
      const result = await this.googleCalendar.disconnectGoogleCalendar(userId);

      return {
        success: result.success,
        message: result.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Check if user has Google Calendar connected
   *
   * GET /api/v1/bookings/calendar/connected
   *
   * Response:
   * {
   *   "connected": true
   * }
   */
  @Get('calendar/connected')
  async isConnected(@Request() req: any) {
    const userId = req.user.id;

    try {
      const connected = await this.googleCalendar.isGoogleCalendarConnected(
        userId
      );

      return {
        success: true,
        data: { connected },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}

/**
 * Frontend Integration Example
 *
 * 1. Get authorization URL:
 *    GET /api/v1/bookings/calendar/auth-url
 *
 * 2. Redirect user to the authUrl
 *
 * 3. After user approves, Google redirects to your app with `code` parameter
 *
 * 4. Exchange code for credentials:
 *    POST /api/v1/bookings/calendar/callback
 *    Body: { code: "..." }
 *
 * 5. Create booking:
 *    POST /api/v1/bookings
 *    Body: { consultantEmail, title, startTime, endTime, ... }
 *
 * Example Flow:
 *
 * // Step 1: Get auth URL
 * const { authUrl } = await fetch('/api/v1/bookings/calendar/auth-url').then(r => r.json());
 *
 * // Step 2: Redirect (typically done after user clicks "Connect Google Calendar")
 * window.location.href = authUrl;
 *
 * // Step 3: Handle callback (after redirect back from Google)
 * const code = new URLSearchParams(window.location.search).get('code');
 * const { success } = await fetch('/api/v1/bookings/calendar/callback', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({ code })
 * }).then(r => r.json());
 *
 * // Step 4: Create booking
 * const { eventId, meetingLink } = await fetch('/api/v1/bookings', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     consultantEmail: 'consultant@example.com',
 *     title: 'Consultation',
 *     startTime: '2024-08-15T14:00:00Z',
 *     endTime: '2024-08-15T15:00:00Z'
 *   })
 * }).then(r => r.json()).then(r => r.data);
 *
 * console.log(`Event created! Join at: ${meetingLink}`);
 */
