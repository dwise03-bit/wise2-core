'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard (or login if not authenticated)
    router.push('/dashboard');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-wise-black">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-wise-electric mb-4">WISE²</h1>
        <p className="text-text-secondary">Loading Command Center...</p>
      </div>
    </div>
  );
}
