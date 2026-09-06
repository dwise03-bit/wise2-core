# Persistent Login Setup — WISE² Core

## Overview

This document describes the persistent login implementation across WISE² Core apps (website, dashboard, admin). Authentication sessions now persist across browser refreshes, tab changes, and page navigation using NextAuth.js.

## What Changed

### 1. **SessionProvider Component** (`packages/auth/src/SessionProvider.tsx`)
- New client-side wrapper around NextAuth's SessionProvider
- Enables automatic session restoration on page load
- Includes session refetch every 5 minutes and on window focus
- **Key props:**
  - `session`: Initial session from server (passed from layout)
  - `refetchInterval`: 5 minutes (300 seconds) — check token validity
  - `refetchOnWindowFocus`: true — restore session when user returns to tab

### 2. **App Layouts Updated**

#### Website (`apps/website/app/layout.tsx`)
```tsx
export default async function RootLayout() {
  const session = await auth();  // Get session server-side
  return (
    <SessionProvider session={session}>
      <ToastProvider>
        {children}
      </ToastProvider>
    </SessionProvider>
  );
}
```

#### Dashboard (`apps/dashboard/app/layout.tsx`)
```tsx
export default async function RootLayout() {
  const session = await auth();  // Get session server-side
  return (
    <SessionProvider session={session}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </SessionProvider>
  );
}
```

#### Admin (`apps/admin/app/layout.tsx`)
```tsx
export default async function RootLayout() {
  const session = await auth();  // Get session server-side
  return (
    <SessionProvider session={session}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </SessionProvider>
  );
}
```

### 3. **Environment Configuration** (`.env` / `.env.example`)
```env
# NextAuth configuration
NEXTAUTH_URL=https://wise2.net
NEXTAUTH_SECRET=__GENERATED_AT_DEPLOYMENT__
NEXT_PUBLIC_GOOGLE_CLIENT_ID=G.bqsQu5ZoS7WlKvmhpxBLCA.y85F959qkmodDGGOHPc-MmcWqfYEEidhnR-D9fjZSWE
```

**Important:** Replace `NEXTAUTH_SECRET` with a secure random value on deployment:
```bash
openssl rand -base64 32
```

### 4. **Middleware** (`middleware.ts`)
- Runs on every request to check session validity
- Protects routes requiring authentication
- Forwards user info to route handlers via headers
- **Protected routes:**
  - `/dashboard/*`
  - `/admin/*`
  - `/sound-labs/*`
  - `/settings/*`
  - `/profile/*`

## How Persistent Login Works

### Session Flow

```
1. User logs in via Google OAuth
   ↓
2. NextAuth creates JWT token stored in secure HTTP-only cookie
   ↓
3. Layout component gets session via auth() server-side
   ↓
4. SessionProvider initialized with session
   ↓
5. Browser loads, SessionProvider restores session from cookie
   ↓
6. User stays logged in across:
   - Page refresh (F5)
   - Tab navigation
   - Window focus (5-min refetch)
   - New tabs (cookie-based)
```

### Session Lifespan

- **JWT Max Age:** 30 days (configured in `authOptions`)
- **Session Refetch:** Every 5 minutes
- **Cookie:** HttpOnly, Secure, SameSite=Lax
- **Rotation:** Token refreshed automatically on refetch

## Configuration Details

### NextAuth Options (`packages/auth/src/config.ts`)

```ts
export const authOptions: NextAuthOptions = {
  providers: [GoogleProvider(...)],
  session: {
    strategy: 'jwt',        // Use JWT tokens
    maxAge: 30 * 24 * 60 * 60,  // 30 days
    updateAge: 24 * 60 * 60,    // Refresh after 24 hours
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 30 * 24 * 60 * 60,  // 30 days
  },
  callbacks: {
    jwt({ token, account, profile }) {
      // Persist OAuth tokens to JWT
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
      }
      return token;
    },
    session({ session, token }) {
      // Add tokens to session for API calls
      (session as any).accessToken = token.accessToken;
      (session as any).refreshToken = token.refreshToken;
      return session;
    },
  },
};
```

## Using the Session in Components

### In Server Components
```ts
import { auth } from '@wise2/auth';

export default async function MyPage() {
  const session = await auth();
  
  if (!session) {
    redirect('/auth/signin');
  }
  
  return <div>Welcome, {session.user?.email}</div>;
}
```

### In Client Components
```tsx
'use client';

import { useAuth } from '@wise2/auth';

export function MyComponent() {
  const { session, isLoading, isAuthenticated } = useAuth();
  
  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please log in</div>;
  
  return <div>Welcome, {session?.user?.email}</div>;
}
```

## Deployment Checklist

- [ ] Set `NEXTAUTH_SECRET` to a secure random value
- [ ] Set `NEXTAUTH_URL` to production domain
- [ ] Verify Google OAuth credentials are set
- [ ] Test login on production
- [ ] Test session persistence (refresh page, open new tab)

## Related Files

- `packages/auth/src/config.ts` — NextAuth configuration
- `packages/auth/src/hooks.ts` — Auth hooks
- `packages/auth/src/SessionProvider.tsx` — Session provider
- `middleware.ts` — Route protection middleware
- `.env` — Environment variables

---

**Status:** ✅ Persistent login enabled across all apps
