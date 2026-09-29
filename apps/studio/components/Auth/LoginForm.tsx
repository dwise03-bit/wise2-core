/**
 * Login Form Component
 * Handles user login with email and password
 */

'use client';

import React, { useState, FormEvent } from 'react';

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  onErrorClear?: () => void;
  onSwitchToSignup?: () => void;
}

export function LoginForm({
  onSubmit,
  isLoading = false,
  error = null,
  onErrorClear,
  onSwitchToSignup,
}: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLocalError(null);

    // Basic validation
    if (!email || !password) {
      setLocalError('Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      setLocalError('Please enter a valid email address');
      return;
    }

    try {
      await onSubmit(email, password);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setLocalError(errorMessage);
    }
  };

  const displayError = localError || error;

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Message */}
        {displayError && (
          <div className="p-3 bg-red-500/10 border border-red-500/50 rounded text-red-400 text-sm">
            {displayError}
            {onErrorClear && (
              <button
                type="button"
                onClick={() => {
                  setLocalError(null);
                  onErrorClear();
                }}
                className="ml-2 underline hover:no-underline"
              >
                Dismiss
              </button>
            )}
          </div>
        )}

        {/* Email Input */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            disabled={isLoading}
            className="w-full px-4 py-2 bg-blue-900/20 border border-blue-500/50 rounded text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition"
            required
          />
        </div>

        {/* Password Input */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-2">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            disabled={isLoading}
            className="w-full px-4 py-2 bg-blue-900/20 border border-blue-500/50 rounded text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition"
            required
          />
        </div>

        {/* Forgot Password Link */}
        <div className="text-right">
          <a
            href="#forgot-password"
            className="text-sm text-blue-400 hover:text-blue-300 transition"
          >
            Forgot password?
          </a>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-700 text-white font-semibold rounded transition transform hover:scale-105 disabled:hover:scale-100 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <span className="animate-spin">⊙</span>
              Signing in...
            </>
          ) : (
            'Sign in'
          )}
        </button>

        {/* Sign Up Link */}
        <div className="text-center text-sm text-gray-400">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="text-blue-400 hover:text-blue-300 font-semibold transition"
          >
            Sign up
          </button>
        </div>
      </form>
    </div>
  );
}
