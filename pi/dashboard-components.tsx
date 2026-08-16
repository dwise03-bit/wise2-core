/**
 * WISE² Dashboard Command Center Components
 * Optimized for Raspberry Pi 3B+
 *
 * Production-ready React components implementing the command center aesthetic
 */

'use client';

import React, { useState, useEffect } from 'react';

// ============================================================================
// System Health Card Component
// ============================================================================

interface HealthMetric {
  label: string;
  value: number | string;
  unit?: string;
  status: 'good' | 'warning' | 'critical';
  icon: string;
}

interface SystemHealthProps {
  metrics: HealthMetric[];
  lastUpdated?: Date;
}

export const SystemHealthDashboard: React.FC<SystemHealthProps> = ({
  metrics,
  lastUpdated,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-green-400';
      case 'warning':
        return 'text-yellow-400';
      case 'critical':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'bg-green-950/20 border-green-900/50';
      case 'warning':
        return 'bg-yellow-950/20 border-yellow-900/50';
      case 'critical':
        return 'bg-red-950/20 border-red-900/50';
      default:
        return 'bg-gray-900/20 border-gray-800/50';
    }
  };

  return (
    <div className="bg-gradient-to-b from-gray-900/50 to-black border border-gray-800 rounded-xl p-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Rajdhani' }}>
          System Health
        </h2>
        {lastUpdated && (
          <span className="text-xs text-gray-500 font-mono">
            Last updated {Math.round((Date.now() - lastUpdated.getTime()) / 1000)}s ago
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric, idx) => (
          <div
            key={idx}
            className={`border rounded-lg p-4 transition-all duration-300 hover:shadow-lg ${getStatusBgColor(
              metric.status
            )}`}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm text-gray-400 font-mono">{metric.label}</span>
              <span className="text-2xl">{metric.icon}</span>
            </div>

            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-2xl font-bold text-lime-400">
                {metric.value}
              </span>
              {metric.unit && <span className="text-xs text-gray-500">{metric.unit}</span>}
            </div>

            <div className={`text-xs font-semibold ${getStatusColor(metric.status)}`}>
              {metric.status === 'good' && '✓ Healthy'}
              {metric.status === 'warning' && '⚠ Monitor'}
              {metric.status === 'critical' && '✗ Critical'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// Key Metrics Card Component
// ============================================================================

interface MetricCard {
  label: string;
  value: string | number;
  change?: number;
  icon: string;
  compareText?: string;
}

interface KeyMetricsProps {
  metrics: MetricCard[];
}

export const KeyMetricsDashboard: React.FC<KeyMetricsProps> = ({ metrics }) => {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: 'Rajdhani' }}>
        Key Metrics
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric, idx) => (
          <div
            key={idx}
            className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg p-6 hover:border-lime-400/50 transition-all duration-300"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-sm text-gray-400 font-mono tracking-wider">{metric.label}</span>
              <span className="text-3xl">{metric.icon}</span>
            </div>

            <div className="mb-2">
              <div className="text-3xl font-bold text-lime-400">{metric.value}</div>
            </div>

            {metric.change !== undefined && (
              <div className="flex items-center gap-1">
                <span
                  className={metric.change > 0 ? 'text-green-400' : 'text-red-400'}
                >
                  {metric.change > 0 ? '↑' : '↓'} {Math.abs(metric.change)}%
                </span>
                {metric.compareText && (
                  <span className="text-xs text-gray-500">{metric.compareText}</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// Customer List Component
// ============================================================================

interface Customer {
  id: string;
  name: string;
  contact: string;
  status: 'active' | 'inactive' | 'prospect';
  lastContact: Date;
  value: number;
  rating: number;
}

interface CustomerListProps {
  customers: Customer[];
  onViewCustomer?: (id: string) => void;
}

export const CustomerListDashboard: React.FC<CustomerListProps> = ({
  customers,
  onViewCustomer,
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-950/30 text-green-300 border-green-900/50';
      case 'inactive':
        return 'bg-gray-950/30 text-gray-400 border-gray-800/50';
      case 'prospect':
        return 'bg-blue-950/30 text-blue-300 border-blue-900/50';
      default:
        return 'bg-gray-950/30 text-gray-400 border-gray-800/50';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatTimeSince = (date: Date) => {
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Rajdhani' }}>
          Customers
        </h2>
        <button className="px-4 py-2 bg-lime-400 text-black font-bold rounded-lg hover:bg-lime-300 transition-all duration-200">
          + New
        </button>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {customers.map((customer) => (
          <div
            key={customer.id}
            className="bg-gradient-to-r from-gray-900 to-black border border-gray-800 rounded-lg p-4 hover:border-lime-400/30 transition-all duration-300 cursor-pointer"
            onClick={() => onViewCustomer?.(customer.id)}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-bold text-white text-lg">{customer.name}</h3>
                <p className="text-sm text-gray-400">{customer.contact}</p>
              </div>
              <div className="flex gap-1">
                {[...Array(customer.rating)].map((_, i) => (
                  <span key={i} className="text-lime-400">
                    ★
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className={`px-2 py-1 rounded border text-xs font-mono ${getStatusBadge(customer.status)}`}>
                {customer.status}
              </span>
              <span className="text-lime-400 font-bold">{formatCurrency(customer.value)}/yr</span>
              <span className="text-gray-500 text-xs">Contact: {formatTimeSince(customer.lastContact)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// Activity Stream Component
// ============================================================================

interface Activity {
  id: string;
  type: 'invoice' | 'call' | 'task' | 'email';
  title: string;
  description: string;
  timestamp: Date;
  icon: string;
}

interface ActivityStreamProps {
  activities: Activity[];
}

export const ActivityStream: React.FC<ActivityStreamProps> = ({ activities }) => {
  const formatTime = (date: Date) => {
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-gradient-to-b from-gray-900/50 to-black border border-gray-800 rounded-xl p-6">
      <h2 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: 'Rajdhani' }}>
        Recent Activity
      </h2>

      <div className="space-y-4 max-h-80 overflow-y-auto">
        {activities.map((activity) => (
          <div key={activity.id} className="flex gap-4 pb-4 border-b border-gray-800 last:border-b-0">
            <div className="text-2xl flex-shrink-0">{activity.icon}</div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-white text-sm">{activity.title}</h3>
              <p className="text-xs text-gray-400 line-clamp-2">{activity.description}</p>
              <p className="text-xs text-gray-600 mt-1">{formatTime(activity.timestamp)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// Sidebar Navigation Component
// ============================================================================

interface NavigationItem {
  label: string;
  icon: string;
  href: string;
  active?: boolean;
}

interface SidebarProps {
  items: NavigationItem[];
  onNavigate?: (href: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ items, onNavigate }) => {
  return (
    <aside className="w-64 bg-gradient-to-b from-black to-gray-950 border-r border-gray-800 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-xl font-bold text-lime-400" style={{ fontFamily: 'Beyond The Mountains' }}>
          WISE²
        </h1>
        <p className="text-xs text-gray-500 font-mono mt-1">Enterprise Command Center</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        {items.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onNavigate?.(item.href)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all duration-200 ${
              item.active
                ? 'bg-lime-400/10 border border-lime-400/50 text-lime-400'
                : 'text-gray-400 hover:text-white hover:bg-gray-900/50'
            }`}
          >
            <span className="text-lg flex-shrink-0">{item.icon}</span>
            <span className="font-medium text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <button className="w-full px-4 py-2 bg-gray-900 border border-gray-800 text-gray-400 rounded-lg hover:border-gray-700 transition-all duration-200 text-sm font-medium">
          ⚙ Settings
        </button>
      </div>
    </aside>
  );
};

// ============================================================================
// Main Dashboard Layout
// ============================================================================

interface DashboardLayoutProps {
  children: React.ReactNode;
  navigationItems?: NavigationItem[];
  onNavigate?: (href: string) => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  navigationItems = [],
  onNavigate,
}) => {
  return (
    <div className="flex h-screen bg-black text-white">
      {navigationItems.length > 0 && (
        <Sidebar items={navigationItems} onNavigate={onNavigate} />
      )}

      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
};

// ============================================================================
// Gauge Component (For System Metrics)
// ============================================================================

interface GaugeProps {
  value: number;
  max?: number;
  label: string;
  status: 'good' | 'warning' | 'critical';
}

export const Gauge: React.FC<GaugeProps> = ({ value, max = 100, label, status }) => {
  const percentage = (value / max) * 100;

  const getGaugeColor = (status: string) => {
    switch (status) {
      case 'good':
        return '#22C55E';
      case 'warning':
        return '#F59E0B';
      case 'critical':
        return '#E53935';
      default:
        return '#8D98A5';
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24 mb-2">
        <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#1F2937"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={getGaugeColor(status)}
            strokeWidth="8"
            strokeDasharray={`${(percentage / 100) * 283} 283`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 0.3s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-lime-400">{value}%</span>
        </div>
      </div>
      <span className="text-sm text-gray-400">{label}</span>
    </div>
  );
};

// ============================================================================
// Export all components
// ============================================================================

export default {
  SystemHealthDashboard,
  KeyMetricsDashboard,
  CustomerListDashboard,
  ActivityStream,
  Sidebar,
  DashboardLayout,
  Gauge,
};
