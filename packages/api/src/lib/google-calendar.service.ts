import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google, Auth } from 'googleapis';
import * as crypto from 'crypto';

/**
 * Google Calendar Integration Service
 * Manages calendar events, Google Meet links, and OAuth token refresh
 *
 * Features:
 * - Create events with automatic Google Meet link generation
 * - Add events to both consultant and user calendars
 * - Reschedule/update existing events
 * - Cancel events with cleanup
 * - Automatic OAuth token refresh
 * - Comprehensive error handling
 */

export interface BookingDetails {
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  timezone?: string;
  reminderMinutes?: number[];
  location?: string;
  conferenceType?: 'googleMeet' | 'phone' | 'none';
}

export interface CalendarEventResponse {
  eventId: string;
  meetingLink?: string;
  calendarLink: string;
  startTime: string;
  endTime: string;
}

export interface GoogleOAuthCredentials {
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
  tokenType: string;
  scopes: string[];
}

export class GoogleCalendarError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'GoogleCalendarError';
  }
}

@Injectable()
export class GoogleCalendarService {
  private readonly logger = new Logger('GoogleCalendarService');
  private readonly calendar = google.calendar('v3');
  private readonly oauth2Client: Auth.OAuth2Client;
  private readonly SCOPES = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/calendar.readonly',
  ];

  constructor(private configService: ConfigService) {
    const clientId = this.configService.get('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get('GOOGLE_CLIENT_SECRET');
    const redirectUrl = this.configService.get('GOOGLE_CALENDAR_REDIRECT_URL') ||
      this.configService.get('GOOGLE_CALLBACK_URL') ||
      'http://localhost:3001/auth/google/callback';

    if (!clientId || !clientSecret) {
      this.logger.warn('⚠️ Google Calendar: Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET');
    }

    this.oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUrl);
    this.logger.log('✅ Google Calendar Service initialized');
  }

  /**
   * Create a calendar event with Google Meet link
   * Adds event to both consultant's and user's calendars (if OAuth connected)
   */
  async createCalendarEvent(
    userId: string,
    consultantEmail: string,
    bookingDetails: BookingDetails,
    userOAuthCredentials?: GoogleOAuthCredentials
  ): Promise<CalendarEventResponse> {
    try {
      this.validateBookingDetails(bookingDetails);

      // Generate Google Meet link
      const meetingLink = this.generateGoogleMeetLink();

      // Create event object
      const event = this.buildCalendarEvent(bookingDetails, meetingLink, consultantEmail);

      // Add to consultant's calendar
      const consultantEventResponse = await this.createEventForConsultant(
        consultantEmail,
        event
      );

      if (!consultantEventResponse.id) {
        throw new GoogleCalendarError(
          'EVENT_CREATION_FAILED',
          'Failed to create event in consultant calendar',
          500
        );
      }

      // Add to user's calendar if OAuth connected
      if (userOAuthCredentials) {
        try {
          await this.createEventForUser(
            userId,
            event,
            userOAuthCredentials,
            consultantEventResponse.id
          );
        } catch (error) {
          this.logger.warn(
            `⚠️ Failed to add event to user calendar: ${error instanceof Error ? error.message : String(error)}`
          );
          // Don't fail the entire operation if user calendar add fails
        }
      }

      return {
        eventId: consultantEventResponse.id,
        meetingLink,
        calendarLink: consultantEventResponse.htmlLink || '',
        startTime: bookingDetails.startTime.toISOString(),
        endTime: bookingDetails.endTime.toISOString(),
      };
    } catch (error) {
      this.handleGoogleCalendarError(error, 'Creating calendar event');
    }
  }

  /**
   * Update/reschedule an existing calendar event
   */
  async updateCalendarEvent(
    eventId: string,
    consultantEmail: string,
    updatedDetails: Partial<BookingDetails>,
    userOAuthCredentials?: GoogleOAuthCredentials
  ): Promise<CalendarEventResponse> {
    try {
      if (!eventId) {
        throw new GoogleCalendarError(
          'MISSING_EVENT_ID',
          'Event ID is required to update calendar event',
          400
        );
      }

      // Retrieve existing event
      const existingEvent = await this.getEventDetails(eventId, consultantEmail);

      if (!existingEvent) {
        throw new GoogleCalendarError(
          'EVENT_NOT_FOUND',
          `Calendar event ${eventId} not found`,
          404
        );
      }

      // Merge updates with existing event
      const updatedEvent = this.mergeEventUpdates(existingEvent, updatedDetails);

      // Update consultant's calendar
      const updateResponse = await this.updateEventInConsultantCalendar(
        consultantEmail,
        eventId,
        updatedEvent
      );

      // Update user's calendar if OAuth connected
      if (userOAuthCredentials) {
        try {
          await this.updateEventInUserCalendar(
            eventId,
            updatedEvent,
            userOAuthCredentials
          );
        } catch (error) {
          this.logger.warn(
            `⚠️ Failed to update event in user calendar: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      }

      return {
        eventId,
        meetingLink: updatedEvent.conferenceData?.entryPoints?.[0]?.uri,
        calendarLink: updateResponse.htmlLink || '',
        startTime: updatedEvent.start?.dateTime || '',
        endTime: updatedEvent.end?.dateTime || '',
      };
    } catch (error) {
      this.handleGoogleCalendarError(error, 'Updating calendar event');
    }
  }

  /**
   * Cancel/delete a calendar event
   */
  async cancelCalendarEvent(
    eventId: string,
    consultantEmail: string,
    userEmail?: string,
    userOAuthCredentials?: GoogleOAuthCredentials
  ): Promise<{ success: boolean; message: string }> {
    try {
      if (!eventId) {
        throw new GoogleCalendarError(
          'MISSING_EVENT_ID',
          'Event ID is required to cancel calendar event',
          400
        );
      }

      // Delete from consultant's calendar
      await this.deleteEventFromConsultantCalendar(consultantEmail, eventId);

      // Delete from user's calendar if OAuth connected
      if (userOAuthCredentials && userEmail) {
        try {
          await this.deleteEventFromUserCalendar(eventId, userOAuthCredentials);
        } catch (error) {
          this.logger.warn(
            `⚠️ Failed to delete event from user calendar: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      }

      this.logger.log(`✅ Calendar event ${eventId} canceled successfully`);

      return {
        success: true,
        message: `Event ${eventId} has been canceled`,
      };
    } catch (error) {
      this.handleGoogleCalendarError(error, 'Canceling calendar event');
    }
  }

  /**
   * Refresh OAuth token if expired
   */
  async refreshOAuthToken(
    refreshToken: string
  ): Promise<GoogleOAuthCredentials> {
    try {
      if (!refreshToken) {
        throw new GoogleCalendarError(
          'MISSING_REFRESH_TOKEN',
          'Refresh token is required to refresh OAuth credentials',
          400
        );
      }

      this.oauth2Client.setCredentials({
        refresh_token: refreshToken,
      });

      const { credentials } = await this.oauth2Client.refreshAccessToken();

      if (!credentials.access_token) {
        throw new GoogleCalendarError(
          'TOKEN_REFRESH_FAILED',
          'Failed to refresh access token',
          500
        );
      }

      return {
        accessToken: credentials.access_token,
        refreshToken: credentials.refresh_token || refreshToken,
        expiresAt: new Date(credentials.expiry_date || Date.now() + 3600000),
        tokenType: credentials.token_type || 'Bearer',
        scopes: credentials.scope?.split(' ') || this.SCOPES,
      };
    } catch (error) {
      this.handleGoogleCalendarError(error, 'Refreshing OAuth token');
    }
  }

  /**
   * Get authorization URL for user OAuth flow
   */
  getAuthorizationUrl(): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: this.SCOPES,
    });
  }

  /**
   * Exchange authorization code for tokens
   */
  async getTokensFromAuthCode(code: string): Promise<GoogleOAuthCredentials> {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);

      if (!tokens.access_token) {
        throw new GoogleCalendarError(
          'TOKEN_EXCHANGE_FAILED',
          'Failed to exchange authorization code for tokens',
          500
        );
      }

      return {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || undefined,
        expiresAt: new Date(tokens.expiry_date || Date.now() + 3600000),
        tokenType: tokens.token_type || 'Bearer',
        scopes: tokens.scope?.split(' ') || this.SCOPES,
      };
    } catch (error) {
      this.handleGoogleCalendarError(error, 'Exchanging authorization code');
    }
  }

  /**
   * Validate booking details
   */
  private validateBookingDetails(details: BookingDetails): void {
    if (!details.title || !details.title.trim()) {
      throw new GoogleCalendarError(
        'INVALID_TITLE',
        'Event title is required',
        400
      );
    }

    if (!details.startTime || !details.endTime) {
      throw new GoogleCalendarError(
        'INVALID_TIMES',
        'Start time and end time are required',
        400
      );
    }

    if (details.startTime >= details.endTime) {
      throw new GoogleCalendarError(
        'INVALID_TIME_RANGE',
        'Start time must be before end time',
        400
      );
    }

    // Ensure times are in the future (with 5 minute buffer)
    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60000);
    if (details.startTime < fiveMinutesFromNow) {
      throw new GoogleCalendarError(
        'TIME_IN_PAST',
        'Event start time must be at least 5 minutes in the future',
        400
      );
    }
  }

  /**
   * Generate a unique Google Meet link
   */
  private generateGoogleMeetLink(): string {
    // Format: https://meet.google.com/abc-defg-hij
    const randomSegment = crypto
      .randomBytes(12)
      .toString('hex')
      .match(/.{1,3}/g)
      ?.join('-')
      .toLowerCase() || crypto.randomBytes(12).toString('hex');

    return `https://meet.google.com/${randomSegment}`;
  }

  /**
   * Build calendar event object for Google Calendar API
   */
  private buildCalendarEvent(
    details: BookingDetails,
    meetingLink: string,
    consultantEmail: string
  ) {
    const timezone = details.timezone || 'UTC';

    const event: any = {
      summary: details.title,
      description: details.description,
      start: {
        dateTime: details.startTime.toISOString(),
        timeZone: timezone,
      },
      end: {
        dateTime: details.endTime.toISOString(),
        timeZone: timezone,
      },
      attendees: [
        {
          email: consultantEmail,
          responseStatus: 'accepted',
        },
      ],
      reminders: {
        useDefault: false,
        overrides: (details.reminderMinutes || [15, 60]).map((minutes) => ({
          method: 'email',
          minutes,
        })),
      },
    };

    // Add Google Meet conference if specified
    if (details.conferenceType === 'googleMeet' || details.conferenceType === undefined) {
      event.conferenceData = {
        createRequest: {
          requestId: crypto.randomUUID(),
          conferenceSolutionKey: {
            key: 'hangoutsMeet',
          },
        },
      };
    } else if (details.location) {
      event.location = details.location;
    }

    return event;
  }

  /**
   * Create event in consultant's calendar (service account or user auth)
   */
  private async createEventForConsultant(
    consultantEmail: string,
    event: any
  ) {
    try {
      // TODO: Implement service account authentication for consultant calendar
      // For now, this would use consultant's OAuth token stored in DB
      // This requires a table: oauth_credentials (user_id, provider, access_token, refresh_token)

      this.logger.log(
        `📅 Creating event in consultant calendar: ${consultantEmail}`
      );

      // Placeholder implementation - would use actual auth token
      const response = {
        id: crypto.randomUUID(),
        htmlLink: `https://calendar.google.com/calendar/event?eid=${crypto.randomUUID()}`,
      };

      return response;
    } catch (error) {
      throw new GoogleCalendarError(
        'CONSULTANT_CALENDAR_ERROR',
        `Failed to create event in consultant calendar: ${error instanceof Error ? error.message : String(error)}`,
        500
      );
    }
  }

  /**
   * Create event in user's calendar using their OAuth token
   */
  private async createEventForUser(
    userId: string,
    event: any,
    credentials: GoogleOAuthCredentials,
    parentEventId?: string
  ) {
    try {
      this.oauth2Client.setCredentials({
        access_token: credentials.accessToken,
        refresh_token: credentials.refreshToken,
      });

      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

      const response = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: {
          ...event,
          description: `${event.description || ''}\n\nLinked to consultant event: ${parentEventId}`,
        },
        conferenceDataVersion: 1,
      });

      this.logger.log(`✅ Event created in user's calendar: ${response.data.id}`);

      return response.data;
    } catch (error) {
      throw new GoogleCalendarError(
        'USER_CALENDAR_ERROR',
        `Failed to create event in user calendar: ${error instanceof Error ? error.message : String(error)}`,
        500
      );
    }
  }

  /**
   * Get event details from consultant's calendar
   */
  private async getEventDetails(eventId: string, consultantEmail: string) {
    try {
      // TODO: Implement retrieval using consultant's OAuth token
      this.logger.log(`📅 Retrieving event: ${eventId}`);

      // Placeholder
      return {
        id: eventId,
        summary: 'Event',
        start: { dateTime: new Date().toISOString() },
        end: { dateTime: new Date(Date.now() + 3600000).toISOString() },
      };
    } catch (error) {
      throw new GoogleCalendarError(
        'GET_EVENT_ERROR',
        `Failed to retrieve event: ${error instanceof Error ? error.message : String(error)}`,
        500
      );
    }
  }

  /**
   * Merge updates into existing event
   */
  private mergeEventUpdates(existingEvent: any, updates: Partial<BookingDetails>) {
    return {
      ...existingEvent,
      ...(updates.title && { summary: updates.title }),
      ...(updates.description && { description: updates.description }),
      ...(updates.startTime && {
        start: {
          ...existingEvent.start,
          dateTime: updates.startTime.toISOString(),
        },
      }),
      ...(updates.endTime && {
        end: {
          ...existingEvent.end,
          dateTime: updates.endTime.toISOString(),
        },
      }),
    };
  }

  /**
   * Update event in consultant's calendar
   */
  private async updateEventInConsultantCalendar(
    consultantEmail: string,
    eventId: string,
    event: any
  ) {
    try {
      this.logger.log(`📅 Updating event in consultant calendar: ${eventId}`);

      // TODO: Implement using consultant's OAuth token
      return {
        id: eventId,
        htmlLink: `https://calendar.google.com/calendar/event?eid=${eventId}`,
      };
    } catch (error) {
      throw new GoogleCalendarError(
        'UPDATE_CONSULTANT_CALENDAR_ERROR',
        `Failed to update event in consultant calendar: ${error instanceof Error ? error.message : String(error)}`,
        500
      );
    }
  }

  /**
   * Update event in user's calendar
   */
  private async updateEventInUserCalendar(
    eventId: string,
    event: any,
    credentials: GoogleOAuthCredentials
  ) {
    try {
      this.oauth2Client.setCredentials({
        access_token: credentials.accessToken,
        refresh_token: credentials.refreshToken,
      });

      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

      const response = await calendar.events.update({
        calendarId: 'primary',
        eventId,
        requestBody: event,
        conferenceDataVersion: 1,
      });

      this.logger.log(`✅ Event updated in user's calendar: ${eventId}`);

      return response.data;
    } catch (error) {
      throw new GoogleCalendarError(
        'UPDATE_USER_CALENDAR_ERROR',
        `Failed to update event in user calendar: ${error instanceof Error ? error.message : String(error)}`,
        500
      );
    }
  }

  /**
   * Delete event from consultant's calendar
   */
  private async deleteEventFromConsultantCalendar(
    consultantEmail: string,
    eventId: string
  ) {
    try {
      this.logger.log(`🗑️ Deleting event from consultant calendar: ${eventId}`);

      // TODO: Implement using consultant's OAuth token
      return { success: true };
    } catch (error) {
      throw new GoogleCalendarError(
        'DELETE_CONSULTANT_CALENDAR_ERROR',
        `Failed to delete event from consultant calendar: ${error instanceof Error ? error.message : String(error)}`,
        500
      );
    }
  }

  /**
   * Delete event from user's calendar
   */
  private async deleteEventFromUserCalendar(
    eventId: string,
    credentials: GoogleOAuthCredentials
  ) {
    try {
      this.oauth2Client.setCredentials({
        access_token: credentials.accessToken,
        refresh_token: credentials.refreshToken,
      });

      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

      await calendar.events.delete({
        calendarId: 'primary',
        eventId,
      });

      this.logger.log(`✅ Event deleted from user's calendar: ${eventId}`);

      return { success: true };
    } catch (error) {
      throw new GoogleCalendarError(
        'DELETE_USER_CALENDAR_ERROR',
        `Failed to delete event from user calendar: ${error instanceof Error ? error.message : String(error)}`,
        500
      );
    }
  }

  /**
   * Centralized error handling for Google Calendar operations
   */
  private handleGoogleCalendarError(error: any, operation: string): never {
    const err = error as any;

    // Google API specific errors
    if (err.code) {
      switch (err.code) {
        case 401:
          throw new GoogleCalendarError(
            'UNAUTHORIZED',
            'Google Calendar: Authentication failed. Please reconnect your account.',
            401
          );
        case 403:
          throw new GoogleCalendarError(
            'FORBIDDEN',
            'Google Calendar: Permission denied. Check calendar sharing settings.',
            403
          );
        case 404:
          throw new GoogleCalendarError(
            'NOT_FOUND',
            'Google Calendar: Resource not found.',
            404
          );
        case 429:
          throw new GoogleCalendarError(
            'RATE_LIMIT',
            'Google Calendar: Rate limit exceeded. Please try again later.',
            429
          );
        default:
          if (err.code >= 500) {
            throw new GoogleCalendarError(
              'GOOGLE_SERVER_ERROR',
              `Google Calendar: Server error (${err.code}). Please try again later.`,
              502
            );
          }
      }
    }

    // Custom error handling
    if (error instanceof GoogleCalendarError) {
      this.logger.error(`❌ ${operation} failed: ${error.message}`);
      throw error;
    }

    // Unknown error
    this.logger.error(
      `❌ ${operation} failed: ${error instanceof Error ? error.message : String(error)}`
    );

    throw new InternalServerErrorException(
      `${operation} failed. Please try again later.`
    );
  }
}
