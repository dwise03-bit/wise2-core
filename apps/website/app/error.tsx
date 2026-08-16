'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-wise flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl font-bold text-wise-danger mb-4">Error</div>
        <h1 className="text-3xl font-bold text-white mb-4">Something went wrong!</h1>
        <p className="text-wise-muted mb-8">
          We encountered an unexpected error. Please try again or return to the home page.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-wise-primary hover:bg-wise-primary-hover text-wise font-semibold rounded-lg transition-colors shadow-glow-blue-sm hover:shadow-glow-blue-md"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="px-6 py-3 border border-wise-primary text-wise-primary hover:bg-wise-primary/10 font-semibold rounded-lg transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
