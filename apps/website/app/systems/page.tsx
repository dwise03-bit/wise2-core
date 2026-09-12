import Link from 'next/link';

export default function SystemsPage() {
  const systems = [
    {
      name: 'Discord Bot Suite',
      icon: '🤖',
      status: 'LIVE',
      description: '40 commands across 5 categories',
      link: '/systems/discord',
      features: [
        'Contractor OS (13 commands)',
        'Academy & Learning (7 commands)',
        'Sales Pipeline (8 commands)',
        'Control Plane (12 commands)',
        'Webhook Integration',
      ],
    },
    {
      name: 'WISE² IMP',
      icon: '📱',
      status: 'READY',
      description: 'Intent Management Platform for iMessage',
      link: '/systems/imp',
      features: [
        'Natural language intent detection',
        'Risk-based access control',
        'Multi-node dispatch (Mac/VPS/GPU/Pi)',
        'Persistent memory system',
        'Audit logging & security',
      ],
    },
    {
      name: 'API Documentation',
      icon: '⚙️',
      status: 'LIVE',
      description: 'Complete REST API reference',
      link: '/api-docs',
      features: [
        'Health check endpoints',
        'Authentication & OAuth',
        'Webhooks & events',
        'Rate limiting',
        'SDKs & examples',
      ],
    },
    {
      name: 'WISE² LIVE™',
      icon: '🎯',
      status: 'LIVE',
      description: 'Multi-tenant demo provisioning engine',
      link: '/systems/live',
      features: [
        '7 demo scenarios',
        'Event sourcing architecture',
        '100+ concurrent users',
        '170+ test cases',
        'Production-ready',
      ],
    },
    {
      name: 'K10 Hardware',
      icon: '🖥️',
      status: 'LIVE',
      description: 'Raspberry Pi edge device with IMP firmware',
      link: '/systems/hardware',
      features: [
        'WiFi + offline mode',
        'Voice interaction (ASR/TTS)',
        '8 animated character faces',
        'Dashboard integration',
        'Enterprise deployment-ready',
      ],
    },
    {
      name: 'Mobile Apps',
      icon: '📲',
      status: 'LIVE',
      description: 'Native iOS, Android, and XR applications',
      link: '/systems/mobile',
      features: [
        'iOS FieldTech Copilot (2900+ lines Swift)',
        'Android VR for Meta Quest',
        'XR Command Center',
        'Offline-first architecture',
        'Real-time sync',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
            WISE² Systems
          </h1>
          <p className="text-xl text-gray-300">
            All production systems are live and operational
          </p>
        </div>

        {/* Systems Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {systems.map((system) => (
            <Link
              key={system.name}
              href={system.link}
              className="group block"
            >
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 hover:border-green-500 hover:bg-gray-800 transition-all h-full hover:shadow-lg hover:shadow-green-500/20">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-4xl">{system.icon}</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      system.status === 'LIVE'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-blue-500/20 text-blue-400'
                    }`}
                  >
                    {system.status}
                  </span>
                </div>

                <h3 className="text-xl font-bold mb-2 group-hover:text-green-400 transition-colors">
                  {system.name}
                </h3>
                <p className="text-gray-400 mb-4 text-sm">{system.description}</p>

                <div className="space-y-2">
                  {system.features.map((feature) => (
                    <div key={feature} className="flex items-start text-sm">
                      <span className="text-green-400 mr-2">✓</span>
                      <span className="text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 text-green-400 font-semibold text-sm group-hover:translate-x-1 transition-transform">
                  Learn more →
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Status Dashboard */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-8 mb-16">
          <h2 className="text-2xl font-bold mb-6">Live Status</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-green-400 mb-4">✅ Operational</h3>
              <ul className="space-y-2 text-gray-300">
                <li>• Website: https://wise2.net</li>
                <li>• API: /api/health</li>
                <li>• Discord Bot: 40 commands</li>
                <li>• Admin Backend: Port 3014</li>
                <li>• K10 Hardware: Deployed</li>
                <li>• iOS/Android/XR: All platforms</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-blue-400 mb-4">🔧 Configuration</h3>
              <ul className="space-y-2 text-gray-300">
                <li>• Database: PostgreSQL 5432</li>
                <li>• Cache: Redis 6379</li>
                <li>• Messaging: Discord webhooks</li>
                <li>• Edge Compute: Raspberry Pi</li>
                <li>• Deployment: Docker Compose</li>
                <li>• CI/CD: GitHub Actions</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-4">
          <Link
            href="/systems/discord"
            className="px-6 py-3 bg-green-500 text-black font-bold rounded-lg hover:bg-green-400 transition-colors"
          >
            Discord Setup
          </Link>
          <Link
            href="/api-docs"
            className="px-6 py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-400 transition-colors"
          >
            API Docs
          </Link>
          <Link
            href="/"
            className="px-6 py-3 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-600 transition-colors"
          >
            Back Home
          </Link>
        </div>
      </div>
    </div>
  );
}
