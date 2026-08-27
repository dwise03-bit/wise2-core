'use client';

import { Mail } from 'lucide-react';
import { FormEvent, useState } from 'react';

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');

    // Simulate API call
    setTimeout(() => {
      setStatus('success');
      setEmail('');
      setTimeout(() => setStatus('idle'), 3000);
    }, 500);
  };

  return (
    <section className="relative bg-[#1a1a1a] py-12 lg:py-16">
      <div className="mx-auto max-w-[1536px] px-6 sm:px-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Left: Newsletter Info */}
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-3">
              <Mail className="h-6 w-6 text-[#E8A23A]" />
              <h3 className="text-[14px] font-black uppercase tracking-wider text-[#F5E6D3]">
                STAY CONNECTED
              </h3>
            </div>
            <p className="mt-3 text-[13px] leading-relaxed text-[#D4D4D4]">
              Get exclusive drops, news, and updates.
            </p>
          </div>

          {/* Right: Signup Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 border border-[#D4842F]/30 bg-[#0f0f0f] px-4 py-3 text-[13px] text-[#F5E6D3] placeholder-[#666] transition focus:border-[#E8A23A] focus:outline-none"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="bg-[#E8A23A] px-6 py-3 text-[11px] font-black uppercase tracking-wider text-[#1a1a1a] transition hover:bg-[#D4842F] disabled:opacity-50"
            >
              {status === 'loading' ? 'SUBSCRIBING...' : 'SUBSCRIBE'}
            </button>
          </form>

          {/* Status Message */}
          {status === 'success' && (
            <div className="col-span-full text-center">
              <p className="text-[12px] text-[#E8A23A]">✓ Thanks for subscribing!</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
