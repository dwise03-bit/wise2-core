'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ email?: string; userId?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userEmail = localStorage.getItem('userEmail');
    const userId = localStorage.getItem('userId');

    if (!token) {
      router.push('/login');
      return;
    }

    setUser({ email: userEmail || '', userId });
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    router.push('/');
  };

  if (loading) {
    return <div style={{ padding: '20px', color: '#0094FF' }}>Loading...</div>;
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #000 0%, #0a0a0a 50%, #050505 100%)',
        color: '#fff',
        padding: '40px 20px',
        fontFamily: '"Rajdhani", sans-serif',
      }}
    >
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#0094FF', margin: 0 }}>Dashboard</h1>
          <button
            onClick={handleLogout}
            style={{
              padding: '10px 20px',
              background: '#ff6b6b',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 700,
            }}
          >
            Logout
          </button>
        </div>

        <div
          style={{
            background: 'linear-gradient(180deg, rgba(10, 10, 10, 0.95), rgba(5, 5, 5, 0.98))',
            border: '1px solid rgba(57, 255, 20, 0.2)',
            borderRadius: '16px',
            padding: '30px',
            marginBottom: '20px',
          }}
        >
          <h2 style={{ color: '#0094FF', marginTop: 0 }}>Welcome, {user?.email}!</h2>
          <p style={{ color: '#888' }}>User ID: {user?.userId}</p>
          <p style={{ color: '#888' }}>You are now logged in to WISE² Genesis.</p>
        </div>

        <div style={{ marginTop: '30px' }}>
          <h3 style={{ color: '#0094FF' }}>Quick Links</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ marginBottom: '10px' }}>
              <Link href="/" style={{ color: '#00D9FF', textDecoration: 'none' }}>
                ← Back Home
              </Link>
            </li>
            <li>
              <Link href="/studio" style={{ color: '#00D9FF', textDecoration: 'none' }}>
                → Go to Studio
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
