'use client';

import React, { useState, useEffect } from 'react';
import { Widget } from './Widget';
import { useMetrics } from '@hooks/useMetrics';
import { useWebSocket } from '@hooks/useWebSocket';
import { useResponsive } from '@hooks/useResponsive';
import { widget as widgetType } from '@types/widget';
import styles from '@styles/dashboard.module.css';

const DEFAULT_WIDGETS: widgetType[] = [
  {
    id: 'status-summary',
    type: 'status-summary',
    title: 'System Status',
    description: 'Overall system health overview',
    gridPosition: { x: 0, y: 0, width: 2, height: 1 },
    refreshInterval: 10000,
    config: {},
    dataSource: { endpoint: '/api/health', method: 'GET', interval: 10000 },
    visualization: { type: 'gauge' },
    isVisible: true,
  },
  {
    id: 'key-metrics',
    type: 'key-metrics',
    title: 'Key Metrics',
    description: 'Critical performance indicators',
    gridPosition: { x: 2, y: 0, width: 2, height: 1 },
    refreshInterval: 5000,
    config: {},
    dataSource: { endpoint: '/api/metrics', method: 'GET', interval: 5000 },
    visualization: { type: 'sparkline' },
    isVisible: true,
  },
  {
    id: 'quick-actions',
    type: 'quick-actions',
    title: 'Quick Actions',
    description: 'System controls',
    gridPosition: { x: 4, y: 0, width: 2, height: 1 },
    refreshInterval: 0,
    config: {},
    dataSource: { endpoint: '', method: 'GET', interval: 0 },
    visualization: { type: 'bar' },
    isVisible: true,
  },
  {
    id: 'intent-distribution',
    type: 'intent-distribution',
    title: 'Intent Distribution',
    description: 'Query intent breakdown (24h)',
    gridPosition: { x: 0, y: 1, width: 2, height: 2 },
    refreshInterval: 30000,
    config: { timeRange: '24h' },
    dataSource: { endpoint: '/api/metrics/orchestrator', method: 'GET', interval: 30000 },
    visualization: { type: 'pie' },
    isVisible: true,
  },
  {
    id: 'model-performance',
    type: 'model-performance',
    title: 'Model Performance',
    description: 'Success rate by model',
    gridPosition: { x: 2, y: 1, width: 2, height: 2 },
    refreshInterval: 30000,
    config: {},
    dataSource: { endpoint: '/api/metrics/orchestrator', method: 'GET', interval: 30000 },
    visualization: { type: 'bar' },
    isVisible: true,
  },
  {
    id: 'cache-hit-rate',
    type: 'cache-hit-rate',
    title: 'Cache Hit Rate',
    description: 'Query cache effectiveness',
    gridPosition: { x: 4, y: 1, width: 2, height: 2 },
    refreshInterval: 5000,
    config: {},
    dataSource: { endpoint: '/api/metrics/orchestrator', method: 'GET', interval: 5000 },
    visualization: { type: 'gauge' },
    isVisible: true,
  },
  {
    id: 'response-time',
    type: 'response-time',
    title: 'Response Time',
    description: 'Latency trend (P50/P95/P99)',
    gridPosition: { x: 0, y: 3, width: 3, height: 2 },
    refreshInterval: 10000,
    config: { timeRange: '24h' },
    dataSource: { endpoint: '/api/metrics/orchestrator', method: 'GET', interval: 10000 },
    visualization: { type: 'line' },
    isVisible: true,
  },
  {
    id: 'memory-usage',
    type: 'memory-usage',
    title: 'Memory Usage',
    description: 'Heap and RSS trends',
    gridPosition: { x: 3, y: 3, width: 2, height: 2 },
    refreshInterval: 5000,
    config: {},
    dataSource: { endpoint: '/api/metrics/system', method: 'GET', interval: 5000 },
    visualization: { type: 'area' },
    isVisible: true,
  },
  {
    id: 'cpu-usage',
    type: 'cpu-usage',
    title: 'CPU Usage',
    description: 'Core utilization',
    gridPosition: { x: 5, y: 3, width: 1, height: 2 },
    refreshInterval: 5000,
    config: {},
    dataSource: { endpoint: '/api/metrics/system', method: 'GET', interval: 5000 },
    visualization: { type: 'sparkline' },
    isVisible: true,
  },
  {
    id: 'recent-activity',
    type: 'recent-activity',
    title: 'Recent Activity',
    description: 'Last 10 events',
    gridPosition: { x: 0, y: 5, width: 6, height: 2 },
    refreshInterval: 2000,
    config: {},
    dataSource: { endpoint: '/api/activity', method: 'GET', interval: 2000 },
    visualization: { type: 'timeline' },
    isVisible: true,
  },
];

export const Dashboard: React.FC = () => {
  const [widgets, setWidgets] = useState<widgetType[]>(DEFAULT_WIDGETS);
  const [widgetData, setWidgetData] = useState<Record<string, any>>({});
  const { data: metricsData, loading: metricsLoading } = useMetrics({ interval: 5000 });
  const { connected: wsConnected } = useWebSocket();
  const { isMobile } = useResponsive();

  useEffect(() => {
    if (metricsData) {
      setWidgetData((prev) => ({
        ...prev,
        ...metricsData,
      }));
    }
  }, [metricsData]);

  const handleWidgetRemove = (widgetId: string) => {
    setWidgets((prev) => prev.filter((w) => w.id !== widgetId));
  };

  const handleWidgetRefresh = (widgetId: string) => {
    // Trigger refresh for specific widget
    setWidgetData((prev) => ({
      ...prev,
      [`${widgetId}-refreshing`]: true,
    }));
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.dashboardHeader}>
        <div className={styles.headerTitle}>
          <h1>Command Center</h1>
          <span className={styles.statusIndicator} data-status={wsConnected ? 'connected' : 'disconnected'}>
            {wsConnected ? '● Connected' : '○ Disconnected'}
          </span>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.actionButton} title="Refresh All">
            ⟳ Refresh
          </button>
          <button className={styles.actionButton} title="Settings">
            ⚙ Settings
          </button>
        </div>
      </div>

      <div className={styles.widgetGrid}>
        {widgets.map((widget) => (
          <Widget
            key={widget.id}
            widget={widget}
            data={widgetData[widget.id]}
            loading={metricsLoading}
            onRefresh={() => handleWidgetRefresh(widget.id)}
            onRemove={() => handleWidgetRemove(widget.id)}
          >
            <div className={styles.widgetPlaceholder}>
              {widget.type} — {JSON.stringify(widgetData[widget.id] || {}).substring(0, 100)}
            </div>
          </Widget>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
