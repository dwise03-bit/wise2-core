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
    <div style={{minHeight: '100vh', background: '#000', color: '#fff', fontFamily: 'system-ui, -apple-system, sans-serif'}}>
      <div style={{maxWidth: '80rem', margin: '0 auto', padding: '0 1rem', paddingTop: '4rem', paddingBottom: '4rem'}}>
        {/* Header */}
        <div style={{marginBottom: '4rem'}}>
          <h1 style={{fontSize: '3rem', fontWeight: 700, marginBottom: '1rem', color: '#3ff14'}}>
            WISE² Systems
          </h1>
          <p style={{fontSize: '1.25rem', color: '#d1d5db'}}>
            All production systems are live and operational
          </p>
        </div>

        {/* Systems Grid */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '4rem'}}>
          {systems.map((system) => (
            <Link
              key={system.name}
              href={system.link}
              style={{textDecoration: 'none'}}
            >
              <div style={{background: 'rgba(31, 41, 55, 0.5)', border: '1px solid #374151', borderRadius: '0.5rem', padding: '1.5rem', height: '100%', transition: 'all 0.3s', cursor: 'pointer'}}
                   onMouseEnter={(e) => {e.currentTarget.style.borderColor = '#22c55e'; e.currentTarget.style.background = '#1f2937'}}
                   onMouseLeave={(e) => {e.currentTarget.style.borderColor = '#374151'; e.currentTarget.style.background = 'rgba(31, 41, 55, 0.5)'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
                  <span style={{fontSize: '2rem'}}>{system.icon}</span>
                  <span
                    style={{padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, background: system.status === 'LIVE' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(59, 130, 246, 0.2)', color: system.status === 'LIVE' ? '#4ade80' : '#60a5fa'}}
                  >
                    {system.status}
                  </span>
                </div>

                <h3 style={{fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: '#fff'}}>
                  {system.name}
                </h3>
                <p style={{color: '#9ca3af', marginBottom: '1rem', fontSize: '0.875rem'}}>{system.description}</p>

                <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                  {system.features.map((feature) => (
                    <div key={feature} style={{display: 'flex', alignItems: 'flex-start', fontSize: '0.875rem'}}>
                      <span style={{color: '#4ade80', marginRight: '0.5rem'}}>✓</span>
                      <span style={{color: '#d1d5db'}}>{feature}</span>
                    </div>
                  ))}
                </div>

                <div style={{marginTop: '1.5rem', color: '#4ade80', fontWeight: 600, fontSize: '0.875rem'}}>
                  Learn more →
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Status Dashboard */}
        <div style={{background: 'rgba(31, 41, 55, 0.5)', border: '1px solid #374151', borderRadius: '0.5rem', padding: '2rem', marginBottom: '4rem'}}>
          <h2 style={{fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem'}}>Live Status</h2>

          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem'}}>
            <div>
              <h3 style={{fontWeight: 600, color: '#4ade80', marginBottom: '1rem'}}>✅ Operational</h3>
              <ul style={{display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#d1d5db'}}>
                <li>• Website: https://wise2.net</li>
                <li>• API: /api/health</li>
                <li>• Discord Bot: 40 commands</li>
                <li>• Admin Backend: Port 3014</li>
                <li>• K10 Hardware: Deployed</li>
                <li>• iOS/Android/XR: All platforms</li>
              </ul>
            </div>

            <div>
              <h3 style={{fontWeight: 600, color: '#60a5fa', marginBottom: '1rem'}}>🔧 Configuration</h3>
              <ul style={{display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#d1d5db'}}>
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
        <div style={{display: 'flex', gap: '1rem', flexWrap: 'wrap'}}>
          <Link
            href="/systems/discord"
            style={{padding: '0.75rem 1.5rem', background: '#22c55e', color: '#000', fontWeight: 700, borderRadius: '0.5rem', textDecoration: 'none', cursor: 'pointer', transition: 'all 0.3s'}}
            onMouseEnter={(e) => {e.currentTarget.style.background = '#4ade80'}}
            onMouseLeave={(e) => {e.currentTarget.style.background = '#22c55e'}}
          >
            Discord Setup
          </Link>
          <Link
            href="/api-docs"
            style={{padding: '0.75rem 1.5rem', background: '#3b82f6', color: '#fff', fontWeight: 700, borderRadius: '0.5rem', textDecoration: 'none', cursor: 'pointer', transition: 'all 0.3s'}}
            onMouseEnter={(e) => {e.currentTarget.style.background = '#60a5fa'}}
            onMouseLeave={(e) => {e.currentTarget.style.background = '#3b82f6'}}
          >
            API Docs
          </Link>
          <Link
            href="/"
            style={{padding: '0.75rem 1.5rem', background: '#374151', color: '#fff', fontWeight: 700, borderRadius: '0.5rem', textDecoration: 'none', cursor: 'pointer', transition: 'all 0.3s'}}
            onMouseEnter={(e) => {e.currentTarget.style.background = '#4b5563'}}
            onMouseLeave={(e) => {e.currentTarget.style.background = '#374151'}}
          >
            Back Home
          </Link>
        </div>
      </div>
    </div>
  );
}
