'use client';

import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';

export default function SignIn() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/wise-hvac-demo/';

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
        maxWidth: '400px',
        padding: '40px',
        backgroundColor: '#2a2a2a',
        borderRadius: '12px',
        textAlign: 'center',
      }}>
        <h1 style={{ color: '#ffffff', marginBottom: '20px' }}>
          WISE² HVAC
        </h1>
        <p style={{ color: '#888', marginBottom: '40px' }}>
          Sign in to access the Field Tech app
        </p>

        <button
          onClick={() => signIn('google', { callbackUrl })}
          style={{
            width: '100%',
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#ffffff',
            backgroundColor: '#3b82f6',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#2563eb')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#3b82f6')}
        >
          Sign in with Google
        </button>

        <p style={{ color: '#666', marginTop: '40px', fontSize: '14px' }}>
          Secure authentication powered by Google
        </p>
      </div>
    </div>
  );
}
