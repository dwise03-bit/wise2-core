# WISE² Revenue Command Center Design

**Goal:** Turn the existing Telnyx phone, WISE² phone gateway, CRM/Second Brain, and Discord bot into a revenue-focused assistant that qualifies leads, books appointments, follows up, closes approved standard offers, and escalates custom/high-value deals.

## Architecture

- Telnyx is the communications transport.
- WISE² Phone Gateway owns call orchestration and AI conversation state.
- PostgreSQL/CRM is the system of record; Redis holds ephemeral state.
- Second Brain supplies business/customer/sales context.
- One existing WISE² Discord bot is the human control plane; specialized sales/closer/marketing/operations behaviors are modular services behind it.
- AI closing authority is bounded by explicit offer rules. Paid ads, mass outreach, custom contracts, out-of-policy discounts, and unusual/high-value deals require human approval.

## Revenue Flow

1. Receive inbound call/SMS event.
2. Resolve or create contact/lead in CRM.
3. Run discovery and qualification.
4. Score intent and determine COLD/WARM/HOT/CLOSING stage.
5. Publish meaningful lead/call state to Discord without streaming every transcript token.
6. Recommend only approved offers.
7. If `ai_closable=true` and all commercial rules pass, allow booking/approved payment-link flow; otherwise escalate.
8. Persist next action and follow-up sequence.
9. Record attribution and revenue events.

## Discord Control Plane

Preserve useful existing channels and map them rather than duplicating them. Target channels: `hot-leads`, `deals`, `revenue`, `payments`, `closer-needed`, `new-leads`, `follow-ups`, `callbacks`, `appointments`, `lost-opportunities`, `reactivation`, `live-calls`, `call-summaries`, `missed-calls`, `voicemail`, `campaigns`, `ads`, `lead-sources`, `content-approvals`, plus existing `command-center`, `alerts`, `daily-sync`, `status`, and `decisions` equivalents.

The existing WISE² bot remains the primary bot identity. Revenue commands include `/lead`, `/leads`, `/hot`, `/pipeline`, `/deal`, `/claim`, `/call`, `/callback`, `/text`, `/followup`, `/book`, `/offer`, `/close`, `/lost`, `/reactivate`, `/revenue`, `/today`, `/agent`, `/campaign`, `/customer`, and `/search` as supported by backend capabilities.

Lead cards expose real actions only: Claim Lead, Call, Text, Send Offer, Book, Follow Up, Escalate, Mark Won, Mark Lost, Open CRM. All actions are permission checked and persisted.

## Commercial Guardrails

Approved offers define ID, name, description, approved/minimum price, discount ceiling, included/excluded features, payment terms, setup/recurring fees, qualification rules, escalation threshold, required disclosures, and `ai_closable`.

AI never invents prices, discounts, guarantees, contractual terms, capabilities, or delivery dates. It escalates custom scope, policy exceptions, low-confidence situations, unusual guarantees, enterprise/high-value work, or any request outside configured authority.

## Data and Events

Audit existing Prisma models before adding data structures. Add only missing concepts for leads/opportunities/offers/assignments/follow-ups/revenue attribution. Use idempotent event handlers and correlation IDs across call, CRM lead, Discord card, follow-up, and deal.

Telnyx/phone events to normalize include inbound/outbound, answered, missed, completed, failed, voicemail, transferred, callback requested, SMS received, and SMS sent.

## Automation

No qualified lead may finish without a next action. Support missed-call recovery, immediate approved follow-up, callbacks, appointment reminders, reactivation, and daily revenue briefs. Consent and opt-out records override all automated outreach.

## Security and Operations

Use role-based permissions for commercial actions. Never expose Telnyx, Discord, database, or AI secrets in Discord/logs. Verify webhooks, rate limit sensitive endpoints, use idempotency keys, log approvals and state changes, and keep Discord as a control plane rather than the database.

## Success Criteria

A production-connected test must prove: prospect contacts WISE² -> Telnyx/phone gateway handles event -> CRM resolves/creates lead -> AI qualifies -> lead score/stage persists -> Discord receives actionable card -> approved offer or escalation occurs -> booking/payment/follow-up updates CRM -> revenue attribution persists.

Anything mocked, stubbed, or simulated must be labeled as such and may not be reported production-ready.
