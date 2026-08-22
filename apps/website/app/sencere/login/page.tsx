'use client';

export const dynamic = 'force-dynamic';

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

        {/* OAuth Options */}
        <div className="mb-6 space-y-3">
          <a
            href="/api/auth/google/authorize"
            className="flex items-center justify-center gap-3 w-full py-3 bg-white text-gray-900 font-montserrat font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </a>
          <a
            href="/api/auth/discord/authorize"
            className="flex items-center justify-center gap-3 w-full py-3 bg-[#5865F2] text-white font-montserrat font-semibold rounded-lg hover:bg-[#4752C4] transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.3671a19.8015 19.8015 0 00-4.8851-1.5152.074.074 0 00-.0784.0371c-.211.3671-.4447.8465-.6083 1.2242a18.353 18.353 0 00-5.487 0 12.64 12.64 0 00-.6177-1.2242.077.077 0 00-.0785-.037 19.7163 19.7163 0 00-4.8852 1.515.07.07 0 00-.0330.0287C.5338 9.0957.1338 13.5007 1.9577 17.6503a.082.082 0 00.0313.0355 19.9054 19.9054 0 005.9527 3.092.08.08 0 00.087-.0276c.461-.6032.8692-1.2356 1.2171-1.8265a.081.081 0 00-.0044-.1231 12.997 12.997 0 01-1.8383-.876.083.083 0 01-.008-.138 8.678 8.678 0 00.316-.237.075.075 0 01.0784-.0109c3.856 1.7623 8.037 1.7623 11.86 0a.075.075 0 01.0785.0088c.1006.08.2091.164.316.237a.083.083 0 01-.009.138 12.926 12.926 0 01-1.8387.875.083.083 0 00-.004.1231c.3489.593.7571 1.225 1.2178 1.8265a.08.08 0 00.0867.0275 19.892 19.892 0 005.9616-3.0921.083.083 0 00.0313-.0356c1.9241-4.1044 1.3543-8.4095-.2035-12.3471a.080.080 0 00-.0331-.0287zM8.02 15.3312c-1.1825 0-2.1569-.9718-2.1569-2.1771 0-1.2052.9524-2.1771 2.1569-2.1771 1.2047 0 2.1779.9719 2.1569 2.1771 0 1.2053-.9524 2.1771-2.1569 2.1771zm7.9748 0c-1.1837 0-2.1569-.9718-2.1569-2.1771 0-1.2052.9487-2.1771 2.1569-2.1771 1.204 0 2.1746.9719 2.1569 2.1771 0 1.2053-.1529 2.1771-2.1569 2.1771z"/>
            </svg>
            Sign in with Discord
          </a>
        </div>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-[#050505] text-gray-400 font-montserrat">
              Or continue with email
            </span>
          </div>
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
