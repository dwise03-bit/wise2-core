# @wise2/ops-protocol

The shared contract for the Mac → VPS direct control layer (F5-OPS-01). It defines the
signed job envelope, the action-profile allowlist, and the target registry, so the Discord
bot, the MacBook relay, and each host's control bridge all validate against one identical
set of rules. **This package executes nothing** — no shell, no SSH, no network calls.

## Pieces

| Module | Responsibility |
|---|---|
| `profiles.ts` | The complete action allowlist. A profile not listed here cannot be requested, signed, relayed, or executed. Every argument is constrained by a closed value set or an anchored pattern — there is no free-form text field anywhere. |
| `signature.ts` | Canonical (key-sorted) JSON serialization, HMAC-SHA256 sign/verify with a timing-safe compare, job-id/nonce minting, and the idempotency fingerprint. |
| `validate.ts` | `verifyJob()` — the single gate: signature → structure → freshness → target → profile → role → args → confirmation → nonce. Fails closed at every step. |
| `registry.ts` | Parses `~/.wise2/targets.json` and provides `publicTarget()`, the Discord-safe projection that drops address, SSH user, key reference, and port. |
| `replay.ts` | Nonce and idempotency stores, both bounded and self-sweeping. |

## Safety properties the tests prove

- A payload mutated after signing, signed with a different secret, or carrying an unknown key id is rejected.
- Jobs expire (10 minute maximum lifetime), cannot be issued in the future, and cannot be replayed.
- A rejected job does **not** burn its nonce, so a corrected re-issue still works; an accepted one can never be replayed.
- Unknown targets, unknown profiles, and profiles a target does not allow are rejected.
- Shell-shaped arguments (`worker; rm -rf /`, `$(whoami)`, `a && curl … | bash`, newlines, traversal) fail the pattern check.
- Writes require `owner` plus a signed confirmation bound to the same job id and actor; production writes require the environment echoed back as `production`; `emergency-stop` requires two distinct confirmations.
- `publicTarget()` output contains no address, SSH user, key reference, or port.

## Usage

```ts
import { sign, verifyJob, createNonceStore, parseTargets } from '@wise2/ops-protocol';

const envelope = sign(job, { keyId: 'relay-2026-09', secret: process.env.WISE2_OPS_SIGNING_KEY! });
const result = verifyJob({ envelope, keys, targets, confirmations, nonces: createNonceStore() });
if (!result.ok) return reject(result.code, result.message);
```

`verifyJob` returns a discriminated `Result`, never a thrown error, so callers cannot
accidentally proceed on a failure path.

## Consumers

- **F5-OPS-02** — control bridge verifies the envelope before any write.
- **F5-OPS-04** — the MacBook relay is the primary verifier and target-registry owner.
- **F5-OPS-06** — the Discord bot mints and signs jobs and confirmations.

CommonJS consumers (`services/wise-discord`) can `require()` the built ESM output on Node 22.

## Registry

Copy `targets.example.json` to `~/.wise2/targets.json` (chmod 600, never committed).
Addresses and key references stay on the MacBook; Discord only ever sees the alias.
