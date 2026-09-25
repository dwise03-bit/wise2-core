'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import {
  TrendingUp,
  TrendingDown,
  Plus,
  MessageSquare,
  Eye,
  EyeOff,
  Settings,
  BarChart3,
  Zap,
  BookOpen,
  Disc3,
  LogOut,
  Home,
  TrendingUpIcon,
  AlertCircle,
  MoreHorizontal,
  ChevronUp,
  ChevronDown,
  Bell,
  Search,
  User,
  Grid,
  LineChart,
  Layers,
  Radio,
  Users,
  Heart,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import MarketChart from './MarketChart';

// Design Tokens
const COLORS = {
  bg: { primary: '#050607', secondary: '#0b0d1c', surface: '#101329', raised: '#151829' },
  electric: { blue: '#0048FF', cyan: '#00D9FF' },
  status: { positive: '#00FF7F', negative: '#FF0055' },
  accent: { gold: '#C4A369', purple: '#8B5CF6' },
  text: { primary: '#FFFFFF', secondary: '#A0A0A8', muted: '#606068' },
};

interface NavItemProps { icon: React.ReactNode; label: string; active: boolean; onClick: () => void; }

function NavItem({ icon, label, active, onClick }: NavItemProps) {
  return (
    <motion.button
      whileHover={{ x: 4 }}
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium ${
        active
          ? 'bg-[#00D9FF]/20 border border-[#00D9FF]/50 text-[#00D9FF] shadow-lg shadow-[#00D9FF]/20'
          : 'text-gray-400 hover:text-[#00D9FF] hover:bg-[#00D9FF]/10'
      }`}
    >
      {icon}
      <span>{label}</span>
    </motion.button>
  );
}

function MarketTickerBar() {
  const markets = [
    { symbol: 'S&P 500', price: 5732.18, change: 14.25, percent: 0.25 },
    { symbol: 'NASDAQ', price: 18402.71, change: 113, percent: 0.62 },
    { symbol: 'DOW', price: 41241.63, change: 340, percent: 0.83 },
    { symbol: 'BTC', price: 62481.20, change: 1280, percent: 2.1 },
    { symbol: 'ETH', price: 2438.17, change: 65, percent: 2.7 },
  ];

  return (
    <div className="bg-[#050607] border-b border-[#00D9FF]/20 px-6 py-3 flex gap-8 overflow-x-auto">
      {markets.map((m, i) => (
        <div key={i} className="flex items-center gap-3 flex-shrink-0">
          <span className="text-xs font-bold text-[#00D9FF] uppercase">{m.symbol}</span>
          <span className="text-sm font-mono font-semibold text-white">${m.price.toFixed(2)}</span>
          <span className={`text-xs font-mono ${m.change >= 0 ? 'text-[#00FF7F]' : 'text-[#FF0055]'}`}>
            {m.change >= 0 ? '▲' : '▼'} {Math.abs(m.change).toFixed(2)}
          </span>
          <span className={`text-xs font-mono ${m.percent >= 0 ? 'text-[#00FF7F]' : 'text-[#FF0055]'}`}>
            {m.percent >= 0 ? '+' : ''}{m.percent.toFixed(2)}%
          </span>
        </div>
      ))}
    </div>
  );
}

function InsightCard({ title, icon, content, color = '#00D9FF' }: any) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-[#0b0d1c] border border-[#00D9FF]/20 rounded-lg p-4 hover:border-[#00D9FF]/50 transition cursor-pointer"
      style={{ borderColor: `${color}33` }}
    >
      <div className="flex items-start gap-2 mb-2">
        <div style={{ color }}>{icon}</div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-200">{title}</h4>
      </div>
      <p className="text-sm text-gray-300">{content}</p>
      <p className="text-xs text-gray-500 mt-2">5m ago</p>
    </motion.div>
  );
}

export default function TradingDashboard() {
  // ===== ALL HOOKS MUST BE CALLED UNCONDITIONALLY AT THE TOP =====
  const { user, token, isAuthenticated, isLoading, logout } = useAuth();

  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSD');
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [chartInterval, setChartInterval] = useState('1D');

  const [watchlist] = useState([
    { symbol: 'BTCUSD', price: 43200, change: 700, changePercent: 1.65, watched: true },
    { symbol: 'ETHUSD', price: 2250, change: 45, changePercent: 2.0, watched: true },
    { symbol: 'AAPL', price: 225, change: 2, changePercent: 0.9, watched: false },
    { symbol: 'MSFT', price: 380, change: -5, changePercent: -1.3, watched: false },
  ]);

  const [marketData] = useState({
    symbol: 'BTCUSD',
    lastPrice: 43200,
    change: 700,
    changePercent: 1.65,
    high: 43500,
    low: 42800,
    volume: 24500000,
    regime: 'TRENDING_UP',
    setups: 2,
  });

  const chartData = [
    { time: '2024-01-01', open: 40000, high: 41000, low: 39500, close: 40500, volume: 2000000 },
    { time: '2024-01-02', open: 40500, high: 41500, low: 40000, close: 41200, volume: 2100000 },
    { time: '2024-01-03', open: 41200, high: 42000, low: 40800, close: 41800, volume: 2200000 },
    { time: '2024-01-04', open: 41800, high: 42500, low: 41500, close: 42100, volume: 2300000 },
    { time: '2024-01-05', open: 42100, high: 43200, low: 42000, close: 43200, volume: 2400000 },
  ];

  // Only effect - redirect on auth change
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = '/auth/signin';
    }
  }, [isAuthenticated, isLoading]);

  // ===== EARLY RETURNS ONLY AFTER ALL HOOKS =====
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050607] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // ===== NOW RENDER THE DASHBOARD =====
  return (
    <div className="flex flex-col h-screen bg-[#050607] text-white">
      <MarketTickerBar />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-64 border-r border-[#00D9FF]/20 bg-[#0b0d1c] p-6 overflow-y-auto">
          <div className="mb-8 rounded-xl border border-[#00D9FF]/20 bg-[#07111f] p-3">
            <Image src="/trading/sjs-logo.png" alt="SJS Trading" width={210} height={92} className="h-auto w-full" priority />
            <p className="mt-2 text-[10px] uppercase tracking-[.18em] text-[#27d7ff]">WISE² market partner</p>
          </div>

          <nav className="space-y-1 mb-8">
            <NavItem icon={<Home size={18} />} label="Dashboard" active={activeNav === 'dashboard'} onClick={() => setActiveNav('dashboard')} />
            <NavItem icon={<TrendingUp size={18} />} label="Markets" active={activeNav === 'markets'} onClick={() => setActiveNav('markets')} />
            <NavItem icon={<LineChart size={18} />} label="Charts" active={activeNav === 'charts'} onClick={() => setActiveNav('charts')} />
            <NavItem icon={<Heart size={18} />} label="Watchlist" active={activeNav === 'watchlist'} onClick={() => setActiveNav('watchlist')} />
            <NavItem icon={<MessageSquare size={18} />} label="AI Assistant" active={activeNav === 'ai-assistant'} onClick={() => setActiveNav('ai-assistant')} />
            <NavItem icon={<Zap size={18} />} label="Trade Lab" active={activeNav === 'trade-lab'} onClick={() => setActiveNav('trade-lab')} />
            <NavItem icon={<BookOpen size={18} />} label="Learn" active={activeNav === 'learn'} onClick={() => setActiveNav('learn')} />
            <NavItem icon={<Grid size={18} />} label="Scanner" active={activeNav === 'scanner'} onClick={() => setActiveNav('scanner')} />
            <NavItem icon={<Layers size={18} />} label="Options" active={activeNav === 'options'} onClick={() => setActiveNav('options')} />
            <NavItem icon={<Radio size={18} />} label="News" active={activeNav === 'news'} onClick={() => setActiveNav('news')} />
            <NavItem icon={<BookOpen size={18} />} label="Journal" active={activeNav === 'journal'} onClick={() => setActiveNav('journal')} />
            <NavItem icon={<Bell size={18} />} label="Alerts" active={activeNav === 'alerts'} onClick={() => setActiveNav('alerts')} />
            <NavItem icon={<Users size={18} />} label="Community" active={activeNav === 'community'} onClick={() => setActiveNav('community')} />
            <NavItem icon={<Settings size={18} />} label="Settings" active={activeNav === 'settings'} onClick={() => setActiveNav('settings')} />
          </nav>

          <div className="pt-6 border-t border-[#00D9FF]/20">
            {user && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Logged in as</p>
                <p className="text-sm font-mono text-[#00D9FF] truncate">{user.email}</p>
              </div>
            )}
            <button
              onClick={logout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-all text-sm font-semibold border border-transparent"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Search Bar */}
          <div className="bg-[#050607] border-b border-[#00D9FF]/20 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 bg-[#0b0d1c] border border-[#00D9FF]/20 rounded px-3 py-2 w-80">
              <Search size={16} className="text-[#00D9FF]/60" />
              <input
                type="text"
                placeholder="Search any stock, crypto, or ETF..."
                className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none"
              />
            </div>
            <div className="flex items-center gap-3">
              <motion.button whileHover={{ scale: 1.05 }} className="p-2 hover:bg-[#0b0d1c] rounded transition text-[#00D9FF]">
                <Bell size={18} />
              </motion.button>
              <motion.button whileHover={{ scale: 1.05 }} className="p-2 hover:bg-[#0b0d1c] rounded transition text-[#C4A369]">
                <User size={18} />
              </motion.button>
            </div>
          </div>

          {/* Content Grid */}
          <div className="flex-1 overflow-auto bg-[#050607]">
            <div className="p-6 grid grid-cols-12 gap-6">
              {/* Left Column - Main Chart */}
              <div className="col-span-9 space-y-6">
                <div className="bg-[#0b0d1c] border border-[#00D9FF]/20 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-3xl font-bold mb-1">{selectedSymbol}</h2>
                      <p className="text-sm text-gray-400">Apple Inc.</p>
                      <div className="flex items-center gap-4 mt-3">
                        <span className="text-2xl font-bold text-white">$179.32</span>
                        <span className="text-[#00FF7F] font-semibold">+2.18 (+1.23%)</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {['1D', '5D', '1M', '3M', '6M', '1Y', '5Y'].map(interval => (
                        <button
                          key={interval}
                          onClick={() => setChartInterval(interval)}
                          className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                            chartInterval === interval
                              ? 'bg-[#00D9FF]/30 border border-[#00D9FF] text-[#00D9FF]'
                              : 'text-gray-400 hover:text-[#00D9FF]'
                          }`}
                        >
                          {interval}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="bg-[#050607] rounded h-64 border border-[#00D9FF]/10 flex items-center justify-center mb-4">
                    <div className="text-center">
                      <LineChart size={48} className="text-[#00D9FF]/30 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Live chart - Connect TradingView API</p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap text-xs">
                    {['Volume', 'RSI', 'MACD', 'EMA', 'Bollinger Bands', 'VWAP'].map(tool => (
                      <span key={tool} className="px-3 py-1 bg-[#00D9FF]/10 border border-[#00D9FF]/20 rounded text-gray-300">{tool}</span>
                    ))}
                  </div>
                </div>

                {/* Candlestick Guide */}
                <div className="bg-[#0b0d1c] border border-[#00D9FF]/20 rounded-lg p-6">
                  <h3 className="text-lg font-bold mb-4 uppercase tracking-wider">CANDLESTICK GUIDE - EASY TO READ, EASY TO TRADE</h3>
                  <div className="grid grid-cols-4 gap-4">
                    {[
                      { title: 'GREEN CANDLE', desc: 'Price closed above open. Buying pressure during that period.', color: '#00FF7F' },
                      { title: 'RED CANDLE', desc: 'Price closed below open. Selling pressure during that period.', color: '#FF0055' },
                      { title: 'DOJI', desc: 'Open and close were close together. Possible indecision.', color: '#C4A369' },
                      { title: 'LONG WICKS', desc: 'Price moved strongly but retreated. Possible rejection/volatility.', color: '#00D9FF' },
                    ].map((guide, i) => (
                      <div key={i} className="bg-[#050607] border border-[#00D9FF]/10 rounded p-3">
                        <div className="h-12 rounded mb-3 border-l-4" style={{ borderLeftColor: guide.color }}></div>
                        <h4 className="font-bold text-xs text-gray-300 mb-1">{guide.title}</h4>
                        <p className="text-xs text-gray-500">{guide.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Watchlist */}
                <div className="bg-[#0b0d1c] border border-[#00D9FF]/20 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold uppercase tracking-wider">WATCHLIST</h3>
                    <button className="p-1 hover:bg-[#00D9FF]/10 rounded text-[#00D9FF]"><Plus size={18} /></button>
                  </div>
                  <div className="space-y-2">
                    {watchlist.map((w, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-[#050607] rounded hover:bg-[#0a0f1a] transition">
                        <span className="font-mono font-semibold">{w.symbol}</span>
                        <span className="text-sm">${w.price.toFixed(2)}</span>
                        <span className={`text-sm font-mono ${w.changePercent >= 0 ? 'text-[#00FF7F]' : 'text-[#FF0055]'}`}>
                          {w.changePercent >= 0 ? '+' : ''}{w.changePercent.toFixed(2)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - PLOT & Insights */}
              <div className="col-span-3 space-y-6 overflow-y-auto">
                {/* PLOT AI */}
                <div className="bg-gradient-to-br from-[#0b0d1c] to-[#050607] border border-[#C4A369]/30 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Image src="/trading/plot-ai-avatar.png" alt="PLOT AI" width={48} height={48} className="h-10 w-10 rounded-full border border-[#27d7ff]/50 object-cover" />
                    <div>
                      <h3 className="font-bold uppercase tracking-wider text-sm">PLOT</h3>
                      <p className="text-xs text-gray-500">AI TRADING ASSISTANT</p>
                    </div>
                    <span className="ml-auto w-2 h-2 rounded-full bg-[#00FF7F]"></span>
                  </div>
                  <p className="text-sm text-gray-300 mb-4">
                    I'm PLOT — your WISE² Intelligent Market Partner. I break down charts, explain the why, and help you understand opportunities in plain English.
                  </p>
                  <input
                    type="text"
                    placeholder="Ask me anything about a stock, crypto, or ETF..."
                    className="w-full bg-[#050607] border border-[#C4A369]/30 rounded px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-[#C4A369]/60 mb-3"
                    onClick={() => setIsAssistantOpen(true)}
                  />
                  <div className="space-y-2 text-xs">
                    {['Explain this chart', 'What is this pattern?', 'Show support & resistance', 'Summarize news'].map((action, i) => (
                      <button key={i} onClick={() => setIsAssistantOpen(true)} className="w-full text-left px-3 py-2 bg-[#050607] hover:bg-[#0a0f1a] rounded border border-[#00D9FF]/20 text-gray-300 transition">
                        {action}
                      </button>
                    ))}
                  </div>
                </div>

                {/* WISE² Connect */}
                <div className="rounded-lg border border-[#168fff]/30 bg-[#07111f] p-5">
                  <div className="flex items-center gap-3">
                    <Image src="/trading/wise2-connect-avatar.png" alt="WISE² Connect" width={44} height={44} className="h-11 w-11 rounded-lg border border-[#168fff]/40 object-cover" />
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider">WISE² Connect</h3>
                      <p className="text-xs text-gray-500">People, calls, and client context</p>
                    </div>
                    <span className="ml-auto flex items-center gap-1 text-[10px] font-bold uppercase text-[#00FF7F]"><span className="h-2 w-2 rounded-full bg-[#00FF7F]" /> Online</span>
                  </div>
                  <button className="mt-4 w-full rounded-md border border-[#168fff]/40 bg-[#0a2742] px-3 py-2 text-xs font-bold text-[#b8eaff] transition hover:border-[#27d7ff]">Open Connect</button>
                </div>

                {/* Insights */}
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider mb-3">PLOT INSIGHTS</h3>
                  <div className="space-y-3">
                    <InsightCard title="Bullish Signal" icon={<ChevronUp size={16} className="text-[#00FF7F]" />} content="AAPL breaking above key resistance at $179. Watch for continuation." color="#00FF7F" />
                    <InsightCard title="Pattern Detected" icon={<Grid size={16} className="text-[#00D9FF]" />} content="Clean higher low. Trend remains strong on 1H." color="#00D9FF" />
                    <InsightCard title="Learn Moment" icon={<BookOpen size={16} className="text-[#8B5CF6]" />} content="This is a bull flag pattern. Want to learn?" color="#8B5CF6" />
                    <InsightCard title="Opportunity" icon={<TrendingUp size={16} className="text-[#C4A369]" />} content="$178.50 - $179.00 (not financial advice)." color="#C4A369" />
                  </div>
                </div>

                {/* News */}
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider mb-3">MARKET NEWS</h3>
                  <div className="space-y-2">
                    {[
                      { title: 'Apple Expands U.S. Manufacturing Plans', time: '5m ago' },
                      { title: 'Fed Signals Caution on Rate Cuts', time: '2h ago' },
                      { title: 'NVIDIA Hits New 52-Week High', time: '3h ago' },
                    ].map((news, i) => (
                      <div key={i} className="bg-[#0b0d1c] border border-[#00D9FF]/20 rounded p-3 text-xs hover:border-[#00D9FF]/50 transition cursor-pointer">
                        <p className="font-semibold text-gray-200 mb-1">{news.title}</p>
                        <p className="text-gray-500 text-xs">{news.time} | MarketWatch</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border border-[#8B5CF6]/30 bg-[#0b0d1c] p-4">
                  <div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-bold uppercase tracking-wider">RECENT JOURNAL</h3><span className="text-[10px] text-[#27d7ff]">VIEW ALL</span></div>
                  <Image src="/trading/recent-journal-chart.png" alt="Recent journal chart" width={520} height={220} className="h-28 w-full rounded-md border border-white/10 object-cover" />
                  <p className="mt-3 text-xs text-gray-400">AAPL long · thesis saved with risk plan.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

