# WISE² TV Hub and Cloud Node Handoff (Daniel + Darrin)

Status: integration handoff on feature branch, NOT production deployment.

## Design
Surface is a dual-use Ubuntu workstation. Docked HDMI display shows TV-first Chromium kiosk with WISE² Hive; built-in display stays a workstation. VPS hosts shared services. Daniel and Darrin use distinct identities, SSH keys, and role-scoped permissions. No shared root credentials, no private key copying, no automatic authorized_keys grants.

## Each person's cloud workstation
Clone the trusted repository and run:
```bash
git clone https://github.com/dwise03-bit/wise2-core.git
cd wise2-core
git fetch origin feat/tv-hub-handoff-20261008
git switch feat/tv-hub-handoff-20261008
bash scripts/wise2-node-onboard.sh daniel  # Darrin uses darrin
```
Review the printed fingerprint and public key. An authorized VPS administrator should create distinct non-root accounts and add ONLY each verified public key to that account's ~/.ssh/authorized_keys (directory 700, file 600). Prefer Tailscale SSH policies scoped to the node and role; enforce MFA in the tailnet. Test new SSH sessions before disabling existing access. Never put private keys, tokens, or admin secrets into Git.

## Surface deployment prerequisites
Confirm the Surface's existing checkout, branch, local modifications, and display topology. Its checkout was observed at f209932, behind upstream. Do not reset or overwrite it. Fetch and review upstream changes in a separate worktree before merging. Detect HDMI using /sys/class/drm/*/status and identify the external monitor using GNOME display settings. Run Chromium kiosk on external screen only after verifying the Wayland display/session and current desktop user; preserve the laptop desktop. Enable autostart only after an interactive dry run. Never kill an existing browser session to start kiosk.

## TV Hub integration contracts
TV home: https://wise2.net/hive (verify reachable/authenticated before kiosk).
Hermes: connect through authenticated VPS reverse proxy, not exposed unauthenticated localhost endpoints.
Services: streaming shortcuts, media controls, device status, WISE² alerts, second-screen market dashboard in read-only mode.
Remote control: phone-to-Hive authenticated control plane with explicit pairing and revocation.
Device health: Tailscale, VPS, Surface, media player, audio/display state; Discord alerts through server-side secret configuration.

## Acceptance checks
1. Daniel and Darrin have unique public-key fingerprints and separate accounts.
2. Both can authenticate to only authorized targets over Tailscale; unauthorized paths fail.
3. Surface internal display remains usable with TV attached and detached.
4. TV kiosk can be closed without affecting workstation.
5. Hive and Hermes authenticate, streaming audio works, remote pairing/revocation works.
6. No secret appears in git diff, browser URLs, or logs.
7. VPS and Surface report the same intended release SHA before calling rollout complete.
