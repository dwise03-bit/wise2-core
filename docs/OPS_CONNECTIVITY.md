# WISE² Ops Connectivity (F5-OPS-05)

How the MacBook relay reaches a control bridge, and what is locked down along the way.

## Corrected assumption

The plan assumed `173.208.147.165` was not on the tailnet and would need an SSH
port-forward. **It already is.** That address is the host whose hostname is `gpu-nmls`,
which appears in the tailnet as `gpu-nmls-1` / `100.68.145.5` /
`gpu-nmls-1.tail44396d.ts.net`. Tailscale-first works today and the SSH fallback is not
needed for this host. The `ssh` transport stays in the protocol for a future host that
lacks tailnet access; it remains an HTTP call through an out-of-band tunnel, never a shell.

The same box serves as `wise2-core` and the GPU host, so the fleet is currently one
managed target, not the four the plan sketched.

## Ingress: `tailscale serve`, not an open port

The control bridge binds `127.0.0.1:3099` and must stay that way. `tailscale serve`
publishes it to the tailnet only:

```bash
bash scripts/ops/setup-ops-ingress.sh    # on the host
```

That gives `https://gpu-nmls-1.tail44396d.ts.net` — TLS terminated by Tailscale, reachable
only by tailnet devices the ACL permits, invisible to the public internet. `tailscale
funnel` is deliberately not used: funnel would expose the bridge to the world.

The target's `baseUrl` in `~/.wise2/targets.json` then points at that origin. When
`baseUrl` is set it wins over address/port composition, so the bridge never has to bind a
non-local interface.

## Tailnet ACL

`config/tailscale/wise2-ops-acl.json` — apply it in the Tailscale admin console
(Access Controls). It permits `tag:ops-relay` → `tag:ops-host` on the bridge port and
nothing else, and keeps Tailscale SSH as break-glass administration only, never as the ops
path. **The tags must be applied to the devices** (admin console → Machines → Edit ACL
tags) or the rules match nothing.

## Registry

`~/.wise2/targets.json`, chmod 600. The relay refuses to start if it is group- or
world-readable, if a target names an unknown profile, or if a target's `bridgeTokenRef`
environment variable is unset. It holds no secrets — only alias, origin, environment, the
profiles that host accepts, and the *names* of environment variables holding tokens.

## SSH hardening

Not applied. With Tailscale ingress in place, no ops action traverses SSH, so the
least-privilege `wise2-ops` account the plan called for has nothing to do — creating it
would add an unused credential. Public SSH on port 22 remains as it was, for
administration outside this system. If the ops path ever needs the tunnel fallback, create
the account then, scoped to a forward-only key.

## Verification

```bash
bash scripts/ops/verify-ops-path.sh
```

Read-only; every check is a GET. It verifies registry presence, permissions and JSON,
tailnet reachability, bridge health plus its refusal of unauthenticated reads, and that
the relay refuses both unauthenticated requests and unsigned jobs.

## Remaining prerequisites

1. **Generate the shared secrets.** `openssl rand -base64 48` for each of
   `WISE2_OPS_SIGNING_KEYS` (same value on the relay, the bridge, and later the Discord
   bot), `WISE2_RELAY_TOKEN`, and the bridge's `WISE2_CONTROL_TOKEN`.
2. **Deploy the control bridge.** It is not currently running on the host — no container,
   nothing listening on 3099. It needs the F5-OPS-02 variables in the host `.env`, and it
   will refuse to start without `WISE2_OPS_SIGNING_KEYS`.
3. **Run the ingress script** on the host, then apply the ACL and device tags.
4. **Install the relay agent** — `scripts/ops/com.wise2.control-relay.plist`.
