# WISE² approval boundaries

**IMPLEMENTED locally in source:** read-only API, fixed probe commands, explicit
service action disclosure, no browser mutation routes, preserved pentest gate,
no unattended deployment/restore. **PLANNED:** Hermes-backed persistent
approval queue, scoped remote agents, approval expiration/revocation/audit.
No fake approval engine is shipped.

| Class | Policy |
|---|---|
| SAFE READ | Fixed local diagnostics, device/package inventory; automatic |
| LOCAL CHANGE | Reversible source/registry/metadata backup/log changes within the authorized directive |
| SERVICE CHANGE | Narrow local Command Center operation, with action disclosure and verified recovery; preserve unrelated services |
| DEPLOYMENT | Explicit approval before an external deployment |
| EXTERNAL CHANGE | Explicit approval for DNS, production infrastructure or security boundaries |
| SECURITY OPERATION | Daniel's owned/authorized scope plus the preserved terminal gate; no automatic scans |
| DESTRUCTIVE | Explicit approval; no destructive automation exists |

Before a high-impact action disclose **ACTION, TARGET, REASON, EXPECTED EFFECT,
ROLLBACK METHOD**. Authorization identifies the target/action/scope; a service
restart is not approval to change a firewall, deploy to a VPS or run a scan.
Reboot, pushes and credential changes require explicit authorization. The
operator's existing directive authorizes reversible local implementation and
service validation, but filesystem/session restrictions still govern execution.

Future control path: User/ChatGPT → WISE² control layer → existing Hermes →
agents/jobs → approval gate → authorized tools/devices → safe audit log.
Until integrated, jobs/approvals/remote tools show NOT CONFIGURED.
