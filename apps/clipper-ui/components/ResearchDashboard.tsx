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

export default function ResearchDashboard() {
  const [activeTab, setActiveTab] = useState<'trending' | 'scheduled' | 'research'>('trending');
  const [trendingCreators, setTrendingCreators] = useState<Creator[]>([]);
  const [scheduledClips, setScheduledClips] = useState<ScheduledClip[]>([]);
  const [researchJob, setResearchJob] = useState<ResearchJob | null>(null);
  const [loading, setLoading] = useState(false);
  const [jobRunning, setJobRunning] = useState(false);

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
      {/* Header */}
      <header className="border-b border-wise-cyan/20 bg-wise-navy/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-wise-cyan">🤖 Research Dashboard</h1>
              <p className="text-wise-cyan/60 mt-1">AI-powered creator discovery & automatic clipping</p>
            </div>
            <button
              onClick={runDailyResearch}
              disabled={jobRunning}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                jobRunning
                  ? 'bg-wise-cyan/50 cursor-not-allowed'
                  : 'bg-wise-cyan text-wise-navy hover:bg-wise-cyan/80'
              }`}
            >
              {jobRunning ? '⏳ Running...' : '▶️ Run Daily Research'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-wise-cyan/10 border border-wise-cyan/20 rounded-lg p-6">
            <p className="text-wise-cyan/60 text-sm mb-2">Creators Discovered</p>
            <p className="text-3xl font-bold text-wise-cyan">{researchJob?.creatorsFound || 0}</p>
          </div>
          <div className="bg-wise-neon/10 border border-wise-neon/20 rounded-lg p-6">
            <p className="text-wise-neon/60 text-sm mb-2">Clips Scheduled</p>
            <p className="text-3xl font-bold text-wise-neon">{researchJob?.clipsScheduled || 0}</p>
          </div>
          <div className="bg-wise-gold/10 border border-wise-gold/20 rounded-lg p-6">
            <p className="text-wise-gold/60 text-sm mb-2">Processing Status</p>
            <button
              onClick={processScheduledClips}
              disabled={loading}
              className={`w-full py-2 px-4 rounded font-semibold text-sm transition ${
                loading
                  ? 'bg-wise-gold/50 cursor-not-allowed'
                  : 'bg-wise-gold text-wise-navy hover:bg-wise-gold/80'
              }`}
            >
              {loading ? '⏳ Processing...' : '⚙️ Process Clips'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-wise-cyan/20">
          {[
            { id: 'trending' as const, label: '📈 Trending Creators', icon: '📈' },
            { id: 'scheduled' as const, label: '⏱️ Scheduled Clips', icon: '⏱️' },
            { id: 'research' as const, label: '🔍 Research Trends', icon: '🔍' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 font-medium border-b-2 transition ${
                activeTab === tab.id
                  ? 'border-wise-cyan text-wise-cyan'
                  : 'border-transparent text-wise-cyan/60 hover:text-wise-cyan/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Trending Creators Tab */}
        {activeTab === 'trending' && (
          <div className="space-y-4">
            <div className="bg-wise-navy/40 border border-wise-cyan/10 rounded-2xl p-8">
              {loading ? (
                <div className="text-center py-12">
                  <p className="text-wise-cyan/60">⏳ Loading trending creators...</p>
                </div>
              ) : trendingCreators.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-wise-cyan/60 mb-4">No creators discovered yet</p>
                  <button
                    onClick={runDailyResearch}
                    className="px-6 py-2 bg-wise-cyan text-wise-navy rounded-lg font-semibold hover:bg-wise-cyan/80 transition"
                  >
                    🔍 Start Discovery
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {trendingCreators.map((creator) => (
                    <div
                      key={creator.id}
                      className="bg-wise-navy/40 border border-wise-cyan/20 rounded-lg p-4 hover:border-wise-cyan/40 transition"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-wise-cyan">{creator.name}</h3>
                          <p className="text-sm text-wise-cyan/60">@{creator.handle}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-wise-gold font-bold">
                            {creator.followerCount?.toLocaleString() || 'N/A'} followers
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-wise-cyan">Clipping Score</span>
                            <span className="text-wise-cyan/60">{Math.round(creator.clippingScore || 0)}/100</span>
                          </div>
                          <div className="w-full bg-wise-navy/50 rounded-full h-2">
                            <div
                              className="bg-wise-cyan h-2 rounded-full"
                              style={{ width: `${creator.clippingScore || 0}%` }}
                            ></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-wise-neon">Trending Score</span>
                            <span className="text-wise-neon/60">{Math.round(creator.trendingScore || 0)}/100</span>
                          </div>
                          <div className="w-full bg-wise-navy/50 rounded-full h-2">
                            <div
                              className="bg-wise-neon h-2 rounded-full"
                              style={{ width: `${creator.trendingScore || 0}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <span className="text-xs bg-wise-cyan/20 text-wise-cyan px-2 py-1 rounded">
                          {creator.platforms?.join(', ') || 'Unknown'}
                        </span>
                      </div>

                      <button className="w-full mt-3 py-2 bg-wise-cyan/20 text-wise-cyan border border-wise-cyan/40 rounded hover:bg-wise-cyan/30 transition text-sm font-medium">
                        📺 Schedule Clips
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
          <div className="bg-wise-navy/40 border border-wise-neon/10 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-wise-neon mb-6">Scheduled Extraction Jobs</h2>
            <div className="space-y-3">
              {[
                { status: 'SCHEDULED', label: 'Ready to Extract', color: 'text-wise-cyan', bgColor: 'bg-wise-cyan/20', count: 12 },
                { status: 'PROCESSING', label: 'Currently Extracting', color: 'text-wise-neon', bgColor: 'bg-wise-neon/20', count: 3 },
                { status: 'EXTRACTED', label: 'Ready to Publish', color: 'text-wise-gold', bgColor: 'bg-wise-gold/20', count: 8 },
                { status: 'PUBLISHED', label: 'Published to Platforms', color: 'text-green-400', bgColor: 'bg-green-400/20', count: 45 },
              ].map((item) => (
                <div key={item.status} className={`${item.bgColor} border border-current rounded-lg p-4`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className={`font-bold ${item.color}`}>{item.label}</h3>
                      <p className={`text-sm ${item.color}/60`}>Last updated: 5 minutes ago</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-3xl font-bold ${item.color}`}>{item.count}</p>
                      <p className={`text-xs ${item.color}/60`}>clips</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 bg-wise-cyan/10 border border-wise-cyan/20 rounded-lg p-6">
              <h3 className="font-bold text-wise-cyan mb-4">🎬 Sample Scheduled Clips</h3>
              <div className="space-y-3">
                {[
                  { title: 'Tech Creator - AI Breakthrough', platform: 'YOUTUBE', duration: '45s', score: 85 },
                  { title: 'Business Insights - Market Analysis', platform: 'TWITCH', duration: '60s', score: 78 },
                  { title: 'Growth Strategy - Viral Moment', platform: 'YOUTUBE', duration: '30s', score: 92 },
                ].map((clip, i) => (
                  <div key={i} className="bg-wise-navy/40 border border-wise-cyan/20 rounded p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-wise-cyan">{clip.title}</p>
                        <p className="text-xs text-wise-cyan/60 mt-1">
                          From {clip.platform} • {clip.duration} • Score: {clip.score}/100
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button className="px-3 py-1 text-xs bg-wise-neon text-wise-navy rounded hover:bg-wise-neon/80 transition">
                          Extract
                        </button>
                        <button className="px-3 py-1 text-xs bg-wise-cyan/20 text-wise-cyan rounded hover:bg-wise-cyan/30 transition">
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
          <div className="bg-wise-navy/40 border border-wise-gold/10 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-wise-gold mb-6">📊 Trending Topics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { topic: 'AI Breakthroughs', volume: 10000, relevance: 0.95, trending: '↑ +45%' },
                { topic: 'Web3 & Crypto', volume: 5000, relevance: 0.7, trending: '↓ -12%' },
                { topic: 'Tech Layoffs', volume: 8000, relevance: 0.85, trending: '↑ +23%' },
                { topic: 'Remote Work', volume: 4200, relevance: 0.68, trending: '→ +2%' },
                { topic: 'Startup News', volume: 6800, relevance: 0.79, trending: '↑ +18%' },
                { topic: 'SaaS Growth', volume: 5500, relevance: 0.82, trending: '↑ +31%' },
              ].map((item, i) => (
                <div key={i} className="bg-wise-navy/40 border border-wise-gold/20 rounded-lg p-4 hover:border-wise-gold/40 transition">
                  <h3 className="font-bold text-wise-gold mb-2">{item.topic}</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-wise-gold/60">Search Volume</p>
                      <p className="text-wise-gold font-bold">{item.volume.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-wise-gold/60">Relevance Score</p>
                      <div className="w-full bg-wise-navy/50 rounded-full h-2 mt-1">
                        <div
                          className="bg-wise-gold h-2 rounded-full"
                          style={{ width: `${item.relevance * 100}%` }}
                        ></div>
                      </div>
                      <p className="text-wise-gold font-bold mt-1">{Math.round(item.relevance * 100)}%</p>
                    </div>
                    <div className="pt-2 border-t border-wise-gold/20">
                      <p className="text-wise-gold font-bold">{item.trending}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 bg-wise-neon/10 border border-wise-neon/20 rounded-lg p-6">
              <h3 className="font-bold text-wise-neon mb-4">🎯 Top Creators in Trending Topics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-wise-navy/40 rounded p-4">
                  <p className="font-bold text-wise-neon mb-2">AI Breakthroughs</p>
                  <ul className="space-y-2 text-sm">
                    <li className="text-wise-neon/80">• TechCrunch (450K followers)</li>
                    <li className="text-wise-neon/80">• AI Research Lab (280K followers)</li>
                    <li className="text-wise-neon/80">• OpenAI Updates (195K followers)</li>
                  </ul>
                </div>
                <div className="bg-wise-navy/40 rounded p-4">
                  <p className="font-bold text-wise-neon mb-2">SaaS Growth</p>
                  <ul className="space-y-2 text-sm">
                    <li className="text-wise-neon/80">• SaaS News Daily (320K followers)</li>
                    <li className="text-wise-neon/80">• Growth Hacker Hub (210K followers)</li>
                    <li className="text-wise-neon/80">• Startup Insights (185K followers)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
