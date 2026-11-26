# Official social publishing integration checklist

1. Register apps with Google/YouTube, Meta, and TikTok and document required scopes.
2. Implement OAuth authorization-code flow with PKCE where supported; encrypt tokens at rest.
3. Check professional-account eligibility, video limits, quota, rate limits, and app-review requirements.
4. Implement provider-specific media upload, publishing status polling, error classification, and idempotency keys.
5. Keep publishing explicitly user-approved; support drafts and dry-run preflight.
6. Write provider sandbox integration tests and webhook signature verification where applicable.

No OAuth credentials or live platform integrations are bundled.
