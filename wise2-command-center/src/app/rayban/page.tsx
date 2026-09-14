'use client';

import React, { useState, useEffect } from 'react';
import AppNav from '../../components/AppNav';

export default function RayBanPage() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <>
      <AppNav />
      <div className="min-h-screen" style={{ backgroundColor: '#0A0E27', marginLeft: '200px' }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');

          :root {
            --primary: #00D9FF;
            --secondary: #FFD700;
            --danger: #FF006E;
            --success: #00FF88;
            --text: #E8F0FF;
            --muted: #6B7C99;
            --surface: #0A0E27;
          }

          .font-display {
            font-family: 'Syne', sans-serif;
            font-weight: 700;
            letter-spacing: -0.02em;
          }

          .font-body {
            font-family: 'Inter', sans-serif;
            font-weight: 500;
            line-height: 1.6;
          }

          .font-mono {
            font-family: 'JetBrains Mono', monospace;
            font-weight: 600;
          }

          @keyframes glow-pulse {
            0%, 100% { box-shadow: 0 0 20px rgba(0, 217, 255, 0.3); }
            50% { box-shadow: 0 0 40px rgba(0, 217, 255, 0.6); }
          }

          @keyframes float-in {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .hero-section {
            background: linear-gradient(135deg, rgba(0, 217, 255, 0.1) 0%, rgba(255, 0, 110, 0.05) 100%);
            padding: 80px 40px;
            text-align: center;
            border-bottom: 1px solid rgba(0, 217, 255, 0.2);
            animation: ${loaded ? 'float-in 0.8s ease-out' : 'none'};
          }

          .hero-icon {
            width: 100px;
            height: 100px;
            margin: 0 auto 30px;
            background: linear-gradient(135deg, var(--primary) 0%, #00A8CC 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 48px;
            animation: ${loaded ? 'glow-pulse 3s ease-in-out infinite' : 'none'};
          }

          .feature-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 24px;
            padding: 60px 40px;
            max-width: 1200px;
            margin: 0 auto;
          }

          .feature-card {
            background: rgba(0, 217, 255, 0.05);
            border: 1px solid rgba(0, 217, 255, 0.2);
            border-radius: 12px;
            padding: 30px;
            transition: all 0.3s ease;
          }

          .feature-card:hover {
            background: rgba(0, 217, 255, 0.1);
            border-color: var(--primary);
            transform: translateY(-5px);
          }

          .feature-icon {
            font-size: 32px;
            margin-bottom: 16px;
          }

          .pricing-section {
            padding: 60px 40px;
            max-width: 1200px;
            margin: 0 auto;
          }

          .pricing-card {
            background: rgba(0, 217, 255, 0.05);
            border: 2px solid rgba(0, 217, 255, 0.2);
            border-radius: 16px;
            padding: 40px;
            margin-bottom: 24px;
          }

          .cta-button {
            background: linear-gradient(135deg, var(--primary) 0%, #00A8CC 100%);
            color: var(--surface);
            border: none;
            padding: 16px 40px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            font-family: 'Inter', sans-serif;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .cta-button:hover {
            transform: scale(1.05);
            box-shadow: 0 0 30px rgba(0, 217, 255, 0.4);
          }

          .section-divider {
            height: 1px;
            background: linear-gradient(90deg, transparent 0%, rgba(0, 217, 255, 0.3) 50%, transparent 100%);
            margin: 40px 0;
          }
        `}</style>

        {/* Hero Section */}
        <div className="hero-section">
          <div className="hero-icon">👓</div>
          <h1 className="font-display text-5xl mb-6" style={{ color: 'var(--primary)' }}>
            Ray-Ban Intelligence Platform
          </h1>
          <p className="font-body text-lg max-w-2xl mx-auto" style={{ color: 'var(--text)' }}>
            Transform your Meta Ray-Ban Pro glasses into an intelligent AI assistant. Real-time video analysis, voice commands, and instant insights at a glance.
          </p>
          <div className="mt-8 flex gap-4 justify-center">
            <button className="cta-button">Get Started</button>
            <button className="cta-button" style={{ background: 'transparent', color: 'var(--primary)', border: '2px solid var(--primary)' }}>
              Watch Demo
            </button>
          </div>
        </div>

        {/* Features Section */}
        <div>
          <div style={{ padding: '40px' }}>
            <h2 className="font-display text-3xl text-center mb-12" style={{ color: 'var(--text)' }}>
              Powered by Hermes AI
            </h2>
          </div>

          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon">🎬</div>
              <h3 className="font-body font-600 mb-2" style={{ color: 'var(--text)' }}>Live Video Intelligence</h3>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                Real-time analysis of everything you see. Object detection, scene understanding, face recognition, and more—all processed instantly.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🎤</div>
              <h3 className="font-body font-600 mb-2" style={{ color: 'var(--text)' }}>Voice Commands</h3>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                "Hermes, analyze this." Natural language voice commands control everything. Get instant answers, analysis, and actionable insights.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🧠</div>
              <h3 className="font-body font-600 mb-2" style={{ color: 'var(--text)' }}>AI-Powered Reasoning</h3>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                Claude AI processes your glasses' visual input with deep reasoning. Context-aware, intelligent, always learning from your patterns.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">💾</div>
              <h3 className="font-body font-600 mb-2" style={{ color: 'var(--text)' }}>Persistent Memory</h3>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                Every capture, every analysis, every decision is logged. Build a complete searchable knowledge base of everything you've seen.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3 className="font-body font-600 mb-2" style={{ color: 'var(--text)' }}>Multi-User Management</h3>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                Manage multiple Ray-Ban devices, users, and teams in one dashboard. Real-time sync across all your glasses.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3 className="font-body font-600 mb-2" style={{ color: 'var(--text)' }}>Sub-Second Latency</h3>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                AI analysis completes in milliseconds. Feel instantaneous. No lag. No delays. Pure intelligence at speed.
              </p>
            </div>
          </div>
        </div>

        <div className="section-divider" style={{ maxWidth: '1200px', margin: '40px auto' }} />

        {/* Use Cases */}
        <div style={{ padding: '60px 40px', maxWidth: '1200px', margin: '0 auto' }}>
          <h2 className="font-display text-3xl mb-12 text-center" style={{ color: 'var(--text)' }}>
            Real-World Applications
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div style={{ background: 'rgba(255, 215, 0, 0.05)', border: '1px solid rgba(255, 215, 0, 0.2)', borderRadius: '12px', padding: '30px' }}>
              <h3 className="font-body font-600 mb-3" style={{ color: 'var(--secondary)' }}>🏢 Enterprise</h3>
              <ul className="space-y-2 text-sm" style={{ color: 'var(--muted)' }}>
                <li>✓ Field service teams: instant equipment identification & diagnostics</li>
                <li>✓ Compliance: automatic photo documentation with context</li>
                <li>✓ Training: real-time guidance overlays for complex procedures</li>
                <li>✓ Security: incident recording with automatic analysis</li>
              </ul>
            </div>

            <div style={{ background: 'rgba(0, 255, 136, 0.05)', border: '1px solid rgba(0, 255, 136, 0.2)', borderRadius: '12px', padding: '30px' }}>
              <h3 className="font-body font-600 mb-3" style={{ color: 'var(--success)' }}>🚀 Creator</h3>
              <ul className="space-y-2 text-sm" style={{ color: 'var(--muted)' }}>
                <li>✓ Content creators: auto-tagging and instant insights</li>
                <li>✓ Fashion/design: real-time trend detection</li>
                <li>✓ Vlogging: automatic scene analysis & captions</li>
                <li>✓ Reference: searchable visual knowledge base</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="section-divider" style={{ maxWidth: '1200px', margin: '40px auto' }} />

        {/* Pricing */}
        <div className="pricing-section">
          <h2 className="font-display text-3xl mb-12 text-center" style={{ color: 'var(--text)' }}>
            Transparent Pricing
          </h2>

          <div className="pricing-card">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="font-display text-2xl" style={{ color: 'var(--primary)' }}>Starter</h3>
                <p className="text-sm mt-2" style={{ color: 'var(--muted)' }}>For individuals & small teams</p>
              </div>
              <span className="font-display text-3xl" style={{ color: 'var(--primary)' }}>$29<span style={{ fontSize: '16px', color: 'var(--muted)' }}>/mo</span></span>
            </div>
            <ul className="space-y-3 text-sm" style={{ color: 'var(--text)' }}>
              <li>✓ 1 Ray-Ban device</li>
              <li>✓ Unlimited captures & analysis</li>
              <li>✓ Basic AI features (object detection, scene analysis)</li>
              <li>✓ 30-day history retention</li>
              <li>✓ Email support</li>
            </ul>
            <button className="cta-button mt-6">Start Free Trial</button>
          </div>

          <div className="pricing-card" style={{ borderColor: 'var(--primary)', background: 'rgba(0, 217, 255, 0.1)' }}>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="font-display text-2xl" style={{ color: 'var(--primary)' }}>Professional</h3>
                <p className="text-sm mt-2" style={{ color: 'var(--muted)' }}>For teams & professionals (RECOMMENDED)</p>
              </div>
              <span className="font-display text-3xl" style={{ color: 'var(--secondary)' }}>$99<span style={{ fontSize: '16px', color: 'var(--muted)' }}>/mo</span></span>
            </div>
            <ul className="space-y-3 text-sm" style={{ color: 'var(--text)' }}>
              <li>✓ 5 Ray-Ban devices</li>
              <li>✓ Unlimited captures & analysis</li>
              <li>✓ Advanced AI: face recognition, OCR, emotional analysis</li>
              <li>✓ Unlimited history retention</li>
              <li>✓ Team dashboard & multi-user management</li>
              <li>✓ Priority support</li>
              <li>✓ Custom integrations</li>
            </ul>
            <button className="cta-button mt-6">Get Started</button>
          </div>

          <div className="pricing-card">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="font-display text-2xl" style={{ color: 'var(--primary)' }}>Enterprise</h3>
                <p className="text-sm mt-2" style={{ color: 'var(--muted)' }}>For large-scale deployments</p>
              </div>
              <span className="font-display text-3xl" style={{ color: 'var(--primary)' }}>Custom</span>
            </div>
            <ul className="space-y-3 text-sm" style={{ color: 'var(--text)' }}>
              <li>✓ Unlimited Ray-Ban devices</li>
              <li>✓ White-label options</li>
              <li>✓ Custom AI models & fine-tuning</li>
              <li>✓ Dedicated infrastructure</li>
              <li>✓ SLA & uptime guarantees</li>
              <li>✓ Dedicated account manager</li>
              <li>✓ Custom security & compliance</li>
            </ul>
            <button className="cta-button mt-6">Contact Sales</button>
          </div>
        </div>

        {/* Footer CTA */}
        <div style={{ padding: '60px 40px', textAlign: 'center', borderTop: '1px solid rgba(0, 217, 255, 0.2)' }}>
          <h2 className="font-display text-3xl mb-4" style={{ color: 'var(--text)' }}>
            Ready to See What Your Eyes Can Do?
          </h2>
          <p className="text-lg mb-8" style={{ color: 'var(--muted)' }}>
            Join thousands of professionals using Ray-Ban Intelligence to work smarter.
          </p>
          <button className="cta-button">Start Your Free Trial Today</button>
        </div>
      </div>
    </>
  );
}
