'use client';

import { useSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from 'next-auth/react';
import { useCallback } from 'react';

/**
 * Hook to get the current user session
 * @returns Session object with user data and access tokens
 */
export function useAuth() {
  const { data: session, status, update } = useSession();

  return {
    session,
    status,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    user: session?.user,
    accessToken: (session as any)?.accessToken,
    refreshToken: (session as any)?.refreshToken,
    update,
  };
}

/**
 * Hook to sign in with Google
 */
export function useSignIn() {
  return useCallback(async () => {
    try {
      const result = await nextAuthSignIn('google', {
        redirect: true,
        callbackUrl: '/',
      });
      return result;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }, []);
}

/**
 * Hook to sign out
 */
export function useSignOut() {
  return useCallback(async () => {
    try {
      await nextAuthSignOut({
        redirect: true,
        callbackUrl: '/',
      });
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }, []);
}

/**
 * Hook to get Google API access token
 */
export function useGoogleAccessToken() {
  const { accessToken } = useAuth();
  return accessToken;
}

/**
 * Hook to check if user has specific Google scopes
 */
export function useHasGoogleScope(scope: string) {
  const { session } = useAuth();
  const grantedScopes = (session as any)?.user?.grantedScopes;

  if (!grantedScopes) return false;
  return grantedScopes.includes(scope);
}
