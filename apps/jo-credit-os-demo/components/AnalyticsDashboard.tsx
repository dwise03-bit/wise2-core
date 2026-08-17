'use client';

import { useState, useEffect } from 'react';

interface AnalyticsData {
  activeUsers: number;
  lyricsGenerated: number;
  projectsCreated: number;
  liveStreams: number;
  totalEngagement: number;
  averageSessionTime: number;
}

export function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    activeUsers: 0,
    lyricsGenerated: 0,
    projectsCreated: 0,
    liveStreams: 0,
    totalEngagement: 0,
    averageSessionTime: 0,
  });

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setAnalytics(prev => ({
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 5),
        lyricsGenerated: prev.lyricsGenerated + Math.floor(Math.random() * 3),
        projectsCreated: prev.projectsCreated + Math.floor(Math.random() * 2),
        liveStreams: prev.liveStreams + Math.floor(Math.random() * 1),
        totalEngagement: prev.totalEngagement + Math.floor(Math.random() * 50),
        averageSessionTime: Math.floor(Math.random() * 45) + 15,
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const metrics = [
    { label: 'Active Users', value: analytics.activeUsers, icon: '👥', color: '#39FF14' },
    { label: 'Lyrics Generated', value: analytics.lyricsGenerated, icon: '✍️', color: '#00D9FF' },
    { label: 'Projects Created', value: analytics.projectsCreated, icon: '🎯', color: '#e0a83c' },
    { label: 'Live Streams', value: analytics.liveStreams, icon: '🔴', color: '#ff5c5c' },
    { label: 'Total Engagement', value: analytics.totalEngagement, icon: '⚡', color: '#a78bfa' },
    { label: 'Avg Session (min)', value: analytics.averageSessionTime, icon: '⏱️', color: '#06b6d4' },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ fontSize: '20px', fontWeight: 900, marginBottom: '20px', color: '#39FF14' }}>
        📊 REAL-TIME ANALYTICS
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        {metrics.map((metric, idx) => (
          <div
            key={idx}
            style={{
              background: '#1a1a1a',
              border: `2px solid ${metric.color}40`,
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center',
              animation: 'pulse 2s infinite',
            }}
          >
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>{metric.icon}</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: metric.color, marginBottom: '4px' }}>
              {metric.value}
            </div>
            <div style={{ fontSize: '12px', color: '#888' }}>{metric.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
