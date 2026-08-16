// Authentication configuration
export { authOptions } from './config';
export { handlers, auth, signIn, signOut } from './api';

// Hooks
export { useAuth, useSignIn, useSignOut, useGoogleAccessToken, useHasGoogleScope } from './hooks';

// Google APIs
export { DriveAPI, SheetsAPI, AnalyticsAPI } from './google-apis';
export {
  createDriveClient,
  createSheetsClient,
  createAnalyticsClient,
} from './google-apis';

// Components
export { GoogleSignInButton } from './components/GoogleSignInButton';
export { UserProfile } from './components/UserProfile';

// Middleware
export { middleware } from './middleware';
