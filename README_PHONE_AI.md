# WISE² Phone AI

WISE² Phone AI is the provider-neutral call/session layer behind the Telnyx AI assistant Paige. Telnyx provides PSTN, voice, AI speech, call control, recording, and conversation events; WISE² persists calls, sessions, CRM identity, leads, and follow-up context.

## Current call lifecycle

1. Telnyx sends a signed event to `POST /api/v1/ai-phone/webhooks/telnyx`.
2. `call.initiated` resolves the WISE² tenant from the destination number and creates an idempotent CRM call/session.
3. Telnyx starts the configured Paige assistant on the active call.
4. `call.answered` marks the call active.
5. `call.conversation.ended` and `call.hangup` finalize the call and create the conversation/lead record when appropriate.

## Required environment

Only configure values that are present in the deployment:

```text
TELNYX_PUBLIC_KEY=<Telnyx webhook public key, base64 SPKI/Ed25519 key>
TELNYX_PHONE_NUMBER=<E.164 purchased number>
AI_PHONE_WEBHOOK_BASE_URL=https://<public-api-host>
DATABASE_URL=<Prisma database URL>
JWT_SECRET=<API authentication secret>
```

The API must receive the original request bytes as `req.rawBody`; this is enabled in `main.ts`. The webhook verifies `telnyx-timestamp` and `telnyx-signature-ed25519` over `timestamp + '.' + raw_body`.

## Production checklist

- Configure the Telnyx Voice API application webhook URL to the endpoint above.
- Confirm the number points to that Voice API application.
- Set the WISE² `aiPhoneConfig.phoneNumber` to the E.164 number.
- Verify TLS, signature rejection, CRM call creation, hangup finalization, and rollback before enabling live traffic.
- Do not put Telnyx keys, recordings, transcripts, or Discord webhook URLs in Git.

## Safety

Pricing, payment links, outbound SMS/email, and human transfer require approved provider configuration and consent. Unknown pricing must be escalated for human confirmation. Recording and messaging behavior must be configured for the caller’s jurisdiction.
