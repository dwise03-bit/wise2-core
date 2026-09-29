'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CherryLogo } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';

function normalizeUser(raw: Record<string, unknown>) {
  const name = typeof raw.name === 'string' ? raw.name : '';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return {
    id: String(raw.id ?? ''),
    email: String(raw.email ?? ''),
    firstName: typeof raw.firstName === 'string' ? raw.firstName : parts[0],
    lastName: typeof raw.lastName === 'string' ? raw.lastName : parts.slice(1).join(' '),
  };
}

export default function AuthCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setSession } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const userRaw = searchParams.get('user');
    const tenantId = searchParams.get('tenantId');

    if (!token || !userRaw) {
      router.replace('/login?error=oauth_missing');
      return;
    }

    try {
      const user = normalizeUser(JSON.parse(userRaw) as Record<string, unknown>);
      setSession(token, user, tenantId || undefined);
      router.replace('/dashboard');
    } catch {
      router.replace('/login?error=oauth_parse');
    }
  }, [router, searchParams, setSession]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-cherry-black px-6">
      <div className="text-center">
        <CherryLogo size="lg" />
        <p className="mt-4 text-sm text-white/60">Signing you in...</p>
      </div>
    </div>
  );
}
