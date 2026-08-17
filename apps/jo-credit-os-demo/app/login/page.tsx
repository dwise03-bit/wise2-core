'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Legacy login route.
 *
 * This page used to host a second login form that posted to /api/auth/signin,
 * an endpoint that does not exist — it returned 404 for every customer who
 * reached it. There is one canonical login screen at /auth/signin; this route
 * now simply forwards there rather than maintaining a divergent form.
 */
export default function LegacyLoginPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/auth/signin');
  }, [router]);

  return <div style={{ padding: 24, color: '#8D98A5' }}>Redirecting to sign in…</div>;
}
