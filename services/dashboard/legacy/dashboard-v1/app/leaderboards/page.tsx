'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Trophy, TrendingUp, Zap } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  id: number;
  first_name: string;
  tier: string;
  total_points?: number;
  engagement_count?: number;
  streak_current?: number;
}

type LeaderboardType = 'points' | 'streaks' | 'viral';

export default function LeaderboardsPage() {
  const [type, setType] = useState<LeaderboardType>('points');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const params = new URLSearchParams();
        params.append('type', type);

        const response = await fetch(`/api/leaderboards?${params}`);
        const data = await response.json();
        setLeaderboard(data.leaderboard || []);
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [type]);

  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  const getTierColor = (tier: string) => {
    if (tier === 'vip') return 'text-red-600';
    if (tier === 'pro') return 'text-blue-600';
    return 'text-gray-600';
  };

  const tabs = [
    { id: 'points' as const, label: 'Points', icon: Trophy },
    { id: 'streaks' as const, label: 'Streaks', icon: Zap },
    { id: 'viral' as const, label: 'Viral', icon: TrendingUp },
  ];

  return (
    <main className="bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-gray-900">
            Wise Defense
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
              Dashboard
            </Link>
            <Link href="/community" className="text-sm text-gray-600 hover:text-gray-900">
              Community
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-white border-b border-gray-200 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-8 h-8 text-red-600" />
            <h1 className="text-4xl font-bold text-gray-900">Leaderboards</h1>
          </div>
          <p className="text-lg text-gray-600">
            See how you stack up against other members of the community.
          </p>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Tabs */}
        <div className="flex gap-4 mb-12 border-b border-gray-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setType(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium transition-all ${
                  type === tab.id
                    ? 'border-red-600 text-red-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Leaderboard Table */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading leaderboard...</p>
          </div>
        ) : leaderboard.length > 0 ? (
          <div className="space-y-2">
            {leaderboard.map((entry, idx) => {
              const medal = getMedalEmoji(entry.rank);
              const value =
                type === 'points'
                  ? entry.total_points
                  : type === 'streaks'
                  ? entry.streak_current
                  : entry.engagement_count;

              return (
                <div
                  key={entry.id}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                    entry.rank <= 3
                      ? 'bg-gradient-to-r from-red-50 to-transparent border-red-200'
                      : 'bg-white border-gray-200 hover:border-red-200'
                  }`}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="text-center w-12">
                      {medal ? (
                        <span className="text-2xl">{medal}</span>
                      ) : (
                        <span className="text-lg font-bold text-gray-600">#{entry.rank}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{entry.first_name}</p>
                      <p className={`text-xs font-medium uppercase tracking-wider ${getTierColor(entry.tier)}`}>
                        {entry.tier}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                    <p className="text-xs text-gray-600">
                      {type === 'points' ? 'points' : type === 'streaks' ? 'days' : 'engagement'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
            <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No entries yet</p>
          </div>
        )}
      </div>
    </main>
  );
}
