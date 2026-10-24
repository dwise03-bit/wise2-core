# WISE² tenant separation

`wise2.net` is the WISE² control plane, never a client-app host. WISE² owns the platform routes `/admin`, `/email`, `/hive`, `/dashboard`, `/support`, and `/api`.

Every client receives its own public domain and isolated runtime:

| Boundary | Required isolation |
| --- | --- |
| Routing | Client root/app domains only; no `*.wise2.net` client routes |
| Runtime | One named service and `tenant-<id>` Docker network |
| Data | Own database and `tenants/<id>` storage prefix |
| Secrets | Client-specific environment file; never a platform secret |
| Operations | Hive health endpoint and client-only alert channel |

## Router rule

Do not use a catch-all router that can serve a client on `wise2.net`. Route by an explicit hostname only. The WISE² router owns its listed control domains; the client router owns only the domains in `tenants.json`.

## Before a client deployment

```bash
node ops/tenants/validate-registry.mjs
```

Then provision the DNS records, isolated environment file, service, network, database, storage prefix, and Hive health monitor for that tenant. Do not point a client domain at the WISE² website service.
