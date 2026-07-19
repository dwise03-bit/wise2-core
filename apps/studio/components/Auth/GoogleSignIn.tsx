'use client';

/**
 * GoogleSignIn Component
 * Google Identity Services integration for sign-in/sign-up
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuthContext } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';

interface GoogleProfile {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

export function GoogleSignIn() {
  const { loginWithGoogle, isLoading, error, clearError } = useAuthContext();
  const { push } = useRouter();
  const [isInitialized, setIsInitialized] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load Google Identity Services library
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    script.onload = () => {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      if (!clientId) {
        console.error('Google Client ID not configured');
        return;
      }

      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
        });

        if (googleButtonRef.current) {
          window.google.accounts.id.renderButton(googleButtonRef.current, {
            theme: 'dark',
            size: 'large',
            width: '100%',
            text: 'signup_with',
            logo_alignment: 'left',
          });
        }

        setIsInitialized(true);
      }
    };

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const handleCredentialResponse = useCallback(
    async (response: any) => {
      if (!response.credential) {
        console.error('No credential received');
        return;
      }

      try {
        clearError();

        // Decode JWT token to get user info
        const parts = response.credential.split('.');
        const payload = JSON.parse(atob(parts[1]));

        const profile: GoogleProfile = {
          id: payload.sub,
          email: payload.email,
          name: payload.name,
          picture: payload.picture,
        };

        // Login with Google profile
        await loginWithGoogle(profile);

        // Redirect to main studio page
        push('/');
      } catch (err) {
        console.error('Sign-in failed:', err);
      }
    },
    [loginWithGoogle, clearError, push]
  );

  return (
    <div className="w-full max-w-md">
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded text-red-400 text-sm">
          {error}
        </div>
      )}

      {!isInitialized ? (
        <div className="p-8 bg-gray-900 rounded border border-gray-800 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          <p className="mt-2 text-gray-400 text-sm">Loading sign-in...</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div
            ref={googleButtonRef}
            id="google-signin-button"
            className="[&>div]:w-full [&>div]:mx-0"
          />

          <p className="text-center text-sm text-gray-400">
            First time? We'll create your WISE² account automatically
          </p>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-black text-gray-400">or continue as guest</span>
            </div>
          </div>

          <button
            onClick={() => push('/studio/demo')}
            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded hover:bg-gray-800 transition-colors text-white font-medium"
          >
            Try Demo Mode
          </button>
        </div>
      )}

      {isLoading && (
        <div className="mt-4 flex items-center justify-center">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
          <span className="ml-2 text-gray-400">Signing you in...</span>
        </div>
      )}
    </div>
  );
}

// Declare global for Google
declare global {
  interface Window {
    google: any;
  }
}
