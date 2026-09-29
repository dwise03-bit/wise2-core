# Google OAuth Login Fix

## Issue
Google OAuth login on wise2.net was failing because of a callback URL mismatch.

## Root Cause
The `GOOGLE_CALLBACK_URL` environment variable was configured incorrectly:
- **Incorrect**: `https://api.wise2.net/auth/google/callback`
- **Correct**: `https://api.wise2.net/v1/auth/google/callback`

The API routes are prefixed with `/v1/auth/`, so the full path to the callback endpoint is `/v1/auth/google/callback`.

## What Was Fixed
Updated `.env.production` to use the correct callback URL:
```
GOOGLE_CALLBACK_URL=https://api.wise2.net/v1/auth/google/callback
```

Also updated template files:
- `.env.production.example`
- `.env.prod.local`
- `.env` (local dev)

## Steps to Deploy
1. **Update Google OAuth App Settings**
   - Go to https://console.cloud.google.com/apis/credentials
   - Find the OAuth 2.0 Client ID for WISE² (web application)
   - Update Authorized redirect URIs to include:
     ```
     https://api.wise2.net/v1/auth/google/callback
     ```
   - Remove the old (incorrect) URI if it exists:
     ```
     https://api.wise2.net/auth/google/callback
     ```

2. **Deploy to Production**
   ```bash
   # The .env.production file is already updated
   # Push to production and restart services
   git push origin main
   # On production server:
   docker-compose -f docker-compose.production.yml restart api
   ```

3. **Test the Login Flow**
   - Navigate to https://wise2.net/login
   - Click "Continue with Google"
   - Verify you're redirected to Google consent screen
   - Accept permissions
   - Should be redirected back to dashboard with token

## Troubleshooting
If login still fails after deploying:

1. Check environment variables on production:
   ```bash
   ssh user@173.208.147.165
   grep GOOGLE /path/to/.env.production
   ```

2. Verify API logs:
   ```bash
   docker-compose logs api | grep -i google
   ```

3. Confirm Google OAuth app has correct callback URI registered

4. Clear browser cookies and cache, then retry

## OAuth Token Exchange Flow
```
1. User clicks "Continue with Google" on login page
   ↓
2. Browser redirects to:
   https://accounts.google.com/o/oauth2/v2/auth?
     client_id=...&
     redirect_uri=https://api.wise2.net/v1/auth/google/callback&
     response_type=code&
     scope=openid+email+profile
   ↓
3. User logs into Google and grants permissions
   ↓
4. Google redirects to:
   https://api.wise2.net/v1/auth/google/callback?code=...
   ↓
5. API exchanges code for tokens:
   POST https://oauth2.googleapis.com/token
   {
     code: "...",
     client_id: "...",
     client_secret: "...",
     redirect_uri: "https://api.wise2.net/v1/auth/google/callback",
     grant_type: "authorization_code"
   }
   ↓
6. API fetches user info:
   GET https://www.googleapis.com/oauth2/v2/userinfo
   Authorization: Bearer {google_access_token}
   ↓
7. API creates/finds WISE² user and returns JWT tokens
   ↓
8. Browser receives JWT and redirects to dashboard
```

## Files Modified
- `.env.production` - Fixed GOOGLE_CALLBACK_URL
- `.env.production.example` - Added GOOGLE_CALLBACK_URL example
- `.env.prod.local` - Fixed GOOGLE_CALLBACK_URL
- `.env` - Added GOOGLE_CALLBACK_URL for local dev

## Related Code
- Auth Controller: `packages/api/src/auth/auth.controller.ts`
  - Route: `@Get('google/callback')` under `@Controller('v1/auth')`
- Auth Service: `packages/api/src/auth/auth.service.ts`
  - Method: `handleGoogleCallback(code: string)`
- Login Page: `apps/website/app/auth/login/page.tsx`
  - Button click: `window.location.href = ${NEXT_PUBLIC_API_URL}/v1/auth/google/authorize`
