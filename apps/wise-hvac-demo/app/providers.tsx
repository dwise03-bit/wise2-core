'use client';

import { SessionProvider } from 'next-auth/react';
import { useEffect } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Handle OAuth callback on mobile
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');

    if (code && state) {
      window.location.href = `/wise-hvac-demo/api/auth/callback/google?code=${code}&state=${state}`;
    }
  }, []);

  return <SessionProvider>{children}</SessionProvider>;
}
