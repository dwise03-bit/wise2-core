# Milestone 13 — Production VPS Deployment

The production stack packages the React build and Express API into a non-root, read-only application container. Docker Compose orchestrates it with PostgreSQL and an HTTPS Caddy edge proxy. PostgreSQL is isolated on an internal network; only Caddy publishes ports.

Health-gated startup prevents the application from starting before PostgreSQL is ready and prevents the proxy from starting before the application is healthy. Production startup requires persistent database configuration and an authentication secret. See `deploy/README.md` for provisioning, release, rollback, and operating procedures.
