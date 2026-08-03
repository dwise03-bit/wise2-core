# WISE² Google Integration - Setup Checklist

**Owner**: dwise03@gmail.com  
**Date**: 2026-07-18  
**Status**: Ready for Final Configuration

---

## Account Information

- **Email**: dwise03@gmail.com
- **Google Client ID**: 797928011228-37panpam8v8ml7l8l7ecd2e0vf2kdmti.apps.googleusercontent.com
- **Project**: WISE² Enterprise

---

## ✅ Phase 1: Complete (Infrastructure)

- [x] NextAuth.js configuration
- [x] Google OAuth provider setup
- [x] React authentication hooks
- [x] Google Drive API utilities
- [x] Google Sheets API utilities
- [x] Google Analytics utilities
- [x] Sign-in/Sign-out components
- [x] Route protection middleware
- [x] Session management
- [x] Documentation

---

## ⬜ Phase 2: Configuration (In Progress)

### Step 1: Retrieve Google Client Secret

**Location**: [Google Cloud Console](https://console.cloud.google.com/)

Instructions:
1. Sign in with dwise03@gmail.com
2. Select your WISE² project
3. Go to **APIs & Services** → **Credentials**
4. Find **OAuth 2.0 Client ID** (797928011228-37panpam8v8ml...)
5. Click the download icon (or pencil to view)
6. Copy the `client_secret` value

**Status**: ⬜ Pending

---

### Step 2: Configure Environment Variables

**File**: `.env.local` (already created)

Add your client secret:
```bash
# Add this line (replace with actual secret):
GOOGLE_CLIENT_SECRET=your_actual_client_secret_here

# Generate a secure auth secret:
openssl rand -base64 32
# Copy the output and add as:
NEXTAUTH_SECRET=your_generated_secret_here
```

**Command to generate secret:**
```bash
openssl rand -base64 32
```

**Status**: ⬜ Pending

---

### Step 3: Enable Google APIs in Cloud Console

**Required APIs**:

1. **Google Drive API**
   - [ ] Go to APIs & Services → Library
   - [ ] Search: "Google Drive API"
   - [ ] Click "Enable"
   - [ ] Verify status shows "Enabled"

2. **Google Sheets API**
   - [ ] Search: "Google Sheets API"
   - [ ] Click "Enable"
   - [ ] Verify status shows "Enabled"

3. **Google Analytics API**
   - [ ] Search: "Google Analytics API"
   - [ ] Click "Enable"
   - [ ] Verify status shows "Enabled"

**Status**: ⬜ Pending

---

### Step 4: Add Authorized Redirect URIs

**In Google Cloud Console**:
1. APIs & Services → Credentials
2. Click your OAuth 2.0 Client ID
3. Add to "Authorized redirect URIs":

**Development:**
```
http://localhost:3000/api/auth/google/callback
http://localhost:3000/api/auth/callback/google
```

**Production** (update later):
```
https://wise2.net/api/auth/google/callback
https://wise2.net/api/auth/callback/google
```

**Status**: ⬜ Pending

---

### Step 5: Install Dependencies

```bash
npm install next-auth googleapis
```

**Status**: ⬜ Pending

---

### Step 6: Create NextAuth Route Handler

**File**: `apps/website/app/api/auth/[...nextauth]/route.ts`

```typescript
import { handlers } from '@wise2/auth';

export const { GET, POST } = handlers;
```

**File**: `apps/dashboard/app/api/auth/[...nextauth]/route.ts`

```typescript
import { handlers } from '@wise2/auth';

export const { GET, POST } = handlers;
```

**Status**: ⬜ Pending

---

### Step 7: Add SessionProvider to Layouts

**File**: `apps/website/app/layout.tsx`

```typescript
import { SessionProvider } from 'next-auth/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
```

**Also add to**:
- `apps/dashboard/app/layout.tsx`
- `apps/studio/app/layout.tsx`

**Status**: ⬜ Pending

---

### Step 8: Add Sign-In Page

**File**: `apps/website/app/auth/signin/page.tsx`

```typescript
'use client';

import { GoogleSignInButton } from '@wise2/auth';
import { useSearchParams } from 'next/navigation';

export default function SignInPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  return (
    <div className="min-h-screen flex items-center justify-center bg-wise-bg">
      <div className="w-full max-w-md p-8 bg-wise-surface rounded-lg border border-wise-medium">
        <h1 className="text-3xl font-bold text-wise-text-primary mb-2">
          Welcome to WISE²
        </h1>
        <p className="text-wise-text-secondary mb-8">
          Sign in to access your studio and dashboard
        </p>
        
        <GoogleSignInButton fullWidth size="lg" />
        
        <p className="text-sm text-wise-text-muted text-center mt-6">
          By signing in, you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
}
```

**Status**: ⬜ Pending

---

### Step 9: Add User Profile to Navigation

Add to your header/navigation component:

```typescript
import { UserProfile } from '@wise2/auth';

export default function Header() {
  return (
    <header>
      <nav>
        {/* ... other nav items ... */}
        <UserProfile />
      </nav>
    </header>
  );
}
```

**Status**: ⬜ Pending

---

### Step 10: Add Middleware for Route Protection

**File**: `apps/website/middleware.ts`

```typescript
export { middleware } from '@wise2/auth';
export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/studio/:path*'],
};
```

**Status**: ⬜ Pending

---

## ⬜ Phase 3: Testing

### Local Testing

- [ ] Start dev server: `npm run dev`
- [ ] Navigate to http://localhost:3000/auth/signin
- [ ] Click "Sign in with Google"
- [ ] Verify OAuth flow works
- [ ] Confirm redirected to dashboard
- [ ] Verify user profile shows name/email
- [ ] Test sign out
- [ ] Verify redirected to sign-in page
- [ ] Test protected route access

### API Testing

- [ ] Test Drive API: List files
- [ ] Test Sheets API: Read sheet
- [ ] Test Analytics API: Fetch data
- [ ] Verify token refresh working
- [ ] Test session persistence

### UI Component Testing

- [ ] GoogleSignInButton renders
- [ ] UserProfile dropdown works
- [ ] Loading states display
- [ ] Error messages show
- [ ] Mobile responsive

---

## ⬜ Phase 4: Production Deployment

### Pre-Deployment

- [ ] Generate production `NEXTAUTH_SECRET`
- [ ] Update `.env.production` with credentials
- [ ] Add production redirect URIs to Google Cloud
- [ ] Set `NEXTAUTH_URL=https://wise2.net`
- [ ] Enable HTTPS everywhere
- [ ] Set up secure cookie configuration

### Deployment Steps

- [ ] Deploy to production
- [ ] Verify OAuth flow on production domain
- [ ] Test all protected routes
- [ ] Monitor authentication logs
- [ ] Set up error tracking
- [ ] Create admin account
- [ ] Test admin access

### Post-Deployment

- [ ] Update Google Analytics ID if applicable
- [ ] Set up monitoring/alerts
- [ ] Document user onboarding
- [ ] Create help documentation
- [ ] Schedule security review

---

## 🔒 Security Checklist

- [ ] `GOOGLE_CLIENT_SECRET` is not in version control
- [ ] `NEXTAUTH_SECRET` is strong and secure
- [ ] HTTPS enabled on production
- [ ] Secure cookies enabled
- [ ] CSRF protection active
- [ ] Rate limiting on auth endpoints
- [ ] Audit logging enabled
- [ ] Session timeout configured (30 days)
- [ ] Automatic token refresh working
- [ ] Minimal Google scopes requested

---

## 📊 Integration Checklist

**Authentication**:
- [ ] Google OAuth working
- [ ] JWT sessions established
- [ ] User data persisted
- [ ] Session refresh functional

**Drive Integration**:
- [ ] List files API working
- [ ] File upload functional
- [ ] File delete working
- [ ] Metadata retrieval operational

**Sheets Integration**:
- [ ] Read data working
- [ ] Write data working
- [ ] Append data working
- [ ] Clear data working

**Analytics Integration**:
- [ ] Analytics API connected
- [ ] Data retrieval working
- [ ] Metrics displaying correctly

---

## 📝 Implementation Timeline

| Phase | Task | Timeline | Status |
|-------|------|----------|--------|
| 1 | Infrastructure Complete | ✅ Complete | ✅ DONE |
| 2a | Get Client Secret | Today | ⬜ Pending |
| 2b | Configure Env Vars | Today | ⬜ Pending |
| 2c | Enable APIs | Today | ⬜ Pending |
| 2d | Setup Routes | Today | ⬜ Pending |
| 2e | Add Components | Today | ⬜ Pending |
| 3 | Local Testing | Tomorrow | ⬜ Pending |
| 4 | Production Deploy | Day 3 | ⬜ Pending |

---

## 💻 Quick Command Reference

```bash
# Start development server
npm run dev

# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Install auth dependencies
npm install next-auth googleapis

# Test authentication
curl http://localhost:3000/api/auth/session

# View logs
npm run logs

# Deploy to production
npm run build && npm run deploy
```

---

## 📞 Support Resources

- **NextAuth.js Docs**: https://next-auth.js.org/
- **Google OAuth Docs**: https://developers.google.com/identity/protocols/oauth2
- **Google Cloud Console**: https://console.cloud.google.com/
- **Setup Guide**: `GOOGLE_INTEGRATION_SETUP.md`
- **Email**: dwise03@gmail.com

---

## 🎯 Success Criteria

✅ When complete, you will have:

1. **OAuth Authentication**
   - Users can sign in with Google
   - Sessions persist across requests
   - Automatic token refresh

2. **Protected Routes**
   - /dashboard requires authentication
   - /admin restricted to admins
   - /studio accessible to authenticated users

3. **Google API Access**
   - Drive: Upload/download files
   - Sheets: Read/write spreadsheet data
   - Analytics: Track user activity

4. **User Experience**
   - Smooth sign-in flow
   - User profile dropdown
   - Easy sign-out
   - Protected route redirects

5. **Security**
   - Secrets never exposed
   - Tokens automatically refreshed
   - Sessions expire properly
   - CSRF protection active

---

**Last Updated**: 2026-07-18  
**Status**: Ready for Configuration  
**Next Step**: Retrieve Google Client Secret

Start with **Step 1** above! 🚀
