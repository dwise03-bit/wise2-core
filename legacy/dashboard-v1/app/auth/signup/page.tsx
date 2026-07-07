'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, Lock, ArrowRight, Check } from 'lucide-react';

function SignupFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tierParam = searchParams.get('tier');

  const [selectedTier, setSelectedTier] = useState<string>(
    tierParam && ['starter', 'pro', 'vip'].includes(tierParam)
      ? tierParam
      : 'pro'
  );

  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    experience_level: 'beginner',
    goals: '',
    tier: selectedTier,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, tier: selectedTier }));
  }, [selectedTier]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Signup failed');
        setLoading(false);
        return;
      }

      const { token } = await res.json();
      localStorage.setItem('token', token);
      router.push('/dashboard');
    } catch (err) {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  const tiers = [
    { id: 'starter', name: 'Starter', price: 99 },
    { id: 'pro', name: 'Pro', price: 199 },
    { id: 'vip', name: 'VIP', price: 499 },
  ];

  return (
    <div className="w-full max-w-2xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-2">
          Start Your Training
        </h1>
        <p className="text-gray-400">
          Create your account and choose your training path.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Account Information */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Account Information</h2>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:bg-black focus:border-red-600 focus:ring-2 focus:ring-red-100 transition-all"
                placeholder="John Doe"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:bg-black focus:border-red-600 focus:ring-2 focus:ring-red-100 transition-all"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:bg-black focus:border-red-600 focus:ring-2 focus:ring-red-100 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>
        </div>

        {/* Training Details */}
        <div className="space-y-4 pt-8 border-t border-gray-800">
          <h2 className="text-lg font-semibold text-white">Training Details</h2>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Experience Level
            </label>
            <select
              name="experience_level"
              value={formData.experience_level}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:bg-black focus:border-red-600 focus:ring-2 focus:ring-red-100 transition-all"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Training Goals
            </label>
            <textarea
              name="goals"
              value={formData.goals}
              onChange={handleChange}
              placeholder="What are your training goals?"
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:bg-black focus:border-red-600 focus:ring-2 focus:ring-red-100 transition-all"
              rows={3}
            />
          </div>
        </div>

        {/* Tier Selection */}
        <div className="space-y-4 pt-8 border-t border-gray-800">
          <h2 className="text-lg font-semibold text-white">Choose Your Plan</h2>
          <div className="grid grid-cols-3 gap-4">
            {tiers.map((tier) => (
              <label
                key={tier.id}
                className={`relative flex flex-col items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedTier === tier.id
                    ? 'border-red-600 bg-red-50'
                    : 'border-gray-700 bg-black hover:border-gray-400'
                }`}
              >
                <input
                  type="radio"
                  name="tier"
                  value={tier.id}
                  checked={selectedTier === tier.id}
                  onChange={(e) => setSelectedTier(e.target.value)}
                  className="sr-only"
                />
                <div className="font-semibold text-white text-center">
                  {tier.name}
                </div>
                <div className="text-sm text-gray-400">${tier.price}/mo</div>
                {selectedTier === tier.id && (
                  <Check className="absolute top-2 right-2 w-5 h-5 text-red-600" />
                )}
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {loading ? 'Creating Account...' : 'Create Account'}
          {!loading && <ArrowRight className="w-4 h-4" />}
        </button>

        <div className="text-center">
          <p className="text-gray-400">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-red-600 font-semibold hover:text-red-700">
              Sign in
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}

export function SignupForm() {
  return (
    <Suspense fallback={<div className="text-center py-12">Loading...</div>}>
      <SignupFormContent />
    </Suspense>
  );
}

export default function SignupPage() {
  return (
    <main className="bg-black min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-gray-800 px-6 h-16 flex items-center">
        <Link href="/" className="text-xl font-bold text-white">
          Wise Defense
        </Link>
      </nav>

      {/* Signup Container */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <SignupForm />
      </div>
    </main>
  );
}
