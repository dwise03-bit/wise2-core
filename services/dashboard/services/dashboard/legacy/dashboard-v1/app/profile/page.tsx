'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { User, Mail, Award, TrendingUp, Settings } from 'lucide-react';

interface UserStats {
  id: number;
  first_name: string;
  email: string;
  tier: string;
  total_points: number;
  streak_current: number;
  streak_longest: number;
  engagement_count: number;
  last_active_date: string;
}

export default function ProfilePage() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/profile?userId=1');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <main className="bg-gray-900 min-h-screen">
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </main>
    );
  }

  if (!stats) {
    return (
      <main className="bg-gray-900 min-h-screen">
        <div className="flex items-center justify-center h-96">
          <p className="text-red-600">Profile not found</p>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-gray-900 min-h-screen">
      {/* Header */}
      <header className="bg-black border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-white">
            Wise Defense
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm text-gray-400 hover:text-white">
              Dashboard
            </Link>
            <Link href="/community" className="text-sm text-gray-400 hover:text-white">
              Community
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Profile Header Card */}
        <div className="bg-black rounded-2xl p-8 border border-gray-800 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center">
                  <User className="w-8 h-8 text-red-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">{stats.first_name}</h1>
                  <p className="text-gray-400">{stats.email}</p>
                </div>
              </div>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
              stats.tier === 'vip'
                ? 'bg-red-100 text-red-700'
                : stats.tier === 'pro'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-900 text-gray-300'
            }`}>
              {stats.tier.toUpperCase()} Plan
            </span>
          </div>
          <div className="border-t border-gray-800 pt-6">
            <p className="text-sm text-gray-400">Last active: {new Date(stats.last_active_date).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-black rounded-2xl p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="w-5 h-5 text-red-600" />
              <p className="text-sm text-gray-400">Total Points</p>
            </div>
            <p className="text-3xl font-bold text-white">{stats.total_points}</p>
          </div>

          <div className="bg-black rounded-2xl p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-3">
              <Award className="w-5 h-5 text-red-600" />
              <p className="text-sm text-gray-400">Current Streak</p>
            </div>
            <p className="text-3xl font-bold text-white">{stats.streak_current}</p>
            <p className="text-xs text-gray-500 mt-1">days</p>
          </div>

          <div className="bg-black rounded-2xl p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-3">
              <Award className="w-5 h-5 text-red-600" />
              <p className="text-sm text-gray-400">Best Streak</p>
            </div>
            <p className="text-3xl font-bold text-white">{stats.streak_longest}</p>
            <p className="text-xs text-gray-500 mt-1">days</p>
          </div>

          <div className="bg-black rounded-2xl p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="w-5 h-5 text-red-600" />
              <p className="text-sm text-gray-400">Engagements</p>
            </div>
            <p className="text-3xl font-bold text-white">{stats.engagement_count}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/dashboard">
            <div className="bg-black rounded-2xl p-6 border border-gray-800 hover:border-red-300 hover:shadow-md transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="font-semibold text-white">Continue Training</p>
                  <p className="text-sm text-gray-400">Return to your dashboard</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/booking">
            <div className="bg-black rounded-2xl p-6 border border-gray-800 hover:border-red-300 hover:shadow-md transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <Settings className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="font-semibold text-white">Book Session</p>
                  <p className="text-sm text-gray-400">Schedule your next training</p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
