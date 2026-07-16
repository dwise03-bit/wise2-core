'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LiveStudioPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the Live Studio subdomain
    if (typeof window !== 'undefined') {
      window.location.href = 'https://studio.wise2.net';
    }
  }, []);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Redirecting to Live Studio...</h1>
        <p className="text-gray-400">If you are not redirected, <a href="https://studio.wise2.net" className="text-blue-400 hover:text-blue-300">click here</a></p>
      </div>
    </div>
  );
}
