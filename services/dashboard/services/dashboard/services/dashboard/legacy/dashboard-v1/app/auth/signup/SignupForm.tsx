'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tierParam = searchParams.get('tier');

  const [selectedTier, setSelectedTier] = useState<string>(
    tierParam && ['starter', 'pro', 'vip'].includes(tierParam)
      ? tierParam
      : 'starter'
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

  // Update tier in formData when selectedTier changes
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
        return;
      }

      const { token } = await res.json();
      localStorage.setItem('token', token);
      router.push('/dashboard');
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card max-w-md w-full">
      <h1 className="heading-silver text-2xl text-center mb-6">Sign Up</h1>
      {error && <p className="text-neon-red mb-4 text-center">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full"
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          className="w-full"
        />

        {/* Tier Selection */}
        <div className="mt-6 pt-6 border-t border-gray-700">
          <label className="block text-sm font-medium text-gray-200 mb-3">
            Choose Your Plan
          </label>
          <div className="space-y-3">
            {/* Starter tier */}
            <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer"
              style={{
                borderColor: selectedTier === 'starter' ? '#ff1744' : '#374151',
                backgroundColor: selectedTier === 'starter' ? 'rgba(255, 23, 68, 0.1)' : 'transparent'
              }}
            >
              <input
                type="radio"
                name="tier"
                value="starter"
                checked={selectedTier === 'starter'}
                onChange={(e) => setSelectedTier(e.target.value)}
                className="mr-3"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-200">Starter - $99/month</div>
                <div className="text-xs text-gray-400">Beginner Fundamentals + community</div>
              </div>
            </label>

            {/* Pro tier */}
            <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer"
              style={{
                borderColor: selectedTier === 'pro' ? '#ff1744' : '#374151',
                backgroundColor: selectedTier === 'pro' ? 'rgba(255, 23, 68, 0.1)' : 'transparent'
              }}
            >
              <input
                type="radio"
                name="tier"
                value="pro"
                checked={selectedTier === 'pro'}
                onChange={(e) => setSelectedTier(e.target.value)}
                className="mr-3"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-200">Pro - $199/month</div>
                <div className="text-xs text-gray-400">Concealed Carry + 2 coaching sessions/month</div>
              </div>
            </label>

            {/* VIP tier */}
            <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer"
              style={{
                borderColor: selectedTier === 'vip' ? '#ff1744' : '#374151',
                backgroundColor: selectedTier === 'vip' ? 'rgba(255, 23, 68, 0.1)' : 'transparent'
              }}
            >
              <input
                type="radio"
                name="tier"
                value="vip"
                checked={selectedTier === 'vip'}
                onChange={(e) => setSelectedTier(e.target.value)}
                className="mr-3"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-200">VIP - $399/month</div>
                <div className="text-xs text-gray-400">All courses + weekly coaching + 24/7 support</div>
              </div>
            </label>
          </div>
        </div>

        <select name="experience_level" value={formData.experience_level} onChange={handleChange} className="w-full">
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
        <textarea
          name="goals"
          placeholder="What are your training goals?"
          value={formData.goals}
          onChange={handleChange}
          className="w-full"
        />
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>
      <p className="text-center text-gray mt-6">
        Already have an account? <Link href="/auth/login" className="text-neon-red hover:underline">Log in</Link>
      </p>
    </div>
  );
}
