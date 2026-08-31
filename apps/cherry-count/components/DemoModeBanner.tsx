'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export function DemoModeBanner() {
  const { isDemoMode, isAuthenticated } = useAuth();

  if (isAuthenticated) return null;

  return (
    <div className="mb-4 rounded-cherry border border-cherry-lavender/30 bg-cherry-royal/10 px-4 py-2 text-center text-xs text-cherry-lavender">
      Demo mode — showing sample data.{' '}
      <Link href="/login" className="underline hover:text-white">
        Sign in
      </Link>{' '}
      for live data.
    </div>
  );
}
