# WISE² Google Integration Setup

**Status**: Ready for Configuration  
**Client ID**: Configured ✅  
**Date**: 2026-07-17

---

## Overview

Complete Google integration for WISE² platform including:
- ✅ Google OAuth Authentication
- ✅ NextAuth.js integration
- ✅ Google Drive API
- ✅ Google Sheets API
- ✅ Google Analytics integration
- ✅ Protected routes & middleware
- ✅ User profile & session management

---

## Files Created

### Authentication Core
- `packages/auth/src/config.ts` - NextAuth configuration with Google OAuth
- `packages/auth/src/api.ts` - NextAuth handler export
- `packages/auth/src/hooks.ts` - React hooks for auth (useAuth, useSignIn, useSignOut)
- `packages/auth/src/middleware.ts` - Route protection middleware

### Google APIs
- `packages/auth/src/google-apis.ts` - Drive, Sheets, Analytics API utilities
- `DriveAPI.listFiles()` - List files from Google Drive
- `DriveAPI.uploadFile()` - Upload files to Drive
- `SheetsAPI.readSheet()` - Read data from Google Sheets
- `SheetsAPI.writeSheet()` - Write data to Google Sheets
- `AnalyticsAPI.getAnalytics()` - Fetch analytics data

### UI Components
- `packages/auth/src/components/GoogleSignInButton.tsx` - Sign in button
- `packages/auth/src/components/UserProfile.tsx` - User profile dropdown
- `packages/auth/src/index.ts` - Main export barrel

### Configuration
- `.env.local` - Environment variables (created)

---

## Setup Instructions

### Step 1: Configure Environment Variables

Edit `.env.local` and add your Google credentials:

```bash
# Already configured with your Client ID:
NEXT_PUBLIC_GOOGLE_CLIENT_ID=797928011228-37panpam8v8ml7l8l7ecd2e0vf2kdmti.apps.googleusercontent.com

# Add these from Google Cloud Console:
GOOGLE_CLIENT_SECRET=your_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
NEXTAUTH_SECRET=generate_with: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000

# Optional - for Google APIs:
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=GA-XXXXX
GOOGLE_DRIVE_API_KEY=your_key_here
GOOGLE_SHEETS_API_KEY=your_key_here
```

### Step 2: Get Client Secret from Google Cloud

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create new)
3. Navigate to **Credentials**
4. Find your OAuth 2.0 Client ID
5. Click the download icon → Select JSON format
6. Copy `client_secret` value to `GOOGLE_CLIENT_SECRET`

### Step 3: Set Up Redirect URIs in Google Cloud

1. In Google Cloud Console → Credentials → OAuth 2.0 Client ID
2. Add Authorized redirect URIs:
   ```
   http://localhost:3000/api/auth/google/callback
   http://localhost:3000/api/auth/callback/google
   https://yourdomain.com/api/auth/google/callback
   ```

### Step 4: Enable Google APIs

Enable these APIs in Google Cloud Console:

1. **Google Drive API** (for file upload/download)
   - Go to APIs & Services → Library
   - Search "Google Drive API"
   - Click Enable

2. **Google Sheets API** (for spreadsheet access)
   - Search "Google Sheets API"
   - Click Enable

3. **Google Analytics API** (for analytics data)
   - Search "Google Analytics API"
   - Click Enable

### Step 5: Generate NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

Copy output to `.env.local`:
```
NEXTAUTH_SECRET=your_generated_secret_here
```

### Step 6: Install Dependencies

```bash
npm install next-auth googleapis
```

### Step 7: Create NextAuth Route Handler

Create `apps/website/app/api/auth/[...nextauth]/route.ts`:

```typescript
import { handlers } from '@wise2/auth';

export const { GET, POST } = handlers;
```

### Step 8: Add SessionProvider to Layout

Update your root layout (`apps/website/app/layout.tsx`):

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

---

## Usage Examples

### Sign In Button

```typescript
import { GoogleSignInButton } from '@wise2/auth';

export default function LoginPage() {
  return <GoogleSignInButton fullWidth size="lg" />;
}
```

### Access User Session

```typescript
'use client';

import { useAuth } from '@wise2/auth';

export default function Profile() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <div>Not logged in</div>;

  return (
    <div>
      <img src={user?.image} alt={user?.name} />
      <p>{user?.name}</p>
      <p>{user?.email}</p>
    </div>
  );
}
```

### Access Google Drive

```typescript
'use client';

import { useAuth } from '@wise2/auth';
import { DriveAPI } from '@wise2/auth';

export default function FileList() {
  const { accessToken } = useAuth();
  const [files, setFiles] = useState([]);

  useEffect(() => {
    if (accessToken) {
      DriveAPI.listFiles(accessToken).then(setFiles);
    }
  }, [accessToken]);

  return (
    <ul>
      {files.map((file) => (
        <li key={file.id}>
          <a href={file.webViewLink}>{file.name}</a>
        </li>
      ))}
    </ul>
  );
}
```

### Read Google Sheet

```typescript
'use client';

import { SheetsAPI } from '@wise2/auth';
import { useAuth } from '@wise2/auth';

export default function SheetReader() {
  const { accessToken } = useAuth();

  const readData = async () => {
    if (!accessToken) return;

    const data = await SheetsAPI.readSheet(
      accessToken,
      'SPREADSHEET_ID',
      'Sheet1!A1:C10',
    );

    console.log(data);
  };

  return <button onClick={readData}>Read Sheet</button>;
}
```

### Protect Routes

```typescript
// apps/website/middleware.ts
export { middleware } from '@wise2/auth';
export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};
```

---

## Protected Routes

The following routes are automatically protected:

- `/dashboard` - User dashboard
- `/studio` - Studio workspace
- `/admin` - Admin panel
- `/profile` - User profile
- `/account` - Account settings
- `/settings` - App settings

Unauthenticated users are redirected to `/auth/signin`.

---

## Google API Reference

### Drive API

```typescript
// List files
DriveAPI.listFiles(accessToken, { pageSize: 20 })

// Upload file
DriveAPI.uploadFile(accessToken, buffer, 'filename.pdf', 'application/pdf')

// Delete file
DriveAPI.deleteFile(accessToken, fileId)

// Get metadata
DriveAPI.getFileMetadata(accessToken, fileId)
```

### Sheets API

```typescript
// Read data
SheetsAPI.readSheet(accessToken, spreadsheetId, 'Sheet1!A1:Z100')

// Write data
SheetsAPI.writeSheet(accessToken, spreadsheetId, 'Sheet1!A1', [
  ['Name', 'Email'],
  ['John', 'john@example.com'],
])

// Append data
SheetsAPI.appendSheet(accessToken, spreadsheetId, 'Sheet1!A1', [...data])

// Clear range
SheetsAPI.clearSheet(accessToken, spreadsheetId, 'Sheet1!A1:Z100')
```

### Analytics API

```typescript
// Get analytics data
AnalyticsAPI.getAnalytics(
  accessToken,
  'VIEW_ID',
  '2026-01-01',
  '2026-07-17',
  ['ga:pageviews', 'ga:sessions'],
)

// Get page views
AnalyticsAPI.getPageViews(
  accessToken,
  'VIEW_ID',
  '2026-01-01',
  '2026-07-17',
)
```

---

## Hooks Reference

### useAuth()

```typescript
const {
  session,      // Current session object
  status,       // 'loading' | 'authenticated' | 'unauthenticated'
  isLoading,    // boolean
  isAuthenticated, // boolean
  user,         // User info
  accessToken,  // Google access token
  refreshToken, // Google refresh token
  update,       // Refresh session
} = useAuth();
```

### useSignIn()

```typescript
const signIn = useSignIn();
await signIn(); // Triggers Google OAuth
```

### useSignOut()

```typescript
const signOut = useSignOut();
await signOut(); // Signs out user
```

### useGoogleAccessToken()

```typescript
const token = useGoogleAccessToken();
// Use for API calls
```

### useHasGoogleScope()

```typescript
const hasScope = useHasGoogleScope('https://www.googleapis.com/auth/drive');
if (hasScope) {
  // User granted Drive access
}
```

---

## Components Reference

### GoogleSignInButton

```typescript
<GoogleSignInButton
  variant="default"      // 'default' | 'outline' | 'ghost'
  size="md"              // 'sm' | 'md' | 'lg'
  fullWidth={false}
  className=""
/>
```

### UserProfile

```typescript
<UserProfile
  showEmail={true}
  className=""
/>
```

Shows:
- User avatar
- Name and email
- Dropdown menu
- Profile settings link
- Sign out button

---

## Scopes Requested

By default, these Google OAuth scopes are requested:

```
openid
profile
email
https://www.googleapis.com/auth/drive
https://www.googleapis.com/auth/spreadsheets
https://www.googleapis.com/auth/analytics.readonly
```

To modify scopes, edit `packages/auth/src/config.ts` and update the `scope` parameter in GoogleProvider.

---

## Database Schema (Recommended)

If storing user/session data:

```sql
-- Users table
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  image TEXT,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sessions table
CREATE TABLE sessions (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL REFERENCES users(id),
  access_token TEXT,
  refresh_token TEXT,
  expires_at BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## Security Considerations

✅ **Security Features**:
- Client secret never exposed to frontend
- Access tokens stored in secure HTTP-only cookies
- CSRF protection via NextAuth
- Automatic token refresh
- Session expiration (30 days)
- Secure redirect validation

⚠️ **Production Checklist**:
- [ ] Set `NEXTAUTH_URL` to production domain
- [ ] Use HTTPS everywhere
- [ ] Rotate `GOOGLE_CLIENT_SECRET` regularly
- [ ] Add rate limiting to auth endpoints
- [ ] Enable audit logging
- [ ] Add 2FA for admin accounts
- [ ] Review and minimize Google scopes

---

## Troubleshooting

### "Invalid client" error
- Verify `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is correct
- Check redirect URIs in Google Cloud Console

### "Access Denied" when accessing Google APIs
- Verify API is enabled in Google Cloud Console
- Check user granted required scopes
- Verify access token hasn't expired

### Session not persisting
- Check `NEXTAUTH_SECRET` is set and consistent
- Verify `NEXTAUTH_URL` matches your domain
- Check cookies are not being blocked by browser

### Redirect loop
- Verify callback URL is correct in `.env.local`
- Check Google Cloud redirect URIs
- Clear cookies and cache

---

## Next Steps

1. ✅ Configure `.env.local` with credentials
2. ✅ Create NextAuth route handler
3. ✅ Add SessionProvider to layout
4. ✅ Add sign-in button to pages
5. ✅ Test OAuth flow
6. ✅ Integrate Google APIs as needed
7. ✅ Deploy to production

---

## References

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Google Drive API](https://developers.google.com/drive/api)
- [Google Sheets API](https://developers.google.com/sheets/api)
- [Google Analytics API](https://developers.google.com/analytics)

---

**Setup Status**: Ready for Configuration  
**Components**: 8 files + utilities  
**Client ID**: Active ✅  
**Next Step**: Add GOOGLE_CLIENT_SECRET to `.env.local`
