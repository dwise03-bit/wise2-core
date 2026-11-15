# WISE² customer onboarding — release gate

Status: IMPLEMENTATION BRANCH / NOT LIVE. Do not claim OAuth, Discord groups, mail, or deployment is active without production tests.

## Critical findings
- docs/AUTH_DEPLOYMENT_FIX.md reports dashboard /auth/login and /api/auth/login returning 404; recheck live before changing deployment.
- apps/website/lib/auth-session.ts contains devLogin() which generates a local dev token. Audit every server authorization guard: reject dev_* tokens on production; hide or remove dev login entry points in production; never trust browser localStorage for server-side authorization.
- apps/studio/AUTH_SETUP.md describes email/password JWT and localStorage tokens. Move production session management to secure HttpOnly, Secure, SameSite cookies with rotation/revocation and CSRF protections.
- Google Brain OAuth documentation exists, but Gmail API consent is separate from Google sign-in. Do not request Gmail access merely to log in.
- No verified Discord OAuth provider configuration or guild membership provisioning established.

## Target journey
1. Landing CTA -> /onboarding (public, accessible, mobile friendly).
2. Choose Google OIDC, Discord OAuth2, or verified email signup. Use provider PKCE/state/nonce as appropriate; allow secure account linking after reauthentication.
3. Verify identity and email, accept current terms/privacy, complete organization profile.
4. Create tenant, owner membership and isolated workspace transactionally; ensure idempotent retries.
5. Select plan -> Stripe Checkout if paid; verify signed webhook before enabling paid features.
6. Assign least-privilege tenant role and requested Discord guild roles via authorized bot, only after guild membership/consent verified. Never make all private groups public.
7. Send welcome/verification email through verified sender domain, with retry, bounce reporting and unsubscribe where applicable.
8. Show dashboard with setup checklist, project intake, secure support and Hermes assistant.
9. Staff approval gate for sensitive integrations and external actions; no implicit Gmail/Drive permissions.
10. Log onboarding events without storing OAuth secrets or access tokens in logs.

## Roles
platform_owner; platform_admin; support; tenant_owner; tenant_admin; tenant_member; tenant_viewer.
Enforce tenant_id on every resource and API query. Staff access requires MFA and auditable just-in-time elevation.

## Discord groups to audit
Public welcome, announcements, support intake; private per-client channels; staff operations; billing/support restricted. Confirm guild IDs, bot membership, intents, role hierarchy, invite expiration, channel permissions and role assignment tests. Do not automatically expose client data.

## Required environment verification (values redacted)
Google client ID/secret, exact production redirect URIs, OIDC consent screen status; Discord application ID/secret, exact callback, guild/bot permissions; auth session signing keys; SMTP/transactional sender DNS SPF DKIM DMARC; Stripe webhook signing secret; database migrations; TLS and proxy configuration. Never print secrets.

## Release checklist
- [ ] Audit production routes and deployment image; GET login page 200, auth endpoint returns correct method/status.
- [ ] Google sign-in success, cancellation, denied scopes, replay/state mismatch, linked-account tests.
- [ ] Discord sign-in success, revoked consent, missing guild membership, bot permissions and role assignment tests.
- [ ] Email signup, verification, reset, rate limits and abuse controls.
- [ ] Session expiry, refresh, logout, MFA, CSRF and cross-tenant authorization tests.
- [ ] No dev token or mock login can access production APIs.
- [ ] Provision tenant once; no duplicate workspace on webhook retries.
- [ ] Verify Stripe checkout/webhook only when applicable.
- [ ] Test welcome mail delivery and sender authentication.
- [ ] Confirm private channel access denied to unrelated customers.
- [ ] Browser smoke tests on desktop and Android; accessibility and error states.
- [ ] Staging sign-off -> controlled production rollout -> independent live verification -> monitoring/rollback.

## Non-destructive deployment policy
Preserve current cinematic homepage, existing accounts, tenants and client sites. Do not rotate all customer passwords or modify DNS to solve app auth issues. Back up database before migrations. Audit -> fix -> test -> independently verify.
