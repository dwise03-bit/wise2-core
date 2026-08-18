# Milestone 12 — Authentication and User Persistence

WISE TOUCH now supports account registration, login, logout, signed seven-day HttpOnly sessions, bcrypt password hashing, and protected user-scoped favorites/assets persistence.

`DATABASE_URL` activates PostgreSQL with automatically initialized `wt_users` and `wt_user_state` tables. Without it, development and tests use an in-memory repository while retaining the same service and route contracts. Existing browser data is merged into an authenticated account on first sync and remains as a local backup.

Production requires a strong `AUTH_SECRET`, HTTPS (`NODE_ENV=production` enables Secure session cookies), and PostgreSQL.
