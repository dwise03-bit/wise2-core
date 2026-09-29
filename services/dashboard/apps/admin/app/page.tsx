'use client';

import { Settings, Users, BarChart3, Shield, Activity, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

export default function Admin() {
  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">
      {/* Background gradient orbs */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full mix-blend-screen filter blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full mix-blend-screen filter blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-24">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="inline-block mb-4">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-600/30 text-blue-300 border border-blue-500/50">
                  ADMIN CONTROL CENTER
                </span>
              </div>
              <h1 className="text-5xl md:text-6xl font-black text-white mb-3 uppercase tracking-widest">
                System Administration
              </h1>
              <p className="text-xl text-gray-400">
                Manage users, settings, compliance, and platform health from one unified hub
              </p>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
            {[
              { label: 'Active Users', value: '2,847', icon: Users, color: 'blue' },
              { label: 'System Health', value: '99.99%', icon: Activity, color: 'green' },
              { label: 'Pending Reviews', value: '12', icon: AlertCircle, color: 'yellow' },
              { label: 'Compliance Score', value: '98%', icon: CheckCircle2, color: 'blue' }
            ].map((metric, i) => {
              const Icon = metric.icon;
              return (
                <div key={i} className="bg-white/10 backdrop-blur-md border border-blue-500/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">{metric.label}</span>
                    <Icon className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">{metric.value}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {/* Users Management */}
          <div className="lg:col-span-2 bg-white/10 backdrop-blur-md border border-blue-500/30 rounded-xl p-8 hover:border-blue-400/60 hover:bg-white/15 transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-600/30 rounded-lg">
                <Users className="w-6 h-6 text-blue-300" />
              </div>
              <h2 className="text-2xl font-bold text-white uppercase tracking-wide">User Management</h2>
            </div>

            <div className="space-y-4">
              {[
                { name: 'Super Admins', count: 3, status: 'active' },
                { name: 'Moderators', count: 12, status: 'active' },
                { name: 'Standard Users', count: 2,832, status: 'active' },
              ].map((group, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-black/30 rounded-lg border border-blue-500/20 hover:border-blue-400/50 transition-all">
                  <div>
                    <p className="text-white font-semibold">{group.name}</p>
                    <p className="text-sm text-gray-400">{group.count} users</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-600/30 text-green-300">
                      {group.status}
                    </span>
                    <ArrowRight className="w-4 h-4 text-blue-400" />
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-6 px-4 py-3 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/50 text-blue-300 rounded-lg font-semibold transition-all flex items-center justify-center gap-2">
              <Users className="w-4 h-4" />
              Manage All Users
            </button>
          </div>

          {/* Quick Actions */}
          <div className="bg-white/10 backdrop-blur-md border border-blue-500/30 rounded-xl p-8 hover:border-blue-400/60 hover:bg-white/15 transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-600/30 rounded-lg">
                <Settings className="w-6 h-6 text-blue-300" />
              </div>
              <h2 className="text-2xl font-bold text-white uppercase tracking-wide">Quick Actions</h2>
            </div>

            <div className="space-y-3">
              {[
                { icon: Shield, label: 'Security Settings', action: 'Configure' },
                { icon: BarChart3, label: 'View Analytics', action: 'Open' },
                { icon: Activity, label: 'System Status', action: 'Monitor' },
                { icon: AlertCircle, label: 'View Alerts', action: 'Review' }
              ].map((action, i) => {
                const Icon = action.icon;
                return (
                  <button key={i} className="w-full flex items-center gap-3 p-3 bg-black/30 rounded-lg border border-blue-500/20 hover:border-blue-400/50 hover:bg-blue-600/20 transition-all text-left group">
                    <Icon className="w-5 h-5 text-blue-400 flex-shrink-0" />
                    <span className="flex-1 text-sm font-semibold text-white group-hover:text-blue-300 transition-colors">{action.label}</span>
                    <span className="text-xs text-gray-500 group-hover:text-blue-400 transition-colors">{action.action}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* System Settings & Compliance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* System Configuration */}
          <div className="bg-white/10 backdrop-blur-md border border-blue-500/30 rounded-xl p-8 hover:border-blue-400/60 hover:bg-white/15 transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-600/30 rounded-lg">
                <Settings className="w-6 h-6 text-blue-300" />
              </div>
              <h2 className="text-2xl font-bold text-white uppercase tracking-wide">System Settings</h2>
            </div>

            <div className="space-y-4">
              {[
                { setting: 'API Rate Limiting', status: 'Enabled', value: '10,000 req/min' },
                { setting: 'Backup Schedule', status: 'Active', value: 'Every 6 hours' },
                { setting: 'SSL/TLS', status: 'Enforced', value: 'TLS 1.3' },
                { setting: 'Two-Factor Auth', status: 'Required', value: '100% adoption' }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-black/30 rounded-lg border border-blue-500/20">
                  <div>
                    <p className="text-white font-semibold text-sm">{item.setting}</p>
                    <p className="text-xs text-gray-500">{item.value}</p>
                  </div>
                  <span className="px-2 py-1 rounded text-xs font-bold bg-green-600/30 text-green-300 border border-green-500/50">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Compliance & Audit */}
          <div className="bg-white/10 backdrop-blur-md border border-blue-500/30 rounded-xl p-8 hover:border-blue-400/60 hover:bg-white/15 transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-600/30 rounded-lg">
                <Shield className="w-6 h-6 text-blue-300" />
              </div>
              <h2 className="text-2xl font-bold text-white uppercase tracking-wide">Compliance & Audit</h2>
            </div>

            <div className="space-y-4">
              {[
                { standard: 'ISO 27001', compliance: '100%', lastCheck: '2 days ago' },
                { standard: 'SOC 2 Type II', compliance: '100%', lastCheck: '1 week ago' },
                { standard: 'GDPR', compliance: '100%', lastCheck: '3 days ago' },
                { standard: 'HIPAA', compliance: '98%', lastCheck: '5 days ago' }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-black/30 rounded-lg border border-blue-500/20">
                  <div>
                    <p className="text-white font-semibold text-sm">{item.standard}</p>
                    <p className="text-xs text-gray-500">{item.lastCheck}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-300">{item.compliance}</p>
                    <CheckCircle2 className="w-4 h-4 text-green-400 mt-1" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
