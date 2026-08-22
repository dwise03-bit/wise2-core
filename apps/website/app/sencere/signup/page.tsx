'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, Phone, Building2, AlertCircle, Check } from 'lucide-react';

export default function SenCereSignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    company: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/sencere/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone || undefined,
          company: formData.company || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Signup failed');
      }

      const data = await response.json();
      // Store token and user info
      sessionStorage.setItem('sencere_token', data.token);
      sessionStorage.setItem('sencere_user', JSON.stringify(data.customer));

      // Redirect to account page
      router.push('/sencere/account');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
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
            Create Account
          </h1>
          <p className="font-montserrat text-gray-400">
            Join SenCere to track orders and save preferences
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="font-montserrat text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSignup} className="space-y-4">
          {/* First & Last Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-montserrat text-sm font-semibold text-white block mb-2">
                First Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="John"
                  className="w-full pl-10 pr-4 py-3 bg-[#0F172A] border border-gray-700 rounded-lg text-white font-montserrat focus:border-[#0369A1] focus:outline-none"
                  required
                />
              </div>
            </div>
            <div>
              <label className="font-montserrat text-sm font-semibold text-white block mb-2">
                Last Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                  className="w-full pl-10 pr-4 py-3 bg-[#0F172A] border border-gray-700 rounded-lg text-white font-montserrat focus:border-[#0369A1] focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="font-montserrat text-sm font-semibold text-white block mb-2">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-3 bg-[#0F172A] border border-gray-700 rounded-lg text-white font-montserrat focus:border-[#0369A1] focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="font-montserrat text-sm font-semibold text-white block mb-2">
              Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-[#0F172A] border border-gray-700 rounded-lg text-white font-montserrat focus:border-[#0369A1] focus:outline-none"
                required
              />
            </div>
            <p className="font-montserrat text-xs text-gray-500 mt-1">
              Minimum 8 characters
            </p>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="font-montserrat text-sm font-semibold text-white block mb-2">
              Confirm Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-[#0F172A] border border-gray-700 rounded-lg text-white font-montserrat focus:border-[#0369A1] focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Phone (Optional) */}
          <div>
            <label className="font-montserrat text-sm font-semibold text-white block mb-2">
              Phone (Optional)
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="(555) 123-4567"
                className="w-full pl-10 pr-4 py-3 bg-[#0F172A] border border-gray-700 rounded-lg text-white font-montserrat focus:border-[#0369A1] focus:outline-none"
              />
            </div>
          </div>

          {/* Company (Optional) */}
          <div>
            <label className="font-montserrat text-sm font-semibold text-white block mb-2">
              Company (Optional)
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="Your company name"
                className="w-full pl-10 pr-4 py-3 bg-[#0F172A] border border-gray-700 rounded-lg text-white font-montserrat focus:border-[#0369A1] focus:outline-none"
              />
            </div>
          </div>

          {/* Create Account Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#0369A1] hover:bg-blue-700 disabled:opacity-50 text-white font-montserrat font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 mt-6"
          >
            {loading ? 'Creating account...' : (
              <>
                <Check className="w-5 h-5" />
                Create Account
              </>
            )}
          </button>
        </form>

        {/* Terms */}
        <p className="font-montserrat text-xs text-gray-500 text-center mt-4">
          By creating an account, you agree to our{' '}
          <Link href="#" className="text-[#0369A1] hover:text-blue-400">
            Terms of Service
          </Link>
          {' '}and{' '}
          <Link href="#" className="text-[#0369A1] hover:text-blue-400">
            Privacy Policy
          </Link>
        </p>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-[#050505] text-gray-400 font-montserrat">
              Already have an account?
            </span>
          </div>
        </div>

        {/* Sign In Link */}
        <Link
          href="/sencere/login"
          className="block w-full py-3 px-4 border border-gray-700 rounded-lg text-white font-montserrat font-semibold text-center hover:bg-gray-900/30 transition-colors"
        >
          Sign In
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
