'use client';

import React, { useState, useEffect } from 'react';
import { BarChart, LineChart, MetricCard } from '../components';
import { useAuth } from '../contexts';
import { TrendingUp, Users, Zap, Target } from 'lucide-react';

export function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState({
    totalLeads: 0,
    activeEstimates: 0,
    completedJobs: 0,
    revenue: 0,
  });

  useEffect(() => {
    if (!isAuthenticated) return;
    loadMetrics();
  }, [isAuthenticated]);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      // TODO: Load metrics from API
      setMetrics({
        totalLeads: 245,
        activeEstimates: 18,
        completedJobs: 342,
        revenue: 125000,
      });
    } finally {
      setLoading(false);
    }
  };

  const leadsData = [
    { label: 'Jan', value: 45 },
    { label: 'Feb', value: 62 },
    { label: 'Mar', value: 58 },
    { label: 'Apr', value: 73 },
    { label: 'May', value: 81 },
    { label: 'Jun', value: 95 },
  ];

  const revenueData = [
    { label: 'Jan', value: 18500 },
    { label: 'Feb', value: 21200 },
    { label: 'Mar', value: 19800 },
    { label: 'Apr', value: 25300 },
    { label: 'May', value: 28900 },
    { label: 'Jun', value: 31200 },
  ];

  const statusDistribution = [
    { label: 'New', value: 45 },
    { label: 'Contacted', value: 62 },
    { label: 'Qualified', value: 82 },
    { label: 'Won', value: 56 },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-white">Welcome back, {user?.name}!</h1>
        <p className="text-gray-400 mt-2">Here's what's happening with your business today.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Leads"
          value={metrics.totalLeads}
          change={{ value: 12, trend: 'up' }}
          icon={<Users size={24} />}
        />
        <MetricCard
          title="Active Estimates"
          value={metrics.activeEstimates}
          change={{ value: 5, trend: 'up' }}
          icon={<Target size={24} />}
        />
        <MetricCard
          title="Completed Jobs"
          value={metrics.completedJobs}
          change={{ value: 8, trend: 'up' }}
          icon={<Zap size={24} />}
        />
        <MetricCard
          title="Revenue"
          value={`$${(metrics.revenue / 1000).toFixed(1)}k`}
          change={{ value: 23, trend: 'up' }}
          icon={<TrendingUp size={24} />}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
          <BarChart
            title="Leads by Status"
            data={statusDistribution}
            height={300}
          />
        </div>

        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
          <LineChart
            title="Revenue Trend (Last 6 Months)"
            data={revenueData}
          />
        </div>

        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
          <BarChart
            title="Leads Generated (Monthly)"
            data={leadsData}
            height={300}
          />
        </div>

        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm">
                Create New Lead
              </button>
              <button className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm">
                Send Estimate
              </button>
              <button className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm">
                Assign Job
              </button>
              <button className="w-full px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors text-sm">
                View Reports
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
