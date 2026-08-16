'use client';

import { CheckCircle2, AlertCircle, Clock, TrendingUp } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const stats = [
    {
      label: 'Accounts Under Review',
      value: '12',
      icon: <CheckCircle2 size={24} />,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Potential Issues Found',
      value: '7',
      icon: <AlertCircle size={24} />,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      label: 'Cases in Progress',
      value: '5',
      icon: <Clock size={24} />,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'Success Rate',
      value: '78%',
      icon: <TrendingUp size={24} />,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
  ];

  const journeyStages = [
    { stage: 'Intake', status: 'completed', date: 'Aug 10' },
    { stage: 'Audit', status: 'completed', date: 'Aug 15' },
    { stage: 'Cases', status: 'in-progress', date: 'Aug 16' },
    { stage: 'Results', status: 'pending', date: 'TBD' },
  ];

  const recentActivity = [
    {
      date: 'Today, 2:30 PM',
      action: 'Dispute submitted',
      account: 'Capital One Credit Card (****1234)',
      status: 'submitted',
    },
    {
      date: 'Yesterday',
      action: 'Issue identified',
      account: 'Equifax Report',
      status: 'pending',
    },
    {
      date: 'Aug 14',
      action: 'New finding confirmed',
      account: 'Experian - Chase Sapphire (****5678)',
      status: 'confirmed',
    },
    {
      date: 'Aug 12',
      action: 'Documents uploaded',
      account: 'Evidence Vault',
      status: 'uploaded',
    },
  ];

  const progressData = [
    { month: 'Jun', progress: 20 },
    { month: 'Jul', progress: 45 },
    { month: 'Aug', progress: 78 },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-lg p-6 shadow-sm">
        <h1 className="text-3xl font-bold mb-2">Welcome back, Alex</h1>
        <p className="text-blue-50">We're auditing your credit reports to identify inaccuracies. Here's your progress.</p>
      </div>

      {/* Journey Progress */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-4">JO Credit Journey</h2>
        <div className="flex items-center justify-between">
          {journeyStages.map((item, idx) => (
            <div key={idx} className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-2 ${
                  item.status === 'completed'
                    ? 'bg-green-100 text-green-700'
                    : item.status === 'in-progress'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {item.status === 'completed' ? '✓' : item.stage[0]}
              </div>
              <p className="font-medium text-gray-900 text-center text-sm">{item.stage}</p>
              <p className="text-xs text-gray-500">{item.date}</p>
              {idx < journeyStages.length - 1 && (
                <div className={`h-1 w-full mx-2 mt-2 rounded ${item.status === 'completed' ? 'bg-green-200' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className={`${stat.bg} border border-gray-200 rounded-lg p-6 shadow-sm`}>
            <div className={`${stat.color} mb-4`}>{stat.icon}</div>
            <p className="text-gray-600 text-sm font-medium mb-1">{stat.label}</p>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress Chart */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Resolution Progress</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="progress" stroke="#0066CC" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Account Distribution */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Accounts by Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[
              { name: 'Open', count: 5 },
              { name: 'Closed', count: 4 },
              { name: 'Disputed', count: 3 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#0066CC" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {recentActivity.map((activity, idx) => (
            <div key={idx} className="flex items-start border-b border-gray-100 pb-4 last:border-0">
              <div className="flex-1">
                <p className="text-sm text-gray-500">{activity.date}</p>
                <p className="font-medium text-gray-900">{activity.action}</p>
                <p className="text-sm text-gray-600">{activity.account}</p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-4 ${
                  activity.status === 'submitted'
                    ? 'bg-blue-50 text-blue-700'
                    : activity.status === 'confirmed'
                    ? 'bg-green-50 text-green-700'
                    : 'bg-yellow-50 text-yellow-700'
                }`}
              >
                {activity.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
