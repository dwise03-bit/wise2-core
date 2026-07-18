'use client';

import Link from 'next/link';
import { RadioTower, Users, LogOut, ArrowRight, BarChart3, Zap } from 'lucide-react';

type DashboardHomeProps = {
  showAuthStatus?: boolean;
  userEmail?: string | null;
  onLogout?: () => void | Promise<void>;
  isLoggingOut?: boolean;
};

export function DashboardHome({
  showAuthStatus = false,
  userEmail,
  onLogout,
  isLoggingOut = false,
}: DashboardHomeProps) {
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden" style={{ backgroundColor: '#050505' }}>
      {/* Animated background gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-20 left-10 w-96 h-96 rounded-full opacity-10 blur-3xl mix-blend-screen"
          style={{
            backgroundColor: '#0055FF',
          }}
        />
        <div
          className="absolute bottom-20 right-10 w-96 h-96 rounded-full opacity-10 blur-3xl mix-blend-screen"
          style={{
            backgroundColor: '#0055FF',
          }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header
          className="border-b wise-transition"
          style={{
            borderColor: 'var(--wise-border-subtle, rgba(255, 255, 255, 0.08))',
            backgroundColor: 'var(--wise-surface, #0D1117)',
          }}
        >
          <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
            <div>
              <h1
                className="text-5xl font-extrabold tracking-widest mb-2 uppercase"
                style={{
                  color: 'var(--wise-text-primary, #FFFFFF)',
                  letterSpacing: 'var(--wise-tracking-wider, 0.05em)',
                }}
              >
                WISE²
              </h1>
              <p
                className="text-sm font-medium tracking-wide"
                style={{
                  color: 'var(--wise-text-secondary, #C9CED6)',
                }}
              >
                ORGANIZED CHAOS COMMAND CENTER
              </p>
            </div>

            {showAuthStatus && onLogout ? (
              <button
                onClick={onLogout}
                disabled={isLoggingOut}
                className="flex items-center gap-2 px-6 py-3 font-semibold rounded-lg wise-transition hover:opacity-80 disabled:opacity-50 group"
                style={{
                  backgroundColor: 'var(--wise-danger, #E53935)',
                  color: 'white',
                  border: 'none',
                }}
              >
                <LogOut size={18} className="group-hover:translate-x-1 wise-transition" />
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </button>
            ) : null}
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 px-6 py-12">
          <div className="max-w-7xl mx-auto">
            {/* Welcome section */}
            <div className="mb-12">
              <h2
                className="text-3xl font-bold mb-4 tracking-wider uppercase"
                style={{
                  color: 'var(--wise-text-primary, #FFFFFF)',
                  letterSpacing: 'var(--wise-tracking-wider, 0.05em)',
                }}
              >
                Welcome back to your Command Center
              </h2>
              <p
                className="text-base leading-relaxed"
                style={{
                  color: 'var(--wise-text-secondary, #C9CED6)',
                }}
              >
                Your WISE² Creator Dashboard is ready to orchestrate your content empire.
                Choose a module to begin your creative journey.
              </p>
              {showAuthStatus && userEmail ? (
                <p className="mt-4 text-sm flex items-center gap-2">
                  <span style={{ color: 'var(--wise-text-muted, #8D98A5)' }}>
                    Signed in as
                  </span>
                  <span
                    className="font-semibold px-3 py-1 rounded-full"
                    style={{
                      backgroundColor: 'var(--wise-primary-transparent, rgba(0, 148, 255, 0.1))',
                      color: 'var(--wise-primary, #0055FF)',
                    }}
                  >
                    {userEmail}
                  </span>
                </p>
              ) : null}
            </div>

            {/* Command modules grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* LIVE Command Center */}
              <Link href="/live">
                <div
                  className="group p-8 rounded-xl wise-transition border cursor-pointer overflow-hidden backdrop-blur-md hover:shadow-lg hover:shadow-blue-500/20"
                  style={{
                    backgroundColor: 'rgba(13, 17, 23, 0.6)',
                    borderColor: 'rgba(0, 85, 255, 0.3)',
                    '--tw-backdrop-blur': 'blur(12px)',
                  } as any}
                >
                  {/* Glow effect on hover */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 wise-transition"
                    style={{
                      backgroundColor: 'var(--wise-primary-transparent, rgba(0, 148, 255, 0.1))',
                    }}
                  />

                  {/* Icon */}
                  <div
                    className="mb-6 inline-flex p-4 rounded-lg wise-transition group-hover:scale-110 relative z-10"
                    style={{
                      backgroundColor: 'var(--wise-primary-transparent, rgba(0, 148, 255, 0.2))',
                      color: 'var(--wise-primary, #0055FF)',
                    }}
                  >
                    <RadioTower size={32} />
                  </div>

                  {/* Content */}
                  <div className="relative z-10">
                    <h3
                      className="text-2xl font-bold mb-2 tracking-wider uppercase group-hover:translate-x-1 wise-transition flex items-center gap-2"
                      style={{
                        color: 'var(--wise-text-primary, #FFFFFF)',
                        letterSpacing: 'var(--wise-tracking-wider, 0.05em)',
                      }}
                    >
                      LIVE Command Center
                      <ArrowRight size={20} className="opacity-0 group-hover:opacity-100 wise-transition" />
                    </h3>
                    <p
                      className="text-sm leading-relaxed"
                      style={{
                        color: 'var(--wise-text-muted, #8D98A5)',
                      }}
                    >
                      Stream and interact with your audience in real-time. Monitor viewers, manage chat, and control your live broadcast.
                    </p>
                  </div>

                  {/* Border gradient effect */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 wise-transition rounded-xl pointer-events-none"
                    style={{
                      background: `linear-gradient(135deg, var(--wise-primary, #0055FF) 0%, transparent 100%)`,
                      opacity: 0.1,
                    }}
                  />
                </div>
              </Link>

              {/* Community */}
              <Link href="/community">
                <div
                  className="group p-8 rounded-xl wise-transition border cursor-pointer overflow-hidden backdrop-blur-md hover:shadow-lg hover:shadow-blue-500/20"
                  style={{
                    backgroundColor: 'rgba(13, 17, 23, 0.6)',
                    borderColor: 'rgba(0, 85, 255, 0.3)',
                    '--tw-backdrop-blur': 'blur(12px)',
                  } as any}
                >
                  {/* Glow effect on hover */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 wise-transition"
                    style={{
                      backgroundColor: 'var(--wise-success-transparent, rgba(34, 197, 94, 0.1))',
                    }}
                  />

                  {/* Icon */}
                  <div
                    className="mb-6 inline-flex p-4 rounded-lg wise-transition group-hover:scale-110 relative z-10"
                    style={{
                      backgroundColor: 'rgba(34, 197, 94, 0.2)',
                      color: 'var(--wise-success, #22C55E)',
                    }}
                  >
                    <Users size={32} />
                  </div>

                  {/* Content */}
                  <div className="relative z-10">
                    <h3
                      className="text-2xl font-bold mb-2 tracking-wider uppercase group-hover:translate-x-1 wise-transition flex items-center gap-2"
                      style={{
                        color: 'var(--wise-text-primary, #FFFFFF)',
                        letterSpacing: 'var(--wise-tracking-wider, 0.05em)',
                      }}
                    >
                      Community
                      <ArrowRight size={20} className="opacity-0 group-hover:opacity-100 wise-transition" />
                    </h3>
                    <p
                      className="text-sm leading-relaxed"
                      style={{
                        color: 'var(--wise-text-muted, #8D98A5)',
                      }}
                    >
                      Engage with your community. Access leaderboards, events, creator connections, and achievement systems.
                    </p>
                  </div>

                  {/* Border gradient effect */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 wise-transition rounded-xl pointer-events-none"
                    style={{
                      background: `linear-gradient(135deg, var(--wise-success, #22C55E) 0%, transparent 100%)`,
                      opacity: 0.1,
                    }}
                  />
                </div>
              </Link>
            </div>

            {/* Quick stats section */}
            <div className="mt-16 grid grid-cols-3 gap-4">
              <div
                className="p-6 rounded-lg border"
                style={{
                  backgroundColor: 'var(--wise-surface, #0D1117)',
                  borderColor: 'var(--wise-border-subtle, rgba(255, 255, 255, 0.08))',
                }}
              >
                <p
                  className="text-xs font-bold tracking-widest uppercase mb-2"
                  style={{
                    color: 'var(--wise-text-muted, #8D98A5)',
                  }}
                >
                  Status
                </p>
                <p
                  className="text-2xl font-bold flex items-center gap-2"
                  style={{
                    color: 'var(--wise-success, #22C55E)',
                  }}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--wise-success, #22C55E)' }} />
                  Online
                </p>
              </div>

              <div
                className="p-6 rounded-lg border"
                style={{
                  backgroundColor: 'var(--wise-surface, #0D1117)',
                  borderColor: 'var(--wise-border-subtle, rgba(255, 255, 255, 0.08))',
                }}
              >
                <p
                  className="text-xs font-bold tracking-widest uppercase mb-2"
                  style={{
                    color: 'var(--wise-text-muted, #8D98A5)',
                  }}
                >
                  System
                </p>
                <p
                  className="text-2xl font-bold"
                  style={{
                    color: 'var(--wise-primary, #0055FF)',
                  }}
                >
                  Optimal
                </p>
              </div>

              <div
                className="p-6 rounded-lg border"
                style={{
                  backgroundColor: 'var(--wise-surface, #0D1117)',
                  borderColor: 'var(--wise-border-subtle, rgba(255, 255, 255, 0.08))',
                }}
              >
                <p
                  className="text-xs font-bold tracking-widest uppercase mb-2"
                  style={{
                    color: 'var(--wise-text-muted, #8D98A5)',
                  }}
                >
                  Updates
                </p>
                <p
                  className="text-2xl font-bold"
                  style={{
                    color: 'var(--wise-text-primary, #FFFFFF)',
                  }}
                >
                  Ready
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer
          className="border-t py-6"
          style={{
            borderColor: 'var(--wise-border-subtle, rgba(255, 255, 255, 0.08))',
            backgroundColor: 'var(--wise-surface, #0D1117)',
            color: 'var(--wise-text-muted, #8D98A5)',
          }}
        >
          <div className="max-w-7xl mx-auto px-6 text-center text-sm">
            <p>© 2024 WISE² Platform. All systems operational.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
