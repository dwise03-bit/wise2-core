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
    {
      name: 'AI Router',
      icon: '🤖',
      status: 'LIVE',
      description: 'Credit-saver engine with local-first inference & knowledge integration',
      link: '/systems/ai-router',
      features: [
        'LOCAL-first routing (Ollama)',
        '4-tier budget enforcement',
        'Second Brain context enrichment',
        'Prometheus metrics & telemetry',
        '99.9% uptime SLA',
      ],
    },
    {
      name: 'Wearables',
      icon: '👓',
      status: 'LIVE',
      description: 'Ray-Ban Meta AR & Meta Quest VR integration',
      link: '/systems/wearables',
      features: [
        'Ray-Ban Meta glasses (AR overlay)',
        'Meta Quest 3S (spatial audio)',
        'Multi-device broadcast',
        'Hand tracking & gestures',
        'Real-time context awareness',
      ],
    },
  ];

  return (
    <main className="min-h-screen bg-[#050607] text-white">
      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <h1 className="text-5xl sm:text-6xl font-black uppercase tracking-tight mb-4 text-white">
          WISE² Systems
        </h1>
        <p className="text-xl text-[#D1D5DB] max-w-2xl">
          All production systems are live and operational. Explore our integrated ecosystem of tools, platforms, and services.
        </p>
      </section>

      {/* Systems Grid */}
      <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {systems.map((system) => (
            <Link key={system.name} href={system.link}>
              <div className="group border border-[#00D9FF]/30 bg-[#0a0f1a]/50 p-6 hover:border-[#00D9FF] hover:bg-[#0a0f1a]/80 transition cursor-pointer h-full flex flex-col">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <span className="text-4xl">{system.icon}</span>
                  <span className={`text-xs font-black uppercase tracking-[0.1em] px-3 py-1 ${
                    system.status === 'LIVE'
                      ? 'bg-[#00FF7F]/20 text-[#00FF7F]'
                      : 'bg-[#C4A369]/20 text-[#C4A369]'
                  }`}>
                    {system.status}
                  </span>
                </div>

                {/* Title & Description */}
                <h3 className="text-lg font-black uppercase tracking-tight mb-2 text-white">
                  {system.name}
                </h3>
                <p className="text-sm text-[#B7C0CB] mb-6 flex-grow">
                  {system.description}
                </p>

                {/* Features */}
                <div className="space-y-2 mb-6 border-t border-[#00D9FF]/20 pt-4">
                  {system.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-2">
                      <span className="text-[#00FF7F] font-bold text-sm flex-shrink-0 mt-0.5">✓</span>
                      <span className="text-xs text-[#D1D5DB]">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="text-sm font-bold uppercase tracking-[0.1em] text-[#00D9FF] group-hover:text-[#39FF14] transition">
                  Learn more →</div>
              </div>
            </Link>
          ))}
        </div>

        <div className="systems-dashboard">
          <h2 className="systems-dashboard-title">Live Status</h2>

          <div className="systems-dashboard-grid">
            <div className="systems-dashboard-section">
              <h3 className="systems-dashboard-section-title systems-dashboard-section-operational">✅ Operational</h3>
              <ul className="systems-dashboard-list">
                <li>• Website: https://wise2.net</li>
                <li>• API: /api/health</li>
                <li>• Discord Bot: 40 commands</li>
                <li>• Admin Backend: Port 3014</li>
                <li>• AI Router: Port 3100</li>
                <li>• Second Brain: Port 3012</li>
                <li>• Ray-Ban Meta: AR integration</li>
                <li>• Meta Quest: VR integration</li>
                <li>• K10 Hardware: Deployed</li>
                <li>• iOS/Android/XR: All platforms</li>
              </ul>
            </div>

            <div className="systems-dashboard-section">
              <h3 className="systems-dashboard-section-title systems-dashboard-section-config">🔧 Configuration</h3>
              <ul className="systems-dashboard-list">
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

        <div className="systems-nav">
          <Link href="/systems/discord" className="systems-nav-btn systems-nav-btn-primary">
            Discord Setup
          </Link>
          <Link href="/api-docs" className="systems-nav-btn systems-nav-btn-secondary">
            API Docs
          </Link>
          <Link href="/" className="systems-nav-btn systems-nav-btn-tertiary">
            Back Home
          </Link>
        </div>
      </div>
    </div>
  );
}
