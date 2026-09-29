# Google Voice Integration Guide

## Overview

The Google Voice Provider enables Wise² AI Phone to handle telephone calls through Google Voice and Google Cloud Communications APIs. This guide covers setup, configuration, and usage.

## Features

- **Inbound Call Handling** — Accept and process incoming calls
- **Outbound Dialing** — Initiate calls to customers
- **Call Transfer** — Route calls to agents or destinations
- **Media Streaming** — Bidirectional audio via WebSocket
- **Recording & Transcription** — Automatic call recording with Google Cloud Speech-to-Text
- **Multi-Region Support** — Leverage Google's global infrastructure
- **OAuth2 Authentication** — Service account-based secure access

## Prerequisites

1. **Google Cloud Project** with the following APIs enabled:
   - Cloud Communications API (for real-time audio)
   - Cloud Speech-to-Text API (for transcription)
   - Cloud Storage API (for recordings)
   - Cloud Logging API (for monitoring)

2. **Service Account** with appropriate permissions:
   - roles/communication.admin
   - roles/storage.admin
   - roles/logging.logWriter

3. **Google Voice License** (if using Google Workspace)
   - Available with Business Standard, Business Plus, or Enterprise editions
   - Or use Google Cloud's communications services separately

## Setup Instructions

### 1. Create Google Cloud Project

```bash
gcloud projects create wise2-phone-project --name="Wise² Phone"
gcloud config set project wise2-phone-project
```

### 2. Enable Required APIs

```bash
gcloud services enable \
  communication.googleapis.com \
  speech.googleapis.com \
  storage-component.googleapis.com \
  logging.googleapis.com
```

### 3. Create Service Account

```bash
gcloud iam service-accounts create wise2-phone \
  --display-name="Wise² Phone Service"

gcloud iam service-accounts keys create ~/wise2-phone-key.json \
  --iam-account=wise2-phone@wise2-phone-project.iam.gserviceaccount.com

gcloud projects add-iam-policy-binding wise2-phone-project \
  --member=serviceAccount:wise2-phone@wise2-phone-project.iam.gserviceaccount.com \
  --role=roles/communication.admin

gcloud projects add-iam-policy-binding wise2-phone-project \
  --member=serviceAccount:wise2-phone@wise2-phone-project.iam.gserviceaccount.com \
  --role=roles/storage.admin
```

### 4. Set Environment Variables

```bash
# .env.local
GOOGLE_PROJECT_ID="wise2-phone-project"
GOOGLE_PRIVATE_KEY_ID="key-id-from-json"
GOOGLE_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----\n"
GOOGLE_CLIENT_EMAIL="wise2-phone@wise2-phone-project.iam.gserviceaccount.com"
GOOGLE_CLIENT_ID="123456789"
GOOGLE_PHONE_NUMBER="+1-555-0123"
GOOGLE_SERVICE_ACCOUNT_KEY="{full-json-content}"
```

## Usage

### Basic Setup

```typescript
import { GoogleVoiceProvider } from '@wise2/ai-phone';

const googleVoice = new GoogleVoiceProvider({
  projectId: process.env.GOOGLE_PROJECT_ID!,
  credentials: {
    type: 'service_account',
    project_id: process.env.GOOGLE_PROJECT_ID!,
    private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID!,
    private_key: process.env.GOOGLE_PRIVATE_KEY!,
    client_email: process.env.GOOGLE_CLIENT_EMAIL!,
    client_id: process.env.GOOGLE_CLIENT_ID!,
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL!,
  },
  phoneNumber: process.env.GOOGLE_PHONE_NUMBER!,
});
```

### Handling Incoming Calls

```typescript
import { CallSessionManager, ToolRegistry, VoiceOrchestrator } from '@wise2/ai-phone';

// Register incoming call
const callInfo = await googleVoice.incomingCall(
  'call_12345',
  '+1-555-9999', // Caller
  '+1-555-0123', // Our number
  'gv-call-abc' // Google Voice call ID
);

// Accept call
await googleVoice.acceptCall('call_12345');

// Start media stream for audio
await googleVoice.startMediaStream('call_12345', 'ws://localhost:3001/media/stream');

// Process conversation through orchestrator
const sessionManager = new CallSessionManager();
const session = sessionManager.createSession('call_12345', 'tenant-123', tools);

const { response, shouldTransfer } = await orchestrator.handleConversationTurn(
  session.sessionId,
  'Hi, I need to schedule an appointment'
);

if (shouldTransfer) {
  // Transfer to agent
  await googleVoice.transferCall('call_12345', '+1-555-0789');
}

// End call
await googleVoice.endCall('call_12345');
```

### Initiating Outbound Calls

```typescript
// Initiate outbound call
const callInfo = await googleVoice.initiateOutboundCall(
  'call_67890',
  '+1-555-0123', // From our number
  '+1-555-8888'  // To customer
);

// Process conversation (same as inbound)
```

### Recording and Transcription

```typescript
// Mark recording as started
googleVoice.recordingStarted('call_12345', 'rec_uuid_001');

// Get recording URL after call
const recording = await googleVoice.getRecording('call_12345');
console.log(`Recording: ${recording?.url}`);

// Mark transcript as ready
googleVoice.transcriptReady('call_12345', 'trans_uuid_001');

// Get transcript
const transcript = await googleVoice.getTranscript('call_12345');
console.log(`Transcript: ${transcript?.text}`);
```

## API Reference

### GoogleVoiceProvider

#### Constructor

```typescript
new GoogleVoiceProvider(config: GoogleVoiceConfig)
```

Configuration:
- `projectId` — Google Cloud project ID
- `credentials` — Service account credentials (Google format)
- `phoneNumber` — E.164 formatted phone number (e.g., '+1-555-0123')

#### Methods

**acceptCall(callId: string): Promise<void>**
- Accepts an incoming call
- Transitions state from 'ringing' to 'answered'

**rejectCall(callId: string): Promise<void>**
- Rejects an incoming call
- Ends the call without accepting

**startMediaStream(callId: string, wsUrl: string): Promise<void>**
- Starts WebSocket media stream for bidirectional audio
- `wsUrl` — WebSocket endpoint for audio streaming

**transferCall(callId: string, destination: string): Promise<void>**
- Transfers call to destination (number or extension)
- Transitions state to 'transferring'

**endCall(callId: string): Promise<void>**
- Ends the call
- Records duration and finalizes call state

**getCall(callId: string): Promise<CallInfo>**
- Returns current call information
- Includes state, duration, timestamps

**incomingCall(callId: string, from: string, to: string, googleCallId?: string): Promise<CallInfo>**
- Registers incoming call from webhook
- Returns call info with initial state

**initiateOutboundCall(callId: string, from: string, to: string): Promise<CallInfo>**
- Initiates outbound call
- Returns call info with queued state

**getRecording(callId: string): Promise<{recordingId, url} | null>**
- Retrieves recording URL from Cloud Storage
- Returns null if no recording

**getTranscript(callId: string): Promise<{transcriptId, text} | null>**
- Retrieves transcript generated by Speech-to-Text
- Returns null if not yet transcribed

**recordingStarted(callId: string, recordingId: string): void**
- Marks recording as started
- Updates call metadata

**transcriptReady(callId: string, transcriptId: string): void**
- Marks transcript as ready
- Updates call metadata

## Webhook Configuration

To receive incoming calls, configure Google Cloud Pub/Sub to route call events:

```typescript
import { Pubsub } from '@google-cloud/pubsub';

const pubsub = new PubSub({ projectId: process.env.GOOGLE_PROJECT_ID });
const subscription = pubsub.subscription('wise2-phone-events');

subscription.on('message', async (message) => {
  const event = JSON.parse(message.data.toString());

  if (event.type === 'INCOMING_CALL') {
    const callInfo = await googleVoice.incomingCall(
      event.callId,
      event.from,
      event.to,
      event.googleCallId
    );

    // Process incoming call
  }

  message.ack();
});
```

## Testing

Run the test suite:

```bash
pnpm test -- google-voice-provider.test.ts
```

Test coverage includes:
- Call registration
- Accept/reject logic
- Media streaming
- Call transfer
- Outbound calls
- Recording tracking
- Transcript tracking
- Error handling

## Monitoring and Logging

Google Voice calls are logged to Cloud Logging:

```typescript
import { Logging } from '@google-cloud/logging';

const logging = new Logging({ projectId: process.env.GOOGLE_PROJECT_ID });
const log = logging.log('wise2-phone');

// Logs are automatically written via console.log integration
// View in Cloud Logging console or with:
// gcloud logging read "logName:projects/wise2-phone-project/logs/wise2-phone"
```

## Troubleshooting

### No Access Token

**Error**: "Failed to obtain access token"

**Solution**: Verify service account credentials and ensure Cloud Communications API is enabled:

```bash
gcloud services enable communication.googleapis.com
```

### Call Not Connecting

**Error**: "Call fails to connect to WebSocket"

**Solution**: Ensure firewall allows WebSocket connections and check media stream handler logs.

### Recording Not Available

**Error**: "Recording not found in Cloud Storage"

**Solution**: Verify Cloud Storage bucket exists and service account has storage.admin role.

### Transcript Generation Slow

**Issue**: Transcripts take too long to generate

**Solution**: This is normal for long calls. Use async processing:

```typescript
// Poll for transcript availability
const pollTranscript = async (callId: string, maxAttempts = 30) => {
  for (let i = 0; i < maxAttempts; i++) {
    const transcript = await googleVoice.getTranscript(callId);
    if (transcript) return transcript;
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  return null;
};
```

## Production Checklist

- [ ] Service account created with minimal permissions
- [ ] Cloud APIs enabled
- [ ] Environment variables configured securely
- [ ] Webhook receiver implemented
- [ ] Monitoring and alerting configured
- [ ] Recording/transcription storage configured
- [ ] Error handling for failed calls
- [ ] Rate limiting implemented
- [ ] Compliance review completed (GDPR, CCPA, etc.)
- [ ] Load testing performed

## Support

For issues or questions:
1. Check Cloud Logging for detailed error messages
2. Review Google Cloud Communications API documentation
3. Run diagnostic tests with `pnpm test`
4. Contact support with call ID and timestamps

## Related Documentation

- [Cloud Communications API](https://cloud.google.com/communications)
- [Service Account Setup](https://cloud.google.com/iam/docs/service-accounts)
- [Cloud Speech-to-Text](https://cloud.google.com/speech-to-text)
- [Cloud Storage](https://cloud.google.com/storage)
- [Pub/Sub](https://cloud.google.com/pubsub)
