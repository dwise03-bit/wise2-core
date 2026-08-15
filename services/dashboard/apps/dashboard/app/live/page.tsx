'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Radio, Eye, Clock, Settings, Share2, ArrowLeft } from 'lucide-react';

export default function LiveCommandCenter() {
  const [isLive, setIsLive] = useState(false);
  const [viewerCount, setViewerCount] = useState(1247);
  const [duration, setDuration] = useState('00:00');

  // Simulate viewer count changes
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setViewerCount((prev) => prev + Math.floor(Math.random() * 50 - 20));
    }, 5000);

    return () => clearInterval(interval);
  }, [isLive]);

  // Simulate duration timer
  useEffect(() => {
    if (!isLive) {
      setDuration('00:00');
      return;
    }

    const interval = setInterval(() => {
      const [minutes, seconds] = duration.split(':').map(Number);
      const totalSeconds = minutes * 60 + seconds + 1;
      const newMinutes = Math.floor(totalSeconds / 60);
      const newSeconds = totalSeconds % 60;
      setDuration(
        `${String(newMinutes).padStart(2, '0')}:${String(newSeconds).padStart(2, '0')}`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [isLive, duration]);

  return (
    <div
      className="min-h-screen overflow-hidden"
      style={{
        backgroundColor: 'var(--wise-bg, #050505)',
        color: 'var(--wise-text-primary, #FFFFFF)',
      }}
    >
      {/* Animated background gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-20 left-10 w-96 h-96 rounded-full opacity-5 blur-3xl"
          style={{
            backgroundColor: 'var(--wise-primary, #0094FF)',
          }}
        />
        <div
          className="absolute bottom-20 right-10 w-96 h-96 rounded-full opacity-5 blur-3xl"
          style={{
            backgroundColor: 'var(--wise-danger, #E53935)',
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
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="p-2 rounded-lg wise-transition hover:opacity-70"
                style={{
                  backgroundColor: 'var(--wise-surface-2, #131922)',
                  color: 'var(--wise-text-secondary, #C9CED6)',
                }}
              >
                <ArrowLeft size={20} />
              </Link>
              <div>
                <h1
                  className="text-4xl font-extrabold tracking-widest uppercase"
                  style={{
                    color: 'var(--wise-text-primary, #FFFFFF)',
                    letterSpacing: 'var(--wise-tracking-wider, 0.05em)',
                  }}
                >
                  LIVE CONTROL
                </h1>
              </div>
            </div>

            {/* Live indicator */}
            <div
              className="flex items-center gap-3 px-4 py-2 rounded-full"
              style={{
                backgroundColor: isLive
                  ? 'var(--wise-danger-transparent, rgba(229, 57, 53, 0.2))'
                  : 'var(--wise-success-transparent, rgba(34, 197, 94, 0.2))',
              }}
            >
              <div
                className={isLive ? 'animate-pulse' : ''}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: isLive ? 'var(--wise-danger, #E53935)' : 'var(--wise-success, #22C55E)',
                }}
              />
              <span
                className="text-sm font-bold"
                style={{
                  color: isLive ? 'var(--wise-danger, #E53935)' : 'var(--wise-success, #22C55E)',
                }}
              >
                {isLive ? 'LIVE' : 'OFFLINE'}
              </span>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Video Player */}
              <div
                className="lg:col-span-2 rounded-xl overflow-hidden border"
                style={{
                  borderColor: 'var(--wise-border-subtle, rgba(255, 255, 255, 0.08))',
                  backgroundColor: 'var(--wise-card, #10151D)',
                }}
              >
                {/* Video preview area */}
                <div
                  className="aspect-video flex items-center justify-center relative overflow-hidden"
                  style={{
                    backgroundColor: 'var(--wise-surface-2, #131922)',
                  }}
                >
                  {/* Live border glow when streaming */}
                  {isLive && (
                    <div
                      className="absolute inset-0 opacity-20 animate-pulse"
                      style={{
                        backgroundColor: 'var(--wise-danger, #E53935)',
                        boxShadow: `0 0 30px var(--wise-danger, #E53935)`,
                      }}
                    />
                  )}

                  <div className="text-center relative z-10">
                    <Radio
                      size={80}
                      style={{
                        color: isLive ? 'var(--wise-danger, #E53935)' : 'var(--wise-primary, #0094FF)',
                        marginBottom: '24px',
                      }}
                      className={isLive ? 'animate-spin' : ''}
                    />
                    <p
                      className="text-2xl font-bold tracking-wider uppercase"
                      style={{
                        color: 'var(--wise-text-secondary, #C9CED6)',
                        letterSpacing: 'var(--wise-tracking-wider, 0.05em)',
                      }}
                    >
                      {isLive ? 'STREAMING LIVE' : 'STREAM PREVIEW'}
                    </p>
                  </div>
                </div>

                {/* Controls */}
                <div
                  className="p-6 border-t flex gap-4"
                  style={{
                    borderColor: 'var(--wise-border-subtle, rgba(255, 255, 255, 0.08))',
                    backgroundColor: 'var(--wise-surface, #0D1117)',
                  }}
                >
                  <button
                    onClick={() => setIsLive(!isLive)}
                    className="flex-1 px-6 py-3 font-bold rounded-lg wise-transition tracking-wider uppercase text-base flex items-center justify-center gap-2 hover:scale-105"
                    style={{
                      backgroundColor: isLive
                        ? 'var(--wise-danger, #E53935)'
                        : 'var(--wise-success, #22C55E)',
                      color: 'white',
                      letterSpacing: 'var(--wise-tracking-wider, 0.05em)',
                    }}
                  >
                    <Radio size={18} />
                    {isLive ? 'STOP BROADCAST' : 'GO LIVE'}
                  </button>

                  <button
                    className="px-4 py-3 rounded-lg wise-transition hover:opacity-70"
                    style={{
                      backgroundColor: 'var(--wise-surface-2, #131922)',
                      color: 'var(--wise-text-secondary, #C9CED6)',
                      border: `1px solid var(--wise-border-medium, rgba(255, 255, 255, 0.12))`,
                    }}
                  >
                    <Settings size={20} />
                  </button>

                  <button
                    className="px-4 py-3 rounded-lg wise-transition hover:opacity-70"
                    style={{
                      backgroundColor: 'var(--wise-surface-2, #131922)',
                      color: 'var(--wise-text-secondary, #C9CED6)',
                      border: `1px solid var(--wise-border-medium, rgba(255, 255, 255, 0.12))`,
                    }}
                  >
                    <Share2 size={20} />
                  </button>
                </div>
              </div>

              {/* Stats Sidebar */}
              <div className="space-y-6">
                {/* Viewers stat */}
                <div
                  className="p-6 rounded-xl border"
                  style={{
                    borderColor: 'var(--wise-border-subtle, rgba(255, 255, 255, 0.08))',
                    backgroundColor: 'var(--wise-card, #10151D)',
                  }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="p-3 rounded-lg"
                      style={{
                        backgroundColor: 'var(--wise-primary-transparent, rgba(0, 148, 255, 0.2))',
                        color: 'var(--wise-primary, #0094FF)',
                      }}
                    >
                      <Eye size={20} />
                    </div>
                    <p
                      className="text-xs font-bold tracking-widest uppercase"
                      style={{
                        color: 'var(--wise-text-muted, #8D98A5)',
                      }}
                    >
                      Concurrent Viewers
                    </p>
                  </div>
                  <p
                    className="text-4xl font-extrabold tracking-tight"
                    style={{
                      color: 'var(--wise-primary, #0094FF)',
                    }}
                  >
                    {viewerCount.toLocaleString()}
                  </p>
                </div>

                {/* Duration stat */}
                <div
                  className="p-6 rounded-xl border"
                  style={{
                    borderColor: 'var(--wise-border-subtle, rgba(255, 255, 255, 0.08))',
                    backgroundColor: 'var(--wise-card, #10151D)',
                  }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="p-3 rounded-lg"
                      style={{
                        backgroundColor: 'rgba(34, 197, 94, 0.2)',
                        color: 'var(--wise-success, #22C55E)',
                      }}
                    >
                      <Clock size={20} />
                    </div>
                    <p
                      className="text-xs font-bold tracking-widest uppercase"
                      style={{
                        color: 'var(--wise-text-muted, #8D98A5)',
                      }}
                    >
                      Stream Duration
                    </p>
                  </div>
                  <p
                    className="text-4xl font-extrabold tracking-tight font-mono"
                    style={{
                      color: 'var(--wise-success, #22C55E)',
                    }}
                  >
                    {duration}
                  </p>
                </div>

                {/* Quick stats */}
                <div
                  className="p-6 rounded-xl border space-y-4"
                  style={{
                    borderColor: 'var(--wise-border-subtle, rgba(255, 255, 255, 0.08))',
                    backgroundColor: 'var(--wise-card, #10151D)',
                  }}
                >
                  <h3
                    className="text-sm font-bold tracking-widest uppercase"
                    style={{
                      color: 'var(--wise-text-primary, #FFFFFF)',
                      letterSpacing: 'var(--wise-tracking-wider, 0.05em)',
                    }}
                  >
                    STREAM METRICS
                  </h3>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span
                        className="text-sm"
                        style={{
                          color: 'var(--wise-text-muted, #8D98A5)',
                        }}
                      >
                        Bitrate
                      </span>
                      <span
                        className="font-mono font-bold"
                        style={{
                          color: 'var(--wise-text-primary, #FFFFFF)',
                        }}
                      >
                        6.5 Mbps
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span
                        className="text-sm"
                        style={{
                          color: 'var(--wise-text-muted, #8D98A5)',
                        }}
                      >
                        Resolution
                      </span>
                      <span
                        className="font-mono font-bold"
                        style={{
                          color: 'var(--wise-text-primary, #FFFFFF)',
                        }}
                      >
                        1920 x 1080
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span
                        className="text-sm"
                        style={{
                          color: 'var(--wise-text-muted, #8D98A5)',
                        }}
                      >
                        FPS
                      </span>
                      <span
                        className="font-mono font-bold"
                        style={{
                          color: 'var(--wise-text-primary, #FFFFFF)',
                        }}
                      >
                        60
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
