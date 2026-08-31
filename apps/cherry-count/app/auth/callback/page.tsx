import { Suspense } from 'react';
import AuthCallbackClient from './callback-client';

export const dynamic = 'force-dynamic';

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-cherry-black px-6">
          <p className="text-sm text-white/60">Signing you in...</p>
        </div>
      }
    >
      <AuthCallbackClient />
    </Suspense>
  );
}
