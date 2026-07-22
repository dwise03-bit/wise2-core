'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('demo@wise2.net');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      router.push('/dashboard');
    } catch (err) {
      setError('Connection error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050505] to-[#1a1a2e] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#2cd588] mb-2">WISE²</h1>
          <p className="text-gray-400">Enterprise AI Operating System</p>
        </div>

        <div className="bg-[#0f0f1e] border border-[#2cd588]/30 rounded-lg p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-6">Login</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-[#050505] border border-[#2cd588]/30 rounded-lg text-white focus:outline-none focus:border-[#2cd588]"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Demo: demo@wise2.net</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-[#050505] border border-[#2cd588]/30 rounded-lg text-white focus:outline-none focus:border-[#2cd588]"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Demo: password123</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-[#2cd588] text-black font-bold rounded-lg hover:bg-green-600 disabled:opacity-50 mt-6"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="bg-[#2cd588]/10 border border-[#2cd588]/30 rounded-lg p-4 text-sm mt-6">
            <p className="text-gray-300 mb-2"><strong>Demo Account:</strong></p>
            <p className="text-gray-400 text-xs font-mono mb-1">Email: demo@wise2.net</p>
            <p className="text-gray-400 text-xs font-mono">Password: password123</p>
          </div>
        </div>

        <div className="text-center mt-6 text-gray-500 text-xs">
          <p>© 2026 WISE² Enterprise. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
