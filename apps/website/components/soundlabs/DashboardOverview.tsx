'use client';

interface DashboardOverviewProps {
  client: { name: string; email: string; plan: string };
  projectCount: number;
}

export function DashboardOverview({ client, projectCount }: DashboardOverviewProps) {
  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Projects', value: projectCount, icon: '📁' },
          { label: 'Plan', value: client.plan.toUpperCase(), icon: '⭐' },
          { label: 'Status', value: 'ONLINE', icon: '✓', color: '#00FF7F' },
          { label: 'Storage', value: '2.4GB', icon: '💾' },
        ].map((stat, i) => (
          <div
            key={i}
            className="p-6 rounded-xl bg-gradient-to-br from-[#0a0a0c] to-[#0f0f12] border border-[#00D9FF]/10 hover:border-[#00D9FF]/30 transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[#00D9FF]/60 text-sm mb-2">{stat.label}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
              <div className="text-2xl">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Spectrum Analyzer Visualization */}
      <div className="p-6 rounded-xl bg-gradient-to-br from-[#0a0a0c] to-[#0f0f12] border border-[#00D9FF]/10">
        <h3 className="text-lg font-semibold text-white mb-4">Spectrum Analysis</h3>
        <div className="space-y-4">
          {/* Frequency Bars */}
          <div className="flex items-end justify-center gap-1 h-32 p-4 bg-[#050607]/50 rounded-lg">
            {[40, 25, 60, 35, 70, 50, 45, 55, 65, 40, 30, 50].map((height, i) => (
              <div
                key={i}
                className="flex-1 rounded-t bg-gradient-to-t from-[#00D9FF] to-[#00FF7F] opacity-80 hover:opacity-100 transition-opacity"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>

          {/* VU Meters */}
          <div className="grid grid-cols-2 gap-4">
            {['L', 'R'].map((channel) => (
              <div key={channel}>
                <p className="text-xs text-[#00D9FF]/60 mb-2">Channel {channel}</p>
                <div className="h-2 bg-[#050607] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#00FF7F] to-[#00D9FF] rounded-full"
                    style={{ width: Math.random() * 100 + '%' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: 'Generate Music', desc: 'Create new track', icon: '✨' },
          { title: 'Start Recording', desc: 'Begin session', icon: '⏹️' },
          { title: 'Go Live', desc: 'Stream to audience', icon: '📡' },
        ].map((action, i) => (
          <button
            key={i}
            className="p-6 rounded-xl bg-gradient-to-br from-[#0a0a0c] to-[#0f0f12] border border-[#00D9FF]/10 hover:border-[#00D9FF]/50 text-left transition-all group"
          >
            <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{action.icon}</div>
            <h4 className="font-semibold text-white mb-1">{action.title}</h4>
            <p className="text-[#00D9FF]/60 text-sm">{action.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
