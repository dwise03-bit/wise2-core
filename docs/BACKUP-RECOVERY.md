# WISE² metadata backup and reviewed recovery

**STAGED implementation**, not yet installed on the host. No automated restore.

## Create, inventory, verify

```
wise2 backup create
wise2 backup list
wise2 backup verify
wise2 backup verify wise2-metadata-<UTC-stamp>.tar.gz
```

Archives live in `/opt/wise2/backups`, mode 0600. Creation writes a temporary
archive, reads every payload to verify the manifest, fsyncs it, renames it to
its final name and fsyncs the directory. An error does not publish a partial
archive or report success merely because a file exists. The manifest records
SHA-256 and byte length for each payload. Verification reads without extracting,
rejects duplicates, traversal, symlinks, unsupported members, policy violations,
oversized data and checksum mismatches. Maximum file 16 MiB, aggregate 256 MiB.
Legacy `wise2-config-*.tar.gz` files are preserved and explicitly unverified;
file existence is not integrity evidence.

## Included

A compiled allowlist in `core/backup.py` includes first-party source/docs,
shared context, CLI and core Python, Command Center assets, versioned service
units, device registry/historical manifest, recovery docs, agent instructions,
Git ignore policy, selected security adapter/policy files and launcher hashes,
Hermes documentation/client and a **disabled non-secret configuration example**.
Only recognized source/metadata extensions are collected; hidden, environment,
credential, token, dependency and cache paths are excluded. Symlink sources
are refused. Project metadata lives in `context/PROJECTS.md`; no project source
is silently swept into a configuration backup.

## Explicit exclusions / manual recovery dependencies

- All tokens, passwords, keys, cookies, auth stores and environment files.
- Hermes runtime `hermes.conf` and credential, even when disabled today.
- Security targets, engagement manifests, reports, evidence and raw logs.
- Project code/data, databases, container images, Docker volumes and credentials.
- Arbitrary `config/` files, system `/etc` configuration, installed user units,
  `/usr/local/bin` launchers, desktop settings, SSH/Tailscale state and home data.
- Git object database, logs and older backups.

Docker daemon configuration/volumes require a separate reviewed backup policy.
No arbitrary daemon JSON or environment is archived as supposedly safe.
The versioned Command Center unit is backed up; installed copy/linger can be
reconstructed and must be checked against the versioned unit. System package,
bootloader and firmware recovery remain the operator's existing procedures.

Secrets are re-provisioned manually from Daniel's trusted stores, out of band,
with least privilege; no secret escrow is implemented. Content checks reject
known key/token markers, but cannot prove that arbitrary prose contains no
secret. Keep first-party source/context non-secret and inspect private content
before backups. SHA-256 proves consistency against the included manifest, not
authenticity against a malicious party. Treat archives as private, protect
independent offline copies and periodically verify them. Retention/deletion is
manual; nothing is deleted automatically.

## Restore design — PLANNED, approval required for replacement

1. Identify the exact files/components to recover and preserve their current
   state. Review ACTION, TARGET, REASON, EXPECTED EFFECT and ROLLBACK METHOD.
2. Verify the archive with the current trusted verifier. Never pipe an archive
   blindly into an extraction at `/` or `/opt/wise2`.
3. After verification, inspect/extract selected regular files into a new empty
   staging directory; review diff, owner and mode before replacing anything.
4. Stop/restart only an affected WISE² service after approval where required;
   preserve the existing user-service policy and loopback binding.
5. Re-provision excluded credentials/system settings manually; do not copy
   production JWT_SECRET to Surface.
6. Run doctor, backup verification and service acceptance. Keep the pre-restore
   copy until live and post-reboot validation succeed.

Git tag `wise2-linux-stable-2026-10-03` preserves versioned source at c04bfb2.
It does not capture secrets, installed system state or project data. For review,
`git show wise2-linux-stable-2026-10-03:path/to/file` reads a baseline file;
replacement is a separate deliberate operator action. No reset/clean/rebase/
merge/push is part of recovery.
