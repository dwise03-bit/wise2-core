'use client';

import { useState } from 'react';

interface LoginPanelProps {
  onLogin: (email: string, password: string) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

export function LoginPanel({ onLogin, isLoading, error }: LoginPanelProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onLogin(email, password);
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050607] via-[#0a0a0c] to-[#050607] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00D9FF] to-[#00FF7F] mb-6">
            <span className="text-[#050607] font-bold text-3xl">♪</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Sound Labs</h1>
          <p className="text-[#00D9FF]/60 text-sm">Professional music production platform</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#00D9FF] mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@studio.com"
              className="w-full px-4 py-3 rounded-lg bg-[#0a0a0c] border border-[#00D9FF]/20 text-white placeholder-[#00D9FF]/40 focus:outline-none focus:border-[#00D9FF] focus:ring-1 focus:ring-[#00D9FF]/30 transition-all"
              disabled={isSubmitting || isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#00D9FF] mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-lg bg-[#0a0a0c] border border-[#00D9FF]/20 text-white placeholder-[#00D9FF]/40 focus:outline-none focus:border-[#00D9FF] focus:ring-1 focus:ring-[#00D9FF]/30 transition-all"
              disabled={isSubmitting || isLoading}
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || isLoading || !email || !password}
            className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-[#00D9FF] to-[#00FF7F] text-[#050607] font-semibold hover:shadow-lg hover:shadow-[#00D9FF]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-8 text-center text-[#00D9FF]/40 text-xs">
          WISE² Sound Labs • Production Ready • v1.0
        </p>
      </div>
    </div>
  );
}
