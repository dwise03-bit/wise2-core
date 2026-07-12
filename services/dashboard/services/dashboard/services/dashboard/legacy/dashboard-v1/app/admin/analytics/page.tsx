/**
 * Advanced Analytics Dashboard
 * Trends, patterns, and insights
 */

'use client';

import { useEffect, useState } from 'react';

interface TrendData {
  metric: string;
  period_days: number;
  data: any[];
}

export default function AdvancedAnalyticsPage() {
  const [engagementTrend, setEngagementTrend] = useState<TrendData | null>(null);
  const [sentimentTrend, setSentimentTrend] = useState<TrendData | null>(null);
  const [viralTrend, setViralTrend] = useState<TrendData | null>(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrends = async () => {
      setLoading(true);
      try {
        const [eng, sent, viral] = await Promise.all([
          fetch(`/api/analytics/trends?metric=engagement&days=${days}`),
          fetch(`/api/analytics/trends?metric=sentiment&days=${days}`),
          fetch(`/api/analytics/trends?metric=viral&days=${days}`),
        ]);

        const engData = await eng.json();
        const sentData = await sent.json();
        const viralData = await viral.json();

        setEngagementTrend(engData);
        setSentimentTrend(sentData);
        setViralTrend(viralData);
      } catch (error) {
        console.error('Failed to fetch trends:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrends();
  }, [days]);

  const getTrendDirection = (data: any[]) => {
    if (data.length < 2) return '→';
    const last = parseInt(data[data.length - 1].count || data[data.length - 1].posts || 0);
    const prev = parseInt(data[data.length - 2].count || data[data.length - 2].posts || 0);
    if (last > prev) return '↑';
    if (last < prev) return '↓';
    return '→';
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <h1 className="text-4xl font-bold mb-2">📊 Advanced Analytics</h1>
      <p className="text-gray-400 mb-8">Trends, patterns, and insights over time</p>

      {/* Period Selector */}
      <div className="flex gap-2 mb-8">
        {[7, 14, 30, 60, 90].map((d) => (
          <button
            key={d}
            onClick={() => setDays(d)}
            className={`px-4 py-2 rounded text-sm ${
              days === d ? 'bg-red-600' : 'bg-gray-800'
            }`}
          >
            {d}d
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center">Loading trends...</div>
      ) : (
        <div className="space-y-8">
          {/* Engagement Trend */}
          <div className="bg-gray-900 p-6 rounded-lg border border-red-600 border-opacity-30">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">💬 Engagement Trend {engagementTrend?.data && getTrendDirection(engagementTrend.data)}</h2>
              {engagementTrend?.data && (
                <span className="text-2xl font-bold text-red-500">{engagementTrend.data.length} periods</span>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-2">Date</th>
                    <th className="text-right py-2">Actions</th>
                    <th className="text-right py-2">Users</th>
                    <th className="text-right py-2">Like Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {engagementTrend?.data?.map((row: any) => (
                    <tr key={row.date} className="border-b border-gray-800 hover:bg-gray-800 transition">
                      <td className="py-2">{row.date}</td>
                      <td className="text-right font-semibold">{row.count}</td>
                      <td className="text-right">{row.unique_users}</td>
                      <td className="text-right text-green-500">{(row.like_rate * 100).toFixed(0)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sentiment Trend */}
          <div className="bg-gray-900 p-6 rounded-lg border border-red-600 border-opacity-30">
            <h2 className="text-xl font-semibold mb-4">💭 Sentiment Trend {sentimentTrend?.data && getTrendDirection(sentimentTrend.data)}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {['positive', 'negative', 'neutral'].map((sent) => {
                const total = sentimentTrend?.data?.filter((d: any) => d.sentiment === sent).reduce((sum: number, d: any) => sum + parseInt(d.count), 0) || 0;
                const emoji = sent === 'positive' ? '✅' : sent === 'negative' ? '⚠️' : '📰';
                return (
                  <div key={sent} className="bg-gray-800 p-4 rounded">
                    <div className="text-sm text-gray-400 capitalize">{emoji} {sent}</div>
                    <div className="text-2xl font-bold text-red-500">{total}</div>
                  </div>
                );
              })}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-2">Date</th>
                    <th className="text-left py-2">Sentiment</th>
                    <th className="text-right py-2">Count</th>
                    <th className="text-right py-2">Avg Relevance</th>
                  </tr>
                </thead>
                <tbody>
                  {sentimentTrend?.data?.map((row: any) => (
                    <tr key={`${row.date}-${row.sentiment}`} className="border-b border-gray-800">
                      <td className="py-2">{row.date}</td>
                      <td className="capitalize">{row.sentiment}</td>
                      <td className="text-right">{row.count}</td>
                      <td className="text-right font-semibold">{(row.avg_relevance * 100).toFixed(0)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Viral Trend */}
          <div className="bg-gray-900 p-6 rounded-lg border border-red-600 border-opacity-30">
            <h2 className="text-xl font-semibold mb-4">📱 Viral Content Trend {viralTrend?.data && getTrendDirection(viralTrend.data)}</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-2">Date</th>
                    <th className="text-left py-2">Platform</th>
                    <th className="text-right py-2">Posts</th>
                    <th className="text-right py-2">Avg Engagement</th>
                    <th className="text-right py-2">Peak</th>
                  </tr>
                </thead>
                <tbody>
                  {viralTrend?.data?.map((row: any) => (
                    <tr key={`${row.date}-${row.platform}`} className="border-b border-gray-800 hover:bg-gray-800 transition">
                      <td className="py-2">{row.date}</td>
                      <td className="capitalize font-semibold">{row.platform}</td>
                      <td className="text-right">{row.posts}</td>
                      <td className="text-right text-green-500">{row.avg_engagement}</td>
                      <td className="text-right text-red-500">{row.peak_engagement}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
