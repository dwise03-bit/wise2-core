# Google Calendar Integration - Setup & Implementation Guide

## Overview

This integration enables WISE² Core to:
- Create consultation bookings with automatic Google Meet links
- Manage calendar events across multiple calendars
- Handle OAuth credentials with automatic token refresh
- Provide production-grade error handling and recovery

## Files Created

### Core Services

#### 1. `src/lib/google-calendar.service.ts` (520 lines)
**Core calendar operations service**
- Calendar event creation with Google Meet links
- Event updates/rescheduling
- Event cancellation
- OAuth token refresh
- Comprehensive error handling

Key methods:
- `createCalendarEvent()` - Create event in both calendars
- `updateCalendarEvent()` - Reschedule/modify event
- `cancelCalendarEvent()` - Delete event from calendars
- `refreshOAuthToken()` - Refresh expired tokens
- `getTokensFromAuthCode()` - Exchange auth code for tokens

### Data Layer

#### 2. `src/db/oauth-credentials.entity.ts` (80 lines)
**TypeORM entity for OAuth credentials**
- Stores access/refresh tokens
- Tracks token expiration
- Manages provider accounts
- Supports multiple OAuth providers (Google, GitHub, Microsoft)

#### 3. `src/db/oauth-credentials.repository.ts` (180 lines)
**Repository for database operations**
- CRUD operations for credentials
- Token update and refresh
- Expiration tracking
- Connection status checks

Key methods:
- `upsertCredentials()` - Create or update
- `getCredentials()` - Retrieve by provider
- `updateToken()` - Update after refresh
- `getExpiredCredentials()` - Find expired tokens

### Integration Layer

#### 4. `src/services/google-calendar-integration.service.ts` (350 lines)
**High-level integration service (recommended for use)**
- Automatic credential management
- Token refresh handling
- Booking workflow orchestration
- User-friendly error messages

Key methods:
- `createBooking()` - Create consultation booking
- `rescheduleBooking()` - Reschedule booking
- `cancelBooking()` - Cancel booking
- `connectGoogleCalendar()` - OAuth connection
- `disconnectGoogleCalendar()` - Revoke access
- `getConnectionStatus()` - Check connection

#### 5. `src/services/google-calendar.module.ts` (30 lines)
**NestJS module for dependency injection**
- Exports all services
- Registers with TypeORM
- Loads configuration

### Examples & Documentation

#### 6. `src/services/google-calendar.example.controller.ts` (450 lines)
**Example controller showing all use cases**
- Complete API endpoint implementations
- Request/response examples
- Error handling patterns
- Frontend integration guide

#### 7. `src/lib/GOOGLE_CALENDAR_INTEGRATION.md` (600+ lines)
**Comprehensive integration guide**
- Architecture overview
- Setup instructions
- Usage examples
- Error handling guide
- API reference
- Testing strategies
- Production deployment

### Database

#### 8. `src/migrations/1721727600000-CreateOAuthCredentialsTable.ts` (180 lines)
**Database migration**
- Creates oauth_credentials table
- Sets up indexes for performance
- Defines foreign key to users
- Creates ENUM type for providers

### User Entity Update

#### 9. `src/auth/user.entity.ts` (MODIFIED)
**Added relation**
- OneToMany relationship to OAuthCredentials
- Enables cascade delete

## Quick Start

### 1. Environment Setup

Add to `.env`:
```env
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_CALENDAR_REDIRECT_URL=http://localhost:3001/auth/google/callback
```

### 2. Import Module

In your app module:
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

### 3. Run Migration

```bash
npm run migration:run:dev
```

### 4. Use in Controller/Service

```typescript
import { GoogleCalendarIntegrationService } from './services/google-calendar-integration.service';

@Injectable()
export class BookingsService {
  constructor(
    private googleCalendar: GoogleCalendarIntegrationService
  ) {}

  async createConsultationBooking(
    userId: string,
    consultantEmail: string,
    bookingTime: Date
  ) {
    return this.googleCalendar.createBooking(
      userId,
      consultantEmail,
      {
        title: 'Consultation Call',
        startTime: bookingTime,
        endTime: new Date(bookingTime.getTime() + 3600000),
        timezone: 'America/New_York',
        conferenceType: 'googleMeet',
      }
    );
  }
}
```

## Architecture

```
Frontend
  ↓
Example Controller (REST API)
  ↓
GoogleCalendarIntegrationService (Business Logic)
  ├─ Auto token refresh
  ├─ Credential management
  └─ Error handling
  ↓
GoogleCalendarService (Core Operations)
  ├─ Calendar API calls
  ├─ Event management
  └─ OAuth flows
  ↓
OAuthCredentialsRepository (Data Access)
  ├─ Token storage/retrieval
  ├─ Expiration tracking
  └─ Provider management
  ↓
Database (PostgreSQL)
```

## Key Features

### 1. Automatic Token Refresh
- Checks token expiration before operations
- Refreshes if expiring within 5 minutes
- Updates database with new tokens
- Falls back gracefully if refresh fails

### 2. Multi-Calendar Support
- Creates events in consultant calendar
- Adds to user calendar if OAuth connected
- Handles independent failures gracefully
- Syncs across calendars

### 3. Google Meet Integration
- Automatically generates unique Meet links
- Adds conference data to events
- Proper conference solution format
- Attendee tracking

### 4. Error Handling
- 10+ specific error codes
- User-friendly error messages
- Automatic retry logic
- Comprehensive logging

### 5. Security
- Tokens stored securely in database
- Refresh tokens managed separately
- Credentials marked inactive after failures
- Scope tracking for audit

## API Endpoints

### Booking Operations
- `POST /api/v1/bookings` - Create booking
- `PUT /api/v1/bookings/:eventId` - Reschedule
- `DELETE /api/v1/bookings/:eventId` - Cancel

### Calendar Management
- `GET /api/v1/bookings/calendar/auth-url` - Get OAuth URL
- `POST /api/v1/bookings/calendar/callback` - Handle OAuth callback
- `GET /api/v1/bookings/calendar/status` - Check connection
- `POST /api/v1/bookings/calendar/disconnect` - Disconnect
- `GET /api/v1/bookings/calendar/connected` - Check if connected

## Error Codes

| Code | Status | Solution |
|------|--------|----------|
| `UNAUTHORIZED` | 401 | Reconnect Google Calendar |
| `FORBIDDEN` | 403 | Check calendar permissions |
| `NOT_FOUND` | 404 | Event may be deleted |
| `RATE_LIMIT` | 429 | Retry with backoff |
| `INVALID_TIMES` | 400 | Verify time range |
| `TIME_IN_PAST` | 400 | Event must be future |
| `MISSING_REFRESH_TOKEN` | 400 | Reconnect OAuth |

## Database Schema

```sql
CREATE TABLE oauth_credentials (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  provider ENUM('google', 'github', 'microsoft'),
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP,
  account_name VARCHAR,
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMP,
  error_message VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, provider)
);
```

## Testing

### Unit Test Example
```typescript
const mockService = {
  createBooking: jest.fn().mockResolvedValue({
    eventId: 'test-123',
    meetingLink: 'https://meet.google.com/test',
  }),
};

// Use in tests
const result = await mockService.createBooking(userId, email, details);
```

### Integration Test
```bash
# Requires Google Cloud project with OAuth setup
npm run test:integration
```

## Production Deployment

### Pre-deployment Checklist

- [ ] Environment variables configured
- [ ] Database migration run
- [ ] Google Cloud project created
- [ ] OAuth credentials configured
- [ ] OAuth redirect URI registered
- [ ] Rate limiting configured
- [ ] Token refresh cron job set up (optional)

### Monitoring

Track:
- Failed token refreshes
- Authorization errors
- Rate limit encounters
- Event creation failures
- Token expiration patterns

### Cron Job (Optional)

Auto-cleanup expired credentials:
```typescript
@Cron('0 2 * * *')
async cleanupExpiredCredentials() {
  const expired = await this.oauthRepository.getExpiredCredentials();
  // Clean up
}
```

## Migration Notes

### From Previous Implementation
If migrating from another calendar system:

1. Create oauth_credentials table (migration included)
2. Map old credentials to new format
3. Test token refresh before migration
4. Keep old system as fallback during transition

### Rollback Plan
1. Keep oauth_credentials table inactive
2. Revert to previous calendar service
3. No data loss in oauth_credentials
4. User reconnect required to reactivate

## Support

### Common Issues

**Token keeps expiring?**
- Check database connectivity
- Verify refresh_token exists
- Check token expiration calculation

**Events not appearing in user calendar?**
- User may not have authorized
- Check OAuth scopes
- Verify account permissions

**Google Meet link generation failing?**
- Check Google API quota
- Verify OAuth token permissions
- Check network connectivity

### Debugging

Enable debug logging:
```typescript
// In main.ts
const logger = new Logger();
logger.debug('GoogleCalendar:', details);
```

Check logs:
```bash
# View recent errors
grep "GoogleCalendarError" logs/*.log
```

## File Manifest

| File | Lines | Purpose |
|------|-------|---------|
| google-calendar.service.ts | 520 | Core operations |
| google-calendar-integration.service.ts | 350 | High-level wrapper |
| oauth-credentials.entity.ts | 80 | Database entity |
| oauth-credentials.repository.ts | 180 | Data access layer |
| google-calendar.module.ts | 30 | NestJS module |
| google-calendar.example.controller.ts | 450 | Usage examples |
| CreateOAuthCredentialsTable migration | 180 | Database setup |
| GOOGLE_CALENDAR_INTEGRATION.md | 600+ | Full documentation |
| **TOTAL** | **~2,390** | **Complete integration** |

## Next Steps

1. **Set up Google Cloud Project**
   - Enable Google Calendar API
   - Create OAuth 2.0 credentials
   - Configure redirect URI

2. **Configure Environment**
   - Add .env variables
   - Run migration

3. **Import Module**
   - Add GoogleCalendarModule to app

4. **Create Endpoints**
   - Use example controller as template
   - Adapt to your data models
   - Add authentication/validation

5. **Test Integration**
   - Use provided examples
   - Test OAuth flow
   - Test booking creation

6. **Deploy**
   - Follow deployment checklist
   - Set up monitoring
   - Configure backups

## Support & Maintenance

### Regular Tasks
- Monitor token refresh failures
- Check API quota usage
- Review error logs
- Update dependencies

### Updates
- Sync with googleapis library updates
- Monitor Google API changes
- Update scopes as needed
- Test after updates

## License

Part of WISE² Core - All rights reserved
