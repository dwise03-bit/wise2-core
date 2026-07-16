# WISE² Sound Labs — Test Credentials

## Admin (only user)
- Email: `dwise@wise2.net`
- Password: `Glock19!`
- Role: Administrator

## Auth Endpoints
- POST `/api/auth/login` — {email, password} → {token, user}
- GET  `/api/auth/me`   — Bearer token required

## Notes
Auth: JWT (7-day expiry, HS256). Token returned in JSON, stored in localStorage as `wise2_token`, sent as `Authorization: Bearer <token>` header on every request.
