'use client';

import React, { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || data.error || 'Login failed');
        setLoading(false);
        return;
      }

      const token = data.accessToken || data.access_token || data.token;
      if (token) {
        localStorage.setItem('auth_token', token);
      }
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      if (data.subscription) {
        localStorage.setItem('subscription', JSON.stringify(data.subscription));
      }

      const redirect = searchParams.get('redirect') || '/dashboard';
      router.push(redirect);
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#050505' }}>
      <div className="w-full max-w-md p-8 rounded-xl border" style={{ background: '#0d1117', borderColor: '#1e293b' }}>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#f8fafc' }}>
            WISE<span style={{ color: '#0094ff' }}>&sup2;</span>
          </h1>
          <p style={{ color: '#9ca3af' }} className="text-sm">Command Center</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
            {error}
          </div>
        )}

        <a
          href="/api/auth/google/authorize"
          className="w-full mb-5 py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
          style={{ background: '#f8fafc', color: '#050505' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09A6.6 6.6 0 0 1 5.49 12c0-.73.13-1.43.35-2.09V7.07H2.18A11 11 0 0 0 1 12c0 1.78.43 3.45 1.18 4.93l3.66-2.84z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
          </svg>
          Continue with Google
        </a>

        <div className="flex items-center gap-3 mb-5" aria-hidden="true">
          <div className="h-px flex-1" style={{ background: '#1e293b' }} />
          <span className="text-xs" style={{ color: '#6b7280' }}>or</span>
          <div className="h-px flex-1" style={{ background: '#1e293b' }} />
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm mb-1" style={{ color: '#9ca3af' }}>Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              required autoFocus
              className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none"
              style={{ background: '#050505', border: '1px solid #1e293b', color: '#f8fafc' }}
              placeholder="you@wise2.net"
            />
          </div>
          <div>
            <label className="block text-sm mb-1" style={{ color: '#9ca3af' }}>Password</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none"
              style={{ background: '#050505', border: '1px solid #1e293b', color: '#f8fafc' }}
            />
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full py-2.5 rounded-lg font-semibold text-sm transition-colors disabled:opacity-50"
            style={{ background: '#0094ff', color: '#050505' }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
