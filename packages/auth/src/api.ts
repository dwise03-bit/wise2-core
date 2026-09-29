import NextAuth from 'next-auth';
import { authOptions } from './config';

// Export the NextAuth handler
export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);

// Export auth as default for use in API routes and middleware
export default auth;
