import Link from 'next/link';

export default function DiscordPage() {
  const categories = [
    {
      name: 'Contractor OS',
      count: '13 commands',
      commands: ['/status', '/deployments', '/logs', '/health', '/config', '/restart', '/backup', '/restore', '/update', '/metrics', '/alerts', '/security', '/audit'],
    },
    {
      name: 'Academy & Learning',
      count: '7 commands',
      commands: ['/tutorial', '/docs', '/examples', '/faq', '/courses', '/progress', '/certificate'],
    },
    {
      name: 'Sales Pipeline',
      count: '8 commands',
      commands: ['/leads', '/deals', '/forecast', '/customers', '/opportunities', '/quotes', '/contract', '/analytics'],
    },
    {
      name: 'Control Plane',
      count: '12 commands',
      commands: ['/start', '/stop', '/scale', '/failover', '/drain', '/loadbalance', '/database', '/cache', '/queue', '/workers', '/autoscale', '/incident'],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h1 className="text-5xl font-bold mb-4"><span className="text-purple-400">Discord</span> Integration</h1>
        <p className="text-xl text-gray-300 mb-16">40 commands • Production-ready • Real-time updates</p>

        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-8 mb-16">
          <h2 className="text-2xl font-bold mb-4 text-purple-400">🚀 Join WISE² Discord</h2>
          <a href="https://discord.gg/wise2" target="_blank" rel="noopener noreferrer" className="inline-block px-6 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-500">Join Discord Server →</a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {categories.map((cat) => (
            <div key={cat.name} className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
              <div className="flex justify-between mb-4">
                <h3 className="text-xl font-bold">{cat.name}</h3>
                <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded text-xs font-bold">{cat.count}</span>
              </div>
              <div className="space-y-2">
                {cat.commands.map((cmd) => (
                  <div key={cmd} className="text-sm">
                    <code className="bg-black/30 px-2 py-1 rounded text-green-400 font-mono">{cmd}</code>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-4">
          <Link href="/systems" className="px-6 py-3 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-600">← Back</Link>
          <Link href="/systems/imp" className="px-6 py-3 bg-purple-500 text-white font-bold rounded-lg hover:bg-purple-400">Next: IMP →</Link>
        </div>
      </div>
    </div>
  );
}
