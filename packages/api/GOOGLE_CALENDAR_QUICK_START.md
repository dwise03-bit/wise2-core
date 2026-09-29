# Google Calendar Integration - Quick Start

## 5-Minute Setup

### Step 1: Add Environment Variables
```env
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx
GOOGLE_CALENDAR_REDIRECT_URL=http://localhost:3001/auth/google/callback
```

### Step 2: Run Migration
```bash
npm run migration:run:dev
```

### Step 3: Import Module
```typescript
// app.module.ts
import { GoogleCalendarModule } from './services/google-calendar.module';

@Module({
  imports: [GoogleCalendarModule], // Add this
})
export class AppModule {}
```

### Step 4: Use in Your Service
```typescript
import { GoogleCalendarIntegrationService } from './services/google-calendar-integration.service';

@Injectable()
export class BookingsService {
  constructor(private googleCalendar: GoogleCalendarIntegrationService) {}

  async createBooking(userId: string, consultantEmail: string) {
    return this.googleCalendar.createBooking(userId, consultantEmail, {
      title: 'Consultation',
      startTime: new Date('2024-08-15T14:00:00Z'),
      endTime: new Date('2024-08-15T15:00:00Z'),
      timezone: 'America/New_York',
      conferenceType: 'googleMeet',
    });
  }
}
```

Done! ✅

## Common Operations

### Create Booking
```typescript
const result = await this.googleCalendar.createBooking(
  userId,                      // User ID
  'consultant@example.com',    // Consultant email
  {
    title: 'Strategy Session',
    description: 'Initial consultation',
    startTime: new Date('2024-08-15T14:00:00Z'),
    endTime: new Date('2024-08-15T15:00:00Z'),
    timezone: 'America/New_York',
    reminderMinutes: [15, 60],
    conferenceType: 'googleMeet',
  }
);

// Result contains:
// - eventId: 'event-123'
// - meetingLink: 'https://meet.google.com/abc-defg-hij'
// - calendarLink: 'https://calendar.google.com/...'
// - startTime, endTime
```

### Reschedule Booking
```typescript
await this.googleCalendar.rescheduleBooking(
  userId,
  eventId,                      // Event ID to reschedule
  'consultant@example.com',
  {
    startTime: new Date('2024-08-16T15:00:00Z'),
    endTime: new Date('2024-08-16T16:00:00Z'),
  }
);
```

### Cancel Booking
```typescript
await this.googleCalendar.cancelBooking(
  userId,
  eventId,
  'consultant@example.com',
  userEmail  // Optional: remove from user's calendar too
);
```

### Connect Google Calendar (OAuth)
```typescript
// 1. Get authorization URL
const authUrl = this.googleCalendar.getAuthorizationUrl();
// User clicks this link and authorizes

// 2. Handle authorization code
const result = await this.googleCalendar.connectGoogleCalendar(
  userId,
  authCode  // From OAuth redirect ?code=...
);
```

### Disconnect Google Calendar
```typescript
await this.googleCalendar.disconnectGoogleCalendar(userId);
```

### Check Connection Status
```typescript
const status = await this.googleCalendar.getConnectionStatus(userId);
// {
//   connected: true,
//   accountName: 'user@gmail.com',
//   expiresAt: Date,
//   isExpiringSoon: false
// }
```

## REST API Examples

### Create Booking
```bash
curl -X POST http://localhost:3001/api/v1/bookings \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "consultantEmail": "consultant@example.com",
    "title": "Consultation",
    "startTime": "2024-08-15T14:00:00Z",
    "endTime": "2024-08-15T15:00:00Z"
  }'
```

### Reschedule
```bash
curl -X PUT http://localhost:3001/api/v1/bookings/event-123 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "consultantEmail": "consultant@example.com",
    "startTime": "2024-08-16T15:00:00Z",
    "endTime": "2024-08-16T16:00:00Z"
  }'
```

### Get Auth URL
```bash
curl http://localhost:3001/api/v1/bookings/calendar/auth-url
# Returns: { "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?..." }
```

### Handle OAuth Callback
```bash
curl -X POST http://localhost:3001/api/v1/bookings/calendar/callback \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{ "code": "4/0AY-tzBw..." }'
```

### Check Connection
```bash
curl http://localhost:3001/api/v1/bookings/calendar/status \
  -H "Authorization: Bearer <token>"
# Returns: { "connected": true, "accountName": "user@gmail.com", ... }
```

## Error Handling

```typescript
import { GoogleCalendarError } from './lib/google-calendar.service';

try {
  await this.googleCalendar.createBooking(...);
} catch (error) {
  if (error instanceof GoogleCalendarError) {
    if (error.code === 'UNAUTHORIZED') {
      // User needs to reconnect
      const authUrl = this.googleCalendar.getAuthorizationUrl();
    } else if (error.code === 'RATE_LIMIT') {
      // Retry later
    } else if (error.code === 'TIME_IN_PAST') {
      // Validate input
    }
  }
}
```

## Frontend Integration

### Step 1: Get Authorization URL
```javascript
const response = await fetch('/api/v1/bookings/calendar/auth-url');
const { authUrl } = await response.json();
```

### Step 2: Redirect User
```javascript
// When user clicks "Connect Google Calendar"
window.location.href = authUrl;
```

### Step 3: Handle Redirect Back
```javascript
// After user approves, Google redirects to your app with ?code=...
const code = new URLSearchParams(window.location.search).get('code');
await fetch('/api/v1/bookings/calendar/callback', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ code })
});
```

### Step 4: Create Booking
```javascript
const response = await fetch('/api/v1/bookings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    consultantEmail: 'consultant@example.com',
    title: 'Strategy Call',
    startTime: '2024-08-15T14:00:00Z',
    endTime: '2024-08-15T15:00:00Z'
  })
});

const { eventId, meetingLink } = await response.json();
console.log(`Meeting link: ${meetingLink}`);
```

## Troubleshooting

### "UNAUTHORIZED" error
User's Google credentials expired or were revoked. Have them reconnect:
```typescript
const authUrl = this.googleCalendar.getAuthorizationUrl();
// Redirect user to authUrl
```

### "TIME_IN_PAST" error
Event must be at least 5 minutes in the future:
```typescript
const now = new Date();
const startTime = new Date(now.getTime() + 15 * 60000); // 15 min from now
```

### "MISSING_REFRESH_TOKEN" error
User authorized only for current session. Ask them to reconnect and choose "offline access":
- This is handled automatically by the OAuth flow

### Events not appearing in user's calendar
User may not have Google Calendar connected. Check:
```typescript
const connected = await this.googleCalendar.isGoogleCalendarConnected(userId);
if (!connected) {
  // Prompt user to connect
}
```

## Database Queries

### Get user's credentials
```sql
SELECT * FROM oauth_credentials 
WHERE user_id = '...' AND provider = 'google';
```

### Find expired tokens
```sql
SELECT * FROM oauth_credentials 
WHERE expires_at < NOW() AND is_active = true;
```

### Check last used
```sql
SELECT user_id, last_used_at 
FROM oauth_credentials 
WHERE provider = 'google'
ORDER BY last_used_at DESC;
```

## File Locations

```
packages/api/
├── src/
│   ├── lib/
│   │   ├── google-calendar.service.ts          ← Core service
│   │   └── GOOGLE_CALENDAR_INTEGRATION.md      ← Full docs
│   ├── db/
│   │   ├── oauth-credentials.entity.ts         ← Database entity
│   │   └── oauth-credentials.repository.ts     ← Data access
│   ├── services/
│   │   ├── google-calendar-integration.service.ts    ← Use this!
│   │   ├── google-calendar.module.ts                 ← Import this
│   │   └── google-calendar.example.controller.ts     ← Examples
│   └── migrations/
│       └── 1721727600000-CreateOAuthCredentialsTable.ts
├── GOOGLE_CALENDAR_SETUP.md          ← Detailed setup
└── GOOGLE_CALENDAR_QUICK_START.md    ← This file
```

## Development Checklist

- [ ] Google Cloud project created
- [ ] OAuth credentials obtained
- [ ] Environment variables set
- [ ] Migration run
- [ ] Module imported
- [ ] Service injected
- [ ] Endpoints created
- [ ] OAuth flow tested
- [ ] Booking creation tested
- [ ] Rescheduling tested
- [ ] Cancellation tested

## Next Steps

1. **Read** `GOOGLE_CALENDAR_SETUP.md` for detailed setup
2. **Review** `src/lib/GOOGLE_CALENDAR_INTEGRATION.md` for complete API docs
3. **Copy** examples from `google-calendar.example.controller.ts`
4. **Test** with provided examples
5. **Deploy** following production checklist

## Need Help?

Check these files in order:
1. `GOOGLE_CALENDAR_QUICK_START.md` (this file) - Quick reference
2. `GOOGLE_CALENDAR_SETUP.md` - Setup and common issues
3. `src/lib/GOOGLE_CALENDAR_INTEGRATION.md` - Complete documentation
4. `src/services/google-calendar.example.controller.ts` - Working examples
5. Inline code comments in service files

---

**TL;DR**: Import `GoogleCalendarModule`, inject `GoogleCalendarIntegrationService`, call `createBooking()`. Done! 🚀
