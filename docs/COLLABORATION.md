# WISE² Core Collaboration

## Roles

- **Daniel** — repository owner and final production approver.
- **Darrin** — collaborator with Write access.

## Branch workflow

1. Start from the latest `main`.
2. Create a focused branch using `feat/`, `fix/`, `chore/`, or `docs/`.
3. Make one purpose-driven change per pull request.
4. Open a pull request into `main` using the template.
5. The other collaborator reviews it. Daniel gives final approval for production-impacting changes.
6. Merge only after checks pass and the pull request is approved.
7. Delete the branch after merge.

## Production safety

Never commit passwords, API keys, Telnyx credentials, database URLs, private keys, or `.env` files. Store secrets in the deployment platform or server environment only.

## Issue ownership

Open an issue before starting work that changes product behavior, infrastructure, mobile builds, or customer data. Include an owner, expected outcome, and verification steps.