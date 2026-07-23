import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { GoogleCalendarService } from '../lib/google-calendar.service';
import { GoogleCalendarIntegrationService } from './google-calendar-integration.service';
import { OAuthCredentials } from '../db/oauth-credentials.entity';
import { OAuthCredentialsRepository } from '../db/oauth-credentials.repository';

/**
 * Google Calendar Module
 * Provides Google Calendar integration services, OAuth credential management,
 * and booking calendar operations
 *
 * Features:
 * - Create calendar events with Google Meet links
 * - Reschedule/update existing events
 * - Cancel events
 * - Manage OAuth credentials with automatic token refresh
 * - Multi-calendar event creation (consultant + user)
 *
 * Usage in controllers/services:
 * ```typescript
 * constructor(private googleCalendar: GoogleCalendarIntegrationService) {}
 *
 * async createConsultationBooking(userId: string, bookingDetails: BookingDetails) {
 *   return this.googleCalendar.createBooking(
 *     userId,
 *     'consultant@example.com',
 *     bookingDetails
 *   );
 * }
 * ```
 */
@Module({
  imports: [TypeOrmModule.forFeature([OAuthCredentials]), ConfigModule],
  providers: [
    GoogleCalendarService,
    GoogleCalendarIntegrationService,
    OAuthCredentialsRepository,
  ],
  exports: [GoogleCalendarService, GoogleCalendarIntegrationService, OAuthCredentialsRepository],
})
export class GoogleCalendarModule {}
