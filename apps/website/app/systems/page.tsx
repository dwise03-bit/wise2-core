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
    <div className="systems-page">
      <div className="systems-container">
        <div className="systems-header">
          <h1 className="systems-title">WISE² Systems</h1>
          <p className="systems-subtitle">All production systems are live and operational</p>
        </div>

        <div className="systems-grid">
          {systems.map((system) => (
            <Link key={system.name} href={system.link} className="systems-link">
              <div className="systems-card">
                <div className="systems-card-header">
                  <span className="systems-card-icon">{system.icon}</span>
                  <span className={`systems-card-status ${system.status === 'LIVE' ? 'systems-card-status-live' : 'systems-card-status-ready'}`}>
                    {system.status}
                  </span>
                </div>

                <h3 className="systems-card-title">{system.name}</h3>
                <p className="systems-card-description">{system.description}</p>

                <div className="systems-card-features">
                  {system.features.map((feature) => (
                    <div key={feature} className="systems-card-feature">
                      <span className="systems-card-feature-check">✓</span>
                      <span className="systems-card-feature-text">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="systems-card-footer">Learn more →</div>
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
