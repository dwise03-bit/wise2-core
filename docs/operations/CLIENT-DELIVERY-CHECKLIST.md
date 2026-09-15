# WISE² Client Delivery Checklist

Use this checklist for every customer launch. A checked item means evidence exists; it does not mean an agent merely attempted the step.

## Commercial gate
- [ ] Client identity and authorized decision-maker confirmed
- [ ] Scope and exclusions approved
- [ ] Package/services selected
- [ ] Price/payment terms confirmed through the approved billing path
- [ ] Any paid provisioning explicitly authorized
- [ ] Owner and target launch date recorded

## Brand and assets
- [ ] Approved logo/brand files collected
- [ ] Locked colors, typography, messaging, and supplied likeness references identified
- [ ] Required copy/media approved or marked for creation
- [ ] No unapproved modification of supplied human likenesses

## Build
- [ ] Build brief references the approved scope
- [ ] Required integrations identified
- [ ] Environment/config requirements documented without secret values
- [ ] Relevant automated tests added or updated before production behavior changes
- [ ] Local/preview build succeeds

## Visual QA
- [ ] Desktop viewport checked
- [ ] Tablet viewport checked where relevant
- [ ] iPhone-size viewport checked
- [ ] Android-size viewport checked where relevant
- [ ] No blocking console errors
- [ ] No critical failed requests
- [ ] No horizontal overflow
- [ ] Primary navigation works
- [ ] Primary CTA is visible and usable
- [ ] Forms, loading, empty, success, and error states checked where applicable
- [ ] Locked brand references preserved
- [ ] Flagship visual work receives human review when appropriate

## Deployment
- [ ] Deployment target confirmed
- [ ] Backup/rollback path confirmed
- [ ] Candidate release built
- [ ] Relevant tests pass
- [ ] Health check passes
- [ ] Smoke test passes
- [ ] DNS changes, if any, independently verified and authorized
- [ ] Production release verified after deployment

## Purchased integrations
Complete only for services included in scope.
- [ ] CRM configured
- [ ] n8n/automation workflows configured
- [ ] AI phone/voice configured
- [ ] Messaging/Discord notifications configured
- [ ] Analytics/observability configured
- [ ] Hosting/backup/monitoring configured

## Security
- [ ] No credentials embedded in this checklist, tickets, docs, screenshots, or Git history
- [ ] Secrets stored using the approved environment/secret mechanism
- [ ] External integrations use least privilege
- [ ] Internal admin services are not exposed publicly without an approved secure access layer

## Handoff
- [ ] Client receives production URL/app access
- [ ] Credentials delivered through an approved secure channel
- [ ] Client training completed or scheduled
- [ ] Support owner and escalation route communicated
- [ ] Maintenance/recurring services activated as purchased
- [ ] 7-day review scheduled
- [ ] 30-day review scheduled
- [ ] First measurable success target recorded
- [ ] Relevant next-step/upsell opportunities recorded without creating unwanted services

## Launch verdict
Record exactly one: `PASS`, `PASS WITH WARNINGS`, or `BLOCKED`.

A launch is `BLOCKED` when required authorization, payment state, security, tests, health checks, visual QA, deployment verification, or rollback readiness is missing.
