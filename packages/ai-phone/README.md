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

### Phase 2: Carrier Integration (Next)
- [ ] Twilio integration
- [ ] WebSocket media stream
- [ ] Real call state tracking
- [ ] Call recording and transcription

### Phase 3: Production Features
- [ ] Real OpenAI voice integration
- [ ] Multi-tenant isolation
- [ ] Analytics and reporting
- [ ] Agent dashboard

### Phase 4: Advanced Capabilities
- [ ] Outbound dialer
- [ ] Conversation recording
- [ ] Custom model fine-tuning
- [ ] Advanced transfer logic

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
  acceptCall(callId: string): Promise<void>;
  transferCall(callId: string, destination: string): Promise<void>;
  endCall(callId: string): Promise<void>;
  // ... more methods
}
```

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
