'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@wise2/shared/hooks';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, isLoading, error: authError, isAuthenticated, isAdmin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect if already authenticated as admin
  useEffect(() => {
    if (mounted && isAuthenticated && isAdmin) {
      router.push('/admin/dashboard');
    }
  }, [mounted, isAuthenticated, isAdmin, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      await login(email, password);
      // The login hook will handle user info, but we need to verify admin role
      // This will be done in the middleware redirect
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black mb-2">WISE²</h1>
          <p className="text-gray-400">Admin Portal</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {(error || authError) && (
            <div className="p-4 bg-red-900/30 border border-red-500 rounded-lg text-red-300">
              {error || authError}
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-2">Admin Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@wise2.net"
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:border-cyan-500 focus:outline-none transition text-white placeholder-gray-500"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:border-cyan-500 focus:outline-none transition text-white placeholder-gray-500"
              required
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg transition disabled:opacity-50"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Warning */}
        <div className="mt-6 p-4 bg-gray-900/50 border border-gray-700 rounded-lg text-center">
          <p className="text-sm text-gray-400">
            This is a restricted admin portal. Only authorized administrators can access this area.
          </p>
        </div>
      </div>
    </div>
  );
}
