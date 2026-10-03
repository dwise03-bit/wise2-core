# Acceptance and reboot validation

**Offline tests are implemented; host validation is BLOCKED in this session.**

## Source checks (no daemon/network/scan)

```
python3 -m unittest discover -s tests -v
node --check command-center/public/app.js
node tests/test_dashboard_dom.js
shellcheck -x scripts/wise2 hermes/client/hermes-client.sh
bash -n scripts/wise2
python3 -m compileall -q core command-center
```

Fixtures test exact dynamic touch state, denied observations, stopped Command
Center failure counting, socket parsing, gate denial, remote unknown telemetry,
archive corruption/hash/policy/failure behavior, log rotation, safe disabled
Hermes, literal config, credential permissions, redirect blocking, JSON auth,
static traversal, cached poll coalescing/staleness, module rendering and literal
text handling. Fixture results are not live host acceptance.

## Host rollout — run in a session permitted to write /opt/wise2

The original host repo was preserved. Inspect before any application:

```
cd /opt/wise2
git status
git diff
git diff --cached
git log --oneline -10
git rev-parse HEAD
git rev-list -n1 wise2-linux-stable-2026-10-03
```

Expected baseline HEAD/tag: c04bfb2d44e4c979e4b5d18569650fe97bbebdfd.
If the state changed, review/preserve the new work before proceeding. Do not
reset, clean, merge, rebase, push or overwrite it. Use the staged verifier to
create a reliable **pre-change** metadata backup without installing new code:

```
WISE2_ROOT=/opt/wise2 python3 /home/dwise/wise2-level-up/core/cli.py backup create
git apply --check /home/dwise/wise2-level-up-delivery/level-up.patch
```

A failed check means stop and reconcile the conflict; no broad overwrite.
After reviewing the patch and successful check, the authorized reversible
rollout is:

```
git apply /home/dwise/wise2-level-up-delivery/level-up.patch
wise2 command-center restart
wise2 backup create
wise2 backup verify
wise2 doctor
/opt/wise2/scripts/wise2-acceptance
```

This changes versioned source only. No unit installation, daemon-reload,
service hardening change or root action is required. The existing service
starts the same server path and reads the new source after this narrow restart.
Open http://127.0.0.1:3010 locally; confirm all modules, touch-sized controls,
unknown/stale labels and readable layouts on the actual Surface. Browser visual
inspection was not possible in the restricted session.

## Intentional service recovery

When the health report is complete (0 WARN/0 FAIL), run explicitly:

```
/opt/wise2/scripts/wise2-acceptance --recovery
```

The script discloses the action, checks service policy/baseline health, kills
only the Command Center main process, verifies increased NRestarts and both
health/UI HTTP within a bounded window, then runs doctor again. If automatic
recovery fails, it tries starting the unchanged service and reports failure;
it never hides a failed recovery behind a later successful manual start.
It never reboots or starts a scanner. Resolve a failing prerequisite before
stacking further changes.

## Prepare reboot — Daniel approves separately

Save active work. Record current doctor, Git state, `uptime`, current
`/proc/sys/kernel/random/boot_id`, service state/enabled status, Restart and
NRestarts, and `loginctl show-user dwise -p Linger` in a private local record.
Verify metadata backup. Resolve warnings truthfully. Review/commit only the
intended source work locally. Tell Daniel the machine is ready, and wait for
explicit reboot approval. No automatic reboot command is included.

After Daniel reboots, confirm changed boot ID and re-run doctor/acceptance;
verify physical touch/stylus, GNOME/Wayland, Wi-Fi, DNS, Tailscale, SSH, Docker,
Command Center user service/3010/HTTP, node registry and backup integrity.
If Hermes is enabled, all four states must pass; otherwise record NOT CONFIGURED.
Then repeat the intentional service recovery test. Record fresh results and
remaining blockers in context. Only that completes workstation acceptance.
