'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Loader2, LockKeyhole } from 'lucide-react';

export default function SignInForm() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(searchParams?.get('error') ? 'Sign-in could not be completed. Please try again.' : '');

  async function handleGoogleSignIn() {
    setLoading(true);
    setError('');
    try {
      await signIn('google', { redirect: true, callbackUrl: '/wise-hvac-demo/field-tech' });
    } catch {
      setError('Google sign-in could not be started. Please try again.');
      setLoading(false);
    }
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
        <a href="/wise-hvac-demo/field-tech" className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-full border border-wise-cyan/40 bg-wise-cyan/10 px-4 text-sm font-bold text-wise-cyan transition hover:bg-wise-cyan/20">Demo Access</a>
        <a href="/wise-hvac-demo/" className="mt-4 inline-flex min-h-11 items-center justify-center px-4 text-sm font-bold text-wise-mute transition hover:text-white">Return to website</a>
        <p className="mt-4 text-xs leading-5 text-wise-mute">Secure access for authorized WISE² technicians.</p>
      </section>
    </main>
  );
}
