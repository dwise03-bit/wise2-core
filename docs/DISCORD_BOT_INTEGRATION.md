# WISE² Discord Integration

WISE² sends operational notifications to configured Discord webhooks.

## Current routing

- Inbound Telnyx calls can notify the configured calls webhook.
- WhatsApp events can notify the configured WhatsApp webhook.
- AI and Revenue OS actions remain tenant-scoped.

## Assistant behavior

Use Discord for internal alerts and handoffs only. Do not post customer
personal information, credentials, API keys, or webhook secrets. Before sending
a customer-facing message or changing a Discord resource, ask for confirmation
and name the destination channel.

## Troubleshooting

1. Check `GET https://api.wise2.net/api/health`.
2. Confirm the relevant Discord webhook environment variable is configured.
3. Inspect API logs for delivery failures.
4. Retry only after confirming the destination and message content.
