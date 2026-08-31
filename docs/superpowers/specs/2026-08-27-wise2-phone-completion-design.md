# WISE² Phone Completion Design

**Date:** 2026-08-27
**Branch:** `spec/wise2-phone-completion`
**Status:** Approved design awaiting written-spec review

## Goal

Complete the existing WISE² AI Phone System in `wise2-core` without replacing healthy infrastructure. The finished system must support real-time inbound/outbound SIP calls, local/free-model speech recognition and reasoning, real CRM/scheduling tool execution, Daniel's authorized voice profile with an honest fallback state, human handoff, operational dashboards, truthful health reporting, and end-to-end verification.

## Current Repository State

The repository already contains:

- `apps/phone-gateway/` with Asterisk ARI integration, call orchestration, STT, LLM, and TTS services.
- `apps/api/src/modules/phone/` for phone API/module integration.
- `packages/ai-phone/` documentation and deployment material.
- `docker-compose.phone.yml` and phone Dockerfiles.
- Prisma phone models for calls, transcripts, summaries, appointments, consent, opt-out, phone providers, campaigns, and related entities.
- Hermes/Ollama integration in the existing WISE² API.
- Asterisk deployment guidance and phone-system audit/build-status documentation.

The design extends this work instead of starting a separate project.

## Non-Goals

- Do not rebuild WISE² CRM.
- Do not replace Hermes/Ollama with a hosted per-minute AI platform.
- Do not depend on consumer Google Voice for automated call handling.
- Do not fake provider connectivity, successful appointments, voice enrollment, call state, recordings, or health status.
- Do not introduce dangerous HVAC troubleshooting workflows that instruct customers to bypass safeties, work live electrical circuits, or handle refrigerant.

## Architecture

Production call flow:

```text
PSTN
  ↓
SIP DID / SIP Trunk
  ↓
Asterisk 22 LTS
  ↓
WISE² Phone Gateway
  ├── call state + media bridge
  ├── VAD / barge-in
  ├── local STT
  ├── Hermes/Ollama
  ├── WISE² CRM + scheduling tools
  ├── voice/TTS provider abstraction
  └── metrics + event logging
  ↓
Asterisk
  ↓
Caller
```

Google Voice remains manual/compatibility-only. It is not the automation transport.

## Component Boundaries

### 1. Telephony / Asterisk Layer

Responsibilities:

- inbound and outbound call lifecycle
- SIP trunk interaction
- ARI/External Media/AudioSocket media bridge, using whichever existing implementation proves stable
- DTMF
- transfer and hangup
- recording hooks
- RTP/media format normalization

The PBX must not contain business logic that belongs in WISE² application services.

### 2. Realtime Media Layer

Responsibilities:

- receive caller audio
- decode telephony audio
- resample once for STT
- VAD and endpoint detection
- interruption/barge-in detection
- cancel queued TTS/audio immediately when caller speech starts
- stream synthesized audio back toward Asterisk

Target interruption reaction is under 250 ms where infrastructure permits it.

### 3. STT Layer

Primary implementation should remain local, using `faster-whisper` or the repository's current local Whisper service.

Requirements:

- telephone audio support
- streaming or near-streaming partials where practical
- confidence/result metadata
- clear health state
- no fabricated transcription success

### 4. Conversation / Hermes Layer

Reuse existing Hermes/Ollama infrastructure.

Responsibilities:

- phone-specific system instructions
- intent detection
- safe HVAC intake
- conversational memory for the current call
- structured tool calls
- caller corrections and context updates
- concise call summaries

The spoken agent must identify itself as Daniel's/Wise²'s AI assistant when appropriate and must not claim to literally be Daniel.

### 5. CRM / Scheduling Tool Layer

Replace current stubs with real adapters to existing WISE² services.

Required capabilities:

- customer search/create/update
- lead creation
- service request/work-order creation
- appointment availability lookup
- appointment create/reschedule/cancel
- dispatch notification
- call record creation/completion
- summary persistence
- human-transfer or callback request

No spoken confirmation of an action may occur until the underlying tool returns success.

### 6. Daniel Voice Layer

Canonical voice profile:

`daniel_wise_primary`

The uploaded recording is the approved starting reference. The original file must be preserved unmodified.

Voice states must be explicit and truthful:

- `REFERENCE_UPLOADED`
- `REFERENCE_PROCESSED`
- `VOICE_MODEL_TRAINING`
- `VOICE_READY`
- `VOICE_TESTING`
- `VOICE_ACTIVE`
- `VOICE_FAILED`
- `FALLBACK_ACTIVE`

The system must not show `VOICE_ACTIVE` until actual synthesis through the Daniel profile passes validation.

A generic WISE² fallback voice must be available and must not impersonate Daniel.

### 7. Consent / Recording Layer

Recording must be policy-driven and disabled or withheld when consent requirements are not met.

Requirements:

- configurable recording policy
- consent event persistence
- encrypted/protected recording metadata/storage path
- transcript storage controls
- no false statement that recording is active

### 8. Outbound Calls

Support authorized workflows only:

- missed-call callback
- appointment reminder
- estimate follow-up
- maintenance reminder
- customer-requested callback

The system must honor opt-out, DNC/business policy, business hours, and applicable consent constraints.

### 9. Human Handoff

Support:

- warm transfer
- cold transfer
- callback request
- dispatch escalation
- supervisor escalation

Triggers include explicit human requests, repeated AI misunderstanding, safety issues, billing disputes, angry callers, high-value commercial leads, or low confidence.

### 10. Phone Dashboard

Add/complete `/phone` within the existing WISE² dashboard rather than creating an unrelated admin site.

Views:

- Live calls
- Call history
- Call detail/transcript
- Daniel voice status
- System health
- Latency/quality metrics
- Google Voice compatibility status

Health labels must be limited to truthful states such as:

- `ONLINE`
- `OFFLINE`
- `DEGRADED`
- `NOT_CONFIGURED`

### 11. Observability

Required structured events include:

- `CALL_STARTED`
- `CALL_CONNECTED`
- `STT_READY`
- `USER_SPEECH`
- `AI_RESPONSE_START`
- `TTS_START`
- `TTS_END`
- `CALL_INTERRUPTED`
- `CRM_TOOL_CALL`
- `APPOINTMENT_CREATED`
- `HUMAN_TRANSFER`
- `CALL_ENDED`
- `VOICE_PROVIDER_ERROR`
- `TELEPHONY_ERROR`

Required latency metrics:

- speech-end to STT completion
- STT to first LLM token
- LLM to first TTS audio
- speech-end to first audible AI response

## Failure Handling

The system must degrade honestly.

Examples:

- CRM unavailable → collect caller details and create a retryable local call outcome/task; do not say the CRM update succeeded.
- Scheduling unavailable → offer team follow-up; do not invent appointment availability.
- Daniel voice unavailable → switch to fallback and log `FALLBACK_ACTIVE`.
- STT/TTS failure → apologize briefly and retry or route to human according to policy.
- SIP/media disconnect → terminate/cleanup call state and persist failure reason.

## Security

Requirements:

- no secrets in frontend code
- signed/authenticated webhook or realtime endpoints
- protected ARI/management interfaces
- SIP toll-fraud controls
- RBAC for phone administration
- PII-aware logs
- encrypted/protected recordings and transcripts
- rate limiting
- input validation
- no anonymous SIP exposure

## Testing Strategy

Use TDD for new behavior where practical.

Minimum automated scenarios:

1. new customer inbound call
2. existing customer lookup
3. no-cooling workflow
4. no-heat workflow
5. appointment availability lookup
6. successful booking
7. scheduling failure without false confirmation
8. CRM failure without false confirmation
9. caller interruption/barge-in
10. explicit human-transfer request
11. repeated misunderstanding escalation
12. gas/smoke/electrical safety triage
13. Daniel voice unavailable fallback
14. STT failure
15. TTS failure
16. SIP/media disconnect cleanup
17. consent/recording behavior
18. outbound appointment reminder
19. caller address correction
20. explicit "Are you Daniel?" identity response

Verification levels:

### Local Voice Test

Microphone → VAD/STT → Hermes → tools/mock integration → TTS → speaker.

### SIP Test

Softphone → Asterisk → WISE² Phone Gateway → two-way AI conversation.

### Production Test

PSTN → SIP DID → Asterisk → WISE² → real CRM/scheduling → voice → caller.

No production readiness claim is allowed until the appropriate level has actually passed.

## Deployment Strategy

Preserve existing WISE² deployment patterns.

Expected deliverables include:

- updated phone Docker/services where needed
- Asterisk integration configuration
- `.env.phone.example`
- health checks
- migration changes only when required
- startup/restart/status/test scripts
- graceful shutdown and retry behavior

Avoid unnecessary changes to unrelated services.

## External Dependencies / Blockers

Potential genuine blockers that may remain after code completion:

- SIP carrier account/DID credentials
- production Asterisk host networking/firewall configuration
- final Daniel voice model/provider if local cloning quality is insufficient
- business-specific recording/consent policy configuration

These blockers must be reported precisely; they must not prevent completing all code and local/SIP-ready work that does not require them.

## Definition of Done

The phone completion work is done only when the system can, at the verified readiness level:

1. connect a call
2. receive caller audio
3. detect speech/endpointing
4. transcribe locally
5. send context to Hermes/Ollama
6. execute real WISE² tool calls
7. speak a response
8. stop speaking when interrupted
9. identify or create the customer as appropriate
10. check real schedule availability
11. create a real appointment only after confirmed tool success
12. escalate to a human
13. persist the call record and concise summary
14. honor consent/recording settings
15. expose truthful dashboard/health state
16. recover cleanly from service/provider failures

Final readiness labels are limited to:

- `WISE² PHONE: READY FOR LOCAL TESTING`
- `WISE² PHONE: READY FOR SIP TESTING`
- `WISE² PHONE: READY FOR PRODUCTION`
- `WISE² PHONE: BLOCKED`

Each status must be backed by actual test evidence.
