# WISE² Phone Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the existing WISE² AI phone stack so it can pass local voice testing, SIP testing, and eventually production PSTN verification without fake integrations or status.

**Architecture:** Extend the existing `apps/phone-gateway` and `apps/api/src/modules/phone` code rather than replacing them. Asterisk remains the telephony edge; the phone gateway owns realtime media/VAD/STT/Hermes/TTS orchestration; the WISE² API owns CRM/scheduling persistence and business actions; the dashboard reads truthful operational state from those services.

**Tech Stack:** TypeScript/Node.js, Asterisk 22 LTS, ARI/external media, Whisper/faster-whisper, Hermes/Ollama, local TTS with Daniel voice abstraction, PostgreSQL/Prisma, Redis, Docker Compose, existing WISE² web/API stack.

**Spec:** `docs/superpowers/specs/2026-08-27-wise2-phone-completion-design.md`

## Global Constraints

- Preserve existing WISE² infrastructure and conventions; do not rebuild CRM or replace Hermes/Ollama with a hosted per-minute AI platform.
- Consumer Google Voice is compatibility/manual-only and must not be used as the automated telephony transport.
- Canonical authorized voice profile is `daniel_wise_primary`.
- Never report `VOICE_ACTIVE`, a booked appointment, a recording, a call connection, or a healthy integration until the underlying operation actually succeeds.
- Human handoff must remain available.
- Do not provide dangerous HVAC bypass/live-electrical/refrigerant instructions through the phone agent.
- Use TDD for each new behavior and commit after each independently testable task.
- Final readiness labels are restricted to `WISE² PHONE: READY FOR LOCAL TESTING`, `WISE² PHONE: READY FOR SIP TESTING`, `WISE² PHONE: READY FOR PRODUCTION`, or `WISE² PHONE: BLOCKED`.

---

## File Structure Map

Existing files to extend:

- `apps/phone-gateway/src/asterisk/ari-client.ts` — Asterisk call control and media integration.
- `apps/phone-gateway/src/conversation/call-orchestrator.ts` — call state machine and turn orchestration.
- `apps/phone-gateway/src/services/stt.service.ts` — local STT adapter.
- `apps/phone-gateway/src/services/llm.service.ts` — Hermes/Ollama and structured tool calling.
- `apps/phone-gateway/src/services/tts.service.ts` — TTS and voice selection.
- `apps/phone-gateway/src/index.ts` — gateway API, health, WebSocket/event exposure.
- `apps/api/src/modules/phone/` — WISE² phone business/API integration.
- `packages/db/prisma/schema.prisma` — phone persistence models already present.
- `docker-compose.phone.yml` — local/service topology.

New focused files planned:

- `apps/phone-gateway/src/media/media-session.ts` — bidirectional call media session abstraction.
- `apps/phone-gateway/src/media/vad.service.ts` — endpointing and barge-in detection.
- `apps/phone-gateway/src/media/audio-codec.ts` — µ-law/PCM conversion and one-time resampling boundary.
- `apps/phone-gateway/src/tools/wise2-tool-client.ts` — typed gateway-to-WISE² API action client.
- `apps/phone-gateway/src/voice/voice-profile.ts` — voice state/type definitions.
- `apps/phone-gateway/src/voice/daniel-voice.service.ts` — Daniel profile/fallback state management.
- `apps/phone-gateway/src/metrics/phone-metrics.ts` — structured event and latency measurement.
- `apps/api/src/modules/phone/services/phone-tool.service.ts` — real CRM/scheduling/dispatch action execution.
- `apps/api/src/modules/phone/controllers/phone-tools.controller.ts` — authenticated internal tool API for gateway calls.
- `apps/api/src/modules/phone/services/recording-policy.service.ts` — policy/consent decision logic.
- `apps/api/src/modules/phone/services/outbound-policy.service.ts` — opt-out/business-hours authorization.
- `apps/phone-gateway/test/` and `apps/api/src/modules/phone/**/*.spec.ts` — new regression coverage.

---

### Task 1: Make phone health truthful and typed

**Files:**
- Create: `apps/phone-gateway/src/health/phone-health.ts`
- Modify: `apps/phone-gateway/src/index.ts`
- Test: `apps/phone-gateway/test/phone-health.test.ts`

**Interfaces:**
- Consumes: existing service `health()` methods or connection state from ARI/STT/LLM/TTS.
- Produces: `PhoneHealthSnapshot` and `buildPhoneHealth(deps): PhoneHealthSnapshot` used by `/health` and the dashboard.

- [ ] **Step 1: Write the failing health-state test**

```ts
import { buildPhoneHealth } from '../src/health/phone-health';

test('reports not_configured instead of online when SIP is absent', async () => {
  const result = await buildPhoneHealth({
    asterisk: async () => 'online',
    sip: async () => 'not_configured',
    stt: async () => 'online',
    llm: async () => 'online',
    tts: async () => 'online',
    voice: async () => 'REFERENCE_UPLOADED',
    crm: async () => 'online',
    scheduling: async () => 'online',
  });
  expect(result.status).toBe('degraded');
  expect(result.sip).toBe('not_configured');
});
```

- [ ] **Step 2: Run the single test and confirm failure**

Run: `npm test -- phone-health.test.ts`

Expected: FAIL because `buildPhoneHealth` does not exist.

- [ ] **Step 3: Implement the typed snapshot**

```ts
export type ComponentState = 'online' | 'offline' | 'degraded' | 'not_configured';
export type VoiceState = 'REFERENCE_UPLOADED' | 'REFERENCE_PROCESSED' | 'VOICE_MODEL_TRAINING' | 'VOICE_READY' | 'VOICE_TESTING' | 'VOICE_ACTIVE' | 'VOICE_FAILED' | 'FALLBACK_ACTIVE';

export interface PhoneHealthSnapshot {
  status: 'ok' | 'degraded' | 'down';
  asterisk: ComponentState;
  sip: ComponentState;
  stt: ComponentState;
  llm: ComponentState;
  tts: ComponentState;
  crm: ComponentState;
  scheduling: ComponentState;
  voice: VoiceState;
}
```

`buildPhoneHealth` must calculate `ok` only when required configured components are online; any `not_configured`/`degraded` yields `degraded`; any required `offline` yields `down`.

- [ ] **Step 4: Wire `/health` to the real snapshot and run tests**

Run: `npm test -- phone-health.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/phone-gateway/src/health apps/phone-gateway/src/index.ts apps/phone-gateway/test/phone-health.test.ts
git commit -m "feat(phone): add truthful component health"
```

---

### Task 2: Add realtime media session, codec boundary, and barge-in

**Files:**
- Create: `apps/phone-gateway/src/media/audio-codec.ts`
- Create: `apps/phone-gateway/src/media/vad.service.ts`
- Create: `apps/phone-gateway/src/media/media-session.ts`
- Modify: `apps/phone-gateway/src/asterisk/ari-client.ts`
- Modify: `apps/phone-gateway/src/conversation/call-orchestrator.ts`
- Test: `apps/phone-gateway/test/media-session.test.ts`

**Interfaces:**
- Produces: `MediaSession.pushInbound(frame)`, `MediaSession.play(stream)`, `MediaSession.cancelPlayback()`, `VadService.observe(frame): VadEvent | null`.
- Consumes: Asterisk media frames and TTS output chunks.

- [ ] **Step 1: Write a failing barge-in test**

```ts
test('caller speech cancels active TTS playback', async () => {
  const cancel = vi.fn();
  const session = createTestMediaSession({ cancelPlayback: cancel });
  session.setSpeaking(true);
  await session.onVadEvent({ type: 'speech_start', atMs: 120 });
  expect(cancel).toHaveBeenCalledTimes(1);
  expect(session.state).toBe('LISTENING');
});
```

- [ ] **Step 2: Run test and confirm failure**

Run: `npm test -- media-session.test.ts`

Expected: FAIL because realtime media session/VAD interfaces are absent.

- [ ] **Step 3: Implement codec and VAD boundaries**

Implement `decodeMulawToPcm16`, `encodePcm16ToMulaw`, and a `VadService` that emits `speech_start`, `speech_end`, and `silence_timeout`. Resample exactly once before STT.

- [ ] **Step 4: Implement `MediaSession` cancellation semantics**

`cancelPlayback()` must clear queued audio and call the Asterisk media playback stop/cancel primitive; `speech_start` while `SPEAKING` must transition to `INTERRUPTED` then `LISTENING`.

- [ ] **Step 5: Wire Asterisk media events to `CallOrchestrator`**

Use the existing ARI implementation where stable; do not replace call control unnecessarily. Ensure hangup closes media session and removes timers/listeners.

- [ ] **Step 6: Run media tests**

Run: `npm test -- media-session.test.ts`

Expected: PASS including cancellation and cleanup.

- [ ] **Step 7: Commit**

```bash
git add apps/phone-gateway/src/media apps/phone-gateway/src/asterisk/ari-client.ts apps/phone-gateway/src/conversation/call-orchestrator.ts apps/phone-gateway/test/media-session.test.ts
git commit -m "feat(phone): add realtime media and barge-in"
```

---

### Task 3: Harden local STT and Hermes turn streaming

**Files:**
- Modify: `apps/phone-gateway/src/services/stt.service.ts`
- Modify: `apps/phone-gateway/src/services/llm.service.ts`
- Modify: `apps/phone-gateway/src/conversation/call-orchestrator.ts`
- Test: `apps/phone-gateway/test/speech-turn.test.ts`

**Interfaces:**
- Produces: `STTService.transcribeTurn(audio): Promise<TranscriptionResult>` and streaming LLM callback/async iterator returning first-token timing.
- Consumes: normalized PCM from Task 2.

- [ ] **Step 1: Write a failing transcription failure test**

```ts
test('does not emit fake transcript when local STT fails', async () => {
  const stt = new STTService({ endpoint: 'http://127.0.0.1:1' });
  await expect(stt.transcribeTurn(Buffer.from([0, 0]))).rejects.toThrow();
});
```

- [ ] **Step 2: Write a failing first-token test**

```ts
test('records LLM first token without waiting for full response', async () => {
  const events: string[] = [];
  await llm.streamReply('hello', token => events.push(token));
  expect(events.length).toBeGreaterThan(0);
});
```

- [ ] **Step 3: Implement explicit STT result contract**

```ts
export interface TranscriptionResult {
  text: string;
  confidence?: number;
  startedAt: number;
  completedAt: number;
}
```

Never synthesize fallback transcript text on failure.

- [ ] **Step 4: Stream Hermes/Ollama output into TTS chunking**

Begin sentence/chunk synthesis before the full LLM answer completes while preserving structured tool-call detection.

- [ ] **Step 5: Run turn tests and existing service tests**

Run: `npm test -- speech-turn.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add apps/phone-gateway/src/services/stt.service.ts apps/phone-gateway/src/services/llm.service.ts apps/phone-gateway/src/conversation/call-orchestrator.ts apps/phone-gateway/test/speech-turn.test.ts
git commit -m "feat(phone): harden local speech and Hermes streaming"
```

---

### Task 4: Replace CRM/scheduling tool stubs with real WISE² actions

**Files:**
- Create: `apps/phone-gateway/src/tools/wise2-tool-client.ts`
- Create: `apps/api/src/modules/phone/services/phone-tool.service.ts`
- Create: `apps/api/src/modules/phone/controllers/phone-tools.controller.ts`
- Modify: `apps/api/src/modules/phone/phone.module.ts`
- Modify: `apps/phone-gateway/src/services/llm.service.ts`
- Test: `apps/api/src/modules/phone/services/phone-tool.service.spec.ts`
- Test: `apps/phone-gateway/test/tool-confirmation.test.ts`

**Interfaces:**
- Produces internal authenticated actions: `customer.search`, `customer.create`, `lead.create`, `service.create`, `appointment.availability`, `appointment.create`, `appointment.reschedule`, `appointment.cancel`, `dispatch.notify`, `call.complete`, `callback.create`.
- Gateway consumes `ToolResult<T> = { ok: true; data: T } | { ok: false; code: string; message: string }`.

- [ ] **Step 1: Write a failing false-confirmation regression test**

```ts
test('does not tell caller an appointment is booked when tool fails', async () => {
  toolClient.execute = vi.fn().mockResolvedValue({ ok: false, code: 'SCHEDULING_OFFLINE', message: 'offline' });
  const reply = await orchestrator.handleToolCall({ name: 'appointment.create', arguments: {} });
  expect(reply.spokenText).not.toMatch(/booked|you.re set/i);
  expect(reply.spokenText).toMatch(/team|scheduling/i);
});
```

- [ ] **Step 2: Implement typed internal tool transport**

Use existing WISE² authentication conventions. Do not expose unauthenticated action endpoints.

- [ ] **Step 3: Implement service methods using existing CRM/scheduling repositories/services**

Each method must return explicit success/failure and persist call context IDs where applicable.

- [ ] **Step 4: Wire LLM tool names to the real client**

Remove/log-only production stubs. Preserve test doubles only inside tests or explicit simulation mode.

- [ ] **Step 5: Run API and gateway tests**

Run: `npm test -- phone-tool.service.spec.ts tool-confirmation.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add apps/phone-gateway/src/tools apps/phone-gateway/src/services/llm.service.ts apps/api/src/modules/phone apps/phone-gateway/test/tool-confirmation.test.ts
git commit -m "feat(phone): execute real CRM and scheduling tools"
```

---

### Task 5: Implement Daniel voice profile state machine and safe fallback

**Files:**
- Create: `apps/phone-gateway/src/voice/voice-profile.ts`
- Create: `apps/phone-gateway/src/voice/daniel-voice.service.ts`
- Modify: `apps/phone-gateway/src/services/tts.service.ts`
- Modify: `apps/phone-gateway/src/index.ts`
- Test: `apps/phone-gateway/test/daniel-voice.test.ts`

**Interfaces:**
- Produces: `DanielVoiceService.getState(): VoiceState`, `synthesize(text): AsyncIterable<Buffer>`, `activateAfterValidation(validation): Promise<void>`.
- Consumes: configured TTS provider and processed authorized reference/model path.

- [ ] **Step 1: Write failing activation and fallback tests**

```ts
test('cannot report VOICE_ACTIVE before synthesis validation succeeds', async () => {
  const voice = new DanielVoiceService(failingProvider);
  await expect(voice.activateAfterValidation()).rejects.toThrow();
  expect(voice.getState()).not.toBe('VOICE_ACTIVE');
});

test('uses generic fallback when Daniel synthesis fails', async () => {
  const voice = new DanielVoiceService(failingProvider, fallbackProvider);
  await collect(voice.synthesize('hello'));
  expect(voice.getState()).toBe('FALLBACK_ACTIVE');
});
```

- [ ] **Step 2: Implement the exact voice states from the spec**

Persist/derive state from real reference/model readiness and validation results.

- [ ] **Step 3: Add the disclosure behavior to the phone prompt**

For direct identity questions, return a transparent response equivalent to: `I'm Daniel's WISE² AI assistant.` Never return `Yes, this is Daniel.`

- [ ] **Step 4: Add voice status to health API and run tests**

Run: `npm test -- daniel-voice.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/phone-gateway/src/voice apps/phone-gateway/src/services/tts.service.ts apps/phone-gateway/src/index.ts apps/phone-gateway/test/daniel-voice.test.ts
git commit -m "feat(phone): add Daniel voice state and fallback"
```

---

### Task 6: Enforce recording consent and outbound-call policy

**Files:**
- Create: `apps/api/src/modules/phone/services/recording-policy.service.ts`
- Create: `apps/api/src/modules/phone/services/outbound-policy.service.ts`
- Modify: `apps/api/src/modules/phone/phone.module.ts`
- Modify: `apps/phone-gateway/src/conversation/call-orchestrator.ts`
- Test: `apps/api/src/modules/phone/services/recording-policy.service.spec.ts`
- Test: `apps/api/src/modules/phone/services/outbound-policy.service.spec.ts`

**Interfaces:**
- Produces: `canRecord(callContext): RecordingDecision` and `canPlaceOutbound(request): OutboundDecision`.
- Consumes: Consent, OptOut, business-hours, and campaign/callback records already represented in Prisma models.

- [ ] **Step 1: Write failing consent tests**

```ts
test('withholds recording when required consent is absent', async () => {
  const decision = await service.canRecord({ consentRequired: true, consentGranted: false });
  expect(decision.allowed).toBe(false);
});
```

- [ ] **Step 2: Write failing opt-out test**

```ts
test('blocks outbound call for opted-out customer', async () => {
  const decision = await service.canPlaceOutbound({ phone: '+15551234567' });
  expect(decision.allowed).toBe(false);
  expect(decision.reason).toBe('OPTED_OUT');
});
```

- [ ] **Step 3: Implement policy services backed by existing DB models**

No call recording or outbound dial should begin before the policy result is allowed.

- [ ] **Step 4: Wire decisions into inbound recording hooks and outbound origination**

Persist consent events/decisions and explicit blocked reasons.

- [ ] **Step 5: Run policy tests**

Run: `npm test -- recording-policy.service.spec.ts outbound-policy.service.spec.ts`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add apps/api/src/modules/phone/services apps/api/src/modules/phone/phone.module.ts apps/phone-gateway/src/conversation/call-orchestrator.ts
git commit -m "feat(phone): enforce consent and outbound policy"
```

---

### Task 7: Add human handoff, metrics, and deterministic call cleanup

**Files:**
- Create: `apps/phone-gateway/src/metrics/phone-metrics.ts`
- Modify: `apps/phone-gateway/src/asterisk/ari-client.ts`
- Modify: `apps/phone-gateway/src/conversation/call-orchestrator.ts`
- Modify: `apps/phone-gateway/src/index.ts`
- Test: `apps/phone-gateway/test/handoff-cleanup.test.ts`
- Test: `apps/phone-gateway/test/phone-metrics.test.ts`

**Interfaces:**
- Produces: `transfer(callId, target, mode)`, `requestCallback(callId, reason)`, `recordEvent(name, fields)`, latency timers for speech→STT→LLM→TTS.

- [ ] **Step 1: Write failing explicit-human-request test**

```ts
test('explicit human request bypasses further AI troubleshooting', async () => {
  const result = await orchestrator.handleTranscript('I want to talk to a person');
  expect(result.nextAction).toBe('HUMAN_TRANSFER');
});
```

- [ ] **Step 2: Write failing disconnect-cleanup test**

```ts
test('media disconnect closes timers and persists failure reason', async () => {
  await orchestrator.onMediaDisconnect('RTP_TIMEOUT');
  expect(orchestrator.state).toBe('ENDED');
  expect(callRepository.complete).toHaveBeenCalledWith(expect.objectContaining({ failureReason: 'RTP_TIMEOUT' }));
});
```

- [ ] **Step 3: Implement handoff modes and trigger routing**

Support warm transfer, cold transfer, callback request, dispatch escalation, and supervisor escalation. Treat explicit human request as immediate unless safety policy requires a concise warning first.

- [ ] **Step 4: Implement required structured events and latency metrics**

Record: `CALL_STARTED`, `CALL_CONNECTED`, `STT_READY`, `USER_SPEECH`, `AI_RESPONSE_START`, `TTS_START`, `TTS_END`, `CALL_INTERRUPTED`, `CRM_TOOL_CALL`, `APPOINTMENT_CREATED`, `HUMAN_TRANSFER`, `CALL_ENDED`, `VOICE_PROVIDER_ERROR`, `TELEPHONY_ERROR`.

- [ ] **Step 5: Run handoff/metrics tests**

Run: `npm test -- handoff-cleanup.test.ts phone-metrics.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add apps/phone-gateway/src/metrics apps/phone-gateway/src/asterisk/ari-client.ts apps/phone-gateway/src/conversation/call-orchestrator.ts apps/phone-gateway/src/index.ts apps/phone-gateway/test
git commit -m "feat(phone): add handoff metrics and call cleanup"
```

---

### Task 8: Complete `/phone` operations UI and Google Voice compatibility state

**Files:**
- Locate existing dashboard route before implementation and modify that app's `/phone` route/components.
- Consume: gateway `/health`, live-call events, call history/detail API, voice state, latency metrics.
- Test: use the repository's existing frontend test framework for the discovered dashboard app.

**Interfaces:**
- Displays only `ONLINE`, `OFFLINE`, `DEGRADED`, `NOT_CONFIGURED` for service health.
- Google Voice panel must state manual/compatibility-only and automated forwarding unsupported.

- [ ] **Step 1: Identify the existing WISE² dashboard package and its routing/test conventions**

Run repository search for existing `/phone`, navigation definitions, and dashboard app package scripts before editing. Do not create a second admin application.

- [ ] **Step 2: Write failing UI tests for truthful health and Daniel voice state**

Test that SIP `not_configured` renders `NOT CONFIGURED` and `REFERENCE_UPLOADED` does not render `ACTIVE`.

- [ ] **Step 3: Implement Live Calls, History, Call Detail, Voice, System Health, Metrics views**

Use existing WISE² components/styles. Hide/disable actions the backend reports unavailable rather than simulating success.

- [ ] **Step 4: Add Google Voice compatibility panel**

Render: human/manual use available, automated AI forwarding unsupported, dedicated SIP DID recommended.

- [ ] **Step 5: Run frontend unit/build tests**

Run the discovered dashboard package test command and production build command.

Expected: tests PASS and build exits 0.

- [ ] **Step 6: Commit**

```bash
git add <discovered-dashboard-path>
git commit -m "feat(phone): complete phone operations dashboard"
```

---

### Task 9: Deployment scripts, env contract, and local/SIP verification harness

**Files:**
- Modify: `docker-compose.phone.yml`
- Create or update: `.env.phone.example`
- Modify: `scripts/deploy-phone-system.sh`
- Modify: `scripts/deploy-phone-system-automated.sh`
- Create: `scripts/phone-health.sh`
- Create: `scripts/phone-test-local.sh`
- Create: `scripts/phone-test-sip.sh`
- Modify: `docs/phone-system/BUILD_STATUS.md`

**Interfaces:**
- Local test exits 0 only after VAD/STT/Hermes/TTS loop succeeds.
- SIP test exits 0 only after Asterisk registration/media path and test extension flow succeed.

- [ ] **Step 1: Add a config-validation test/script that fails on missing required local variables**

Required local variables include actual Hermes/Ollama, STT, TTS, DB/Redis, and gateway values; SIP variables may remain `NOT_CONFIGURED` for local readiness.

- [ ] **Step 2: Update Docker Compose health dependencies**

Ensure phone gateway startup does not report healthy while required local dependencies are unavailable.

- [ ] **Step 3: Implement `phone-test-local.sh`**

The script must verify health, submit/stream a real local audio fixture or microphone test path, receive non-empty STT text, receive Hermes output, and produce non-empty TTS audio.

- [ ] **Step 4: Implement `phone-test-sip.sh`**

Verify Asterisk CLI/API availability, PJSIP registration state when configured, and a controlled test-extension/media session. If SIP credentials are absent, exit non-zero and print `NOT_CONFIGURED` rather than PASS.

- [ ] **Step 5: Update build status from evidence only**

Do not preserve estimated latency values as measured values. Store actual measurements or mark them unverified.

- [ ] **Step 6: Run shell syntax/config checks and compose validation**

Run:

```bash
bash -n scripts/phone-health.sh scripts/phone-test-local.sh scripts/phone-test-sip.sh
docker compose -f docker-compose.phone.yml config
```

Expected: all exit 0.

- [ ] **Step 7: Commit**

```bash
git add docker-compose.phone.yml .env.phone.example scripts/phone-* scripts/deploy-phone-system*.sh docs/phone-system/BUILD_STATUS.md
git commit -m "chore(phone): add deployment and verification harness"
```

---

### Task 10: End-to-end regression suite and readiness decision

**Files:**
- Create: `apps/phone-gateway/test/e2e/phone-flows.test.ts`
- Modify as needed only where tests expose defects.
- Update: `docs/phone-system/BUILD_STATUS.md`

**Interfaces:**
- Produces final test evidence and exactly one allowed readiness label.

- [ ] **Step 1: Encode the minimum 20 scenarios from the design spec**

Include new/existing customer, no-cooling/no-heat, successful booking, scheduling failure, CRM failure, barge-in, explicit human request, repeated misunderstanding, safety triage, Daniel fallback, STT/TTS failure, media disconnect, consent, outbound reminder, address correction, and `Are you Daniel?` identity handling.

- [ ] **Step 2: Run the complete phone gateway/API suites**

Run the actual package test commands discovered from `package.json` for `apps/phone-gateway`, API phone module, and dashboard.

Expected: all PASS.

- [ ] **Step 3: Run production builds**

Build phone gateway, API, and dashboard packages. Run `docker compose -f docker-compose.phone.yml config` again.

Expected: all exit 0.

- [ ] **Step 4: Execute the highest available real verification level**

Local environment only → run local test and allow at most `WISE² PHONE: READY FOR LOCAL TESTING`.

Configured Asterisk/SIP softphone → run SIP test and allow at most `WISE² PHONE: READY FOR SIP TESTING`.

Configured PSTN DID + real CRM/scheduling + production environment → execute real inbound/outbound verification before allowing `WISE² PHONE: READY FOR PRODUCTION`.

- [ ] **Step 5: Record blockers precisely**

If SIP carrier credentials, Asterisk networking, recording policy, or Daniel voice model remain unavailable, list the exact missing dependency and keep readiness below the affected level.

- [ ] **Step 6: Commit final evidence**

```bash
git add apps/phone-gateway/test/e2e docs/phone-system/BUILD_STATUS.md
git commit -m "test(phone): verify end-to-end readiness"
```

---

## Self-Review Result

- Spec coverage: all component boundaries, failure handling, security-sensitive policies, human handoff, voice truthfulness, dashboard, observability, deployment, and verification levels are assigned to tasks.
- Placeholder scan: no implementation task relies on `TBD`/`TODO` or unspecified fake success behavior. Dashboard path discovery is intentionally deferred to Task 8 because the approved design requires extending the existing dashboard and the exact package must be discovered before editing.
- Type consistency: health, voice, media, tool result, recording, outbound, metrics, and readiness contracts are defined once and consumed by later tasks.
- Scope control: the plan completes the existing phone subsystem only; it does not rebuild unrelated WISE² services.
