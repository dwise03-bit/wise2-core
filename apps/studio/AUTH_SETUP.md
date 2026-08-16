# Authentication Setup for SoundLabs Studio

This document describes the authentication system implementation for SoundLabs Studio.

## Overview

The authentication system provides:
- User registration (signup) with email and password
- User login with email and password
- JWT-based session management
- Automatic token refresh
- Protected routes for authenticated users
- Logout functionality

## Architecture

### Frontend Components

1. **API Client** (`lib/api-client.ts`)
   - HTTP client with automatic JWT token management
   - Handles token storage in localStorage
   - Automatic token refresh on 401 responses
   - Redirects to `/auth` on token expiry

2. **Auth Hook** (`hooks/useAuth.ts`)
   - React hook for auth state management
   - Provides `login()`, `signup()`, `logout()` methods
   - Manages loading and error states
   - Tracks authentication status

3. **Auth Components** (`components/Auth/`)
   - `LoginForm.tsx` - Email/password login form
   - `SignupForm.tsx` - Registration form with password confirmation
   - `ProtectedRoute.tsx` - Wrapper for protected pages

4. **Auth Page** (`app/auth/page.tsx`)
   - Login/signup UI with form switching
   - Redirects to workspace on successful login

### Backend Integration

The frontend communicates with the NestJS API at `packages/api/src/auth/`:
- `POST /v1/auth/signup` - Register new user
- `POST /v1/auth/login` - Login and get tokens
- `POST /v1/auth/logout` - Logout and revoke tokens
- `POST /v1/auth/refresh` - Refresh access token
- `POST /v1/auth/verify-email` - Verify email address
- `POST /v1/auth/password-reset` - Request password reset
- `POST /v1/auth/password-reset/confirm` - Confirm password reset
- `POST /v1/auth/change-password` - Change password (authenticated)

## Password Requirements

For security, passwords must meet these requirements:
- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one digit (0-9)
- At least one special character (!@#$%^&*()_+-=\[\]{};':"\\|,.<>\/?")

Example valid password: `MyPassword123!`

## Database Schema

The database uses Prisma with the following User model:

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  passwordHash  String
  role          UserRole  @default(CUSTOMER)
  
  subscription      Subscription?
  projects          Project[]
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Project {
  id              String    @id @default(cuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  title           String
  description     String?
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}
```

## Environment Configuration

### Frontend (.env.local)

```bash
# Point to your API backend
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Backend (.env)

```bash
# JWT Configuration
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRATION=900  # 15 minutes in seconds

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/wise2

# Email (for verification and password reset)
EMAIL_PROVIDER=sendgrid  # or smtp
SENDGRID_API_KEY=your-key
```

## Usage

### 1. User Registration

```typescript
import { useAuth } from '@/hooks/useAuth';

function SignupComponent() {
  const { signup, isLoading, error } = useAuth();
  
  const handleSignup = async (email: string, password: string) => {
    try {
      await signup(email, password, 'John Doe');
      // Redirect to login or show verification message
    } catch (err) {
      console.error('Signup failed:', err);
    }
  };
}
```

### 2. User Login

```typescript
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

function LoginComponent() {
  const { login, isLoading, error } = useAuth();
  const router = useRouter();
  
  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
      router.push('/workspace');
    } catch (err) {
      console.error('Login failed:', err);
    }
  };
}
```

### 3. Protected Routes

```typescript
import { ProtectedRoute } from '@/components/Auth/ProtectedRoute';

export default function WorkspacePage() {
  return (
    <ProtectedRoute>
      <YourWorkspaceContent />
    </ProtectedRoute>
  );
}
```

### 4. Check Authentication Status

```typescript
import { useAuth } from '@/hooks/useAuth';

function UserProfile() {
  const { user, isAuthenticated, logout } = useAuth();
  
  if (!isAuthenticated) return <div>Please log in</div>;
  
  return (
    <div>
      <p>Welcome, {user?.email}</p>
      <button onClick={logout}>Sign Out</button>
    </div>
  );
}
```

## Authentication Flow

1. **Signup**
   - User enters email, password, and optional name
   - Frontend validates password strength
   - API creates user with hashed password
   - Verification email sent (if email service configured)
   - User directed to login

2. **Login**
   - User enters email and password
   - API validates credentials
   - API returns `accessToken` and `refreshToken`
   - Tokens stored in localStorage
   - User redirected to `/workspace`

3. **Authenticated Requests**
   - All API requests include `Authorization: Bearer <accessToken>` header
   - API validates token before processing request

4. **Token Refresh**
   - If access token expires (401 response)
   - Frontend automatically uses refresh token
   - New access token generated without user interaction
   - Request retried with new token

5. **Logout**
   - API revokes all user sessions
   - Frontend clears tokens from localStorage
   - User redirected to `/auth`

## Security Considerations

- **Passwords**: Hashed with bcrypt on backend, never stored plain text
- **Tokens**: JWT signed with secret key, expire after 15 minutes
- **HTTPS**: Always use HTTPS in production
- **CORS**: API should have appropriate CORS configuration
- **Token Storage**: localStorage used for simplicity; httpOnly cookies recommended for production
- **Refresh Tokens**: Should have longer expiration (7+ days)
- **Email Verification**: Prevents account takeover via fake emails
- **Rate Limiting**: Signup and login endpoints are rate-limited

## Testing

### Test Signup
1. Navigate to `/auth`
2. Click "Sign up" tab
3. Enter email (must be valid format)
4. Enter password meeting requirements
5. Confirm password
6. Click "Create account"
7. On success, switch to login tab

### Test Login
1. Navigate to `/auth`
2. Enter registered email
3. Enter password
4. Click "Sign in"
5. Should redirect to `/workspace` on success

### Test Protected Routes
1. Log out from `/workspace`
2. Try to navigate to `/workspace` directly
3. Should redirect to `/auth`

### Test Token Refresh
1. Login to get tokens
2. Wait for token to expire or manually remove token from localStorage
3. Try to make API call
4. Should automatically refresh token

## Troubleshooting

### "Invalid email or password"
- Verify email and password are correct
- Check that email is verified (if required)
- Ensure email format is valid

### "Password must contain..."
- Password doesn't meet complexity requirements
- Check password requirements section above
- Example: `TestPass123!`

### "Email already registered"
- Email is already in use
- Try logging in instead
- Or use different email for new account

### Token refresh failures
- Verify `NEXT_PUBLIC_API_URL` is correct in `.env.local`
- Check backend is running and accessible
- Verify JWT_SECRET matches between frontend and backend

### Logout redirect not working
- Verify router configuration
- Check browser console for errors
- Ensure `/auth` route exists

## Future Improvements

For production, consider adding:
1. **OAuth/Social Login** - Google, GitHub, etc.
2. **Two-Factor Authentication** - TOTP or SMS
3. **Session Management** - Device tracking, session revocation
4. **Audit Logging** - Track login attempts and auth events
5. **Passwordless Auth** - Magic links or WebAuthn
6. **SSO** - Enterprise single sign-on integration
