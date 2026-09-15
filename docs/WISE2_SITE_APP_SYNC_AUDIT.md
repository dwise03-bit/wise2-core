# WISE² Website ↔ iOS App Sync Audit

Date: 2026-09-14

## Reference audited

The live site at https://www.wise2.net/ is the public WISE² intake experience:
“Capture Your Vision,” a five-step project-type flow covering Brand Creation,
Website Build, App or Platform, Product Development, Marketing Campaign, Music
and Entertainment, AI and Automation, Business System, Full A-to-Z Build, and
Something New. Its public brand line is “Ideas. Built. Legacies.”

## Current app role

The iOS app is the authenticated WISE² Command Center. It should remain the
private execution surface for Home, AI, Work, Systems, and More. It should not
duplicate the public intake wizard.

## Sync decisions

- Canonical API base is `https://wise2.net/api/v1` for both app configuration
  and production traffic.
- Public intake project types should map to app/business records through the
  backend, rather than being hardcoded as separate mobile-only flows.
- Brand continuity: retain WISE² dark command-center UI while using the public
  site’s shared language where appropriate: “Capture Your Vision,” “Organized
  Chaos,” and “Ideas. Built. Legacies.”
- Keep authentication, business data, approvals, OTA checks, and operational
  actions behind the authenticated API.

## Implemented in this pass

- Updated iOS default API configuration from the raw VPS HTTP endpoint to the
  canonical HTTPS production endpoint.
- Updated the editable Settings fallback to the same HTTPS endpoint.
- Preserved user overrides through `API_BASE_URL` and existing UserDefaults.

## Next build phases

1. Add a shared backend project-intake model that accepts the website’s project
   types and exposes them to the app’s Work/CRM surfaces.
2. Add deep links from website intake completion into authenticated app records.
3. Add shared analytics events for intake → qualification → execution.
4. Replace remaining mock/fixture-only operational paths with authenticated API
   responses and explicit empty/error states.

## Verification gate

After each phase: build the iOS target for the paired device, run the app,
verify login and Home/Work/Systems/More navigation, and confirm the app uses
the HTTPS API endpoint in Settings.
