'use client';

import { useEffect, useState } from 'react';

export default function QuickLoginPage() {
  const [status, setStatus] = useState('Logging in...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const performDevLogin = async () => {
      try {
        const response = await fetch('/api/v1/auth/dev-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'dwise03@gmail.com' }),
        });

        if (!response.ok) {
          throw new Error(`Login failed: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.data?.tokens?.accessToken) {
          const { tokens, user } = data.data;

          // Store tokens
          localStorage.setItem('auth_token', tokens.accessToken);
          if (tokens.refreshToken) {
            localStorage.setItem('refresh_token', tokens.refreshToken);
          }

          // Store user
          localStorage.setItem('user', JSON.stringify(user));

          setStatus('✅ Login successful! Redirecting to trading dashboard...');

          // Redirect after a brief delay
          setTimeout(() => {
            window.location.href = '/trading';
          }, 1000);
        } else {
          setError('Invalid response from server');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        setStatus('❌ Login failed');
      }
    };

    performDevLogin();
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">
          {error ? '❌' : '⏳'}
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">{status}</h1>
        {error && (
          <p className="text-red-400 mb-4">{error}</p>
        )}
        <p className="text-gray-400 text-sm">
          Email: <span className="text-[#00D9FF]">dwise03@gmail.com</span>
        </p>
      </div>
    </div>
  );
}
