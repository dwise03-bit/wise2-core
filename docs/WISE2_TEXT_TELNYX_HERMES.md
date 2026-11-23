# WISE² Text: Telnyx → Hermes

## Endpoint
Configure the Telnyx messaging webhook for:

`POST https://<public-api-host>/api/webhooks/telnyx/messages`

Only `message.received` events are accepted. The handler requires Telnyx Ed25519 verification using the exact raw request body; unsigned events are rejected.

## Required production configuration

```
TELNYX_PUBLIC_KEY=<Telnyx public webhook key>
HERMES_TEXT_INTAKE_URL=<authenticated Hermes text-ingest endpoint>
HERMES_TEXT_INTAKE_TOKEN=<dedicated secret for the Hermes intake>
```

The endpoint intentionally does not accept a generic API key or an unauthenticated Hermes URL. If the Hermes destination is not configured or unavailable, the inbound message is persisted with `routing_state=queued`, retains the provider event for retry/audit, and Telnyx receives 200 to prevent duplicate delivery storms.

## Persistence and idempotency

Apply `packages/db/migrations/011_wise2_text_messages.sql` before enabling the webhook. The `provider_event_id` unique constraint makes webhook retries idempotent. Each record keeps the original signed-event body, normalized text, media metadata, routing state, error (if any), and Hermes receipt.

## Hermes contract

Hermes must accept:

```json
{
  "id": "archived-message-id",
  "source": "telnyx",
  "receivedAt": "ISO-8601",
  "from": "+1...",
  "to": "+1...",
  "text": "Project update",
  "media": []
}
```

It must honor the `Idempotency-Key` header and return a 2xx response only after durable storage. Optional response fields are `project` and `taskIds`.

## Release checklist

1. Run the database migration and deploy the API.
2. Set the three secrets through the host secret manager; do not commit them.
3. Register the endpoint for the Telnyx number's inbound messaging profile and enable MMS if the number/carrier supports it.
4. Send Telnyx's signed test event and verify the new archive row.
5. Send one plain SMS and one picture from Daniel/Darrin's phones.
6. Confirm each gets a `routed` row and Hermes receives a matching idempotency key.
7. Add outbound acknowledgement only after Telnyx's messaging profile, sender registration, and opt-in language are verified.
