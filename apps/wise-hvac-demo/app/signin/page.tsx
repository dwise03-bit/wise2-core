import { Suspense } from 'react';
import SignInForm from './signin-form';

export default function SignIn() {
  return (
    <Suspense fallback={<SignInLoading />}>
      <SignInForm />
    </Suspense>
  );
}

function SignInLoading() {
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
          Loading...
        </p>
      </div>
    </div>
  );
}
