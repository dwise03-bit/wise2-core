'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { verifyToken } from '@/lib/email';
import { analytics } from '@/lib/analytics';

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    analytics.track('page_view', { page: 'verify' });

    if (!token) {
      setError('Invalid verification link');
      setVerifying(false);
      return;
    }

    // Simulate verification process
    const timer = setTimeout(() => {
      const isValid = verifyToken(token);
      if (isValid) {
        setVerified(true);
        analytics.track('email_verified', { token: token.substring(0, 8) });
      } else {
        setError('Verification link has expired or is invalid');
      }
      setVerifying(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [token]);

  return (
    <div className="min-h-screen bg-wise flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {verifying && (
          <>
            <div className="text-4xl mb-4 animate-spin">⏳</div>
            <h1 className="text-2xl font-bold text-wise-primary mb-2">Verifying Email</h1>
            <p className="text-wise-muted">Please wait while we confirm your email address...</p>
          </>
        )}

        {verified && !verifying && (
          <>
            <div className="text-6xl mb-4 animate-bounce">✨</div>
            <h1 className="text-3xl font-bold text-wise-primary mb-2">Email Verified!</h1>
            <p className="text-wise-muted mb-6">Your account is fully activated and ready to use.</p>
            <a
              href="/auth/login"
              className="inline-block px-6 py-2 bg-wise-primary hover:bg-wise-primary-hover text-wise font-semibold rounded-md transition-colors shadow-glow-blue-sm hover:shadow-glow-blue-md"
            >
              Sign In Now
            </a>
          </>
        )}

        {error && !verifying && (
          <>
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-wise-primary mb-2">Verification Failed</h1>
            <p className="text-red-500 mb-6">{error}</p>
            <a
              href="/auth/signup"
              className="inline-block px-6 py-2 bg-wise-primary hover:bg-wise-primary-hover text-wise font-semibold rounded-md transition-colors"
            >
              Try Again
            </a>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-wise flex flex-col items-center justify-center px-4">
          <div className="text-4xl mb-4 animate-spin">⏳</div>
          <p className="text-wise-muted">Loading...</p>
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
