/**
 * Admin News Intelligence Dashboard
 * Real-time metrics for news scraping, analysis, and distribution
 */

'use client';

import { useEffect, useState } from 'react';

interface Analytics {
  articles: {
    total: string;
    today: string;
    this_week: string;
  };
  reviews: {
    total: string;
    high_priority: string;
    recommended: string;
  };
  sentiment: Array<{ sentiment: string; count: string }>;
  top_sources: Array<{ source_name: string; count: string }>;
  alerts: Array<{ platform: string; count: string }>;
  social_posts: Array<{ platform: string; total: string; posted: string }>;
  telegram_subscriptions: Array<{ subscription_type: string; count: string }>;
  timestamp: string;
}

export default function NewsAnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/admin/news/analytics');
        const data = await response.json();
        setAnalytics(data);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Loading analytics...</div>;
  }

  if (!analytics) {
    return <div className="p-8 text-center text-red-600">Failed to load analytics</div>;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <h1 className="text-4xl font-bold mb-2">📰 News Intelligence Dashboard</h1>
      <p className="text-gray-400 mb-8">Last updated: {new Date(analytics.timestamp).toLocaleTimeString()}</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Articles Collected */}
        <div className="bg-gray-900 p-6 rounded-lg border border-red-600 border-opacity-30">
          <h2 className="text-lg font-semibold mb-4">📊 Articles Collected</h2>
          <div className="text-3xl font-bold text-red-500">{analytics.articles.total}</div>
          <div className="text-sm text-gray-400 mt-2">
            <div>Today: {analytics.articles.today}</div>
            <div>This Week: {analytics.articles.this_week}</div>
          </div>
        </div>

        {/* Content Reviews */}
        <div className="bg-gray-900 p-6 rounded-lg border border-red-600 border-opacity-30">
          <h2 className="text-lg font-semibold mb-4">✅ Content Reviews</h2>
          <div className="text-3xl font-bold text-red-500">{analytics.reviews.total}</div>
          <div className="text-sm text-gray-400 mt-2">
            <div>High Priority: {analytics.reviews.high_priority}</div>
            <div>Recommended: {analytics.reviews.recommended}</div>
          </div>
        </div>

        {/* Alerts Sent */}
        <div className="bg-gray-900 p-6 rounded-lg border border-red-600 border-opacity-30">
          <h2 className="text-lg font-semibold mb-4">🔔 Alerts Sent</h2>
          <div className="space-y-1">
            {analytics.alerts.map((alert) => (
              <div key={alert.platform} className="text-sm">
                {alert.platform}: <span className="font-bold">{alert.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Sentiment Analysis */}
        <div className="bg-gray-900 p-6 rounded-lg border border-red-600 border-opacity-30">
          <h2 className="text-lg font-semibold mb-4">💭 Sentiment Breakdown</h2>
          <div className="space-y-2">
            {analytics.sentiment.map((s) => (
              <div key={s.sentiment} className="flex justify-between">
                <span className="capitalize">{s.sentiment}</span>
                <span className="font-bold">{s.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top News Sources */}
        <div className="bg-gray-900 p-6 rounded-lg border border-red-600 border-opacity-30">
          <h2 className="text-lg font-semibold mb-4">📰 Top News Sources</h2>
          <div className="space-y-2">
            {analytics.top_sources.map((source) => (
              <div key={source.source_name} className="flex justify-between">
                <span>{source.source_name}</span>
                <span className="font-bold">{source.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Social Media Distribution */}
        <div className="bg-gray-900 p-6 rounded-lg border border-red-600 border-opacity-30">
          <h2 className="text-lg font-semibold mb-4">📱 Social Media Posts</h2>
          <div className="space-y-3">
            {analytics.social_posts.map((post) => (
              <div key={post.platform} className="flex justify-between items-center">
                <span className="capitalize font-semibold">{post.platform}</span>
                <div className="text-sm">
                  <span className="text-green-500">{post.posted}</span>
                  <span className="text-gray-500"> / {post.total}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Telegram Subscriptions */}
        <div className="bg-gray-900 p-6 rounded-lg border border-red-600 border-opacity-30">
          <h2 className="text-lg font-semibold mb-4">💬 Telegram Subscribers</h2>
          <div className="space-y-2">
            {analytics.telegram_subscriptions.map((sub) => (
              <div key={sub.subscription_type} className="flex justify-between">
                <span className="capitalize">{sub.subscription_type}</span>
                <span className="font-bold">{sub.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-gray-900 rounded-lg border border-gray-700 text-sm text-gray-400">
        <p>🔄 Dashboard auto-refreshes every 30 seconds</p>
      </div>
    </div>
  );
}
