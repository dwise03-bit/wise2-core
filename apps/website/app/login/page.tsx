'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      // Store user data (token is in httpOnly cookie)
      localStorage.setItem('userEmail', data.user.email);
      localStorage.setItem('userId', data.user.id);

      setSuccess('✓ Login successful! Redirecting...');
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (err) {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        width: '100vw',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #000 0%, #0a0a0a 50%, #050505 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '"Rajdhani", sans-serif',
        color: '#fff',
        padding: '20px',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;900&family=Rajdhani:wght@400;500;600;700&display=swap');

        @keyframes w2enter {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(20px);
          }
          to {
            opacity: 1;
            transform: none;
          }
        }

        @keyframes w2glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(57, 255, 20, 0.3);
          }
          50% {
            box-shadow: 0 0 40px rgba(57, 255, 20, 0.6);
          }
        }

        input, textarea {
          font-family: 'Rajdhani', sans-serif;
        }

        input:focus {
          outline: none;
        }
      `}</style>

      {/* Gradient Orbs */}
      <div
        style={{
          position: 'fixed',
          top: '-10%',
          left: '-10%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(57, 255, 20, 0.1), transparent)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'fixed',
          bottom: '-5%',
          right: '-5%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(0, 217, 255, 0.08), transparent)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />

      {/* Login Card */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: '480px',
          animation: 'w2enter 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div
            style={{
              fontFamily: '"Orbitron", sans-serif',
              fontSize: '32px',
              fontWeight: 900,
              letterSpacing: '2px',
              marginBottom: '12px',
              background: 'linear-gradient(135deg, #0094FF, #00D9FF)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            WISE²
          </div>
          <div style={{ fontSize: '14px', color: '#888', letterSpacing: '2px', textTransform: 'uppercase' }}>
            Organized Chaos Login
          </div>
        </div>

        {/* Form Card */}
        <div
          style={{
            background: 'linear-gradient(180deg, rgba(10, 10, 10, 0.95), rgba(5, 5, 5, 0.98))',
            border: '1px solid rgba(57, 255, 20, 0.2)',
            borderRadius: '16px',
            padding: '40px',
            boxShadow: '0 0 60px rgba(57, 255, 20, 0.1), inset 0 0 30px rgba(57, 255, 20, 0.05)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Email Input */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  color: '#0094FF',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginBottom: '8px',
                  fontWeight: 700,
                }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="dwise03@gmail.com"
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'rgba(57, 255, 20, 0.05)',
                  border: '1px solid rgba(57, 255, 20, 0.2)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  transition: 'all 0.3s',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(57, 255, 20, 0.6)';
                  e.target.style.boxShadow = '0 0 20px rgba(57, 255, 20, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(57, 255, 20, 0.2)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Password Input */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  color: '#0094FF',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginBottom: '8px',
                  fontWeight: 700,
                }}
              >
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'rgba(57, 255, 20, 0.05)',
                  border: '1px solid rgba(57, 255, 20, 0.2)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  transition: 'all 0.3s',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(57, 255, 20, 0.6)';
                  e.target.style.boxShadow = '0 0 20px rgba(57, 255, 20, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(57, 255, 20, 0.2)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div
                style={{
                  padding: '12px 16px',
                  background: 'rgba(255, 107, 107, 0.1)',
                  border: '1px solid rgba(255, 107, 107, 0.3)',
                  borderRadius: '8px',
                  color: '#ff6b6b',
                  fontSize: '13px',
                  textAlign: 'center',
                }}
              >
                ✕ {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div
                style={{
                  padding: '12px 16px',
                  background: 'rgba(57, 255, 20, 0.1)',
                  border: '1px solid rgba(57, 255, 20, 0.3)',
                  borderRadius: '8px',
                  color: '#0094FF',
                  fontSize: '13px',
                  textAlign: 'center',
                }}
              >
                {success}
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '14px 28px',
                background: loading ? 'rgba(57, 255, 20, 0.3)' : 'linear-gradient(135deg, #0094FF, #00D9FF)',
                border: 'none',
                borderRadius: '8px',
                color: loading ? 'rgba(255, 255, 255, 0.5)' : '#000',
                fontSize: '15px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s',
                opacity: loading ? 0.6 : 1,
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  (e.target as HTMLButtonElement).style.transform = 'translateY(-2px)';
                  (e.target as HTMLButtonElement).style.boxShadow = '0 10px 30px rgba(57, 255, 20, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  (e.target as HTMLButtonElement).style.transform = 'none';
                  (e.target as HTMLButtonElement).style.boxShadow = 'none';
                }
              }}
            >
              {loading ? '⏳ Authenticating...' : '➜ LOGIN'}
            </button>
          </form>

          {/* Divider */}
          <div
            style={{
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(57, 255, 20, 0.2), transparent)',
              margin: '28px 0',
            }}
          />

          {/* Footer Links */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '16px',
              fontSize: '13px',
            }}
          >
            <Link
              href="/"
              style={{
                color: '#888',
                textDecoration: 'none',
                transition: 'color 0.3s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#0094FF')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#888')}
            >
              ← Back Home
            </Link>
            <Link
              href="/signup"
              style={{
                color: '#888',
                textDecoration: 'none',
                transition: 'color 0.3s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#0094FF')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#888')}
            >
              Create Account →
            </Link>
          </div>
        </div>

        {/* Demo Credentials Hint */}
        <div
          style={{
            marginTop: '32px',
            padding: '16px',
            background: 'rgba(57, 255, 20, 0.05)',
            border: '1px solid rgba(57, 255, 20, 0.15)',
            borderRadius: '8px',
            fontSize: '12px',
            color: '#888',
            textAlign: 'center',
          }}
        >
          Demo: dwise03@gmail.com / Glock19!
        </div>
      </div>
    </div>
  );
}
