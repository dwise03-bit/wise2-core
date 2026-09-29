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

  const handleGoogleLogin = () => {
    const clientId = '797928011228-37panpam8v8ml7l8l7ecd2e0vf2kdmti.apps.googleusercontent.com';
    const redirectUri = encodeURIComponent('https://api.wise2.net/auth/google/callback');
    const scopes = encodeURIComponent('openid profile email');
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scopes}&access_type=offline`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050505] to-[#1a1a2e] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#2cd588] mb-2">WISE²</h1>
          <p className="text-gray-400">Command Center</p>
        </div>

        <div className="bg-[#0f0f1e] border border-[#2cd588]/30 rounded-lg p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-6">Login</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full px-4 py-2 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-colors mb-6 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#2cd588]/30"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#0f0f1e] text-gray-500">Or continue with email</span>
            </div>
          </div>

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
              {loading ? 'Signing in...' : 'Sign In with Email'}
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
