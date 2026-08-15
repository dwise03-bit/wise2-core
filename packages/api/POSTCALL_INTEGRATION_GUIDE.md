# Post-Call Service Integration Guide

## Quick Start

This guide walks through integrating the Post-Call Automation Service into your WISE² Core API.

## Files Created

```
packages/api/src/v1/consulting/
├── postcall.service.ts           (Main service - 550 lines)
├── postcall.controller.ts        (REST endpoints - 80 lines)
├── postcall.scheduler.ts         (Job scheduler - 80 lines)
├── POSTCALL_SERVICE_DOCUMENTATION.md
└── consulting.module.ts          (Updated with PostCallService)

packages/api/src/
└── queue/queue.service.ts        (Updated with JobType enum)

packages/api/src/v1/email/
└── email.service.ts              (Updated with sendPostCallSummary method)
```

## Step 1: Install Dependencies

The service uses these already-installed packages:

```bash
npm list @anthropic-ai/sdk googleapis date-fns date-fns-tz
```

If missing:

```bash
cd packages/api
npm install @anthropic-ai/sdk googleapis date-fns date-fns-tz
```

Also ensure NestJS schedule is installed:

```bash
npm list @nestjs/schedule
# If missing:
npm install @nestjs/schedule
```

## Step 2: Configure Environment Variables

Add to `.env` or `.env.local`:

```bash
# Anthropic API (for Claude)
ANTHROPIC_API_KEY=sk-ant-...

# Google Service Account (JSON format)
GOOGLE_SERVICE_ACCOUNT_KEY='{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "service-account@your-project.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}'

# Frontend URL (for dashboard links in emails)
FRONTEND_URL=https://wise2.io
```

### Getting Google Service Account Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a service account:
   - **IAM & Admin** → **Service Accounts** → **Create Service Account**
   - Name: `wise2-postcall-processor`
3. Add roles:
   - Google Calendar API - Read-only
   - Google Drive API - Read-only
4. Create key:
   - Keys → **Add Key** → **Create new key** → JSON
   - Download the JSON file
   - Convert to single-line string for `GOOGLE_SERVICE_ACCOUNT_KEY`
5. Share Google Drive folder with service account email
6. Enable APIs:
   - Enable **Google Calendar API**
   - Enable **Google Drive API**

### Getting Anthropic API Key

1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Navigate to **API Keys**
3. Create new key: **Generate API Key**
4. Copy to `ANTHROPIC_API_KEY`

## Step 3: Update Database Schema

The service uses existing models. Verify your Prisma schema has:

```prisma
// In packages/db/prisma/schema.prisma

model PostCallSummary {
  id            String   @id @default(cuid())
  bookingId     String   @unique
  booking       Booking  @relation(fields: [bookingId], references: [id], onDelete: Cascade)
  recordingUrl  String?  @db.Text
  transcript    String?  @db.Text
  summary       String   @db.Text
  followUpDate  DateTime?
  followUpNotes String?  @db.Text
  sentAt        DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  actionItems   ActionItem[]
  @@index([bookingId])
}

model ActionItem {
  id          String          @id @default(cuid())
  summaryId   String
  summary     PostCallSummary @relation(fields: [summaryId], references: [id], onDelete: Cascade)
  title       String
  description String?         @db.Text
  owner       String?         // "user" or "consultant"
  dueDate     DateTime?
  completed   Boolean         @default(false)
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt
  @@index([summaryId])
}
```

If missing, add these models and run migration:

```bash
cd packages/db
npx prisma migrate dev --name add_post_call_summary
npx prisma generate
```

## Step 4: Enable NestJS Schedule in App Module

In `packages/api/src/app.module.ts`:

```typescript
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot(), // Add this line
    ConsultingModule,
    // ... other modules
  ],
})
export class AppModule {}
```

## Step 5: Update Consulting Module

The module is already updated to export `PostCallScheduler`. Verify:

```typescript
// packages/api/src/v1/consulting/consulting.module.ts

import { PostCallScheduler } from './postcall.scheduler';

@Module({
  controllers: [ConsultingController, PostCallController],
  providers: [
    ConsultingService,
    PostCallSummaryService,
    PostCallScheduler, // ✅ Added
    // ...
  ],
})
```

## Step 6: Update Booking Completion Workflow

When a booking transitions to `completed` status, ensure the `meetingLink` is stored:

```typescript
// In consulting.service.ts or wherever bookings are completed

await this.prisma.booking.update({
  where: { id: bookingId },
  data: {
    status: 'completed',
    meetingLink: 'https://meet.google.com/abc-defg-hij', // Important!
  },
});
```

If using Google Calendar for scheduling, extract meeting link from calendar event:

```typescript
// After booking is scheduled, fetch calendar event
const event = await calendar.events.get({
  calendarId: 'primary',
  eventId: eventId,
});

const meetingLink = event.data.conferenceData?.entryPoints?.[0].uri;

await this.prisma.booking.update({
  where: { id: bookingId },
  data: { meetingLink },
});
```

## Step 7: Test the Integration

### Start the Application

```bash
cd packages/api
npm run start:dev
```

### Check Logs

Watch for scheduler initialization:

```
[NestFactory] Starting Nest application...
📅 Post-Call Scheduler initialized
✅ Google Calendar API initialized
```

### Manual Test

1. Create a test booking:

```bash
curl -X POST http://localhost:3000/v1/consulting/bookings \
  -H 'Authorization: Bearer jwt_token' \
  -H 'Content-Type: application/json' \
  -d '{
    "userId": "user_123",
    "serviceId": "service_456",
    "consultantId": "consultant_789",
    "startTime": "2024-07-22T14:00:00Z",
    "durationHours": 1
  }'
```

2. Mark booking as completed:

```bash
# Update booking status in database or via API
UPDATE bookings SET status = 'completed' WHERE id = 'booking_123';
```

3. Trigger post-call processing manually:

```bash
curl -X PATCH http://localhost:3000/v1/consulting/post-call/booking_123/process \
  -H 'Authorization: Bearer jwt_token'
```

4. Check database:

```sql
SELECT * FROM "PostCallSummary" WHERE "bookingId" = 'booking_123';
SELECT * FROM "ActionItem" WHERE "summaryId" IN (...);
```

### Monitor Logs

The service logs at each step:

```
🔄 Processing post-call summary for booking: booking_123
📹 Fetching Google Meet recording...
🤖 Generating AI summary with Claude...
💾 Storing summary in database...
📧 Sending branded email to user...
🔔 Notifying consultant...
✅ Post-call summary completed for booking: booking_123
```

## Step 8: Production Deployment

### Docker Setup

Update `Dockerfile.api` to include new environment variables:

```dockerfile
ENV ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
ENV GOOGLE_SERVICE_ACCOUNT_KEY=${GOOGLE_SERVICE_ACCOUNT_KEY}
ENV FRONTEND_URL=${FRONTEND_URL}
```

### Docker Compose

Add to `docker-compose.prod.yml`:

```yaml
services:
  api:
    environment:
      ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}
      GOOGLE_SERVICE_ACCOUNT_KEY: ${GOOGLE_SERVICE_ACCOUNT_KEY}
      FRONTEND_URL: ${FRONTEND_URL}
```

### Deploy

```bash
# Build
docker build -f Dockerfile.api -t wise2-api:latest .

# Push to registry
docker push wise2-api:latest

# Deploy
docker-compose -f docker-compose.prod.yml up -d api
```

## Step 9: Set Up SendGrid (Optional but Recommended)

For real email sending instead of console logging:

1. Get SendGrid API key from [SendGrid Console](https://app.sendgrid.com/)
2. Add to `.env`:

```bash
SENDGRID_API_KEY=SG.xxx...
```

3. Update `email.service.ts`:

```typescript
import * as sgMail from '@sendgrid/mail';

@Injectable()
export class EmailService {
  private sgMail = sgMail;

  constructor(private configService: ConfigService) {
    this.sgMail.setApiKey(this.configService.get('SENDGRID_API_KEY'));
  }

  protected async _send(email: {
    to: string;
    subject: string;
    template: string;
  }) {
    await this.sgMail.send({
      to: email.to,
      from: 'noreply@wise2.io',
      subject: email.subject,
      html: email.template,
    });
  }
}
```

## Monitoring & Alerting

### Key Metrics

Set up monitoring for:

1. **Processing Success Rate**:
   - Query: `SELECT COUNT(*) WHERE "sentAt" IS NOT NULL / total bookings`
   - Alert if < 95%

2. **Processing Time**:
   - Query: `SELECT AVG(EXTRACT(EPOCH FROM ("sentAt" - "endTime"))) / 3600 FROM "PostCallSummary" JOIN "Booking" ...`
   - Alert if > 4 hours average

3. **Error Rate**:
   - Monitor logs for `❌ Failed to process`
   - Alert if > 5 errors per hour

### Example Prometheus Query

```promql
rate(postcall_processing_errors_total[5m]) > 0.1
```

## Troubleshooting

### "Google Calendar API not initialized"

**Cause**: Invalid service account credentials

**Fix**:
1. Verify `GOOGLE_SERVICE_ACCOUNT_KEY` is valid JSON
2. Check service account has Calendar and Drive scopes
3. Restart application

### "Claude API returned 401 Unauthorized"

**Cause**: Invalid or expired API key

**Fix**:
1. Verify `ANTHROPIC_API_KEY` is correct
2. Check API key hasn't been rotated
3. Verify rate limits not exceeded

### "No recording found in Google Drive"

**Cause**: Recording not saved yet (takes 1-2 hours after meeting ends)

**Fix**:
1. Check recording exists in Google Drive manually
2. Increase delay before post-call processing (modify scheduler interval)
3. Implement retry logic in queue service

### "Emails not sending"

**Cause**: EmailService not configured for real delivery

**Fix**:
1. Integrate SendGrid (see Step 9)
2. Check console logs for email content
3. Verify email addresses are valid

## API Documentation

See `src/v1/consulting/POSTCALL_SERVICE_DOCUMENTATION.md` for:
- Detailed endpoint documentation
- Request/response examples
- Error codes and handling
- Integration patterns

## Next Steps

1. **Test thoroughly** with test bookings
2. **Monitor logs** for the first week
3. **Gather user feedback** on email quality
4. **Optimize prompts** based on consultant feedback
5. **Add analytics** dashboard for post-call metrics

## Support

For issues or questions:
- Check logs: `docker logs wise2-api | grep PostCall`
- Review documentation: `POSTCALL_SERVICE_DOCUMENTATION.md`
- Contact team: support@wise2.io

---

**Integration Version**: 1.0  
**Last Updated**: July 23, 2024  
**Status**: Ready for Production Deployment
