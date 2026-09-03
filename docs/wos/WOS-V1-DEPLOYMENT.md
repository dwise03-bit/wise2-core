# WOS V1 Deployment and Rollback

WOS-0001 does not deploy. The repository's existing GitHub Actions and Docker/Compose production process remains authoritative pending explicit runtime confirmation. Required release sequence is build, lint/type-check, unit/integration tests, golden path, migration SQL review, security checks, then the existing deployment workflow.

Rollback must use the existing image/version rollback procedure documented in `DEPLOYMENT_HANDOFF.md` and production deployment documents. Database rollback is not assumed safe: additive migrations require a forward-compatible rollback plan; destructive migrations require separate human approval and are outside WOS-0001.

## Environment/secrets matrix

| Environment | State | Data | Secrets boundary |
|---|---|---|---|
| Local | developer Compose/Turbo | disposable local Postgres/Redis | `.env`/shell only; never commit |
| Test | CI/test configuration | isolated test database and fake providers | CI secret store; no production credentials |
| Staging | existing deployment process to be confirmed | isolated staging data | deployment secret store; scoped credentials |
| Production | existing Docker/Compose + GitHub deployment path | live PostgreSQL | host/CI secret stores only; never logs or Discord |
