'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, AlertCircle } from 'lucide-react';

export default function SenCereLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/sencere/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Login failed');
      }

      const data = await response.json();
      // Store token in session storage
      sessionStorage.setItem('sencere_token', data.token);
      sessionStorage.setItem('sencere_user', JSON.stringify(data.customer));

      // Redirect to account page
      router.push('/sencere/account');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-cormorant text-4xl font-bold text-white mb-2">
            Sign In
          </h1>
          <p className="font-montserrat text-gray-400">
            Access your SenCere account and order history
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="font-montserrat text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email */}
          <div>
            <label className="font-montserrat text-sm font-semibold text-white block mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-3 bg-[#0F172A] border border-gray-700 rounded-lg text-white font-montserrat focus:border-[#0369A1] focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="font-montserrat text-sm font-semibold text-white block mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-[#0F172A] border border-gray-700 rounded-lg text-white font-montserrat focus:border-[#0369A1] focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="text-right">
            <Link
              href="#"
              className="font-montserrat text-sm text-[#0369A1] hover:text-blue-400"
            >
              Forgot password?
            </Link>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#0369A1] hover:bg-blue-700 disabled:opacity-50 text-white font-montserrat font-semibold rounded-lg transition-colors"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-[#050505] text-gray-400 font-montserrat">
              New customer?
            </span>
          </div>
        </div>

        {/* Sign Up Link */}
        <Link
          href="/sencere/signup"
          className="block w-full py-3 px-4 border border-gray-700 rounded-lg text-white font-montserrat font-semibold text-center hover:bg-gray-900/30 transition-colors"
        >
          Create Account
        </Link>

        {/* Back to Shop */}
        <div className="text-center mt-8">
          <Link
            href="/sencere/products"
            className="font-montserrat text-sm text-gray-400 hover:text-[#0369A1]"
          >
            ← Back to Shop
          </Link>
        </div>
      </div>
    </div>
  );
}
