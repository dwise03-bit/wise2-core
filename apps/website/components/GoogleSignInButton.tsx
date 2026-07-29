'use client';

import { useState } from 'react';

interface GoogleSignInButtonProps {
  clientId?: string;
  redirectUri?: string;
  text?: 'signin' | 'signup' | 'continue';
  fullWidth?: boolean;
  className?: string;
}

export default function GoogleSignInButton({
  clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
  redirectUri = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI || 'http://localhost:3001/api/auth/google/callback',
  text = 'continue',
  fullWidth = true,
  className = '',
}: GoogleSignInButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);

      // Redirect to Google authorization endpoint
      const response = await fetch('/api/auth/google/authorize', {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to start Google sign-in');
      }

      // The authorize route will redirect to Google, so we just follow
      // This shouldn't actually resolve as we'll be redirected
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  const displayText = {
    signin: 'Sign in with Google',
    signup: 'Create account with Google',
    continue: 'Continue with Google',
  }[text];

  return (
    <div>
      <button
        onClick={handleGoogleSignIn}
        disabled={loading}
        className={`${
          fullWidth ? 'w-full' : ''
        } py-2 px-4 border border-wise-subtle hover:border-wise-primary text-wise-primary rounded-md transition-colors hover:bg-wise-surface disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${className}`}
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        {loading ? 'Connecting...' : displayText}
      </button>
      {error && (
        <p className="mt-2 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
