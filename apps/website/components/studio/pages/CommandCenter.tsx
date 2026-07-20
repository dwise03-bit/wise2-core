'use client';

import { useEffect, useState } from 'react';

interface KPI {
  title: string;
  value: string | number;
  trend: string;
  icon: string;
  color: string;
}

interface DashboardMetrics {
  timestamp: string;
  kpis: KPI[];
  charts: any;
  recent_events: any[];
}

export default function CommandCenter() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/v1/metrics/dashboard');
        if (!response.ok) throw new Error('Failed to fetch metrics');
        const data = await response.json();
        setMetrics(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching metrics:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 60000); // Refresh every 60 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div style={{ color: '#888', textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: '24px', marginBottom: '20px' }}>⏳</div>
        <div>Loading Command Center metrics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ color: '#ff6600', textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: '24px', marginBottom: '20px' }}>⚠️</div>
        <div>Error: {error}</div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div style={{ color: '#666', textAlign: 'center', padding: '60px 20px' }}>
        No metrics available
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px',
      }}>
        {metrics.kpis.map((kpi, idx) => (
          <div
            key={idx}
            style={{
              background: 'linear-gradient(135deg, #0a0a0a 0%, #0f0f0f 100%)',
              border: `1px solid ${kpi.color}20`,
              borderRadius: '8px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div style={{ fontSize: '28px' }}>{kpi.icon}</div>
              <div style={{
                fontSize: '11px',
                padding: '2px 8px',
                background: kpi.color + '20',
                color: kpi.color,
                borderRadius: '3px',
                fontWeight: 600,
              }}>
                {kpi.trend}
              </div>
            </div>
            <div style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {kpi.title}
            </div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: kpi.color }}>
              {kpi.value}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div style={{
        background: '#0a0a0a',
        border: '1px solid #262626',
        borderRadius: '8px',
        padding: '20px',
      }}>
        <h3 style={{
          margin: '0 0 16px 0',
          fontFamily: '"Orbitron", sans-serif',
          fontSize: '16px',
          fontWeight: 700,
          color: '#39FF14',
          textTransform: 'uppercase',
          letterSpacing: '1px',
        }}>
          Revenue Trend (30d)
        </h3>
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: '12px',
          height: '120px',
        }}>
          {metrics.charts.revenue_trend.data.map((point: any, idx: number) => (
            <div
              key={idx}
              style={{
                flex: 1,
                background: 'linear-gradient(180deg, #39FF14 0%, #39FF1420 100%)',
                height: `${(point.amount / 3500) * 100}%`,
                borderRadius: '4px',
                position: 'relative',
                minHeight: '20px',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
              }}
            >
              <div style={{
                fontSize: '10px',
                color: '#39FF14',
                fontWeight: 600,
                paddingBottom: '4px',
              }}>
                ${point.amount.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{
        background: '#0a0a0a',
        border: '1px solid #262626',
        borderRadius: '8px',
        padding: '20px',
      }}>
        <h3 style={{
          margin: '0 0 16px 0',
          fontFamily: '"Orbitron", sans-serif',
          fontSize: '16px',
          fontWeight: 700,
          color: '#39FF14',
          textTransform: 'uppercase',
          letterSpacing: '1px',
        }}>
          Recent Activity
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {metrics.recent_events.map((event, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '12px',
                background: '#060606',
                border: '1px solid #1f1f1f',
                borderRadius: '6px',
                fontSize: '13px',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                <div style={{ color: '#e6e6e6', fontWeight: 600 }}>{event.event}</div>
                <div style={{ color: '#888', fontSize: '12px' }}>
                  {event.user || event.branch || 'System'}
                </div>
              </div>
              <div style={{ color: '#39FF14', whiteSpace: 'nowrap', marginLeft: '16px' }}>
                {event.timestamp}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Metadata */}
      <div style={{
        fontSize: '11px',
        color: '#666',
        textAlign: 'right',
        padding: '0 4px',
      }}>
        Last updated: {new Date(metrics.timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
}
