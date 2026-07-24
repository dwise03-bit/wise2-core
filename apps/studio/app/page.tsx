'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the main Creative Studio
    router.replace('/studio');
  }, [router]);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#39FF14',
      fontFamily: '"Rajdhani", sans-serif',
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '32px', margin: '0 0 10px 0' }}>WISE² Studio</h1>
        <p style={{ color: '#888' }}>Redirecting to Creative Studio...</p>
      </div>
    </div>
  );
}
