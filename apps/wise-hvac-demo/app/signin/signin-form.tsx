'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, LockKeyhole } from 'lucide-react';

const ERROR_MESSAGES: Record<string, string> = {
  oauth_failed: 'Google sign-in could not be completed. Check that your account is authorized.',
  google_rejected: 'Google sign-in was cancelled or denied.',
  oauth_state: 'Sign-in session expired. Please try again.',
  google_not_configured: 'Google sign-in is not configured on this server yet.',
};

export default function SignInForm() {
  const searchParams = useSearchParams();
  const errorCode = searchParams?.get('error') ?? '';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(
    errorCode ? ERROR_MESSAGES[errorCode] ?? 'Sign-in could not be completed. Please try again.' : '',
  );

  function handleGoogleSignIn() {
    setLoading(true);
    setError('');
    window.location.href = '/wise-hvac-demo/api/auth/google/authorize';
  }

  return (
    <main className="wise-bg-pointer grid min-h-screen place-items-center px-4 py-10 text-wise-text sm:px-6">
      <section className="tech-card w-full max-w-md p-6 text-center sm:p-9">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-wise-blue/30 bg-wise-blue/10 text-wise-cyan"><LockKeyhole className="h-6 w-6" /></div>
        <p className="mt-6 font-display text-3xl font-black uppercase tracking-[0.08em] text-white">WISE<span className="text-wise-blue">²</span> HVAC</p>
        <h1 className="mt-3 text-sm font-black uppercase tracking-[0.18em] text-wise-cyan">Technician sign in</h1>
        <p className="mt-4 text-sm leading-6 text-wise-mute">Use your authorized company Google account to access field operations.</p>
        {error && <p role="alert" className="mt-5 rounded-2xl border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-200">{error}</p>}
        <button type="button" onClick={handleGoogleSignIn} disabled={loading} className="wise-button-blue mt-6 min-h-12 w-full disabled:cursor-not-allowed disabled:opacity-50" aria-busy={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LockKeyhole className="h-4 w-4" />}{loading ? 'Opening Google…' : 'Continue with Google'}
        </button>
        {process.env.NEXT_PUBLIC_DEMO_MODE === 'true' ? (
          <a href="/wise-hvac-demo/field-tech" className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-full border border-wise-cyan/40 bg-wise-cyan/10 px-4 text-sm font-bold text-wise-cyan transition hover:bg-wise-cyan/20">Demo Access</a>
        ) : null}
        <a href="/wise-hvac-demo/" className="mt-4 inline-flex min-h-11 items-center justify-center px-4 text-sm font-bold text-wise-mute transition hover:text-white">Return to website</a>
        <p className="mt-4 text-xs leading-5 text-wise-mute">Secure access for authorized WISE² technicians.</p>
      </section>
    </main>
  );
}
