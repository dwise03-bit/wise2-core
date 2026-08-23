# WISE² IMP — Android Integration

## Backend reality

IMP is a technician-facing brand layered over the existing, working
`POST /v1/hermes/chat` endpoint (`packages/api/src/hermes/hermes.controller.ts` /
`hermes.service.ts`). There is no separate "IMP" backend — the server-side system prompt
literally identifies itself as "Hermes, the WISE² business intelligence assistant" and the
request DTO's `mode` field is a fixed enum: `executive | audit | sales | projects | support |
systems`. There is no `fieldtech`/technician mode.

**Decision**: the Android client sends `mode: "support"` (closest existing fit) and folds
structured job context into the `message` string itself, since `HermesChatDto` has no separate
context field and its `messages` history entries only allow `role: 'user' | 'assistant'`
(no `system`).

## Context assembly

`ImpChatViewModel.buildContextBlock()` (`ui/screens/imp/ImpChatViewModel.kt`) gathers, from
Room (offline-safe, no extra network calls):

- Customer name and complaint (from `JobRepository`)
- Equipment manufacturer/model/refrigerant/tonnage (from `EquipmentRepository`, when the job
  has an equipment link)
- The most recent saved reading (from `ReadingRepository`)
- Current diagnostic category/step/finding (from `DiagnosticRepository`)

...and prepends it as a `JOB CONTEXT:` block before the technician's actual question, then
sends the last 10 turns of conversation history as `messages` so IMP has continuity across a
chat session.

## Fact vs. hypothesis (spec §12/§13)

The outgoing context block ends with an explicit instruction: *"Distinguish observed facts from
hypotheses. State a confidence level. Do not claim a fault is confirmed without supporting
evidence."* This is enforced by prompt instruction only — there is no server-side or
client-side validation that IMP's reply actually follows this. If stricter guarantees are
needed later, that validation would need to live in `hermes.service.ts` (server-side), not the
Android client, since the client only sees the final text response.

## What a real production IMP mode would need

1. A `fieldtech` (or `technician`) entry added to `HERMES_MODES` in
   `packages/api/src/hermes/hermes.dto.ts`, with a dedicated system prompt in
   `hermes.service.ts` that knows about HVAC diagnostics, refrigerant safety, and the
   fact/hypothesis distinction natively instead of via a per-request instruction string.
2. A structured context field on the DTO instead of folding it into `message` text, so context
   and the technician's actual question aren't conflated in the model's input.
3. Server-side citation/evidence tracking (`hermes.service.ts` already returns `sources: []` and
   `evidenceStatus` — currently always `'conversation-only'` for this endpoint since no
   retrieval is wired in).

None of this blocks the current build — the client works against the real endpoint today — but
it's the natural next step for IMP to feel purpose-built rather than borrowed.
