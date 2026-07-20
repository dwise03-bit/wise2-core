'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const COLORS = {
  accent: '#39FF14',
  accentDim: 'rgba(57, 255, 20, 0.1)',
  accentDarkBg: 'rgba(57, 255, 20, 0.08)',
  black: '#050505',
  darkBg: '#0a0a0a',
  borderColor: '#262626',
  textPrimary: '#e6e6e6',
  textSecondary: '#999999',
};

export default function LandingPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    activeUsers: '12.4K',
    totalCreations: '1.2M+',
    systemUptime: '99.9%',
  });

  return (
    <div style={{ background: COLORS.black, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '60px',
          padding: '0 40px',
          background: 'linear-gradient(180deg, #111, #0a0a0a)',
          borderBottom: `1px solid ${COLORS.borderColor}`,
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
          <span
            style={{
              fontFamily: 'Orbitron, sans-serif',
              fontWeight: 900,
              fontSize: '22px',
              letterSpacing: '1px',
              background: 'linear-gradient(180deg, #fff 20%, #777 80%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            WISE
          </span>
          <span
            style={{
              fontFamily: 'Orbitron, sans-serif',
              fontWeight: 900,
              fontSize: '13px',
              color: COLORS.accent,
              textShadow: `0 0 8px rgba(57,255,20,.6)`,
            }}
          >
            2
          </span>
        </div>

        {/* Navigation */}
        <nav
          style={{
            display: 'flex',
            gap: '32px',
            alignItems: 'center',
            fontSize: '14px',
            fontWeight: 600,
            letterSpacing: '.5px',
            fontFamily: 'Rajdhani, sans-serif',
          }}
        >
          <a href="#features" style={{ color: '#ccc', textDecoration: 'none' }}>
            Features
          </a>
          <a href="#pricing" style={{ color: '#ccc', textDecoration: 'none' }}>
            Pricing
          </a>
          <a href="#" style={{ color: '#ccc', textDecoration: 'none' }}>
            Docs
          </a>
          <a href="#" style={{ color: '#ccc', textDecoration: 'none' }}>
            Contact
          </a>
        </nav>

        {/* Auth Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => router.push('/auth/login')}
            style={{
              background: 'transparent',
              border: `1px solid #333`,
              color: '#ccc',
              borderRadius: '6px',
              padding: '9px 18px',
              fontFamily: 'Rajdhani, sans-serif',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.borderColor = COLORS.accent;
              (e.target as HTMLButtonElement).style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.borderColor = '#333';
              (e.target as HTMLButtonElement).style.color = '#ccc';
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => router.push('/auth/signup')}
            style={{
              background: COLORS.accent,
              color: COLORS.black,
              border: 'none',
              borderRadius: '6px',
              padding: '9px 20px',
              fontFamily: 'Rajdhani, sans-serif',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              animation: 'pulse 3s infinite',
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.filter = 'brightness(1.15)';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.filter = 'brightness(1)';
            }}
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section
        style={{
          padding: '100px 40px',
          textAlign: 'center',
          background: `radial-gradient(1200px 600px at 50% 0%, rgba(57,255,20,.08), transparent 70%), ${COLORS.black}`,
        }}
      >
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div
            style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: '14px',
              letterSpacing: '2px',
              color: COLORS.accent,
              marginBottom: '16px',
              textTransform: 'uppercase',
              animation: 'fadeInUp 0.4s ease',
            }}
          >
            The future of creative AI
          </div>

          <h1
            style={{
              fontFamily: 'Orbitron, sans-serif',
              fontWeight: 900,
              fontSize: '56px',
              letterSpacing: '1px',
              lineHeight: 1.15,
              margin: '0 0 20px',
              background: 'linear-gradient(180deg, #fff 25%, #999 80%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'fadeInUp 0.5s ease 0.1s backwards',
            }}
          >
            AI Creative Studio
            <br />
            For Modern Creators
          </h1>

          <p
            style={{
              fontSize: '16px',
              color: '#bbb',
              lineHeight: 1.6,
              margin: '0 0 32px',
              maxWidth: '700px',
              marginLeft: 'auto',
              marginRight: 'auto',
              fontFamily: 'Rajdhani, sans-serif',
              animation: 'fadeInUp 0.5s ease 0.2s backwards',
            }}
          >
            Generate music, videos, images, and audio with production-grade AI. WISE² gives you studio-quality tools powered by the best
            models on the market.
          </p>

          {/* CTA Buttons */}
          <div
            style={{
              display: 'flex',
              gap: '16px',
              justifyContent: 'center',
              animation: 'fadeInUp 0.5s ease 0.3s backwards',
            }}
          >
            <button
              onClick={() => router.push('/auth/signup')}
              style={{
                background: COLORS.accent,
                color: COLORS.black,
                border: 'none',
                borderRadius: '8px',
                padding: '15px 32px',
                fontFamily: 'Rajdhani, sans-serif',
                fontWeight: 700,
                fontSize: '15px',
                cursor: 'pointer',
                letterSpacing: '.5px',
                animation: 'pulse 3s infinite',
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.filter = 'brightness(1.15)';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.filter = 'brightness(1)';
              }}
            >
              START FREE TRIAL
            </button>
            <button
              style={{
                background: 'transparent',
                border: `1px solid ${COLORS.accent}`,
                color: COLORS.accent,
                borderRadius: '8px',
                padding: '15px 32px',
                fontFamily: 'Rajdhani, sans-serif',
                fontWeight: 700,
                fontSize: '15px',
                cursor: 'pointer',
                letterSpacing: '.5px',
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.background = 'rgba(57, 255, 20, 0.1)';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.background = 'transparent';
              }}
            >
              WATCH DEMO
            </button>
          </div>

          {/* Stats */}
          <div
            style={{
              marginTop: '48px',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '40px',
              maxWidth: '500px',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontFamily: 'Orbitron, sans-serif',
                  fontWeight: 900,
                  fontSize: '20px',
                  color: COLORS.accent,
                }}
              >
                {stats.activeUsers}
              </div>
              <div
                style={{
                  fontSize: '11px',
                  color: '#888',
                  marginTop: '4px',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  fontFamily: 'Rajdhani, sans-serif',
                }}
              >
                Active Users
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontFamily: 'Orbitron, sans-serif',
                  fontWeight: 900,
                  fontSize: '20px',
                  color: COLORS.accent,
                }}
              >
                {stats.totalCreations}
              </div>
              <div
                style={{
                  fontSize: '11px',
                  color: '#888',
                  marginTop: '4px',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  fontFamily: 'Rajdhani, sans-serif',
                }}
              >
                Assets Created
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontFamily: 'Orbitron, sans-serif',
                  fontWeight: 900,
                  fontSize: '20px',
                  color: COLORS.accent,
                }}
              >
                {stats.systemUptime}
              </div>
              <div
                style={{
                  fontSize: '11px',
                  color: '#888',
                  marginTop: '4px',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  fontFamily: 'Rajdhani, sans-serif',
                }}
              >
                Uptime
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        style={{
          padding: '80px 40px',
          background: COLORS.darkBg,
          borderTop: `1px solid #1f1f1f`,
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2
              style={{
                fontFamily: 'Orbitron, sans-serif',
                fontWeight: 900,
                fontSize: '40px',
                letterSpacing: '1px',
                margin: '0 0 12px',
                color: '#fff',
              }}
            >
              Studio-Grade Features
            </h2>
            <p
              style={{
                fontSize: '15px',
                color: '#999',
                fontFamily: 'Rajdhani, sans-serif',
              }}
            >
              Everything you need to create professional content at scale
            </p>
          </div>

          {/* Features Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '24px',
            }}
          >
            {[
              { emoji: '🎵', title: 'AI Music Generation', desc: 'Generate original music, from EDM to orchestral. Style, mood, and instrumentation control.' },
              { emoji: '🎬', title: 'Video Creation', desc: 'Text-to-video synthesis. Scene composition, effects, and voiceover generation included.' },
              { emoji: '🎨', title: 'Image & Design', desc: 'Generate, edit, and upscale images. Consistent styles across batches with AI brand memory.' },
              { emoji: '🎙️', title: 'Voice Synthesis', desc: 'Clone voices, generate narration, or use pre-trained professional voices. Multi-language support.' },
              { emoji: '🚀', title: 'Batch Processing', desc: 'Generate 100+ assets in one command. Automated workflows for studios and agencies.' },
              { emoji: '⚡', title: 'Fast Rendering', desc: 'Sub-second generation for music. 30–60s for video. Optimized infrastructure worldwide.' },
            ].map((feature, idx) => (
              <div
                key={idx}
                style={{
                  background: 'linear-gradient(180deg, #121212, #0c0c0c)',
                  border: `1px solid ${COLORS.borderColor}`,
                  borderRadius: '12px',
                  padding: '28px',
                  animation: `fadeInUp 0.5s ease ${0.1 * idx}s backwards`,
                }}
              >
                <div
                  style={{
                    fontFamily: 'Orbitron, sans-serif',
                    fontSize: '28px',
                    marginBottom: '12px',
                  }}
                >
                  {feature.emoji}
                </div>
                <h3
                  style={{
                    fontSize: '16px',
                    fontWeight: 700,
                    color: '#fff',
                    margin: '0 0 10px',
                    fontFamily: 'Rajdhani, sans-serif',
                  }}
                >
                  {feature.title}
                </h3>
                <p
                  style={{
                    fontSize: '13px',
                    color: '#888',
                    lineHeight: 1.5,
                    margin: 0,
                    fontFamily: 'Rajdhani, sans-serif',
                  }}
                >
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hermes Section */}
      <section
        style={{
          padding: '80px 40px',
          background: 'linear-gradient(135deg, #0f150c, #0b0b0b)',
          borderTop: `1px solid #1e1e1e`,
          borderBottom: `1px solid #1e1e1e`,
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '60px',
            alignItems: 'center',
          }}
        >
          <div>
            <h2
              style={{
                fontFamily: 'Orbitron, sans-serif',
                fontWeight: 900,
                fontSize: '36px',
                letterSpacing: '1px',
                margin: '0 0 16px',
                color: '#fff',
              }}
            >
              Powered by Hermes
            </h2>
            <p
              style={{
                fontSize: '14px',
                color: '#bbb',
                lineHeight: 1.6,
                margin: '0 0 28px',
                fontFamily: 'Rajdhani, sans-serif',
              }}
            >
              WISE² is built on Hermes, our proprietary AI model trained on 500M+ creative assets. It understands context, style, and nuance
              in ways standard models can't.
            </p>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                fontFamily: 'Rajdhani, sans-serif',
              }}
            >
              {[
                '50% faster than competitors',
                '99.9% uptime SLA',
                'Enterprise-grade security',
                'Fine-tuning & custom models',
              ].map((item, idx) => (
                <li
                  key={idx}
                  style={{
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'center',
                    fontSize: '14px',
                  }}
                >
                  <span style={{ color: COLORS.accent, fontWeight: 900 }}>✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Benchmarks */}
          <div
            style={{
              background: COLORS.darkBg,
              border: `1px solid rgba(57, 255, 20, 0.2)`,
              borderRadius: '12px',
              padding: '32px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div
              style={{
                fontFamily: 'Orbitron, sans-serif',
                fontSize: '11px',
                color: COLORS.accent,
                letterSpacing: '2px',
                textTransform: 'uppercase',
              }}
            >
              Hermes Benchmarks
            </div>

            {[
              { label: 'Music Quality Score', value: '9.4/10', percent: 94 },
              { label: 'Generation Speed', value: '8.8/10', percent: 88 },
              { label: 'Style Accuracy', value: '9.6/10', percent: 96 },
              { label: 'Reliability (uptime)', value: '99.9%', percent: 99 },
            ].map((metric, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 0',
                  borderBottom: idx < 3 ? '1px solid #2a2a2a' : 'none',
                  fontFamily: 'Rajdhani, sans-serif',
                }}
              >
                <span style={{ fontSize: '13px', color: '#bbb' }}>{metric.label}</span>
                <div
                  style={{
                    width: '120px',
                    height: '4px',
                    background: '#1a1a1a',
                    borderRadius: '2px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${metric.percent}%`,
                      height: '100%',
                      background: COLORS.accent,
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: '13px',
                    color: COLORS.accent,
                    fontWeight: 700,
                  }}
                >
                  {metric.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        id="pricing"
        style={{
          padding: '80px 40px',
          background: COLORS.black,
        }}
      >
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2
              style={{
                fontFamily: 'Orbitron, sans-serif',
                fontWeight: 900,
                fontSize: '40px',
                letterSpacing: '1px',
                margin: '0 0 12px',
                color: '#fff',
              }}
            >
              Simple, Transparent Pricing
            </h2>
            <p
              style={{
                fontSize: '15px',
                color: '#999',
                fontFamily: 'Rajdhani, sans-serif',
              }}
            >
              No hidden fees. Cancel anytime. All plans include API access.
            </p>
          </div>

          {/* Pricing Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '24px',
            }}
          >
            {[
              {
                name: 'Starter',
                subtitle: 'Perfect for experiments',
                price: '$29',
                features: [
                  '5,000 credits/month',
                  'All generation models',
                  'Community support',
                  { text: 'Priority queue', disabled: true },
                ],
              },
              {
                name: 'Professional',
                subtitle: 'For active creators',
                price: '$99',
                featured: true,
                features: [
                  '25,000 credits/month',
                  'All generation models',
                  'Priority queue',
                  'Email support (24h)',
                ],
              },
              {
                name: 'Enterprise',
                subtitle: 'For studios & agencies',
                price: 'Custom',
                features: [
                  'Unlimited credits',
                  'Dedicated support',
                  'Custom models',
                  'SLA guarantee',
                ],
              },
            ].map((plan, idx) => (
              <div
                key={idx}
                style={{
                  background: plan.featured ? 'linear-gradient(180deg, #1a1f15, #0f140a)' : 'linear-gradient(180deg, #121212, #0c0c0c)',
                  border: plan.featured ? '1.5px solid #39FF14' : `1px solid ${COLORS.borderColor}`,
                  borderRadius: '12px',
                  padding: '32px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                  position: 'relative',
                  fontFamily: 'Rajdhani, sans-serif',
                }}
              >
                {plan.featured && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '-12px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'linear-gradient(90deg, #39FF14, #b6ff00)',
                      color: COLORS.black,
                      padding: '4px 14px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 700,
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                    }}
                  >
                    MOST POPULAR
                  </div>
                )}

                <div>
                  <h3
                    style={{
                      fontSize: '18px',
                      fontWeight: 700,
                      color: '#fff',
                      margin: 0,
                    }}
                  >
                    {plan.name}
                  </h3>
                  <p
                    style={{
                      fontSize: '13px',
                      color: '#999',
                      margin: '6px 0 0',
                    }}
                  >
                    {plan.subtitle}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  <span
                    style={{
                      fontFamily: 'Orbitron, sans-serif',
                      fontSize: '32px',
                      fontWeight: 700,
                      color: '#fff',
                    }}
                  >
                    {plan.price}
                  </span>
                  {plan.price !== 'Custom' && (
                    <span style={{ color: '#999', fontSize: '13px' }}>/month</span>
                  )}
                </div>

                <ul
                  style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  {plan.features.map((feature, fidx) => (
                    <li
                      key={fidx}
                      style={{
                        display: 'flex',
                        gap: '8px',
                        alignItems: 'center',
                        fontSize: '13px',
                        color: typeof feature === 'string' ? '#fff' : feature.disabled ? '#666' : '#fff',
                      }}
                    >
                      <span style={{ color: typeof feature === 'string' ? COLORS.accent : '#888' }}>✓</span>
                      <span>{typeof feature === 'string' ? feature : feature.text}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => router.push('/auth/signup')}
                  style={{
                    background: COLORS.accent,
                    color: COLORS.black,
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px',
                    fontFamily: 'Rajdhani, sans-serif',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    marginTop: 'auto',
                    animation: plan.featured ? 'pulse 3s infinite' : 'none',
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLButtonElement).style.filter = 'brightness(1.15)';
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLButtonElement).style.filter = 'brightness(1)';
                  }}
                >
                  {plan.featured ? 'START FREE TRIAL' : 'GET STARTED'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: '60px 40px 40px',
          background: COLORS.darkBg,
          borderTop: `1px solid #1f1f1f`,
          color: '#888',
          textAlign: 'center',
          fontFamily: 'Rajdhani, sans-serif',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p style={{ margin: '0 0 20px', fontSize: '13px' }}>WISE² - AI Creative Studio for Modern Creators</p>
          <p style={{ margin: 0, fontSize: '12px' }}>© 2024 WISE². All rights reserved.</p>
        </div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;900&family=Rajdhani:wght@400;500;600;700&display=swap');

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: none;
          }
        }

        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 6px rgba(57, 255, 20, 0.35);
          }
          50% {
            box-shadow: 0 0 18px rgba(57, 255, 20, 0.7);
          }
        }

        body {
          margin: 0;
          padding: 0;
          font-family: 'Rajdhani', sans-serif;
          color: #e6e6e6;
          background: #050505;
        }

        a {
          color: #39FF14;
          text-decoration: none;
        }

        a:hover {
          color: #b6ff9e;
        }
      `}</style>
    </div>
  );
}
