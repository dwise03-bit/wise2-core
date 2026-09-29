'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Trophy, Calendar, Users, Zap, ArrowLeft, TrendingUp, Award, Flame } from 'lucide-react';

type TabType = 'leaderboard' | 'events' | 'creators' | 'achievements';

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<TabType>('leaderboard');

  const leaderboardData = [
    { rank: 1, name: 'SonicArtist', points: 15250, icon: '🥇', trend: 'up' },
    { rank: 2, name: 'BeatMaker', points: 12840, icon: '🥈', trend: 'down' },
    { rank: 3, name: 'MusicWizard', points: 11230, icon: '🥉', trend: 'up' },
    { rank: 4, name: 'ProducerX', points: 9875, icon: '⭐', trend: 'stable' },
  ];

  const eventsData = [
    {
      name: 'Sound Design Challenge',
      date: 'July 15-22',
      users: 234,
      icon: Zap,
    },
    {
      name: 'Remix Battle',
      date: 'July 22-29',
      users: 156,
      icon: Flame,
    },
  ];

  const creatorsData = [
    {
      name: 'Echo Master',
      followers: 15420,
      status: 'Active',
    },
    {
      name: 'Rhythm King',
      followers: 12350,
      status: 'Active',
    },
    {
      name: 'Sound Wizard',
      followers: 9870,
      status: 'Away',
    },
  ];

  const achievementsData = [
    { name: 'First Stream', users: 1200, rarity: 'Common' },
    { name: '100 Viewers', users: 450, rarity: 'Uncommon' },
    { name: '1000 Viewers', users: 85, rarity: 'Rare' },
    { name: 'Community Legend', users: 12, rarity: 'Epic' },
  ];

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
            backgroundColor: 'var(--wise-success, #22C55E)',
          }}
        />
        <div
          className="absolute bottom-20 right-10 w-96 h-96 rounded-full opacity-5 blur-3xl"
          style={{
            backgroundColor: 'var(--wise-primary, #0094FF)',
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
              <div className="flex items-center gap-3">
                <div
                  className="p-3 rounded-lg"
                  style={{
                    backgroundColor: 'var(--wise-success-transparent, rgba(34, 197, 94, 0.2))',
                    color: 'var(--wise-success, #22C55E)',
                  }}
                >
                  <Users size={24} />
                </div>
                <h1
                  className="text-4xl font-extrabold tracking-widest uppercase"
                  style={{
                    color: 'var(--wise-text-primary, #FFFFFF)',
                    letterSpacing: 'var(--wise-tracking-wider, 0.05em)',
                  }}
                >
                  Community
                </h1>
              </div>
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div
          className="border-b"
          style={{
            borderColor: 'var(--wise-border-subtle, rgba(255, 255, 255, 0.08))',
            backgroundColor: 'var(--wise-surface, #0D1117)',
          }}
        >
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex gap-8">
              {(['leaderboard', 'events', 'creators', 'achievements'] as TabType[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="py-4 px-4 font-bold text-sm uppercase tracking-wider wise-transition relative"
                  style={{
                    color:
                      activeTab === tab
                        ? 'var(--wise-primary, #0094FF)'
                        : 'var(--wise-text-muted, #8D98A5)',
                    letterSpacing: 'var(--wise-tracking-wider, 0.05em)',
                  }}
                >
                  {tab}
                  {activeTab === tab && (
                    <div
                      className="absolute bottom-0 left-0 right-0 h-1"
                      style={{
                        backgroundColor: 'var(--wise-primary, #0094FF)',
                        boxShadow: `0 0 16px var(--wise-primary, #0094FF)`,
                      }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 px-6 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Leaderboard Tab */}
            {activeTab === 'leaderboard' && (
              <div className="space-y-6">
                <h2
                  className="text-2xl font-bold tracking-wider uppercase"
                  style={{
                    color: 'var(--wise-text-primary, #FFFFFF)',
                    letterSpacing: 'var(--wise-tracking-wider, 0.05em)',
                  }}
                >
                  Top Creators
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {leaderboardData.map((user) => (
                    <div
                      key={user.rank}
                      className="group p-6 rounded-xl border wise-transition hover:scale-105 cursor-pointer"
                      style={{
                        borderColor: 'var(--wise-border-subtle, rgba(255, 255, 255, 0.08))',
                        backgroundColor: 'var(--wise-card, #10151D)',
                      }}
                    >
                      <div className="flex items-center gap-6">
                        <div
                          className="text-5xl flex-shrink-0 w-16 h-16 flex items-center justify-center rounded-lg"
                          style={{
                            backgroundColor: 'var(--wise-primary-transparent, rgba(0, 148, 255, 0.2))',
                            color: 'var(--wise-primary, #0094FF)',
                          }}
                        >
                          {user.icon}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3
                              className="text-xl font-bold"
                              style={{
                                color: 'var(--wise-text-primary, #FFFFFF)',
                              }}
                            >
                              {user.name}
                            </h3>
                            {user.trend === 'up' && (
                              <TrendingUp
                                size={16}
                                style={{
                                  color: 'var(--wise-success, #22C55E)',
                                }}
                              />
                            )}
                          </div>

                          <p
                            className="text-sm"
                            style={{
                              color: 'var(--wise-text-muted, #8D98A5)',
                            }}
                          >
                            Rank #{user.rank}
                          </p>
                        </div>

                        <div className="text-right">
                          <p
                            className="text-3xl font-extrabold"
                            style={{
                              color: 'var(--wise-primary, #0094FF)',
                            }}
                          >
                            {user.points.toLocaleString()}
                          </p>
                          <p
                            className="text-xs tracking-widest uppercase"
                            style={{
                              color: 'var(--wise-text-muted, #8D98A5)',
                              letterSpacing: 'var(--wise-tracking-wider, 0.05em)',
                            }}
                          >
                            Points
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Events Tab */}
            {activeTab === 'events' && (
              <div className="space-y-6">
                <h2
                  className="text-2xl font-bold tracking-wider uppercase"
                  style={{
                    color: 'var(--wise-text-primary, #FFFFFF)',
                    letterSpacing: 'var(--wise-tracking-wider, 0.05em)',
                  }}
                >
                  Active Events
                </h2>

                <div className="space-y-4">
                  {eventsData.map((event, i) => {
                    const IconComponent = event.icon;
                    return (
                      <div
                        key={i}
                        className="p-6 rounded-xl border wise-transition hover:scale-102 cursor-pointer"
                        style={{
                          borderColor: 'var(--wise-border-subtle, rgba(255, 255, 255, 0.08))',
                          backgroundColor: 'var(--wise-card, #10151D)',
                        }}
                      >
                        <div className="flex items-center justify-between gap-6">
                          <div className="flex items-center gap-6">
                            <div
                              className="p-4 rounded-lg"
                              style={{
                                backgroundColor: 'var(--wise-warning, #F59E0B)',
                                color: 'white',
                              }}
                            >
                              <IconComponent size={28} />
                            </div>

                            <div>
                              <h3
                                className="text-xl font-bold mb-2"
                                style={{
                                  color: 'var(--wise-text-primary, #FFFFFF)',
                                }}
                              >
                                {event.name}
                              </h3>
                              <div className="flex items-center gap-4">
                                <p
                                  className="text-sm flex items-center gap-2"
                                  style={{
                                    color: 'var(--wise-text-muted, #8D98A5)',
                                  }}
                                >
                                  <Calendar size={14} />
                                  {event.date}
                                </p>
                                <p
                                  className="text-sm flex items-center gap-2"
                                  style={{
                                    color: 'var(--wise-text-muted, #8D98A5)',
                                  }}
                                >
                                  <Users size={14} />
                                  {event.users} participants
                                </p>
                              </div>
                            </div>
                          </div>

                          <button
                            className="px-6 py-2 rounded-lg font-bold text-sm uppercase wise-transition hover:opacity-80"
                            style={{
                              backgroundColor: 'var(--wise-primary, #0094FF)',
                              color: 'white',
                              letterSpacing: 'var(--wise-tracking-wider, 0.05em)',
                            }}
                          >
                            Join
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Creators Tab */}
            {activeTab === 'creators' && (
              <div className="space-y-6">
                <h2
                  className="text-2xl font-bold tracking-wider uppercase"
                  style={{
                    color: 'var(--wise-text-primary, #FFFFFF)',
                    letterSpacing: 'var(--wise-tracking-wider, 0.05em)',
                  }}
                >
                  Featured Creators
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {creatorsData.map((creator, i) => (
                    <div
                      key={i}
                      className="p-6 rounded-xl border wise-transition hover:scale-105 cursor-pointer"
                      style={{
                        borderColor: 'var(--wise-border-subtle, rgba(255, 255, 255, 0.08))',
                        backgroundColor: 'var(--wise-card, #10151D)',
                      }}
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg"
                          style={{
                            backgroundColor: 'var(--wise-primary, #0094FF)',
                            color: 'white',
                          }}
                        >
                          {creator.name.charAt(0)}
                        </div>
                        <div>
                          <h3
                            className="font-bold"
                            style={{
                              color: 'var(--wise-text-primary, #FFFFFF)',
                            }}
                          >
                            {creator.name}
                          </h3>
                          <p
                            className="text-xs"
                            style={{
                              color:
                                creator.status === 'Active'
                                  ? 'var(--wise-success, #22C55E)'
                                  : 'var(--wise-text-muted, #8D98A5)',
                            }}
                          >
                            {creator.status}
                          </p>
                        </div>
                      </div>

                      <p
                        className="text-2xl font-bold mb-2"
                        style={{
                          color: 'var(--wise-primary, #0094FF)',
                        }}
                      >
                        {creator.followers.toLocaleString()}
                      </p>
                      <p
                        className="text-xs tracking-widest uppercase"
                        style={{
                          color: 'var(--wise-text-muted, #8D98A5)',
                          letterSpacing: 'var(--wise-tracking-wider, 0.05em)',
                        }}
                      >
                        Followers
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Achievements Tab */}
            {activeTab === 'achievements' && (
              <div className="space-y-6">
                <h2
                  className="text-2xl font-bold tracking-wider uppercase"
                  style={{
                    color: 'var(--wise-text-primary, #FFFFFF)',
                    letterSpacing: 'var(--wise-tracking-wider, 0.05em)',
                  }}
                >
                  Achievements
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {achievementsData.map((achievement, i) => {
                    let rarityColor = 'var(--wise-success, #22C55E)';
                    if (achievement.rarity === 'Uncommon')
                      rarityColor = 'var(--wise-primary, #0094FF)';
                    if (achievement.rarity === 'Rare')
                      rarityColor = 'var(--wise-warning, #F59E0B)';
                    if (achievement.rarity === 'Epic')
                      rarityColor = 'var(--wise-danger, #E53935)';

                    return (
                      <div
                        key={i}
                        className="p-6 rounded-xl border wise-transition hover:scale-105 cursor-pointer"
                        style={{
                          borderColor: 'var(--wise-border-subtle, rgba(255, 255, 255, 0.08))',
                          backgroundColor: 'var(--wise-card, #10151D)',
                        }}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className="p-4 rounded-lg flex-shrink-0"
                            style={{
                              backgroundColor: 'rgba(34, 197, 94, 0.2)',
                              color: 'var(--wise-success, #22C55E)',
                            }}
                          >
                            <Award size={24} />
                          </div>

                          <div className="flex-1">
                            <h3
                              className="font-bold mb-1"
                              style={{
                                color: 'var(--wise-text-primary, #FFFFFF)',
                              }}
                            >
                              {achievement.name}
                            </h3>
                            <p
                              className="text-xs font-bold tracking-wide uppercase"
                              style={{
                                color: rarityColor,
                                letterSpacing: 'var(--wise-tracking-wider, 0.05em)',
                              }}
                            >
                              {achievement.rarity}
                            </p>
                            <p
                              className="text-xs mt-2"
                              style={{
                                color: 'var(--wise-text-muted, #8D98A5)',
                              }}
                            >
                              {achievement.users} creators earned
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
