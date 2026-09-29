/**
 * Signup Form Component
 * Handles user registration with email, password, and name
 */

'use client';

import React, { useState, FormEvent } from 'react';

interface SignupFormProps {
  onSubmit: (email: string, password: string, name?: string) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  onErrorClear?: () => void;
  onSwitchToLogin?: () => void;
}

export function SignupForm({
  onSubmit,
  isLoading = false,
  error = null,
  onErrorClear,
  onSwitchToLogin,
}: SignupFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLocalError(null);

    // Basic validation
    if (!email || !password || !confirmPassword) {
      setLocalError('Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      setLocalError('Please enter a valid email address');
      return;
    }

    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    // Check password strength (basic requirements)
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
      password
    );

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      setLocalError(
        'Password must contain uppercase, lowercase, number, and special character'
      );
      return;
    }

    try {
      await onSubmit(email, password, name || undefined);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Signup failed';
      setLocalError(errorMessage);
    }
  };

  const displayError = localError || error;
  const passwordsMatch = !password || !confirmPassword || password === confirmPassword;

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
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

        {/* Name Input */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            Full Name (Optional)
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            disabled={isLoading}
            className="w-full px-4 py-2 bg-blue-900/20 border border-blue-500/50 rounded text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition"
          />
        </div>

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
          <p className="text-xs text-gray-400 mt-1">
            Min 8 chars, uppercase, lowercase, number, and special character
          </p>
        </div>

        {/* Confirm Password Input */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium mb-2"
          >
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            disabled={isLoading}
            className={`w-full px-4 py-2 bg-blue-900/20 border rounded text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition ${
              passwordsMatch
                ? 'border-blue-500/50 focus:border-blue-400'
                : 'border-red-500/50 focus:border-red-400'
            }`}
            required
          />
          {!passwordsMatch && confirmPassword && (
            <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !passwordsMatch}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-700 text-white font-semibold rounded transition transform hover:scale-105 disabled:hover:scale-100 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
        >
          {isLoading ? (
            <>
              <span className="animate-spin">⊙</span>
              Creating account...
            </>
          ) : (
            'Create account'
          )}
        </button>

        {/* Login Link */}
        <div className="text-center text-sm text-gray-400">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-blue-400 hover:text-blue-300 font-semibold transition"
          >
            Sign in
          </button>
        </div>
      </form>
    </div>
  );
}
