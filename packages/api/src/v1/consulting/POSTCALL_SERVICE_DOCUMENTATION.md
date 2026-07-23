# Post-Call Automation Service Documentation

## Overview

The Post-Call Automation Service (`PostCallSummaryService`) automatically processes consulting bookings after they complete, generating AI-powered summaries, extracting action items, and sending branded emails to users and consultants.

**Current Status**: Production-ready with full error handling and retry logic

## Architecture

```
Booking Completion
        ↓
[2-3 hour delay]
        ↓
CheckAndProcessPastBookings() [runs every 30 min]
        ↓
Queue Job: PROCESS_POST_CALL_SUMMARY
        ↓
processPostCallSummary()
    ├─ Fetch Google Meet recording
    ├─ Get transcript
    ├─ Generate AI summary (Claude)
    ├─ Store in database
    ├─ Send branded email to user
    ├─ Notify consultant
    └─ Mark as sent
```

## Features

### 1. Automatic Processing

- **Trigger**: Every 30 minutes, checks for completed bookings (2-3 hours after end time)
- **Scheduling**: Uses `@nestjs/schedule` with `@Interval` decorator
- **Queue**: Integrates with existing `QueueService` for reliable job processing

### 2. Recording & Transcript Fetching

```typescript
await fetchMeetingRecording(booking)
  ├─ Extract meeting ID from Google Meet link
  ├─ Search Google Drive for recording video
  └─ Fetch transcript (when Meet API available)
```

**Requirements**:
- Google service account credentials
- Google Calendar API + Drive API scopes
- Google Meet recordings saved to Google Drive

**Fallback**: Returns `null` if recording unavailable (continues with summary)

### 3. AI-Powered Summarization

Uses Claude 3.5 Sonnet via Anthropic API to generate:

- **Summary**: 2-3 sentence executive overview of key discussion points
- **Action Items**: 
  - Title
  - Description
  - Owner (user or consultant)
  - Due date
- **Follow-up Date**: Recommended date for next session

**Prompt Engineering**: Custom prompt tailored for consulting context

```typescript
const response = await this.anthropic.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 1024,
  messages: [{
    role: 'user',
    content: prompt // Uses booking + transcript context
  }]
})
```

### 4. Database Storage

**Schema** (Prisma models):

```prisma
model PostCallSummary {
  id            String   @id @default(cuid())
  bookingId     String   @unique
  booking       Booking  @relation(...)
  recordingUrl  String?
  transcript    String?
  summary       String
  followUpDate  DateTime?
  followUpNotes String?
  sentAt        DateTime?
  createdAt     DateTime @default(now())
  actionItems   ActionItem[]
}

model ActionItem {
  id          String   @id @default(cuid())
  summaryId   String
  summary     PostCallSummary @relation(...)
  title       String
  description String?
  owner       String?  // "user" or "consultant"
  dueDate     DateTime?
  completed   Boolean  @default(false)
}
```

### 5. Branded Email to User

**Template Features**:
- Gradient header with session overview
- Executive summary with quoted styling
- Formatted action items with owners and due dates
- Quick action buttons:
  - "View on Dashboard" (links to booking details)
  - "Watch Recording" (links to Google Drive)
  - "Schedule Follow-up" (links to booking calendar)
- Professional footer with support link

**Example**:
```
📋 Post-Call Summary
Session Overview
- Consultant: Jane Smith
- Service: AI Strategy Consulting
- Date: July 23, 2024 at 2:00 PM
- Duration: 1 hour

Summary
"Key discussion points about AI implementation roadmap, identified three priority areas for technical stack evaluation..."

Action Items
• Finalize tech stack selection (Owner: User, Due: 7/30/2024)
• Create proof-of-concept implementation (Owner: Consultant, Due: 8/6/2024)

[View on Dashboard] [Watch Recording] [Schedule Follow-up]
```

### 6. Consultant Notification

**Purpose**: Keep consultant informed of summary generation

**Content**:
- Client name and email
- Service name
- Session date
- Key takeaways (top 3 action items)
- Link to full summary in dashboard

### 7. Error Handling & Retry Logic

**Retry Strategy**:
- Max retries: 3 attempts
- Exponential backoff via queue service
- Detailed error logging

**Graceful Degradation**:
- If recording not found: Continues without it
- If transcript unavailable: Uses booking notes
- If AI summary fails: Returns fallback summary
- If email fails: Logs error but doesn't block completion

**Error Logging** (structured):
```typescript
this.logger.error('❌ Failed to process post-call summary', {
  bookingId,
  error: error.message,
  stack: error.stack
})
```

## API Endpoints

All endpoints require JWT authentication.

### Get Post-Call Summary
```http
GET /v1/consulting/post-call/:bookingId
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "id": "summary_123",
    "bookingId": "booking_456",
    "recordingUrl": "https://drive.google.com/...",
    "summary": "Discussion focused on...",
    "followUpDate": "2024-08-06T00:00:00Z",
    "actionItems": [
      {
        "id": "action_1",
        "title": "Complete proposal",
        "owner": "user",
        "dueDate": "2024-07-30T00:00:00Z",
        "completed": false
      }
    ],
    "sentAt": "2024-07-23T18:00:00Z"
  }
}
```

### Get Action Item Statistics
```http
GET /v1/consulting/post-call/:bookingId/stats
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "total": 5,
    "completed": 2,
    "remaining": 3,
    "completionPercentage": 40,
    "userOwned": 3,
    "consultantOwned": 2,
    "overdueDates": [
      {
        "id": "action_2",
        "title": "Review materials",
        "dueDate": "2024-07-22T00:00:00Z"
      }
    ]
  }
}
```

### Mark Action Item Completed
```http
PATCH /v1/consulting/post-call/action-items/:actionItemId/complete
```

**Response**:
```json
{
  "status": "success",
  "message": "Action item marked as completed"
}
```

### Update Action Item
```http
PATCH /v1/consulting/post-call/action-items/:actionItemId
```

**Request Body**:
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "owner": "consultant",
  "dueDate": "2024-08-15T00:00:00Z",
  "completed": false
}
```

### Trigger Manual Processing (Testing)
```http
PATCH /v1/consulting/post-call/:bookingId/process
```

**Response**:
```json
{
  "status": "success",
  "message": "Post-call processing initiated"
}
```

## Configuration

### Environment Variables

```bash
# Anthropic API
ANTHROPIC_API_KEY=sk-ant-...

# Google Service Account (for Calendar + Drive API)
GOOGLE_SERVICE_ACCOUNT_KEY='{
  "type": "service_account",
  "project_id": "wise2-project",
  "private_key_id": "...",
  "private_key": "...",
  "client_email": "...",
  "client_id": "...",
  "auth_uri": "...",
  "token_uri": "...",
  "auth_provider_x509_cert_url": "...",
  "client_x509_cert_url": "..."
}'

# Frontend URL for links in emails
FRONTEND_URL=https://wise2.io

# Email service
SENDGRID_API_KEY=SG.xxx... (when integrated)
```

### Database Schema

Run migrations after creating `PostCallSummary` and `ActionItem` models:

```bash
cd packages/db
npx prisma migrate dev --name add_post_call_summary
npx prisma generate
```

## Usage Examples

### 1. Automatic Processing (Default)

The service runs automatically every 30 minutes via the scheduler:

```typescript
@Interval(30 * 60 * 1000) // Every 30 minutes
async checkForCompletedBookings(): Promise<void>
```

### 2. Manual Trigger (Testing/Admin)

```bash
curl -X PATCH \
  http://localhost:3000/v1/consulting/post-call/booking_123/process \
  -H 'Authorization: Bearer jwt_token'
```

### 3. Service Injection (For Custom Workflows)

```typescript
@Injectable()
export class CustomWorkflow {
  constructor(private postCallService: PostCallSummaryService) {}

  async handleCustomEvent(bookingId: string) {
    // Get summary
    const summary = await this.postCallService.getPostCallSummary(bookingId);
    
    // Mark action items as done
    for (const item of summary.actionItems) {
      if (shouldComplete(item)) {
        await this.postCallService.completeActionItem(item.id);
      }
    }
  }
}
```

### 4. Monitoring Completion

```typescript
// Check stats for a booking
const stats = await this.postCallService.getActionItemStats(bookingId);

console.log(`
  Completion: ${stats.completionPercentage}%
  Remaining: ${stats.remaining} items
  Overdue: ${stats.overdueDates.length} items
`);
```

## Integration Points

### With Existing Services

1. **ConsultingService**: Uses booking data, updates booking status
2. **EmailService**: Sends branded emails to users and consultants
3. **QueueService**: Handles job queuing and retry logic
4. **PrismaService**: Database access for all operations
5. **ConfigService**: Reads environment variables

### External APIs

1. **Google Calendar API**: Fetch meeting details and calendar events
2. **Google Drive API**: Search for and retrieve recordings
3. **Anthropic Claude API**: AI summarization and action item extraction
4. **SendGrid/EmailService**: Email delivery (when configured)

## Monitoring & Logging

### Log Format

```
✅ Post-call email sent to user@example.com
❌ Failed to process post-call summary for booking_123
🔄 Processing post-call summary for booking_123
📹 Fetching Google Meet recording...
🤖 Generating AI summary with Claude...
💾 Storing summary in database...
```

### Key Metrics to Track

1. **Processing Success Rate**: % of bookings with successful summaries
2. **Average Processing Time**: Time from booking end to summary delivery
3. **Error Rate**: Failed processing attempts
4. **Email Delivery Rate**: Successfully sent emails
5. **Action Item Completion Rate**: % of items completed

### Integration with Monitoring Tools

```typescript
// Example: Send metrics to Datadog
await datadog.gauge('postcall.processing_time', duration);
await datadog.increment('postcall.summaries_created');
await datadog.gauge('postcall.error_rate', errorCount / totalAttempts);
```

## Security Considerations

1. **API Key Management**:
   - Store in `.env.local` (not git)
   - Rotate regularly
   - Use least-privilege scopes

2. **Google Credentials**:
   - Service account only (not user credentials)
   - Restricted to required APIs
   - Audit logs enabled

3. **Database Access**:
   - Encrypted at rest (RDS)
   - Encrypted in transit (SSL)
   - Row-level security via userId

4. **Email Security**:
   - Use SendGrid API (not SMTP)
   - Enable security headers
   - Validate email addresses

## Troubleshooting

### Issue: Summaries not being processed

**Check**:
1. Is scheduler running? `logger.log('📅 Post-Call Scheduler initialized')`
2. Are bookings marked as `status: 'completed'`?
3. Is `checkAndProcessPastBookings()` finding bookings?

**Solution**:
```bash
# Manually trigger for a specific booking
curl -X PATCH http://localhost:3000/v1/consulting/post-call/booking_123/process
```

### Issue: Google Drive search returns no results

**Causes**:
- Recording not saved to Drive yet (takes 1-2 hours)
- Service account lacks Drive API scope
- Meeting link format incorrect

**Solution**:
1. Check Google Drive for video files manually
2. Verify service account scopes: `https://www.googleapis.com/auth/drive.readonly`
3. Verify meeting link format: `https://meet.google.com/abc-defg-hij`

### Issue: Claude API returning 401 Unauthorized

**Check**:
- `ANTHROPIC_API_KEY` is valid and not expired
- API key is for correct organization
- Rate limits not exceeded

**Solution**:
```bash
# Test API key
curl https://api.anthropic.com/v1/models \
  -H "x-api-key: $ANTHROPIC_API_KEY"
```

### Issue: Emails not sending

**Check**:
1. Is `EmailService` configured with SendGrid?
2. Is `FRONTEND_URL` set correctly?
3. Are recipient emails valid?

**Solution**:
- For now, emails are logged to console (see `email.service.ts`)
- Integrate with SendGrid when ready

## Performance Optimization

### Current Design

- **Interval**: 30 minutes (configurable)
- **Database queries**: Indexed on `startTime`, `status`, `bookingId`
- **API calls**: Parallel fetching (recording + transcript)
- **Processing**: Async, non-blocking

### Optimization Opportunities

1. **Batch Processing**: Process multiple bookings in parallel
2. **Caching**: Cache Claude responses for similar sessions
3. **Webhook Integration**: Trigger immediately when booking completes
4. **Lazy Transcript Loading**: Fetch transcript only if needed

## Future Enhancements

1. **Improved Transcript**:
   - Native Google Meet API integration
   - Automatic speech-to-text for non-Google Meet calls
   - Timestamp-based highlights

2. **Enhanced Summaries**:
   - Custom prompt templates per service type
   - Multi-language support
   - Sentiment analysis

3. **Action Item Features**:
   - Automated reminders via email/SMS
   - Calendar event creation
   - Slack/Discord integration

4. **Analytics Dashboard**:
   - Post-call summary trends
   - Action item completion rates
   - Consultant performance metrics

5. **Compliance**:
   - GDPR data retention policies
   - SOC 2 audit trail
   - Redaction of sensitive information

## Support & Maintenance

### Regular Tasks

- Monitor error logs daily
- Review completion rates weekly
- Update Claude model when new versions available
- Audit Google API scopes quarterly

### Contact

- Developer: WISE² Team
- Documentation: This file
- Issues: GitHub issues tracker
- Support: support@wise2.io

---

**Last Updated**: July 23, 2024  
**Version**: 1.0  
**Status**: Production Ready
