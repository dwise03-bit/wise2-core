'use client';

import { useSignIn } from '../hooks';
import { useState } from 'react';

interface GoogleSignInButtonProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

/**
 * Google Sign In button component
 * Integrates with NextAuth for authentication
 */
export function GoogleSignInButton({
  className = '',
  variant = 'default',
  size = 'md',
  fullWidth = false,
}: GoogleSignInButtonProps) {
  const signIn = useSignIn();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setLoading(true);
    setError(null);

    try {
      await signIn();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
      setLoading(false);
    }
  };

  const baseStyles = 'font-semibold rounded transition-all flex items-center justify-center gap-2';

  const variantStyles = {
    default: 'bg-white text-gray-900 hover:bg-gray-50 border border-gray-300',
    outline: 'border border-gray-300 bg-transparent text-gray-900 hover:bg-gray-50',
    ghost: 'bg-transparent text-gray-900 hover:bg-gray-100',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const widthStyles = fullWidth ? 'w-full' : '';

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        className={`
          ${baseStyles}
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${widthStyles}
          ${loading ? 'opacity-50 cursor-not-allowed' : ''}
          ${className}
        `}
      >
        {loading ? (
          <>
            <span className="animate-spin">⏳</span>
            Signing in...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <image
                href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%234285F4' font-size='20' font-weight='bold'%3EG%3C/text%3E%3C/svg%3E"
                width="24"
                height="24"
              />
            </svg>
            Sign in with Google
          </>
        )}
      </button>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
}
