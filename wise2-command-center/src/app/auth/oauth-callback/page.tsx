'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function OAuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const isNewUser = searchParams.get('is_new_user') === 'true';

    if (accessToken && refreshToken) {
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      router.push(isNewUser ? '/onboarding' : '/dashboard');
    } else {
      router.push('/auth/login?error=oauth_failed');
    }
  }, [searchParams, router]);

  return <div className="flex items-center justify-center h-screen">Authenticating...</div>;
}
