import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { GoogleCalendarService, GoogleOAuthCredentials, BookingDetails, CalendarEventResponse } from '../lib/google-calendar.service';
import { OAuthCredentialsRepository } from '../db/oauth-credentials.repository';
import { OAuthProvider } from '../db/oauth-credentials.entity';

/**
 * Google Calendar Integration Service
 * High-level service that combines GoogleCalendarService with credential management
 * Handles OAuth token refresh, credential storage, and booking workflows
 */
@Injectable()
export class GoogleCalendarIntegrationService {
  private readonly logger = new Logger('GoogleCalendarIntegrationService');

  constructor(
    private readonly googleCalendar: GoogleCalendarService,
    private readonly oauthRepository: OAuthCredentialsRepository
  ) {}

  /**
   * Create a calendar event with automatic credential management
   * Handles token refresh if needed
   */
  async createBooking(
    userId: string,
    consultantEmail: string,
    bookingDetails: BookingDetails
  ): Promise<CalendarEventResponse> {
    try {
      // Get user's Google OAuth credentials if connected
      const userCredentials = await this.getValidatedCredentials(userId);

      // Create the event
      const result = await this.googleCalendar.createCalendarEvent(
        userId,
        consultantEmail,
        bookingDetails,
        userCredentials
      );

      // Mark credentials as used
      if (userCredentials) {
        await this.oauthRepository.markAsUsed(userId, OAuthProvider.GOOGLE);
      }

      this.logger.log(`✅ Booking created for user ${userId}: ${result.eventId}`);

      return result;
    } catch (error) {
      this.logger.error(
        `❌ Failed to create booking: ${error instanceof Error ? error.message : String(error)}`
      );
      throw error;
    }
  }

  /**
   * Reschedule an existing booking
   * Handles token refresh and updates both calendars
   */
  async rescheduleBooking(
    userId: string,
    eventId: string,
    consultantEmail: string,
    updatedDetails: Partial<BookingDetails>
  ): Promise<CalendarEventResponse> {
    try {
      // Get user's Google OAuth credentials if connected
      const userCredentials = await this.getValidatedCredentials(userId);

      // Update the event
      const result = await this.googleCalendar.updateCalendarEvent(
        eventId,
        consultantEmail,
        updatedDetails,
        userCredentials
      );

      // Mark credentials as used
      if (userCredentials) {
        await this.oauthRepository.markAsUsed(userId, OAuthProvider.GOOGLE);
      }

      this.logger.log(`✅ Booking rescheduled: ${eventId}`);

      return result;
    } catch (error) {
      this.logger.error(
        `❌ Failed to reschedule booking: ${error instanceof Error ? error.message : String(error)}`
      );
      throw error;
    }
  }

  /**
   * Cancel a booking and remove from calendars
   */
  async cancelBooking(
    userId: string,
    eventId: string,
    consultantEmail: string,
    userEmail?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Get user's Google OAuth credentials if connected
      const userCredentials = await this.getValidatedCredentials(userId);

      // Cancel the event
      const result = await this.googleCalendar.cancelCalendarEvent(
        eventId,
        consultantEmail,
        userEmail,
        userCredentials
      );

      // Mark credentials as used
      if (userCredentials) {
        await this.oauthRepository.markAsUsed(userId, OAuthProvider.GOOGLE);
      }

      this.logger.log(`✅ Booking canceled: ${eventId}`);

      return result;
    } catch (error) {
      this.logger.error(
        `❌ Failed to cancel booking: ${error instanceof Error ? error.message : String(error)}`
      );
      throw error;
    }
  }

  /**
   * Get valid Google OAuth credentials for a user
   * Automatically refreshes token if needed
   */
  private async getValidatedCredentials(
    userId: string
  ): Promise<GoogleOAuthCredentials | undefined> {
    try {
      const credential = await this.oauthRepository.getCredentials(
        userId,
        OAuthProvider.GOOGLE
      );

      if (!credential) {
        this.logger.debug(
          `ℹ️ User ${userId} does not have Google Calendar connected`
        );
        return undefined;
      }

      if (!credential.is_active) {
        this.logger.warn(
          `⚠️ Google Calendar credentials for user ${userId} are inactive`
        );
        return undefined;
      }

      // Check if token is expired or expiring soon
      const now = new Date();
      const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60000);

      if (credential.expires_at <= fiveMinutesFromNow) {
        if (!credential.refresh_token) {
          this.logger.warn(
            `⚠️ Google Calendar token expired and no refresh token available for user ${userId}`
          );

          // Mark as failed
          await this.oauthRepository.markAsFailed(
            userId,
            OAuthProvider.GOOGLE,
            'Token expired - no refresh token available'
          );

          return undefined;
        }

        // Refresh the token
        try {
          this.logger.log(
            `🔄 Refreshing Google Calendar token for user ${userId}`
          );

          const refreshedCredentials = await this.googleCalendar.refreshOAuthToken(
            credential.refresh_token
          );

          // Update stored credentials
          await this.oauthRepository.updateToken(
            userId,
            OAuthProvider.GOOGLE,
            {
              accessToken: refreshedCredentials.accessToken,
              refreshToken: refreshedCredentials.refreshToken,
              expiresAt: refreshedCredentials.expiresAt,
              scopes: refreshedCredentials.scopes?.join(' '),
            }
          );

          this.logger.log(`✅ Google Calendar token refreshed for user ${userId}`);

          return refreshedCredentials;
        } catch (error) {
          this.logger.error(
            `❌ Failed to refresh token for user ${userId}: ${
              error instanceof Error ? error.message : String(error)
            }`
          );

          // Mark as failed
          await this.oauthRepository.markAsFailed(
            userId,
            OAuthProvider.GOOGLE,
            `Token refresh failed: ${error instanceof Error ? error.message : String(error)}`
          );

          return undefined;
        }
      }

      // Token is valid
      return {
        accessToken: credential.access_token,
        refreshToken: credential.refresh_token,
        expiresAt: credential.expires_at,
        tokenType: credential.token_type || 'Bearer',
        scopes: credential.scopes?.split(' ') || [],
      };
    } catch (error) {
      this.logger.error(
        `❌ Error retrieving credentials: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      return undefined;
    }
  }

  /**
   * Connect user to Google Calendar via OAuth
   * Exchanges auth code for tokens and stores them
   */
  async connectGoogleCalendar(userId: string, authCode: string, accountEmail?: string): Promise<{
    success: boolean;
    message: string;
    accountName?: string;
  }> {
    try {
      if (!authCode) {
        throw new BadRequestException('Authorization code is required');
      }

      // Exchange code for tokens
      const credentials = await this.googleCalendar.getTokensFromAuthCode(authCode);

      // Store credentials in database
      const stored = await this.oauthRepository.upsertCredentials(
        userId,
        OAuthProvider.GOOGLE,
        {
          accessToken: credentials.accessToken,
          refreshToken: credentials.refreshToken,
          tokenType: credentials.tokenType,
          scopes: credentials.scopes?.join(' '),
          expiresAt: credentials.expiresAt,
          accountName: accountEmail,
        }
      );

      this.logger.log(`✅ Google Calendar connected for user ${userId}`);

      return {
        success: true,
        message: 'Google Calendar connected successfully',
        accountName: stored.account_name,
      };
    } catch (error) {
      this.logger.error(
        `❌ Failed to connect Google Calendar: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      throw error;
    }
  }

  /**
   * Disconnect user from Google Calendar
   */
  async disconnectGoogleCalendar(userId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const disconnected = await this.oauthRepository.disconnect(
        userId,
        OAuthProvider.GOOGLE
      );

      if (!disconnected) {
        return {
          success: false,
          message: 'Google Calendar was not connected',
        };
      }

      this.logger.log(`✅ Google Calendar disconnected for user ${userId}`);

      return {
        success: true,
        message: 'Google Calendar disconnected successfully',
      };
    } catch (error) {
      this.logger.error(
        `❌ Failed to disconnect Google Calendar: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      throw error;
    }
  }

  /**
   * Check if user has Google Calendar connected
   */
  async isGoogleCalendarConnected(userId: string): Promise<boolean> {
    try {
      return await this.oauthRepository.isConnected(
        userId,
        OAuthProvider.GOOGLE
      );
    } catch (error) {
      this.logger.error(
        `❌ Error checking Google Calendar connection: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      return false;
    }
  }

  /**
   * Get Google Calendar connection status
   */
  async getConnectionStatus(userId: string): Promise<{
    connected: boolean;
    accountName?: string;
    expiresAt?: Date;
    isExpiringSoon?: boolean;
  }> {
    try {
      const credential = await this.oauthRepository.getCredentials(
        userId,
        OAuthProvider.GOOGLE
      );

      if (!credential || !credential.is_active) {
        return { connected: false };
      }

      const now = new Date();
      const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60000);

      return {
        connected: true,
        accountName: credential.account_name,
        expiresAt: credential.expires_at,
        isExpiringSoon: credential.expires_at <= thirtyMinutesFromNow,
      };
    } catch (error) {
      this.logger.error(
        `❌ Error getting connection status: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      return { connected: false };
    }
  }

  /**
   * Get OAuth authorization URL for user to connect Google Calendar
   */
  getAuthorizationUrl(): string {
    return this.googleCalendar.getAuthorizationUrl();
  }
}
