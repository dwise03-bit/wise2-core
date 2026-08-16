'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BarChart3, Users, DollarSign, TrendingUp, Zap } from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  mrr: number;
  conversionRate: number;
  avgSessionsPerUser: number;
  topStudents: any[];
  revenueByTier: any[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem('token');
    if (!t) {
      window.location.href = '/auth/login';
      return;
    }
    setToken(t);
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return <div className="min-h-screen bg-black text-white p-8">Loading...</div>;
  }

  return (
    <main className="min-h-screen bg-black">
      <header className="bg-black border-b border-gray-800 py-4 px-6 sticky top-0 z-50">
        <h1 className="heading-silver text-2xl">Admin Dashboard</h1>
      </header>

      <section className="p-6 max-w-7xl mx-auto">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray">Total Users</h3>
              <Users className="text-neon-red" size={24} />
            </div>
            <p className="heading-silver text-3xl font-bold">{stats.totalUsers}</p>
            <p className="text-gray-muted text-sm">{stats.activeUsers} active</p>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray">Monthly Revenue</h3>
              <DollarSign className="text-neon-red" size={24} />
            </div>
            <p className="heading-silver text-3xl font-bold">${(stats.mrr / 100).toFixed(2)}</p>
            <p className="text-gray-muted text-sm">${(stats.totalRevenue / 100).toFixed(2)} total</p>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray">Conversion Rate</h3>
              <TrendingUp className="text-neon-red" size={24} />
            </div>
            <p className="heading-silver text-3xl font-bold">{(stats.conversionRate * 100).toFixed(1)}%</p>
            <p className="text-gray-muted text-sm">Free to Paid</p>
          </div>
        </div>

        {/* Top Students */}
        <div className="card mb-8">
          <h2 className="heading-silver text-xl mb-4 flex items-center gap-2">
            <Zap className="text-neon-red" /> Top Performers
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-2 px-4 text-gray">Rank</th>
                  <th className="text-left py-2 px-4 text-gray">Name</th>
                  <th className="text-left py-2 px-4 text-gray">Tier</th>
                  <th className="text-left py-2 px-4 text-gray">Sessions</th>
                  <th className="text-left py-2 px-4 text-gray">Avg Score</th>
                </tr>
              </thead>
              <tbody>
                {stats.topStudents.map((student, idx) => (
                  <tr key={idx} className="border-b border-gray-800">
                    <td className="py-3 px-4 text-neon-red font-bold">#{idx + 1}</td>
                    <td className="py-3 px-4 text-silver">{student.name}</td>
                    <td className="py-3 px-4 text-gray capitalize">{student.tier}</td>
                    <td className="py-3 px-4 text-gray">{student.sessions}</td>
                    <td className="py-3 px-4 text-gray">{student.avgScore}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Revenue by Tier */}
        <div className="card">
          <h2 className="heading-silver text-xl mb-4 flex items-center gap-2">
            <BarChart3 className="text-neon-red" /> Revenue by Tier
          </h2>
          <div className="space-y-4">
            {stats.revenueByTier.map((tier) => (
              <div key={tier.name}>
                <div className="flex justify-between mb-2">
                  <span className="text-gray capitalize">{tier.name}</span>
                  <span className="text-neon-red font-bold">${(tier.revenue / 100).toFixed(2)}</span>
                </div>
                <div className="w-full bg-secondary-black rounded h-2">
                  <div
                    className="bg-neon-red rounded h-2 transition-all"
                    style={{ width: `${(tier.percentage)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/admin/users" className="btn-primary text-center">
            Manage Users
          </Link>
          <Link href="/admin/content" className="btn-primary text-center">
            Manage Content
          </Link>
          <Link href="/admin/sessions" className="btn-primary text-center">
            View Sessions
          </Link>
          <Link href="/admin/analytics" className="btn-primary text-center">
            Full Analytics
          </Link>
        </div>
      </section>
    </main>
  );
}
