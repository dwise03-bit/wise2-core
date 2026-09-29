# Google Calendar Integration Guide

## Overview

The Google Calendar Integration provides seamless booking calendar management with automatic Google Meet link generation, multi-calendar synchronization, and OAuth token management.

## Architecture

```
GoogleCalendarService (Core)
├── Calendar Event Management
├── Google Meet Link Generation
├── OAuth Token Refresh
└── Error Handling

GoogleCalendarIntegrationService (High-level)
├── Credential Management
├── Automatic Token Refresh
├── Booking Workflows
└── Connection Management

OAuthCredentialsRepository (Data Layer)
├── Credential Storage
├── Token Updates
└── Expiration Checks
```

## Features

### 1. Calendar Event Creation
- Automatically generates Google Meet links
- Creates events in both consultant and user calendars
- Sets reminder notifications
- Supports custom timezones
- Handles conference data properly

### 2. Event Management
- Update/reschedule existing events
- Cancel events with cleanup
- Support for partial updates
- Maintains calendar consistency

### 3. OAuth Token Management
- Automatic token refresh before expiration
- Secure credential storage
- Expiration tracking
- Error handling and recovery
- Provider account tracking

### 4. Error Handling
- Comprehensive error codes
- Automatic fallback for failures
- User-friendly error messages
- Logging for debugging

## Setup

### 1. Environment Variables

Add to your `.env` file:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_CALENDAR_REDIRECT_URL=http://localhost:3001/auth/google/callback

# Or use GOOGLE_CALLBACK_URL as fallback
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback
```

### 2. Database Migration

Run the migration to create the `oauth_credentials` table:

```bash
npm run migration:run:dev
```

This creates:
- `oauth_credentials` table
- Unique index on (user_id, provider)
- Additional performance indexes
- Foreign key to users table

### 3. Import Module

In your NestJS app module:

```typescript
import { GoogleCalendarModule } from './services/google-calendar.module';

@Module({
  imports: [
    // ... other imports
    GoogleCalendarModule,
  ],
})
export class AppModule {}
```

## Usage

### Basic Booking Creation

```typescript
import { GoogleCalendarIntegrationService } from './services/google-calendar-integration.service';
import { BookingDetails } from './lib/google-calendar.service';

@Controller('bookings')
export class BookingsController {
  constructor(
    private googleCalendar: GoogleCalendarIntegrationService
  ) {}

  @Post('create')
  async createBooking(
    @Body() req: {
      userId: string;
      consultantEmail: string;
      bookingDetails: BookingDetails;
    }
  ) {
    const result = await this.googleCalendar.createBooking(
      req.userId,
      req.consultantEmail,
      {
        title: 'Consultation Call',
        description: 'Initial strategy consultation',
        startTime: new Date('2024-08-15T14:00:00Z'),
        endTime: new Date('2024-08-15T15:00:00Z'),
        timezone: 'America/New_York',
        reminderMinutes: [15, 60],
        conferenceType: 'googleMeet',
      }
    );

    return {
      eventId: result.eventId,
      meetingLink: result.meetingLink,
      calendarLink: result.calendarLink,
    };
  }
}
```

### Booking Details Interface

```typescript
interface BookingDetails {
  title: string;                          // Event title (required)
  description?: string;                   // Event description
  startTime: Date;                        // Start time (required)
  endTime: Date;                          // End time (required)
  timezone?: string;                      // User's timezone (default: UTC)
  reminderMinutes?: number[];            // Reminder times (default: [15, 60])
  location?: string;                      // Physical location or phone number
  conferenceType?: 'googleMeet'           // 'googleMeet' | 'phone' | 'none'
              | 'phone'
              | 'none';
}
```

### Rescheduling Events

```typescript
@Put('reschedule/:eventId')
async rescheduleBooking(
  @Param('eventId') eventId: string,
  @Body() req: {
    userId: string;
    consultantEmail: string;
    newStartTime: Date;
    newEndTime: Date;
  }
) {
  return this.googleCalendar.rescheduleBooking(
    req.userId,
    eventId,
    req.consultantEmail,
    {
      startTime: req.newStartTime,
      endTime: req.newEndTime,
    }
  );
}
```

### Canceling Events

```typescript
@Delete('cancel/:eventId')
async cancelBooking(
  @Param('eventId') eventId: string,
  @Body() req: {
    userId: string;
    consultantEmail: string;
    userEmail?: string;
  }
) {
  return this.googleCalendar.cancelBooking(
    req.userId,
    eventId,
    req.consultantEmail,
    req.userEmail
  );
}
```

### OAuth Connection Management

#### Get Authorization URL

```typescript
@Get('auth/google/url')
getAuthUrl() {
  return {
    authUrl: this.googleCalendar.getAuthorizationUrl(),
  };
}
```

#### Connect Google Calendar

```typescript
@Post('auth/google/callback')
async connectGoogleCalendar(
  @Body() req: {
    userId: string;
    authCode: string;
    accountEmail?: string;
  }
) {
  return this.googleCalendar.connectGoogleCalendar(
    req.userId,
    req.authCode,
    req.accountEmail
  );
}
```

#### Check Connection Status

```typescript
@Get('auth/google/status/:userId')
async getConnectionStatus(@Param('userId') userId: string) {
  return this.googleCalendar.getConnectionStatus(userId);
}
```

#### Disconnect Google Calendar

```typescript
@Post('auth/google/disconnect/:userId')
async disconnectGoogleCalendar(@Param('userId') userId: string) {
  return this.googleCalendar.disconnectGoogleCalendar(userId);
}
```

## Error Handling

### Common Errors

| Error Code | Status | Meaning | Solution |
|-----------|--------|---------|----------|
| `UNAUTHORIZED` | 401 | Google auth failed | User needs to reconnect |
| `FORBIDDEN` | 403 | Permission denied | Check calendar sharing settings |
| `NOT_FOUND` | 404 | Event not found | Event may have been deleted |
| `RATE_LIMIT` | 429 | Too many requests | Retry after delay |
| `GOOGLE_SERVER_ERROR` | 502 | Google API down | Retry later |
| `MISSING_EVENT_ID` | 400 | Event ID required | Include eventId parameter |
| `INVALID_TIMES` | 400 | Invalid time range | startTime must be before endTime |
| `TIME_IN_PAST` | 400 | Time is in past | Event must be 5+ minutes from now |
| `MISSING_REFRESH_TOKEN` | 400 | Can't refresh token | User needs to reconnect |

### Error Handling Example

```typescript
import { GoogleCalendarError } from './lib/google-calendar.service';

try {
  const result = await this.googleCalendar.createBooking(
    userId,
    consultantEmail,
    bookingDetails
  );
} catch (error) {
  if (error instanceof GoogleCalendarError) {
    // Handle specific Google Calendar error
    console.error(`${error.code}: ${error.message}`);

    if (error.code === 'UNAUTHORIZED') {
      // Prompt user to reconnect
      // Redirect to getAuthorizationUrl()
    } else if (error.code === 'RATE_LIMIT') {
      // Retry after delay
    }
  } else {
    // Handle other errors
    console.error('Unexpected error:', error);
  }
}
```

## Database Schema

### oauth_credentials Table

```sql
CREATE TABLE oauth_credentials (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider oauth_provider_enum NOT NULL, -- 'google' | 'github' | 'microsoft'
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_type VARCHAR,
  scopes TEXT, -- Space-separated scopes
  expires_at TIMESTAMP NOT NULL,
  provider_account_id VARCHAR,
  account_name VARCHAR, -- Email or account display name
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMP,
  error_message VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

CREATE INDEX idx_oauth_credentials_provider ON oauth_credentials(provider);
CREATE INDEX idx_oauth_credentials_expires_at ON oauth_credentials(expires_at);
CREATE INDEX idx_oauth_credentials_is_active ON oauth_credentials(is_active);
```

## Token Refresh Flow

The system automatically refreshes expired tokens:

1. When booking operation is requested
2. Service checks token expiration
3. If expiring within 5 minutes:
   - Uses refresh_token to get new access_token
   - Updates database with new token
   - Logs refresh event
4. If refresh fails:
   - Marks credentials as inactive
   - Logs error message
   - Proceeds without user calendar update
5. All operations continue normally

## Security Considerations

### Token Storage
- Tokens stored in database (ensure DB encryption)
- Never logged or displayed to users
- Refresh tokens stored separately from access tokens
- Tokens marked as inactive after failures

### Scope Management
- Only requests necessary scopes
- Tracks granted scopes in database
- Can revoke/disconnect at any time

### Error Messages
- User-friendly error messages
- Detailed logs for debugging
- No sensitive data in error responses

## Testing

### Mock Implementation

For testing without live Google API:

```typescript
// In test file
const mockGoogleCalendarService = {
  createCalendarEvent: jest.fn().mockResolvedValue({
    eventId: 'test-event-id',
    meetingLink: 'https://meet.google.com/test-123',
    calendarLink: 'https://calendar.google.com/event?eid=test',
    startTime: '2024-08-15T14:00:00Z',
    endTime: '2024-08-15T15:00:00Z',
  }),
};

describe('BookingsController', () => {
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [BookingsController],
      providers: [
        {
          provide: GoogleCalendarIntegrationService,
          useValue: mockGoogleCalendarService,
        },
      ],
    }).compile();
  });

  it('should create a booking', async () => {
    // Test implementation
  });
});
```

## API Integration Examples

### Create Consultation Booking

```bash
curl -X POST http://localhost:3001/bookings/create \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "consultantEmail": "consultant@example.com",
    "bookingDetails": {
      "title": "Strategy Consultation",
      "description": "30-minute consultation call",
      "startTime": "2024-08-15T14:00:00Z",
      "endTime": "2024-08-15T14:30:00Z",
      "timezone": "America/New_York",
      "reminderMinutes": [15, 60],
      "conferenceType": "googleMeet"
    }
  }'
```

### Reschedule Event

```bash
curl -X PUT http://localhost:3001/bookings/reschedule/event-id-123 \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "consultantEmail": "consultant@example.com",
    "newStartTime": "2024-08-16T15:00:00Z",
    "newEndTime": "2024-08-16T15:30:00Z"
  }'
```

### Check Connection Status

```bash
curl http://localhost:3001/bookings/auth/google/status/user-123
```

Response:
```json
{
  "connected": true,
  "accountName": "user@gmail.com",
  "expiresAt": "2024-08-20T10:30:00Z",
  "isExpiringSoon": false
}
```

## Troubleshooting

### Issue: "Authentication failed" (401)

**Solution**: User needs to reconnect Google Calendar
1. Get authorization URL: `getAuthorizationUrl()`
2. Redirect user to URL
3. Handle authorization code
4. Call `connectGoogleCalendar(userId, authCode)`

### Issue: "Token expired - no refresh token available"

**Solution**: User's refresh token is missing
1. User must disconnect and reconnect
2. Request "offline" access during OAuth flow

### Issue: "Failed to create event in consultant calendar"

**Solution**: Consultant's credentials not available
1. Ensure consultant has connected their Google account
2. Check if consultant's credentials are valid
3. Event will still be added to user's calendar

### Issue: Token keeps expiring

**Solution**: Check database connectivity
1. Verify oauth_credentials table exists
2. Check user has valid refresh_token
3. Verify token expiration time is correct

## Production Deployment

### Environment Setup

```env
# Production
GOOGLE_CLIENT_ID=prod-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=prod-client-secret
GOOGLE_CALENDAR_REDIRECT_URL=https://app.example.com/auth/google/callback

# Database
DATABASE_URL=postgresql://user:pass@host:5432/wise2
```

### Database Encryption

Recommend enabling at-rest encryption for `oauth_credentials` table:

```sql
-- Enable for sensitive columns
ALTER TABLE oauth_credentials
  ADD CONSTRAINT encrypt_access_token
  CHECK (pg_catalog.digest(access_token, 'sha256') IS NOT NULL);
```

### Monitoring

Monitor these metrics:
- Failed token refreshes
- Authorization failures
- Rate limit errors
- Event creation failures
- Token expiration patterns

### Cron Job for Cleanup

Optional: Clean up expired, inactive credentials:

```typescript
@Cron('0 2 * * *') // Daily at 2 AM
async cleanupExpiredCredentials() {
  const expired = await this.oauthRepository.getExpiredCredentials(
    OAuthProvider.GOOGLE
  );

  for (const credential of expired) {
    if (!credential.refresh_token) {
      // Hard delete if no refresh possible
      await this.oauthRepository.remove(credential);
    }
  }
}
```

## API Reference

See inline documentation in:
- `GoogleCalendarService` - Core calendar operations
- `GoogleCalendarIntegrationService` - High-level booking workflows
- `OAuthCredentialsRepository` - Database operations
