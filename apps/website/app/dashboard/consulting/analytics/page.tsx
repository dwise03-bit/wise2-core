'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Navigation, Footer } from '@/components/wise';
import { Download, TrendingUp, Users, DollarSign, Clock, Activity, Loader2 } from 'lucide-react';

interface Booking {
  id: string;
  userName: string;
  userEmail: string;
  consultantId: string;
  consultantName: string;
  serviceId: string;
  serviceName: string;
  date: string;
  time: string;
  duration: number;
  timezone: string;
  status: 'pending' | 'confirmed' | 'completed' | 'no-show' | 'cancelled';
  price: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface Analytics {
  totalBookings: number;
  totalBookingsThisMonth: number;
  totalRevenue: number;
  totalRevenueThisMonth: number;
  averageDuration: number;
  utilizationRate: number;
  bookingsByConsultant: Record<string, number>;
  revenueByConsultant: Record<string, number>;
  revenueByDay: Record<string, number>;
  servicePopularity: Record<string, number>;
  topConsultantsByBookings: Array<{ name: string; count: number }>;
  topConsultantsByRevenue: Array<{ name: string; revenue: number }>;
  utilizationTrends: Array<{ week: string; rate: number }>;
}

export default function AnalyticsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'year'>('month');

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/bookings');
      if (!response.ok) throw new Error('Failed to fetch bookings');
      const data = await response.json();
      setBookings(data.bookings || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  useEffect(() => {
    if (bookings.length === 0) return;

    const calculatedAnalytics = calculateAnalytics(bookings);
    setAnalytics(calculatedAnalytics);
  }, [bookings]);

  const calculateAnalytics = (bookingsList: Booking[]): Analytics => {
    const completedBookings = bookingsList.filter((b) => b.status === 'completed');
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const bookingsThisMonth = bookingsList.filter((b) => new Date(b.date) >= currentMonth);
    const completedThisMonth = bookingsThisMonth.filter((b) => b.status === 'completed');

    // Total metrics
    const totalRevenue = completedBookings.reduce((sum, b) => sum + b.price, 0);
    const totalRevenueThisMonth = completedThisMonth.reduce((sum, b) => sum + b.price, 0);
    const averageDuration =
      completedBookings.length > 0
        ? completedBookings.reduce((sum, b) => sum + b.duration, 0) / completedBookings.length
        : 0;

    // Bookings by consultant
    const bookingsByConsultant: Record<string, number> = {};
    const revenueByConsultant: Record<string, number> = {};
    completedBookings.forEach((booking) => {
      bookingsByConsultant[booking.consultantName] = (bookingsByConsultant[booking.consultantName] || 0) + 1;
      revenueByConsultant[booking.consultantName] = (revenueByConsultant[booking.consultantName] || 0) + booking.price;
    });

    // Revenue by day (last 30 days)
    const revenueByDay: Record<string, number> = {};
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    completedBookings
      .filter((b) => new Date(b.date) >= thirtyDaysAgo)
      .forEach((booking) => {
        const date = booking.date;
        revenueByDay[date] = (revenueByDay[date] || 0) + booking.price;
      });

    // Service popularity
    const servicePopularity: Record<string, number> = {};
    completedBookings.forEach((booking) => {
      servicePopularity[booking.serviceName] = (servicePopularity[booking.serviceName] || 0) + 1;
    });

    // Top consultants
    const topConsultantsByBookings = Object.entries(bookingsByConsultant)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const topConsultantsByRevenue = Object.entries(revenueByConsultant)
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Utilization rate and trends
    const totalPossibleHours = completedBookings.length * 60; // Assuming each session is max 60 mins
    const totalActualHours = completedBookings.reduce((sum, b) => sum + b.duration, 0);
    const utilizationRate = totalPossibleHours > 0 ? (totalActualHours / totalPossibleHours) * 100 : 0;

    // Weekly utilization trends
    const utilizationTrends = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - i * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const weekBookings = completedBookings.filter(
        (b) => new Date(b.date) >= weekStart && new Date(b.date) < weekEnd
      );
      const weekHours = weekBookings.reduce((sum, b) => sum + b.duration, 0);
      const possibleHours = weekBookings.length * 60;
      const weekRate = possibleHours > 0 ? (weekHours / possibleHours) * 100 : 0;

      utilizationTrends.push({
        week: `Week of ${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
        rate: Math.round(weekRate),
      });
    }

    return {
      totalBookings: bookingsList.length,
      totalBookingsThisMonth: bookingsThisMonth.length,
      totalRevenue,
      totalRevenueThisMonth,
      averageDuration: Math.round(averageDuration),
      utilizationRate: Math.round(utilizationRate),
      bookingsByConsultant,
      revenueByConsultant,
      revenueByDay,
      servicePopularity,
      topConsultantsByBookings,
      topConsultantsByRevenue,
      utilizationTrends,
    };
  };

  const exportReport = () => {
    if (!analytics) return;

    const report = {
      generatedAt: new Date().toISOString(),
      summary: {
        totalBookings: analytics.totalBookings,
        totalBookingsThisMonth: analytics.totalBookingsThisMonth,
        totalRevenue: analytics.totalRevenue,
        totalRevenueThisMonth: analytics.totalRevenueThisMonth,
        averageDuration: analytics.averageDuration,
        utilizationRate: analytics.utilizationRate,
      },
      topConsultantsByBookings: analytics.topConsultantsByBookings,
      topConsultantsByRevenue: analytics.topConsultantsByRevenue,
      utilizationTrends: analytics.utilizationTrends,
    };

    const jsonString = JSON.stringify(report, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `consulting-analytics-${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] text-white">
        <Navigation />
        <div className="pt-32 pb-20 px-6 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Navigation />

      <main className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">Consulting Analytics</h1>
              <p className="text-gray-400">Real-time insights into your consulting business</p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as 'month' | 'quarter' | 'year')}
                className="px-4 py-2 bg-[#161616] border border-[#1a1a1a] rounded-lg text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
              <button
                onClick={exportReport}
                className="px-4 py-2 bg-[#161616] hover:bg-[#1a1a1a] rounded-lg font-semibold transition flex items-center gap-2"
              >
                <Download size={18} />
                Export Report
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-8 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
              {error}
            </div>
          )}

          {/* Key Metrics */}
          {analytics && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
                {/* Total Bookings This Month */}
                <div className="bg-[#101010] border border-[#1a1a1a] rounded-2xl p-6 hover:border-emerald-500/30 transition">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 bg-emerald-500/20 rounded-lg">
                      <Users size={20} className="text-emerald-400" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide">This Month</div>
                      <div className="text-sm font-medium text-gray-400">Bookings</div>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-emerald-400">{analytics.totalBookingsThisMonth}</div>
                  <div className="mt-2 text-xs text-gray-500">
                    {analytics.totalBookings} total all time
                  </div>
                </div>

                {/* Total Revenue This Month */}
                <div className="bg-[#101010] border border-[#1a1a1a] rounded-2xl p-6 hover:border-amber-500/30 transition">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 bg-amber-500/20 rounded-lg">
                      <DollarSign size={20} className="text-amber-400" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide">This Month</div>
                      <div className="text-sm font-medium text-gray-400">Revenue</div>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-amber-400">
                    ${analytics.totalRevenueThisMonth.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    ${analytics.totalRevenue.toLocaleString('en-US', { maximumFractionDigits: 0 })} total
                  </div>
                </div>

                {/* Average Duration */}
                <div className="bg-[#101010] border border-[#1a1a1a] rounded-2xl p-6 hover:border-blue-500/30 transition">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 bg-blue-500/20 rounded-lg">
                      <Clock size={20} className="text-blue-400" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide">Average</div>
                      <div className="text-sm font-medium text-gray-400">Duration</div>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-blue-400">{analytics.averageDuration}</div>
                  <div className="mt-2 text-xs text-gray-500">minutes per session</div>
                </div>

                {/* Utilization Rate */}
                <div className="bg-[#101010] border border-[#1a1a1a] rounded-2xl p-6 hover:border-violet-500/30 transition">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 bg-violet-500/20 rounded-lg">
                      <Activity size={20} className="text-violet-400" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide">Current</div>
                      <div className="text-sm font-medium text-gray-400">Utilization</div>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-violet-400">{analytics.utilizationRate}%</div>
                  <div className="mt-2 text-xs text-gray-500">consultant capacity</div>
                </div>

                {/* Trending */}
                <div className="bg-[#101010] border border-[#1a1a1a] rounded-2xl p-6 hover:border-pink-500/30 transition">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 bg-pink-500/20 rounded-lg">
                      <TrendingUp size={20} className="text-pink-400" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide">Growth</div>
                      <div className="text-sm font-medium text-gray-400">Trend</div>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-pink-400">
                    {bookings.length > 0 ? '+' : ''}0%
                  </div>
                  <div className="mt-2 text-xs text-gray-500">month over month</div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                {/* Bookings by Consultant Chart */}
                <div className="bg-[#101010] border border-[#1a1a1a] rounded-2xl p-8">
                  <h3 className="text-xl font-bold mb-6">Bookings by Consultant</h3>
                  <BarChart
                    data={analytics.topConsultantsByBookings.map((c) => ({
                      label: c.name,
                      value: c.count,
                    }))}
                  />
                </div>

                {/* Revenue Over Time Chart */}
                <div className="bg-[#101010] border border-[#1a1a1a] rounded-2xl p-8">
                  <h3 className="text-xl font-bold mb-6">Revenue Over Time (Last 30 Days)</h3>
                  <LineChart
                    data={Object.entries(analytics.revenueByDay)
                      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
                      .slice(-30)
                      .map(([date, revenue]) => ({
                        label: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                        value: revenue,
                      }))}
                  />
                </div>

                {/* Services Popularity Chart */}
                <div className="bg-[#101010] border border-[#1a1a1a] rounded-2xl p-8">
                  <h3 className="text-xl font-bold mb-6">Services Popularity</h3>
                  <PieChart
                    data={Object.entries(analytics.servicePopularity).map(([name, count]) => ({
                      label: name,
                      value: count,
                    }))}
                  />
                </div>

                {/* Utilization Trends */}
                <div className="bg-[#101010] border border-[#1a1a1a] rounded-2xl p-8">
                  <h3 className="text-xl font-bold mb-6">Utilization Trends (Weekly)</h3>
                  <LineChart
                    data={analytics.utilizationTrends.map((t) => ({
                      label: t.week.replace('Week of ', ''),
                      value: t.rate,
                    }))}
                    maxValue={100}
                  />
                </div>
              </div>

              {/* Top Consultants Tables */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                {/* Top by Bookings */}
                <div className="bg-[#101010] border border-[#1a1a1a] rounded-2xl p-8">
                  <h3 className="text-xl font-bold mb-6">Top Consultants by Bookings</h3>
                  <div className="space-y-3">
                    {analytics.topConsultantsByBookings.map((consultant, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-[#0f0f0f] rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center text-sm font-bold text-emerald-400">
                            {idx + 1}
                          </div>
                          <div>
                            <div className="font-semibold">{consultant.name}</div>
                            <div className="text-xs text-gray-500">{consultant.count} bookings</div>
                          </div>
                        </div>
                        <div className="text-emerald-400 font-bold">{consultant.count}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top by Revenue */}
                <div className="bg-[#101010] border border-[#1a1a1a] rounded-2xl p-8">
                  <h3 className="text-xl font-bold mb-6">Top Consultants by Revenue</h3>
                  <div className="space-y-3">
                    {analytics.topConsultantsByRevenue.map((consultant, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-[#0f0f0f] rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-amber-500/20 rounded-full flex items-center justify-center text-sm font-bold text-amber-400">
                            {idx + 1}
                          </div>
                          <div>
                            <div className="font-semibold">{consultant.name}</div>
                            <div className="text-xs text-gray-500">
                              ${consultant.revenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                            </div>
                          </div>
                        </div>
                        <div className="text-amber-400 font-bold">
                          ${consultant.revenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

// Chart Components
interface ChartData {
  label: string;
  value: number;
}

function BarChart({ data }: { data: ChartData[] }) {
  const maxValue = Math.max(...data.map((d) => d.value));
  const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'];

  return (
    <div className="space-y-4">
      {data.map((item, idx) => (
        <div key={idx} className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">{item.label}</span>
            <span className="font-semibold text-white">{item.value}</span>
          </div>
          <div className="w-full h-8 bg-[#0f0f0f] rounded-lg overflow-hidden">
            <div
              className="h-full rounded-lg transition-all duration-300"
              style={{
                width: `${(item.value / maxValue) * 100}%`,
                backgroundColor: colors[idx % colors.length],
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function LineChart({ data, maxValue: customMaxValue }: { data: ChartData[]; maxValue?: number }) {
  const maxValue = customMaxValue || Math.max(...data.map((d) => d.value), 1);
  const minValue = Math.min(...data.map((d) => d.value), 0);
  const range = maxValue - minValue || 1;

  const points = data.map((item, idx) => ({
    x: (idx / (data.length - 1 || 1)) * 100,
    y: 100 - ((item.value - minValue) / range) * 100,
  }));

  const pathD = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <div className="w-full">
      <svg viewBox="0 0 100 50" className="w-full h-40 mb-4">
        {/* Grid Lines */}
        {[0, 25, 50, 75, 100].map((y) => (
          <line
            key={`grid-${y}`}
            x1="0"
            y1={y}
            x2="100"
            y2={y}
            stroke="rgba(229, 231, 235, 0.1)"
            strokeWidth="0.5"
          />
        ))}

        {/* Area under curve */}
        <defs>
          <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgb(16, 185, 129)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="rgb(16, 185, 129)" stopOpacity="0" />
          </linearGradient>
        </defs>

        <path
          d={`${pathD} L 100 100 L 0 100 Z`}
          fill="url(#chartGradient)"
        />

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke="rgb(16, 185, 129)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data Points */}
        {points.map((p, idx) => (
          <circle
            key={`point-${idx}`}
            cx={p.x}
            cy={p.y}
            r="1.5"
            fill="rgb(16, 185, 129)"
          />
        ))}
      </svg>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-4 text-xs">
        {data.slice(0, 4).map((item, idx) => (
          <div key={idx} className="text-gray-400">
            <span className="font-semibold text-white">{item.label}:</span> {item.value}
          </div>
        ))}
      </div>
    </div>
  );
}

function PieChart({ data }: { data: ChartData[] }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#ef4444'];

  let currentAngle = -90;
  const slices = data.map((item, idx) => {
    const sliceAngle = (item.value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;
    currentAngle = endAngle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = 50 + 40 * Math.cos(startRad);
    const y1 = 50 + 40 * Math.sin(startRad);
    const x2 = 50 + 40 * Math.cos(endRad);
    const y2 = 50 + 40 * Math.sin(endRad);

    const largeArc = sliceAngle > 180 ? 1 : 0;

    const pathData = [
      `M 50 50`,
      `L ${x1} ${y1}`,
      `A 40 40 0 ${largeArc} 1 ${x2} ${y2}`,
      'Z',
    ].join(' ');

    return { pathData, color: colors[idx % colors.length], item, percentage: (item.value / total) * 100 };
  });

  return (
    <div className="space-y-4">
      <svg viewBox="0 0 100 100" className="w-full h-40 mx-auto">
        {slices.map((slice, idx) => (
          <path key={idx} d={slice.pathData} fill={slice.color} opacity="0.8" />
        ))}
      </svg>

      <div className="grid grid-cols-2 gap-3">
        {slices.map((slice, idx) => (
          <div key={idx} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: slice.color }}
            />
            <div>
              <div className="text-gray-400">{slice.item.label}</div>
              <div className="font-semibold text-white">{slice.item.value} ({slice.percentage.toFixed(1)}%)</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
