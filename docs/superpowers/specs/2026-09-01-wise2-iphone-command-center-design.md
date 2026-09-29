# WISE² iPhone Mobile Command Center Design

Date: 2026-09-01
Status: Approved direction, implementation pending plan

## Goal

Turn the iPhone into the primary secure mobile control surface for WISE² without moving heavy compute onto the phone. The VPS, GPU workstation, and Mac remain execution hosts; the iPhone provides the operator UI, field capture, approvals, alerts, and one-tap command entry.

## Architecture

The first release is an installable Progressive Web App integrated with the existing WISE² Command Center. It should be reachable from the production command-center surface and installable to the iPhone Home Screen. Native iOS can follow later while reusing the same APIs and data contracts.

The mobile layer consists of four units:

1. Mobile Command UI — responsive Next.js interface optimized for iPhone portrait use.
2. Command API — authenticated endpoints for status reads and allow-listed operational commands.
3. Field Capture — photos, video references, voice notes, timestamps, location consent, customer/job association, and upload queue.
4. iOS Shortcut Bridge — HTTPS endpoints and deep links that Apple Shortcuts can call for common WISE² actions.

## Primary Mobile Navigation

The initial tab bar is:

- Home
- Jobs
- AI
- Clients
- Settings

The Home screen shows WISE² network state, VPS/GPU/phone/AI service state, high-priority alerts, and large launch controls for AI Agent, Field Tech, CRM, and Phone.

## Mobile Actions

Initial actions:

- Open current WISE² dashboard
- View VPS and GPU health
- Open HVAC Field Tech
- Start a field capture
- Create or resume a job note
- Open CRM/client record
- Open AI assistant
- View AI phone state
- Trigger allow-listed service actions
- Open deployment/status views
- Launch Tailscale/SSH fallback links where appropriate

Destructive or high-risk actions must never execute from an unconfirmed tap. Production deploys, service restarts, database operations, deletions, and configuration mutations require a confirmation screen and server-side authorization.

## Authentication and Network

The mobile PWA uses normal WISE² authenticated HTTPS sessions. Private infrastructure actions must be routed through a small server-side command API rather than exposing raw SSH or infrastructure credentials to the browser.

Tailscale remains the preferred private transport for direct infrastructure access. Public WISE² endpoints may expose read-only health summaries, while privileged control endpoints require authenticated sessions and explicit authorization.

No long-lived SSH keys, API master keys, database passwords, Telnyx secrets, or infrastructure secrets are stored in browser localStorage.

## iOS / PWA Requirements

Add:

- web app manifest
- Apple touch icon assets
- standalone display mode
- iPhone-safe viewport and safe-area handling
- installable Home Screen experience
- offline shell for navigation/status fallback
- network/offline indicator
- resumable upload queue for field capture
- deep-link routes for Shortcuts

Recommended launch path: `/mobile` within the existing Command Center surface, with production routing under the WISE² domain structure.

## Shortcut Bridge

Provide stable HTTPS/deep-link actions for Apple Shortcuts, starting with:

- Open WISE²
- WISE² system status
- Start service call
- Start field capture
- Ask WISE² AI
- Open current jobs

Shortcuts must call authenticated application endpoints, not shell commands directly.

## Field Capture Flow

1. Tap Action Button or Field Capture.
2. Select or create customer/job context.
3. Capture photo/video/voice note/text.
4. Attach timestamp and optional location with user consent.
5. Queue locally if offline.
6. Upload when connectivity returns.
7. Confirm the item is attached to the WISE² job record.

## Error Handling

- Show explicit online/offline state.
- Distinguish WISE² API unavailable from local network unavailable.
- Queue field data locally when upload fails.
- Never report a command as successful until the server returns a success result.
- For privileged commands, show the returned server result and timestamp.

## Testing

Minimum automated coverage:

- responsive mobile route rendering
- manifest validity
- authenticated vs unauthenticated command access
- allow-listed command enforcement
- privileged confirmation requirement
- offline field queue behavior
- retry and duplicate-upload handling
- Shortcut endpoint contract tests

Manual iPhone verification:

- Safari load
- Add to Home Screen
- standalone launch
- safe-area rendering
- Face ID/session continuity as supported by browser auth
- Tailscale-connected access
- cellular access for public WISE² surfaces
- Action Button Shortcut flow
- camera/microphone/location permission handling

## Implementation Boundaries

Version 1 intentionally does not embed a full terminal, store SSH credentials, duplicate the entire desktop dashboard, or run local LLM workloads on the phone. It is a mobile control surface over existing WISE² services.

## Success Criteria

The release is successful when the operator can install WISE² to the iPhone Home Screen and, from one mobile interface, see infrastructure state, open jobs/clients/AI/phone workflows, capture field data, and invoke approved WISE² commands without needing a laptop for routine operations.
