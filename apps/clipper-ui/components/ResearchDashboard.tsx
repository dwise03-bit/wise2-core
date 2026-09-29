'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface Creator {
  id: string;
  name: string;
  handle: string;
  clippingScore?: number;
  trendingScore?: number;
  followerCount?: number;
  platforms?: string[];
}

interface ScheduledClip {
  id: string;
  title?: string;
  sourcePlatform: string;
  clipPotentialScore?: number;
  status: string;
  scheduledFor: string;
  publishTo?: string[];
}

interface ResearchJob {
  status: string;
  creatorsFound: number;
  clipsScheduled: number;
  topCreators: Creator[];
}

// Animated Counter Component
const AnimatedCounter = ({ value, duration = 2000 }: { value: number; duration?: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = value / (duration / 16);
    const interval = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(interval);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(interval);
  }, [value, duration]);

  return <span>{count.toLocaleString()}</span>;
};

// Animated Progress Bar Component
const AnimatedProgressBar = ({ value, color = 'bg-wise-cyan' }: { value: number; color?: string }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setDisplayValue(value), 100);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div className="w-full bg-wise-navy/50 rounded-full h-2.5 overflow-hidden">
      <div
        className={`${color} h-2.5 rounded-full transition-all duration-500 ease-out`}
        style={{ width: `${displayValue}%` }}
      >
        <div className="h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
      </div>
    </div>
  );
};

// Skeleton Loader Component
const SkeletonCard = () => (
  <div className="bg-wise-navy/40 border border-wise-cyan/10 rounded-lg p-4 animate-pulse">
    <div className="h-4 bg-wise-cyan/20 rounded w-3/4 mb-4" />
    <div className="h-3 bg-wise-cyan/15 rounded w-1/2 mb-3" />
    <div className="space-y-2">
      <div className="h-2 bg-wise-cyan/15 rounded w-full" />
      <div className="h-2 bg-wise-cyan/15 rounded w-4/5" />
    </div>
  </div>
);

// Animated Status Badge Component
const StatusBadge = ({ status, count }: { status: string; count: number }) => {
  const statusConfig = {
    SCHEDULED: { label: 'Ready to Extract', color: 'text-wise-cyan', bgColor: 'bg-wise-cyan/20', icon: '📋' },
    PROCESSING: { label: 'Currently Extracting', color: 'text-wise-neon', bgColor: 'bg-wise-neon/20', icon: '⚙️' },
    EXTRACTED: { label: 'Ready to Publish', color: 'text-wise-gold', bgColor: 'bg-wise-gold/20', icon: '✨' },
    PUBLISHED: { label: 'Published to Platforms', color: 'text-green-400', bgColor: 'bg-green-400/20', icon: '🎉' },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.SCHEDULED;

  return (
    <div className={`${config.bgColor} border border-current rounded-lg p-4 transition-all duration-300 hover:shadow-lg hover:shadow-wise-cyan/20 transform hover:scale-102`}>
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg animate-bounce">{config.icon}</span>
            <h3 className={`font-bold ${config.color}`}>{config.label}</h3>
          </div>
          <p className={`text-sm ${config.color}/60`}>Last updated: 5 minutes ago</p>
        </div>
        <div className="text-right">
          <p className={`text-3xl font-bold ${config.color}`}>
            <AnimatedCounter value={count} />
          </p>
          <p className={`text-xs ${config.color}/60`}>clips</p>
        </div>
      </div>
    </div>
  );
};

// Metric Card Component
const MetricCard = ({ label, value, icon, color }: { label: string; value: number | string; icon: string; color: string }) => (
  <div className={`group bg-gradient-to-br from-${color}/10 to-${color}/5 border border-${color}/20 rounded-xl p-6 transition-all duration-300 hover:border-${color}/40 hover:shadow-lg cursor-default transform hover:scale-102`}>
    <div className="flex items-start justify-between mb-4">
      <div>
        <p className={`text-${color}/60 text-sm font-medium mb-2`}>{label}</p>
        {typeof value === 'number' ? (
          <p className={`text-4xl font-bold text-${color}`}>
            <AnimatedCounter value={value} />
          </p>
        ) : (
          <p className={`text-4xl font-bold text-${color}`}>{value}</p>
        )}
      </div>
      <span className="text-3xl opacity-60 group-hover:opacity-100 transition-opacity">{icon}</span>
    </div>
    <div className="h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-full" />
  </div>
);

export default function ResearchDashboard() {
  const [activeTab, setActiveTab] = useState<'trending' | 'scheduled' | 'research'>('trending');
  const [trendingCreators, setTrendingCreators] = useState<Creator[]>([]);
  const [scheduledClips, setScheduledClips] = useState<ScheduledClip[]>([]);
  const [researchJob, setResearchJob] = useState<ResearchJob | null>(null);
  const [loading, setLoading] = useState(false);
  const [jobRunning, setJobRunning] = useState(false);
  const [hoveredCreator, setHoveredCreator] = useState<string | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.wise2.net';

  useEffect(() => {
    fetchTrendingCreators();
    fetchScheduledClips();
    fetchResearchStats();
  }, []);

  const fetchTrendingCreators = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/api/v1/research/creators/trending?limit=20`);
      setTrendingCreators(response.data || []);
    } catch (error) {
      console.error('Failed to fetch trending creators:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchScheduledClips = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/v1/research/scheduled-stats`);
      if (response.data?.byStatus) {
        setScheduledClips(Object.entries(response.data.byStatus).map(([status, count]) => ({
          id: status,
          status,
          sourcePlatform: 'MIXED',
          clipPotentialScore: Math.random() * 100,
          scheduledFor: new Date().toISOString(),
          publishTo: [],
        })));
      }
    } catch (error) {
      console.error('Failed to fetch scheduled clips:', error);
    }
  };

  const fetchResearchStats = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/v1/research/trends`);
      setResearchJob(response.data as ResearchJob);
    } catch (error) {
      console.error('Failed to fetch research stats:', error);
    }
  };

  const runDailyResearch = async () => {
    setJobRunning(true);
    try {
      const response = await axios.post(`${API_BASE}/api/v1/research/daily`);
      setResearchJob(response.data);
      await fetchTrendingCreators();
      await fetchScheduledClips();
    } catch (error) {
      console.error('Failed to run research:', error);
    } finally {
      setJobRunning(false);
    }
  };

  const processScheduledClips = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/api/v1/research/process-scheduled`);
      alert(`Processed ${response.data?.processed || 0} clips`);
      await fetchScheduledClips();
    } catch (error) {
      console.error('Failed to process clips:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-wise-navy via-wise-navy to-black">
      {/* Enhanced Header */}
      <header className="border-b border-wise-cyan/20 bg-gradient-to-r from-wise-navy/95 to-wise-navy/80 backdrop-blur-xl sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-3xl animate-pulse">🤖</span>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-wise-cyan to-wise-neon bg-clip-text text-transparent">
                  Research Dashboard
                </h1>
              </div>
              <p className="text-wise-cyan/60 text-sm sm:text-base">AI-powered creator discovery & automatic clipping</p>
            </div>
            <button
              onClick={runDailyResearch}
              disabled={jobRunning}
              className={`group relative px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 whitespace-nowrap ${
                jobRunning
                  ? 'bg-wise-cyan/40 cursor-not-allowed'
                  : 'bg-gradient-to-r from-wise-cyan to-wise-neon text-wise-navy hover:shadow-lg hover:shadow-wise-cyan/50'
              }`}
            >
              <span className="relative flex items-center gap-2">
                {jobRunning ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Running...
                  </>
                ) : (
                  <>
                    <span className="group-hover:translate-x-1 transition-transform">▶️</span>
                    Run Research
                  </>
                )}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <MetricCard
            label="Creators Discovered"
            value={researchJob?.creatorsFound || 0}
            icon="🎯"
            color="wise-cyan"
          />
          <MetricCard
            label="Clips Scheduled"
            value={researchJob?.clipsScheduled || 0}
            icon="📊"
            color="wise-neon"
          />
          <div className="bg-gradient-to-br from-wise-gold/10 to-wise-gold/5 border border-wise-gold/20 rounded-xl p-6 transition-all duration-300 hover:border-wise-gold/40 hover:shadow-lg transform hover:scale-102">
            <p className="text-wise-gold/60 text-sm font-medium mb-4">Processing Control</p>
            <button
              onClick={processScheduledClips}
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 ${
                loading
                  ? 'bg-wise-gold/40 cursor-not-allowed'
                  : 'bg-gradient-to-r from-wise-gold to-wise-gold/80 text-wise-navy hover:shadow-lg hover:shadow-wise-gold/50'
              }`}
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Processing...
                </>
              ) : (
                <>
                  <span>⚙️</span>
                  Process Clips
                </>
              )}
            </button>
          </div>
        </div>

        {/* Enhanced Tabs with Animation */}
        <div className="mb-8 border-b border-wise-cyan/20 backdrop-blur-sm">
          <div className="flex gap-1 sm:gap-4 overflow-x-auto scrollbar-hide">
            {[
              { id: 'trending' as const, label: '📈 Trending Creators', icon: '📈' },
              { id: 'scheduled' as const, label: '⏱️ Scheduled Clips', icon: '⏱️' },
              { id: 'research' as const, label: '🔍 Research Trends', icon: '🔍' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-4 sm:px-6 py-3 sm:py-4 font-semibold text-sm sm:text-base whitespace-nowrap transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'text-wise-cyan'
                    : 'text-wise-cyan/60 hover:text-wise-cyan/80'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-wise-cyan via-wise-neon to-wise-cyan animate-pulse" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Trending Creators Tab */}
        {activeTab === 'trending' && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-wise-navy/40 border border-wise-cyan/10 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              ) : trendingCreators.length === 0 ? (
                <div className="text-center py-12 sm:py-16">
                  <p className="text-wise-cyan/60 mb-6 text-lg">No creators discovered yet</p>
                  <button
                    onClick={runDailyResearch}
                    className="px-8 py-3 bg-gradient-to-r from-wise-cyan to-wise-neon text-wise-navy rounded-lg font-semibold hover:shadow-lg hover:shadow-wise-cyan/50 transition-all transform hover:scale-105"
                  >
                    🔍 Start Discovery
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {trendingCreators.map((creator, idx) => (
                    <div
                      key={creator.id}
                      onMouseEnter={() => setHoveredCreator(creator.id)}
                      onMouseLeave={() => setHoveredCreator(null)}
                      className="group bg-gradient-to-br from-wise-navy/60 to-wise-navy/30 border border-wise-cyan/20 rounded-xl p-5 sm:p-6 hover:border-wise-cyan/40 transition-all duration-300 transform hover:scale-102 hover:shadow-lg hover:shadow-wise-cyan/20 cursor-default"
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-wise-cyan text-lg group-hover:text-wise-neon transition-colors">{creator.name}</h3>
                          <p className="text-sm text-wise-cyan/60">@{creator.handle}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-wise-gold font-bold">
                            {creator.followerCount?.toLocaleString() || 'N/A'}
                          </p>
                          <p className="text-xs text-wise-gold/60">followers</p>
                        </div>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div>
                          <div className="flex justify-between text-xs mb-2">
                            <span className="text-wise-cyan font-medium">Clipping Score</span>
                            <span className="text-wise-cyan font-bold">{Math.round(creator.clippingScore || 0)}/100</span>
                          </div>
                          <AnimatedProgressBar value={creator.clippingScore || 0} color="bg-wise-cyan" />
                        </div>

                        <div>
                          <div className="flex justify-between text-xs mb-2">
                            <span className="text-wise-neon font-medium">Trending Score</span>
                            <span className="text-wise-neon font-bold">{Math.round(creator.trendingScore || 0)}/100</span>
                          </div>
                          <AnimatedProgressBar value={creator.trendingScore || 0} color="bg-wise-neon" />
                        </div>
                      </div>

                      <div className="flex gap-2 mb-4 flex-wrap">
                        {creator.platforms?.map((platform) => (
                          <span
                            key={platform}
                            className="text-xs bg-wise-cyan/20 text-wise-cyan px-2.5 py-1 rounded-full font-medium hover:bg-wise-cyan/30 transition-colors"
                          >
                            {platform}
                          </span>
                        ))}
                      </div>

                      <button className="w-full py-2.5 px-4 bg-gradient-to-r from-wise-cyan/20 to-wise-neon/20 text-wise-cyan border border-wise-cyan/40 rounded-lg hover:from-wise-cyan/30 hover:to-wise-neon/30 transition-all duration-300 text-sm font-semibold transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
                        <span>📺</span>
                        Schedule Clips
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Scheduled Clips Tab */}
        {activeTab === 'scheduled' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-wise-navy/40 border border-wise-neon/10 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
              <h2 className="text-2xl sm:text-3xl font-bold text-wise-neon mb-8 flex items-center gap-2">
                <span>⏱️</span>
                Scheduled Extraction Jobs
              </h2>
              <div className="space-y-3">
                {[
                  { status: 'SCHEDULED', count: 12 },
                  { status: 'PROCESSING', count: 3 },
                  { status: 'EXTRACTED', count: 8 },
                  { status: 'PUBLISHED', count: 45 },
                ].map((item) => (
                  <StatusBadge key={item.status} status={item.status} count={item.count} />
                ))}
              </div>
            </div>

            <div className="bg-wise-cyan/10 border border-wise-cyan/20 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
              <h3 className="font-bold text-wise-cyan mb-6 text-xl flex items-center gap-2">
                <span className="animate-bounce">🎬</span>
                Sample Scheduled Clips
              </h3>
              <div className="space-y-3">
                {[
                  { title: 'Tech Creator - AI Breakthrough', platform: 'YOUTUBE', duration: '45s', score: 85 },
                  { title: 'Business Insights - Market Analysis', platform: 'TWITCH', duration: '60s', score: 78 },
                  { title: 'Growth Strategy - Viral Moment', platform: 'YOUTUBE', duration: '30s', score: 92 },
                ].map((clip, i) => (
                  <div
                    key={i}
                    className="group bg-gradient-to-r from-wise-navy/40 to-wise-navy/20 border border-wise-cyan/20 rounded-xl p-4 sm:p-5 hover:border-wise-cyan/40 transition-all duration-300 hover:shadow-lg hover:shadow-wise-cyan/20 transform hover:scale-102 cursor-default"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <p className="font-semibold text-wise-cyan group-hover:text-wise-neon transition-colors">{clip.title}</p>
                        <p className="text-xs text-wise-cyan/60 mt-2">
                          <span className="inline-block">📍 {clip.platform}</span>
                          <span className="mx-2">•</span>
                          <span className="inline-block">⏱️ {clip.duration}</span>
                          <span className="mx-2">•</span>
                          <span className="inline-block font-bold text-wise-neon">✨ {clip.score}/100</span>
                        </p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button className="px-3 py-1.5 text-xs bg-gradient-to-r from-wise-neon to-wise-neon/80 text-wise-navy rounded-lg hover:shadow-lg hover:shadow-wise-neon/50 transition-all transform hover:scale-105 active:scale-95 font-semibold">
                          Extract
                        </button>
                        <button className="px-3 py-1.5 text-xs bg-wise-cyan/20 text-wise-cyan rounded-lg hover:bg-wise-cyan/30 transition-all transform hover:scale-105 active:scale-95 font-semibold border border-wise-cyan/30">
                          Reschedule
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Research Trends Tab */}
        {activeTab === 'research' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-wise-navy/40 border border-wise-gold/10 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
              <h2 className="text-2xl sm:text-3xl font-bold text-wise-gold mb-8 flex items-center gap-2">
                <span>📊</span>
                Trending Topics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { topic: 'AI Breakthroughs', volume: 10000, relevance: 0.95, trending: '↑ +45%' },
                  { topic: 'Web3 & Crypto', volume: 5000, relevance: 0.7, trending: '↓ -12%' },
                  { topic: 'Tech Layoffs', volume: 8000, relevance: 0.85, trending: '↑ +23%' },
                  { topic: 'Remote Work', volume: 4200, relevance: 0.68, trending: '→ +2%' },
                  { topic: 'Startup News', volume: 6800, relevance: 0.79, trending: '↑ +18%' },
                  { topic: 'SaaS Growth', volume: 5500, relevance: 0.82, trending: '↑ +31%' },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="group bg-gradient-to-br from-wise-navy/40 to-wise-navy/20 border border-wise-gold/20 rounded-xl p-5 sm:p-6 hover:border-wise-gold/40 transition-all duration-300 transform hover:scale-102 hover:shadow-lg hover:shadow-wise-gold/20"
                  >
                    <h3 className="font-bold text-wise-gold mb-4 text-lg group-hover:text-wise-neon transition-colors">{item.topic}</h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="text-wise-gold/60 font-medium mb-1">Search Volume</p>
                        <p className="text-wise-gold font-bold text-lg">{item.volume.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-wise-gold/60 font-medium mb-2">Relevance Score</p>
                        <AnimatedProgressBar value={item.relevance * 100} color="bg-wise-gold" />
                        <p className="text-wise-gold font-bold mt-2">{Math.round(item.relevance * 100)}%</p>
                      </div>
                      <div className="pt-3 border-t border-wise-gold/20">
                        <p className={`font-bold ${item.trending.includes('+') ? 'text-wise-neon' : 'text-red-400'}`}>
                          {item.trending}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-wise-neon/10 border border-wise-neon/20 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
              <h3 className="font-bold text-wise-neon mb-6 text-xl flex items-center gap-2">
                <span>🎯</span>
                Top Creators in Trending Topics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    topic: 'AI Breakthroughs',
                    creators: [
                      { name: 'TechCrunch', followers: '450K' },
                      { name: 'AI Research Lab', followers: '280K' },
                      { name: 'OpenAI Updates', followers: '195K' },
                    ],
                  },
                  {
                    topic: 'SaaS Growth',
                    creators: [
                      { name: 'SaaS News Daily', followers: '320K' },
                      { name: 'Growth Hacker Hub', followers: '210K' },
                      { name: 'Startup Insights', followers: '185K' },
                    ],
                  },
                ].map((section, i) => (
                  <div
                    key={i}
                    className="group bg-gradient-to-br from-wise-navy/40 to-wise-navy/20 rounded-xl p-5 sm:p-6 border border-wise-neon/20 hover:border-wise-neon/40 transition-all duration-300 transform hover:scale-102 hover:shadow-lg hover:shadow-wise-neon/20"
                  >
                    <p className="font-bold text-wise-neon mb-4 text-lg group-hover:text-wise-cyan transition-colors">{section.topic}</p>
                    <ul className="space-y-2.5 text-sm">
                      {section.creators.map((creator, idx) => (
                        <li
                          key={idx}
                          className="text-wise-neon/80 hover:text-wise-neon transition-colors flex items-center gap-2 group/item"
                        >
                          <span className="group-hover/item:translate-x-1 transition-transform">→</span>
                          <span>{creator.name}</span>
                          <span className="text-wise-neon/60">({creator.followers})</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Global Styles */}
      <style jsx global>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        /* Smooth transitions for all interactive elements */
        button, [role='button'] {
          transition: all 200ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        /* Glassmorphism effect */
        .backdrop-blur-xl {
          backdrop-filter: blur(20px);
        }

        /* Scale transform utility */
        .scale-102 {
          transform: scale(1.02);
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}
