'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { ApiClient } from '@/lib/api-client';
import { BarChart, LineChart, PieChart, MetricCard } from '@/components/Charts';

interface ReportData {
  leadsNew: number;
  leadsCount: number;
  leadsQualified: number;
  leadsBooked: number;
  estimatesCount: number;
  estimatesPending: number;
  estimatesSent: number;
  estimatesAccepted: number;
  jobsCount: number;
  jobsCompleted: number;
  jobsInProgress: number;
  jobsUnassigned: number;
  followupsCount: number;
  followupsOverdue: number;
  totalLeadValue: number;
  estimateValue: number;
  revenueByMonth: Array<{ month: string; revenue: number }>;
  leadsBySource: Array<{ source: string; count: number }>;
  leadsByStatus: Array<{ status: string; count: number }>;
}

export function ReportsPage() {
  const { token } = useAuth();
  const client = new ApiClient(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api', token);

  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  const loadReportData = async () => {
    try {
      setLoading(true);
      const reportData = await client.getBusinessIntelligence({
        dateRange,
      });
      setData(reportData);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReportData();
  }, [dateRange]);

  if (loading) {
    return <div className="flex justify-center items-center h-96">Loading reports...</div>;
  }

  if (!data) {
    return <div className="text-center text-gray-600">No data available</div>;
  }

  const qualificationRate = data.leadsCount > 0 ? (data.leadsQualified / data.leadsCount) * 100 : 0;
  const conversionRate = data.leadsQualified > 0 ? (data.leadsBooked / data.leadsQualified) * 100 : 0;
  const estimateAcceptanceRate = data.estimatesSent > 0 ? (data.estimatesAccepted / data.estimatesSent) * 100 : 0;
  const jobCompletionRate = data.jobsCount > 0 ? (data.jobsCompleted / data.jobsCount) * 100 : 0;

  const avgLeadValue = data.leadsCount > 0 ? data.totalLeadValue / data.leadsCount : 0;
  const avgEstimateValue = data.estimatesCount > 0 ? data.estimateValue / data.estimatesCount : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Reports & Analytics</h1>
        <div className="flex gap-2">
          {(['week', 'month', 'quarter', 'year'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-4 py-2 rounded capitalize ${
                dateRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="bg-red-100 text-red-800 p-4 rounded">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Leads"
          value={data.leadsCount}
          trend={data.leadsNew}
          trendLabel="new this period"
          status="neutral"
        />
        <MetricCard
          title="Qualification Rate"
          value={`${qualificationRate.toFixed(1)}%`}
          trend={qualificationRate > 30 ? 'up' : 'down'}
          trendLabel={`${qualificationRate > 30 ? 'Above' : 'Below'} 30% target`}
          status={qualificationRate > 30 ? 'up' : 'down'}
        />
        <MetricCard
          title="Active Estimates"
          value={data.estimatesPending}
          trend={data.estimatesSent}
          trendLabel="sent this period"
          status={data.estimatesPending > 5 ? 'down' : 'up'}
        />
        <MetricCard
          title="Jobs In Progress"
          value={data.jobsInProgress}
          trend={data.jobsCompleted}
          trendLabel="completed this period"
          status={data.jobsCompleted > 0 ? 'up' : 'neutral'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded shadow p-6">
          <h2 className="text-xl font-bold mb-4">Revenue Trend</h2>
          <LineChart
            data={data.revenueByMonth.map((item) => ({
              label: item.month,
              value: item.revenue / 100, // Convert cents to dollars
            }))}
            title="Monthly Revenue"
            color="#3b82f6"
          />
        </div>

        <div className="bg-white rounded shadow p-6">
          <h2 className="text-xl font-bold mb-4">Leads by Source</h2>
          <BarChart
            data={data.leadsBySource.map((item) => ({
              label: item.source,
              value: item.count,
            }))}
            title="Lead Distribution"
            color="#10b981"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded shadow p-6">
          <h2 className="text-xl font-bold mb-4">Conversion Funnel</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">Total Leads</span>
                <span className="text-lg font-bold">{data.leadsCount}</span>
              </div>
              <div className="w-full bg-blue-100 rounded h-8 flex items-center px-3">
                <span className="text-sm font-medium">100%</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">Qualified</span>
                <span className="text-lg font-bold">{data.leadsQualified}</span>
              </div>
              <div
                className="bg-green-100 rounded h-8 flex items-center px-3"
                style={{ width: `${qualificationRate}%` }}
              >
                <span className="text-sm font-medium">{qualificationRate.toFixed(1)}%</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">Booked</span>
                <span className="text-lg font-bold">{data.leadsBooked}</span>
              </div>
              <div
                className="bg-purple-100 rounded h-8 flex items-center px-3"
                style={{ width: `${(data.leadsBooked / data.leadsCount) * 100}%` }}
              >
                <span className="text-sm font-medium">
                  {((data.leadsBooked / data.leadsCount) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded shadow p-6">
          <h2 className="text-xl font-bold mb-4">Key Metrics</h2>
          <div className="space-y-4">
            <div className="flex justify-between p-3 bg-blue-50 rounded">
              <span className="font-medium">Avg Lead Value</span>
              <span className="font-bold">${avgLeadValue.toFixed(0)}</span>
            </div>
            <div className="flex justify-between p-3 bg-green-50 rounded">
              <span className="font-medium">Conversion Rate</span>
              <span className="font-bold">{conversionRate.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between p-3 bg-purple-50 rounded">
              <span className="font-medium">Estimate Acceptance</span>
              <span className="font-bold">{estimateAcceptanceRate.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between p-3 bg-yellow-50 rounded">
              <span className="font-medium">Job Completion Rate</span>
              <span className="font-bold">{jobCompletionRate.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between p-3 bg-red-50 rounded">
              <span className="font-medium">Overdue Followups</span>
              <span className="font-bold text-red-600">{data.followupsOverdue}</span>
            </div>
            <div className="flex justify-between p-3 bg-orange-50 rounded">
              <span className="font-medium">Unassigned Jobs</span>
              <span className="font-bold text-orange-600">{data.jobsUnassigned}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded shadow p-6">
        <h2 className="text-xl font-bold mb-4">Lead Status Distribution</h2>
        <div className="flex justify-center">
          <PieChart
            data={data.leadsByStatus.map((item) => ({
              label: item.status,
              value: item.count,
            }))}
            title="Leads by Status"
          />
        </div>
      </div>

      <div className="bg-white rounded shadow p-6">
        <h2 className="text-xl font-bold mb-4">Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-2">Lead Generation</p>
            <p className="text-3xl font-bold">{data.leadsNew}</p>
            <p className="text-sm text-gray-600">new leads this period</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Revenue Potential</p>
            <p className="text-3xl font-bold">${(data.totalLeadValue / 100).toFixed(0)}</p>
            <p className="text-sm text-gray-600">estimated pipeline value</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Business Health</p>
            <p className="text-3xl font-bold">
              {((qualificationRate + conversionRate + estimateAcceptanceRate) / 3).toFixed(0)}%
            </p>
            <p className="text-sm text-gray-600">overall performance score</p>
          </div>
        </div>
      </div>
    </div>
  );
}
