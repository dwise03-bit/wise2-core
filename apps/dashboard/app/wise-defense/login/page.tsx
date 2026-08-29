'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

function safeRedirect() {
  const requested = new URLSearchParams(window.location.search).get('redirect');
  return requested?.startsWith('/wise-defense/') && requested !== '/wise-defense/login'
    ? requested
    : '/wise-defense/dashboard';
}

export default function WiseDefenseLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch('/api/wise-defense/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Sign in failed.');

      localStorage.setItem('token', payload.token);
      localStorage.setItem('user', JSON.stringify(payload.user));
      router.replace(safeRedirect());
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Sign in failed.');
      setLoading(false);
    }
  }

  return <main className="grid min-h-screen place-items-center bg-[#050607] px-4 text-zinc-100">
    <section className="w-full max-w-md border border-red-950 bg-[#090a0b] p-7 shadow-[0_0_60px_rgba(127,29,29,.18)]">
      <Link href="/wise-defense-landing" className="block border-b border-zinc-800 pb-5">
        <p className="text-lg font-black tracking-[.14em]">WISE DEFENSE <span className="text-red-600">L.L.C.</span></p>
        <p className="mt-1 text-[9px] tracking-[.34em] text-zinc-500">TRAIN. TEACH. PROTECT.</p>
      </Link>
      <div className="py-6">
        <p className="text-[10px] font-bold uppercase tracking-[.24em] text-red-500">Authorized operators</p>
        <h1 className="mt-2 text-2xl font-black uppercase">Command Center Sign In</h1>
        <p className="mt-2 text-sm leading-6 text-zinc-500">Use your existing WISE² account. Access remains tenant-scoped and critical information must be verified through official sources.</p>
      </div>
      {error && <p role="alert" className="mb-4 border border-red-900 bg-red-950/40 px-3 py-2 text-sm text-red-300">{error}</p>}
      <form className="space-y-4" onSubmit={signIn}>
        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">Email
          <input autoComplete="email" className="mt-2 w-full border border-zinc-700 bg-black px-3 py-3 text-sm text-white outline-none focus:border-red-600" onChange={event => setEmail(event.target.value)} required type="email" value={email}/>
        </label>
        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">Password
          <input autoComplete="current-password" className="mt-2 w-full border border-zinc-700 bg-black px-3 py-3 text-sm text-white outline-none focus:border-red-600" onChange={event => setPassword(event.target.value)} required type="password" value={password}/>
        </label>
        <button className="w-full border border-red-600 bg-red-800 px-4 py-3 text-xs font-black uppercase tracking-[.18em] hover:bg-red-700 disabled:cursor-wait disabled:opacity-60" disabled={loading} type="submit">{loading ? 'Authenticating…' : 'Enter Command Center'}</button>
      </form>
      <Link href="/wise-defense-landing" className="mt-5 block text-center text-[10px] font-bold uppercase tracking-wider text-zinc-500 hover:text-zinc-200">Return to public site</Link>
    </section>
  </main>;
}
