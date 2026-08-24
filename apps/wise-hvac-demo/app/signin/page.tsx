'use client';

import { useState } from 'react';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showGoogleAuth, setShowGoogleAuth] = useState(true);

  const handleGoogleSignIn = () => {
    setLoading(true);
    const clientId = '797928011228-37panpam8v8ml7l8l7ecd2e0vf2kdmti.apps.googleusercontent.com';
    const redirectUri = typeof window !== 'undefined'
      ? `${window.location.origin}/wise-hvac-demo/api/auth/google/callback`
      : '';

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent',
    });

    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/wise-hvac-demo/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('auth-token', data.token);
        window.location.href = '/wise-hvac-demo/';
      } else {
        setError('Invalid email or password');
      }
    } catch {
      setError('Sign in failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#1a1a1a',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <div style={{
        maxWidth: '420px',
        padding: '40px',
        backgroundColor: '#2a2a2a',
        borderRadius: '12px',
        textAlign: 'center',
      }}>
        <h1 style={{ color: '#ffffff', marginBottom: '12px', fontSize: '28px' }}>
          WISE² HVAC
        </h1>
        <p style={{ color: '#888', marginBottom: '32px', fontSize: '14px' }}>
          Field Technician Management
        </p>

        {showGoogleAuth ? (
          <>
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px 24px',
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#ffffff',
                backgroundColor: loading ? '#555' : '#4285f4',
                border: 'none',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s',
                marginBottom: '16px',
              }}
              onMouseOver={(e) => !loading && (e.currentTarget.style.backgroundColor = '#357ae8')}
              onMouseOut={(e) => !loading && (e.currentTarget.style.backgroundColor = '#4285f4')}
            >
              {loading ? '⏳ Signing in...' : '🔐 Sign in with Google'}
            </button>

            <div style={{ margin: '20px 0', color: '#666', fontSize: '13px' }}>
              or continue with email
            </div>

            <button
              onClick={() => setShowGoogleAuth(false)}
              style={{
                width: '100%',
                padding: '12px 24px',
                fontSize: '14px',
                color: '#4285f4',
                backgroundColor: 'transparent',
                border: '2px solid #4285f4',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(66, 133, 244, 0.1)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              Email & Password
            </button>
          </>
        ) : (
          <>
            <form onSubmit={handleEmailSignIn}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  marginBottom: '12px',
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #444',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  marginBottom: '16px',
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #444',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
                required
              />

              {error && (
                <p style={{ color: '#ff6b6b', fontSize: '13px', marginBottom: '12px' }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: '#ffffff',
                  backgroundColor: loading ? '#555' : '#3b82f6',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  marginBottom: '12px',
                }}
                onMouseOver={(e) => !loading && (e.currentTarget.style.backgroundColor = '#2563eb')}
                onMouseOut={(e) => !loading && (e.currentTarget.style.backgroundColor = '#3b82f6')}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <button
              onClick={() => setShowGoogleAuth(true)}
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '13px',
                color: '#888',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              ← Back to Google Sign In
            </button>
          </>
        )}

        <p style={{ color: '#555', marginTop: '24px', fontSize: '12px' }}>
          🔒 Secure authentication | For field technicians only
        </p>
      </div>
    </div>
  );
}
