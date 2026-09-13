'use client';

import React, { useState, useEffect } from 'react';
import AppNav from '../../components/AppNav';

export default function HermesControlPage() {
  const [activeTab, setActiveTab] = useState<'models' | 'context' | 'costs' | 'tuning' | 'integrations'>('models');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <>
      <AppNav />
      <div className="space-y-8" style={{ marginLeft: '200px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');

        :root {
          --color-primary: #00D9FF;
          --color-secondary: #FFD700;
          --color-danger: #FF006E;
          --color-surface: #0A0E27;
          --color-text: #E8F0FF;
          --color-muted: #6B7C99;
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
          letter-spacing: 0.01em;
        }

        @keyframes hermes-pulse {
          0%, 100% { box-shadow: 0 0 20px rgba(0, 217, 255, 0.4), 0 0 40px rgba(0, 217, 255, 0.2); }
          50% { box-shadow: 0 0 30px rgba(0, 217, 255, 0.6), 0 0 60px rgba(0, 217, 255, 0.3); }
        }

        .hermes-orb {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: radial-gradient(circle at 30% 30%, rgba(0, 217, 255, 0.3), rgba(10, 14, 39, 0.9));
          border: 2px solid var(--color-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: ${loaded ? 'hermes-pulse 3s ease-in-out infinite' : 'none'};
        }

        .hermes-orb-icon {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, var(--color-primary) 0%, #00A8CC 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
        }
      `}</style>

      <div className="pt-4">
        <div className="flex flex-col items-center gap-6 mb-12">
          <div className="hermes-orb">
            <div className="hermes-orb-icon">⚡</div>
          </div>

          <div className="text-center space-y-2">
            <h1 className="font-display text-4xl" style={{ color: 'var(--color-primary)' }}>
              Hermes Control
            </h1>
            <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
              AI orchestration, live
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6 w-full max-w-md">
            <div className="text-center">
              <div className="font-mono text-2xl" style={{ color: 'var(--color-primary)' }}>9/18</div>
              <div className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>Agents Active</div>
            </div>
            <div className="text-center">
              <div className="font-mono text-2xl" style={{ color: 'var(--color-secondary)' }}>$12.48</div>
              <div className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>Today Cost</div>
            </div>
            <div className="text-center">
              <div className="font-mono text-2xl" style={{ color: 'var(--color-primary)' }}>2.8s</div>
              <div className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>Avg Latency</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-3">
          <div className="space-y-2 sticky top-24">
            {(['models', 'context', 'costs', 'tuning', 'integrations'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="w-full text-left px-4 py-3 rounded-lg transition-all text-sm font-body"
                style={{
                  backgroundColor: activeTab === tab ? 'rgba(0, 217, 255, 0.1)' : 'transparent',
                  borderLeft: activeTab === tab ? '3px solid var(--color-primary)' : '3px solid transparent',
                  color: activeTab === tab ? 'var(--color-primary)' : 'var(--color-muted)',
                }}
              >
                <span className="font-display text-base">{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-9">
          {activeTab === 'models' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-2xl mb-2" style={{ color: 'var(--color-text)' }}>
                  Model Zoo
                </h2>
                <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                  Select inference engine. Active model shows as highlighted.
                </p>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                {[
                  { name: 'Qwen 2.5 Coder', provider: 'LOCAL', cost: 'FREE', speed: '180ms', active: true },
                  { name: 'Claude Opus', provider: 'ANTHROPIC', cost: '$0.075/1K', speed: '90ms', active: false },
                  { name: 'GPT-4 Turbo', provider: 'OPENAI', cost: '$0.030/1K', speed: '120ms', active: false },
                ].map(model => (
                  <div
                    key={model.name}
                    className="p-4 rounded-lg border-2 transition-all cursor-pointer"
                    style={{
                      borderColor: model.active ? 'var(--color-primary)' : 'rgba(107, 124, 153, 0.3)',
                      backgroundColor: model.active ? 'rgba(0, 217, 255, 0.05)' : 'transparent',
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-body font-600" style={{ color: 'var(--color-text)' }}>
                          {model.name}
                        </p>
                        <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
                          {model.provider}
                        </p>
                      </div>
                      {model.active && (
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: 'var(--color-primary)' }}
                        />
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-3 border-t border-opacity-20" style={{ borderColor: 'var(--color-primary)' }}>
                      <div>
                        <div className="text-[9px] uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>Cost</div>
                        <div className="font-mono text-sm mt-1" style={{ color: 'var(--color-text)' }}>{model.cost}</div>
                      </div>
                      <div>
                        <div className="text-[9px] uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>Speed</div>
                        <div className="font-mono text-sm mt-1" style={{ color: 'var(--color-text)' }}>{model.speed}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'context' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-2xl mb-2" style={{ color: 'var(--color-text)' }}>
                  Context Composition
                </h2>
                <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                  What Hermes sees. Live breakdown of grounding sources.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  { label: 'Brain Knowledge', value: 35, color: 'var(--color-primary)' },
                  { label: 'Live Telemetry', value: 45, color: 'var(--color-secondary)' },
                  { label: 'Agent State', value: 20, color: 'rgba(0, 217, 255, 0.5)' },
                ].map(item => (
                  <div key={item.label}>
                    <div className="flex justify-between mb-2 text-sm font-body">
                      <span style={{ color: 'var(--color-text)' }}>{item.label}</span>
                      <span className="font-mono" style={{ color: item.color }}>{item.value}%</span>
                    </div>
                    <div className="h-2 rounded-full" style={{ backgroundColor: 'rgba(107, 124, 153, 0.2)' }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${item.value}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'costs' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-2xl mb-2" style={{ color: 'var(--color-text)' }}>
                  Cost Dashboard
                </h2>
                <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                  Spending by provider and operation type.
                </p>
              </div>

              <div className="grid gap-4 grid-cols-3">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(0, 217, 255, 0.05)', borderLeft: '3px solid var(--color-primary)' }}>
                  <div className="text-[9px] uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>Today</div>
                  <div className="font-display text-2xl mt-2" style={{ color: 'var(--color-primary)' }}>$12.48</div>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(255, 215, 0, 0.05)', borderLeft: '3px solid var(--color-secondary)' }}>
                  <div className="text-[9px] uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>This Month</div>
                  <div className="font-display text-2xl mt-2" style={{ color: 'var(--color-secondary)' }}>$284.32</div>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(0, 217, 255, 0.05)', borderLeft: '3px solid var(--color-primary)' }}>
                  <div className="text-[9px] uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>YTD</div>
                  <div className="font-display text-2xl mt-2" style={{ color: 'var(--color-primary)' }}>$1,203.45</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tuning' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-2xl mb-2" style={{ color: 'var(--color-text)' }}>
                  Model Parameters
                </h2>
                <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                  Tune Hermes behavior. Changes apply to next request.
                </p>
              </div>

              <div className="space-y-6 max-w-md">
                <div>
                  <div className="flex justify-between mb-3">
                    <label className="text-sm font-body" style={{ color: 'var(--color-text)' }}>Temperature</label>
                    <span className="font-mono" style={{ color: 'var(--color-primary)' }}>0.70</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    defaultValue="0.7"
                    className="w-full"
                    style={{
                      accentColor: 'var(--color-primary)',
                    }}
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-3">
                    <label className="text-sm font-body" style={{ color: 'var(--color-text)' }}>Max Tokens</label>
                    <span className="font-mono" style={{ color: 'var(--color-primary)' }}>2048</span>
                  </div>
                  <input
                    type="range"
                    min="256"
                    max="8192"
                    step="256"
                    defaultValue="2048"
                    className="w-full"
                    style={{
                      accentColor: 'var(--color-primary)',
                    }}
                  />
                </div>

                <div>
                  <label className="text-sm font-body block mb-3" style={{ color: 'var(--color-text)' }}>Reasoning Depth</label>
                  <div className="flex gap-2">
                    {['Basic', 'Standard', 'Deep'].map(depth => (
                      <button
                        key={depth}
                        className="flex-1 py-2 rounded text-xs font-body transition-all"
                        style={{
                          backgroundColor: depth === 'Standard' ? 'var(--color-primary)' : 'rgba(107, 124, 153, 0.2)',
                          color: depth === 'Standard' ? 'var(--color-surface)' : 'var(--color-text)',
                        }}
                      >
                        {depth}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-2xl mb-2" style={{ color: 'var(--color-text)' }}>
                  External Hooks
                </h2>
                <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                  Where Hermes writes decisions. Webhooks are call-only.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  { name: 'WISE² Discord', status: 'connected', color: 'var(--color-primary)' },
                  { name: 'wise2-core GitHub', status: 'connected', color: 'var(--color-primary)' },
                  { name: 'Team Slack', status: 'offline', color: 'var(--color-muted)' },
                ].map(integration => (
                  <div
                    key={integration.name}
                    className="p-4 rounded-lg flex items-center justify-between"
                    style={{ backgroundColor: 'rgba(107, 124, 153, 0.1)' }}
                  >
                    <div>
                      <p className="font-body font-600" style={{ color: 'var(--color-text)' }}>
                        {integration.name}
                      </p>
                      <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
                        {integration.status}
                      </p>
                    </div>
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: integration.color }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
