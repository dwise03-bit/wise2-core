'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CherryLogo, Wise2Badge } from '@/components/ui';
import { CHERRY_LAYOUT } from '@/lib/brand-tokens';
import { useAuth } from '@/contexts/AuthContext';

const OAUTH_ERRORS: Record<string, string> = {
  oauth_failed: 'Sign-in with Google or Discord failed. Try email login or demo mode.',
  oauth_state: 'Sign-in session expired. Please try again.',
  oauth_missing: 'Sign-in response was incomplete. Please try again.',
  oauth_parse: 'Could not read sign-in response. Please try again.',
};

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setSession } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const oauthError = searchParams.get('error');
  const displayError = error || (oauthError ? OAUTH_ERRORS[oauthError] || 'Sign-in failed' : '');

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
        setError(data.error || 'Login failed');
        return;
      }

      setSession(data.token, data.user, data.tenantId || undefined);
      router.push(searchParams.get('redirect') || '/dashboard');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${CHERRY_LAYOUT.page} flex min-h-screen items-center justify-center px-6`}>
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <CherryLogo size="lg" />
          <p className="mt-2 font-script text-xl text-cherry-bubblegum">Track It. Pack It. Profit.</p>
        </div>

        <div className={`${CHERRY_LAYOUT.glass} p-6`}>
          {displayError && (
            <div className="mb-4 rounded-cherry border border-cherry-red/30 bg-cherry-red/10 p-3 text-sm text-cherry-red">
              {displayError}
            </div>
          )}

          <div className="mb-4 grid grid-cols-2 gap-2">
            <a
              href="/api/auth/google/authorize"
              className="flex items-center justify-center gap-2 rounded-cherry border border-white/10 bg-white/5 px-3 py-2.5 text-sm font-medium hover:border-cherry-hot/40"
            >
              Google
            </a>
            <a
              href="/api/auth/discord/authorize"
              className="flex items-center justify-center gap-2 rounded-cherry border border-white/10 bg-white/5 px-3 py-2.5 text-sm font-medium hover:border-cherry-hot/40"
            >
              Discord
            </a>
          </div>

          <div className="mb-4 flex items-center gap-3 text-xs text-white/30">
            <div className="h-px flex-1 bg-white/10" />
            or email
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs text-white/50">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-cherry border border-cherry-bubblegum/20 bg-cherry-black px-3 py-2.5 text-sm focus:border-cherry-hot focus:outline-none"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-white/50">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-cherry border border-cherry-bubblegum/20 bg-cherry-black px-3 py-2.5 text-sm focus:border-cherry-hot focus:outline-none"
              />
            </div>
            <button type="submit" disabled={loading} className={`w-full ${CHERRY_LAYOUT.btnPrimary} disabled:opacity-50`}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <Link href="/dashboard" className="text-xs text-white/40 hover:text-cherry-hot">
              Continue in demo mode →
            </Link>
          </div>
        </div>

        <Wise2Badge className="mt-6 text-center" />
      </div>
    </div>
  );
}
