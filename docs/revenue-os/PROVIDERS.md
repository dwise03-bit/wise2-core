# Revenue OS — Provider Integrations

Revenue OS is not wired to any single vendor. Each external capability is an
interface in `packages/api/src/revenue-os/providers/provider.types.ts`, and a
concrete provider is selected from configuration at runtime.

**Today there is exactly one implementation: `MockProvider`.** No live adapter
for any vendor exists in the repo yet. Everything below describes what each
capability will need, and exactly how the system behaves until it gets it.

---

## The NEEDS_CONFIG contract

This is the single most important behaviour in this document.

With no credentials configured:

- **The mock provider is used.** `MockProvider` implements every capability
  interface — messaging, telephony, calendar, lead source, review.
- **Nothing is sent.** `sendSms()` returns `{ sent: false, status: 'NEEDS_CONFIG' }`
  and logs that the message was suppressed. `placeCall()` returns
  `{ placed: false, status: 'NEEDS_CONFIG' }`. No customer is contacted.
- **Nothing is invented.** `availableSlots()` returns an empty array rather
  than plausible-looking times. `reviewLink()` returns `null` rather than a
  guessed URL. `verifySignature()` returns `false` always — an unverifiable
  signature is never treated as valid.
- **Agents report `NEEDS_CONFIG`, they do not fail.**
  `AgentsService.missingCapabilities()` treats every capability an agent
  requires as missing unless the provider reports `READY`. `MockProvider.health()`
  never returns `READY`, so today **every agent in every tenant is
  `NEEDS_CONFIG`**, whatever its `enabled` flag says.
- **Workflows skip, and say why.** `AgentsService.canRun()` returns false, so
  each workflow returns `skipped('<Agent> disabled or NEEDS_CONFIG')` — or,
  if it got as far as sending, `skipped('messaging provider not configured;
  nothing was sent.')`. `WorkflowRunnerService` records that as an
  `AutomationRun` row with status `SKIPPED` and the reason attached.

So an unconfigured Revenue OS is visibly inert rather than quietly broken. The
failure mode this design exists to prevent is an AI that appears to be working
while sending nothing — or worse, one that invents a price, a slot or an
arrival time to fill the gap left by a missing provider.

`MockProvider.health()` reports which of the four `TELEPHONY_*` variables are
unset in its `missing[]` array, so the UI can name the exact variable to set.
Note that it returns `NEEDS_CONFIG` regardless — setting those four variables
does **not** make the mock provider go `READY`; only a real adapter can.

---

## Capabilities and the credentials they need

Four capability names are declared on the agents
(`AgentCapability` in `agent-definitions.ts`): `messaging`, `telephony`,
`calendar`, `review`. Lead-source providers are a fifth interface, used for
inbound webhook verification rather than by an agent directly.

### 1. Telephony — inbound calls, outbound calls, call webhooks

Used by: WISE Receptionist, WISE Speed-to-Lead.
Interface: `TelephonyProvider` (`placeCall`, `verifySignature`, `health`).

| Variable | In `.env.example` | Purpose |
|---|---|---|
| `TELEPHONY_PROVIDER` | ✅ | Which vendor adapter to select |
| `TELEPHONY_ACCOUNT_ID` | ✅ | Vendor account identifier |
| `TELEPHONY_AUTH_TOKEN` | ✅ | API credential — also the webhook signing secret for most vendors |
| `TELEPHONY_PHONE_NUMBER` | ✅ | The number calls originate from and inbound calls arrive on |

Still required beyond credentials: a provisioned phone number, a webhook URL
registered with the vendor, and a **trusted mapping from inbound number to
tenant** — `WebhookSecurityService` resolves tenant from server-side mapping
and never from the payload body, so that mapping must exist before inbound
calls can be attributed.

### 2. Messaging — SMS to customers

Used by: Speed-to-Lead, Recovery, Membership, Review, Reactivation — i.e. five
of the seven agents. This is the highest-value capability to configure first.
Interface: `MessagingProvider` (`sendSms`, `health`).

**No messaging-specific environment variables exist yet.** `.env.example`
defines none, and `MockProvider.health()` checks only the `TELEPHONY_*` set. A
real adapter will need, at minimum: an API credential, a sending number or
messaging-service id, and the inbound webhook secret used to receive STOP/START
replies. Name them when the adapter is written and add them to `.env.example`
at the same time.

Compliance note: `ConsentService` denies contact by default — an unknown
consent state is refusal, not permission — and honours STOP/START keywords. A
messaging adapter must route inbound replies into `ConsentService` or the
opt-out guarantee is only theoretical.

### 3. Meta (Facebook / Instagram lead ads) — inbound leads

Used by: ATTRACT → RESPOND. A `LeadSourceProvider`.

| Variable | In `.env.example` | Purpose |
|---|---|---|
| `META_APP_ID` | ✅ | App identifier |
| `META_APP_SECRET` | ✅ | Used to verify the `X-Hub-Signature-256` HMAC on lead webhooks |
| `META_WEBHOOK_VERIFY_TOKEN` | ✅ | Answers Meta's subscription verification challenge |

Also needed outside env: a Page access token per connected page, a subscribed
webhook, and a page/form → tenant mapping.

### 4. Google Ads — campaign spend and attribution

| Variable | In `.env.example` | Purpose |
|---|---|---|
| `GOOGLE_ADS_CUSTOMER_ID` | ✅ | The Ads account to read |

Not yet present and required by any real Google Ads client: a developer token,
an OAuth client id/secret, and a refresh token. Without them, `Campaign.spend`
must be maintained by hand, and cost-per-booked-job in the attribution endpoint
is only as good as that manual number.

### 5. Google Business Profile — review destination

| Variable | In `.env.example` | Purpose |
|---|---|---|
| `GOOGLE_BUSINESS_LOCATION_ID` | ✅ | The location whose review link is used |

An OAuth credential pair is also needed to call the API. See the review
capability below for what happens without it.

### 6. Calendar — real availability and appointments

Used by: WISE Booking, WISE Receptionist, WISE Speed-to-Lead.
Interface: `CalendarProvider` (`availableSlots`, `health`).

**No calendar environment variables exist yet** — none in `.env.example`, none
read anywhere in the code. A real adapter needs credentials for whichever
system owns the dispatch board (a field-service platform, or Google/Microsoft
calendar), plus a technician/resource mapping and the tenant's business hours.

Until then `availableSlots()` returns `[]`. That is deliberate: the global
agent rules forbid inventing availability, so the Booking agent reports no
availability rather than offering a time nobody can keep.

### 7. Review — the feedback link

Used by: WISE Review.
Interface: `ReviewProvider` (`reviewLink`, `health`).

**No review-link environment variable exists yet.** `reviewLink()` returns
`null`, and the Review agent may not construct a URL — it sends only a
configured link. So review requests do not go out until a real review provider
or a per-tenant configured link exists.

Note also that the Review agent must not review-gate: every customer gets the
same question, and negative feedback creates an internal recovery task and is
preserved rather than suppressed.

---

## Summary table

| Capability | Interface | Env vars today | Live adapter | Behaviour without credentials |
|---|---|---|---|---|
| Telephony | `TelephonyProvider` | 4 (`TELEPHONY_*`) | ❌ | No call placed; signatures rejected |
| Messaging | `MessagingProvider` | none defined | ❌ | No SMS sent; `sent: false` |
| Meta lead ads | `LeadSourceProvider` | 3 (`META_*`) | ❌ | Signature verification fails closed |
| Google Ads | — | 1 (`GOOGLE_ADS_CUSTOMER_ID`) | ❌ | Spend must be entered manually |
| Google Business | `ReviewProvider` | 1 (`GOOGLE_BUSINESS_LOCATION_ID`) | ❌ | No review link |
| Calendar | `CalendarProvider` | none defined | ❌ | Empty slot list; no booking offered |
| Review link | `ReviewProvider` | none defined | ❌ | `reviewLink()` returns `null` |

---

## Adding a real provider

1. Implement the capability interface from `provider.types.ts`. `health()` must
   return `READY` only when every credential it needs is actually present, and
   list the missing variable names otherwise — that string is what the operator
   will see in the UI.
2. Register it in `RevenueOsModule` and select it from configuration, keeping
   `MockProvider` as the fallback when the vendor variable is unset.
3. Add every new variable to `.env.example`, blank, with a comment.
4. Never store a secret in `AgentConfig`. The schema has `providerConfigRef`
   for exactly this — a reference to where the credential lives, never the
   credential.
5. Keep the honesty contract: on failure, return a falsy result with a reason.
   Never return a fabricated success, a plausible slot, or a constructed link.

---

See also: [README.md](./README.md) · [DEPLOYMENT.md](./DEPLOYMENT.md)
