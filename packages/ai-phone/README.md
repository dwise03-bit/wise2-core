# Wise2 AI Phone

AI-powered receptionist system for service businesses. Handles inbound calls, customer identification, appointment booking, and human transfer logic.

## Architecture

### Core Components

- **CallSessionManager** — Manages call state machine and session lifecycle
- **ToolRegistry** — Defines and executes AI tools (customer lookup, booking, etc.)
- **VoiceOrchestrator** — Orchestrates conversation flow with AI model
- **Provider Interfaces** — Pluggable implementations for CRM, scheduler, voice model, etc.

### Provider-Neutral Design

```
VoiceOrchestrator
├── VoiceModelProvider (OpenAI, Twilio, etc.)
├── CRMProvider (Salesforce, HubSpot, custom)
├── SchedulerProvider (Calendly, custom)
├── TelephonyProvider (Twilio, Vonage, etc.)
└── NotificationProvider (Twilio SMS, SendGrid, etc.)
```

## Production: Asterisk PJSIP + Twilio BYOC

For production deployment with Twilio Bring Your Own Carrier (BYOC):

```bash
# Deploy Asterisk configuration
sudo cp config/pjsip.conf /etc/asterisk/
sudo cp config/sorcery.conf /etc/asterisk/

# Configure Twilio credentials
sudo sed -i "s/TWILIO_ACCOUNT_SID/your_account_sid/" /etc/asterisk/pjsip.conf
sudo sed -i "s/TWILIO_AUTH_TOKEN/your_auth_token/" /etc/asterisk/pjsip.conf

# Restart Asterisk
sudo systemctl restart asterisk

# Verify registration
asterisk -rx "pjsip show registrations"
# Expected: twilio | Registered | twilio-endpoint
```

**Key Documents:**
- **[DEPLOYMENT.md](DEPLOYMENT.md)** — Full production deployment guide (30 min)
- **[TWILIO_BYOC_SETUP.md](TWILIO_BYOC_SETUP.md)** — Detailed Twilio BYOC setup
- **[SORCERY_FIX_SUMMARY.md](SORCERY_FIX_SUMMARY.md)** — Technical explanation of Asterisk sorcery registration fix
- **[scripts/verify-twilio-byoc.sh](scripts/verify-twilio-byoc.sh)** — Automated diagnostics

**Configuration Files:**
- `config/pjsip.conf` — Asterisk PJSIP + Twilio BYOC configuration
- `config/sorcery.conf` — Sorcery object mappings (registration fix)

## Getting Started

### Installation

```bash
pnpm add @wise2/ai-phone
```

### Basic Usage

```typescript
import {
  CallSessionManager,
  CRMMock,
  SchedulerMock,
  ToolRegistry,
  VoiceOrchestrator,
  VoiceModelMock,
} from '@wise2/ai-phone';

// Initialize providers
const crm = new CRMMock();
const scheduler = new SchedulerMock();
const voiceModel = new VoiceModelMock();

// Create managers
const sessionManager = new CallSessionManager();
const toolRegistry = new ToolRegistry(crm, scheduler);
const orchestrator = new VoiceOrchestrator(voiceModel, sessionManager, toolRegistry);

// Start a call
const session = sessionManager.createSession(callId, tenantId, toolRegistry.getTools());

// Process user message
const { response, shouldTransfer } = await orchestrator.handleConversationTurn(
  session.sessionId,
  'Hi, I need to schedule an appointment'
);

// End call
sessionManager.endSession(session.sessionId, 'completed');
const summary = sessionManager.getSummary(session.sessionId);
```

## API Server

The package includes an Express server for testing and integration:

```bash
pnpm dev
```

### Endpoints

#### Initialize Call
```bash
POST /calls/init
Body: { tenantId?: string, fromNumber: string }
Returns: { callId, sessionId }
```

#### Send Message
```bash
POST /calls/:sessionId/message
Body: { message: string }
Returns: { response, shouldTransfer, state }
```

#### Get Session Summary
```bash
GET /calls/:sessionId/summary
Returns: { summary }
```

#### End Call
```bash
POST /calls/:sessionId/end
Body: { disposition?: string }
Returns: { summary }
```

#### Test Scripted Conversation
```bash
POST /test/conversation
Body: { conversation: string[], tenantId?: string }
Returns: { sessionId, conversation: Array<{userMessage, response, transfer}>, summary }
```

## Tool System

Available tools for AI to execute:

### identify_customer
Look up customer by phone number.
```typescript
{ phone: "+15551234567" }
→ { id, fullName, email, ... }
```

### create_lead
Create sales lead from inbound call.
```typescript
{ customerId, intent, priority? }
→ { id, customerId, stage, ... }
```

### check_availability
Check appointment slots.
```typescript
{ serviceType, date }
→ [{ start, end, technician }, ...]
```

### create_booking
Book appointment (requires confirmation).
```typescript
{ customerId, serviceType, startTime, endTime }
→ { id, confirmationNumber, ... }
```

### request_transfer
Request transfer to human agent.
```typescript
{ reason }
→ { status: "transfer_requested" }
```

### record_consent
Record consent for communication.
```typescript
{ phone, channel, purpose }
→ { id, status, capturedAt, ... }
```

## Session State Machine

```
queued → ringing → answered → in-progress → {completed|failed}
                                    ↓
                            transferring → completed
```

## Call Session Context

Tracks during conversation:
- `intent` — Customer's service need
- `isExistingCustomer` — Known customer?
- `requiresTransfer` — Should transfer to agent?
- `verificationLevel` — Identity verification status
- `attemptCount` — Failed tool attempts (transfer at > 3)
- `silenceCount` — Consecutive silent moments (transfer at > 2)

## Testing

### Run All Tests
```bash
pnpm test
```

### Run Demo
```bash
pnpm dev
# Then run the test harness in another terminal
```

### Test Scripted Conversations
```bash
curl -X POST http://localhost:3001/test/conversation \
  -H "Content-Type: application/json" \
  -d '{
    "conversation": [
      "Hi, I need to schedule an appointment",
      "Yes, general consultation",
      "Is Thursday at 9 AM available?",
      "Perfect, book me then"
    ]
  }'
```

## Roadmap

### Phase 1: Local Testing ✅
- [x] Session state machine
- [x] Mock CRM and scheduler
- [x] AI conversation loop
- [x] Tool execution system
- [x] Express test server

### Phase 2: Carrier Integration ✅
- [x] Twilio integration
- [x] Google Voice integration
- [x] WebSocket media stream
- [x] Real call state tracking
- [x] Call recording and transcription

### Phase 3: Production Features
- [x] Real OpenAI voice integration (chat + Whisper + TTS; mock fallback)
- [x] Multi-tenant isolation
- [x] Analytics and reporting
- [x] Agent dashboard (Business OS + iOS)

### Phase 4: Advanced Capabilities
- [ ] Outbound dialer
- [x] Conversation recording
- [ ] Custom model fine-tuning
- [x] Advanced transfer logic

## Telephony Providers

Wise² Phone supports multiple telephony carriers:

### Twilio
```typescript
import { TwilioProvider } from '@wise2/ai-phone';

const twilio = new TwilioProvider({
  accountSid: process.env.TWILIO_ACCOUNT_SID!,
  authToken: process.env.TWILIO_AUTH_TOKEN!,
  phoneNumber: '+1-555-0123',
});
```

### Google Voice
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
  phoneNumber: '+1-555-0456',
});
```

## Provider Interfaces

Implement these to swap providers:

### CRMProvider
```typescript
interface CRMProvider {
  lookupCustomer(phone: string): Promise<Customer | null>;
  createCustomer(data: Partial<Customer>): Promise<Customer>;
  createLead(data: Partial<Lead>): Promise<Lead>;
  createBooking(data: Partial<Booking>): Promise<Booking>;
  recordConsent(data: Partial<ConsentEvent>): Promise<ConsentEvent>;
  // ... more methods
}
```

### VoiceModelProvider
```typescript
interface VoiceModelProvider {
  chat(
    sessionId: string,
    systemPrompt: string,
    messages: ChatMessage[],
    tools: ToolDefinition[]
  ): Promise<AIResponse>;
  transcribe(audioBuffer: Buffer): Promise<string>;
  synthesize(text: string): Promise<Buffer>;
}
```

### TelephonyProvider
```typescript
interface TelephonyProvider {
  readonly name: string;
  acceptCall(callId: string): Promise<void>;
  rejectCall(callId: string): Promise<void>;
  startMediaStream(callId: string, wsUrl: string): Promise<void>;
  transferCall(callId: string, destination: string): Promise<void>;
  endCall(callId: string): Promise<void>;
  getCall(callId: string): Promise<CallInfo>;
}
```

Each provider (Twilio, Google Voice, etc.) implements this interface for carrier-independent call handling.

## Development

### Project Structure
```
src/
├── types.ts              # All TypeScript interfaces
├── call-session.ts       # Session state machine
├── crm-mock.ts          # Mock CRM implementation
├── scheduler-mock.ts    # Mock scheduler
├── tool-registry.ts     # Tool definitions & execution
├── voice-orchestrator.ts # Conversation orchestration
├── voice-model-mock.ts  # Mock AI model
├── main.ts              # Express server entry point
├── test-harness.ts      # Test framework
└── index.ts             # Public exports
```

### Build
```bash
pnpm build
```

### Type Checking
```bash
pnpm type-check
```

## License

Proprietary — Wise2 Genesis
