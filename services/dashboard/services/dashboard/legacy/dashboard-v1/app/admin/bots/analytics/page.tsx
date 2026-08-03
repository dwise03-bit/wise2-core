'use client';

import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';

interface Analytics {
  dau: Array<{ day: string; count: number }>;
  engagementRate: number;
  topPosts: Array<any>;
  tierBreakdown: Array<{ tier: string; count: number }>;
  totalPoints: number;
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  async function fetchAnalytics() {
    try {
      const res = await fetch('/api/admin/bots/analytics');
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <p className="text-gray">Loading analytics...</p>;
  if (!analytics) return <p className="text-gray">No data available</p>;

  const currentDAU = analytics.dau[analytics.dau.length - 1]?.count || 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="section-heading mb-2">Analytics Dashboard</h2>
        <p className="text-gray text-sm">Bot engagement metrics and performance</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray">Daily Active Users</span>
            <TrendingUp size={16} className="text-neon-red" />
          </div>
          <div className="text-3xl font-bold text-neon-red">{currentDAU}</div>
          <p className="text-xs text-gray mt-2">Users active today</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray">Engagement Rate</span>
            <BarChart3 size={16} className="text-neon-red" />
          </div>
          <div className="text-3xl font-bold text-neon-red">{analytics.engagementRate}%</div>
          <p className="text-xs text-gray mt-2">Of active members</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray">Total Points</span>
            <TrendingUp size={16} className="text-neon-red" />
          </div>
          <div className="text-3xl font-bold text-neon-red">{analytics.totalPoints}</div>
          <p className="text-xs text-gray mt-2">Community-wide</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray">Viral Posts</span>
            <BarChart3 size={16} className="text-neon-red" />
          </div>
          <div className="text-3xl font-bold text-neon-red">{analytics.topPosts.length}</div>
          <p className="text-xs text-gray mt-2">High engagement</p>
        </div>
      </div>

      {/* Tier Breakdown */}
      <div className="card">
        <h3 className="heading-silver text-lg mb-4">Member Tiers</h3>
        <div className="space-y-3">
          {analytics.tierBreakdown.length > 0 ? (
            analytics.tierBreakdown.map((tier) => (
              <div key={tier.tier} className="flex items-center justify-between pb-3 border-b border-gray-800 last:border-0">
                <span className="text-gray capitalize">{tier.tier || 'free'}</span>
                <div className="flex items-center gap-3">
                  <div className="w-24 bg-gray-800 rounded-full h-2">
                    <div
                      className="bg-neon-red h-2 rounded-full"
                      style={{
                        width: `${Math.min(100, (tier.count / Math.max(...analytics.tierBreakdown.map((t) => t.count))) * 100)}%`,
                      }}
                    />
                  </div>
                  <span className="text-neon-red font-semibold w-12 text-right">{tier.count}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray text-sm">No tier data</p>
          )}
        </div>
      </div>

      {/* Top Posts */}
      <div className="card">
        <h3 className="heading-silver text-lg mb-4">Top Viral Posts</h3>
        {analytics.topPosts.length > 0 ? (
          <div className="space-y-3">
            {analytics.topPosts.slice(0, 5).map((post, i) => (
              <div key={i} className="border-b border-gray-800 pb-3 last:border-0">
                <div className="flex justify-between items-start gap-4 mb-2">
                  <span className="text-sm text-gray font-semibold">#{i + 1}</span>
                  <span className="text-neon-red font-semibold">🔥 {post.engagement_count} reactions</span>
                </div>
                <p className="text-gray text-sm line-clamp-2">{post.discord_content || '(No content)'}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray text-sm">No viral posts yet</p>
        )}
      </div>
    </div>
  );
}
