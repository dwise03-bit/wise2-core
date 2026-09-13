'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, Lock, Mail } from 'lucide-react';

export default function BlakkhailLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch('/api/sencere/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to sign in');
      sessionStorage.setItem('sencere_token', data.token);
      sessionStorage.setItem('sencere_user', JSON.stringify(data.customer));
      router.push('/sencere/account');
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Unable to sign in');
    } finally { setLoading(false); }
  }

  return (
    <main className="relative flex min-h-[calc(100vh-104px)] items-center justify-center overflow-hidden bg-black px-5 py-16 text-[#A8A8A8]">
      <div className="pointer-events-none absolute inset-0 opacity-25" style={{ backgroundImage: 'linear-gradient(rgba(214,163,49,.16) 1px, transparent 1px), linear-gradient(90deg, rgba(214,163,49,.16) 1px, transparent 1px)', backgroundSize: '64px 64px', transform: 'perspective(700px) rotateX(55deg) scale(1.4)', transformOrigin: 'center bottom' }} />
      <div className="relative z-10 w-full max-w-md border border-[#8C6518] bg-[#0A0A0A]/95 p-7 shadow-[0_24px_80px_rgba(0,0,0,.6)] sm:p-10">
        <div className="mb-9 text-center">
          <p className="mb-4 text-[10px] font-bold uppercase tracking-[.35em] text-[#A8A8A8]">Members access</p>
          <h1 className="font-[var(--font-display)] text-5xl font-black uppercase tracking-tight text-[#D6A331]">Sign in</h1>
          <p className="mt-3 text-sm leading-relaxed">Access your orders, saved details, and the next drop.</p>
        </div>
        {error && <div className="mb-5 flex gap-3 border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300"><AlertCircle className="h-5 w-5 shrink-0" />{error}</div>}
        <form onSubmit={handleLogin} className="space-y-5">
          <label className="block text-xs font-bold uppercase tracking-widest text-white">Email address
            <span className="relative mt-2 block"><Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#D6A331]" /><input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="min-h-12 w-full border border-[#3a3a3a] bg-black pl-10 pr-3 text-base font-normal text-white outline-none transition-colors focus:border-[#D6A331]" /></span>
          </label>
          <label className="block text-xs font-bold uppercase tracking-widest text-white">Password
            <span className="relative mt-2 block"><Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#D6A331]" /><input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="min-h-12 w-full border border-[#3a3a3a] bg-black pl-10 pr-3 text-base font-normal text-white outline-none transition-colors focus:border-[#D6A331]" /></span>
          </label>
          <button disabled={loading} className="min-h-12 w-full bg-[#D6A331] px-4 text-xs font-black uppercase tracking-[.2em] text-black transition-colors hover:bg-[#f0c65b] disabled:opacity-50">{loading ? 'Signing in…' : 'Sign in'}</button>
        </form>
        <div className="mt-8 border-t border-[#3a3a3a] pt-6 text-center text-sm">
          <p>New to Blakk Hail? <Link href="/sencere/signup" className="font-bold text-[#D6A331] hover:text-white">Create account</Link></p>
          <Link href="/" className="mt-5 inline-block text-xs uppercase tracking-widest text-[#A8A8A8] hover:text-[#D6A331]">← Back to storefront</Link>
        </div>
      </div>
    </main>
  );
}
