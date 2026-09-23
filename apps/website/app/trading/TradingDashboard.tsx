'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
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
} from 'lucide-react';
import { useMarketData } from '@/hooks/useMarketData';
import { useTradingViewProfile } from '@/hooks/useTradingViewProfile';
import MarketChart from './MarketChart';
import TradingViewWatchlist from './TradingViewWatchlist';
import TradingViewAlerts from './TradingViewAlerts';
import AITradingAssistant from './AITradingAssistant';
import ScreenRecorder from './ScreenRecorder';

interface Position {
  id: string;
  symbol: string;
  direction: 'LONG' | 'SHORT';
  entryPrice: number;
  quantity: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
  stopPrice: number;
  target: number;
}

interface MarketData {
  symbol: string;
  lastPrice: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  volume: number;
  regime: string;
  setups: number;
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

function NavItem({ icon, label, active, onClick }: NavItemProps) {
  return (
    <motion.button
      whileHover={{ x: 4 }}
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
        active
          ? 'bg-[#00D9FF]/15 border border-[#00D9FF]/40 text-[#00D9FF] font-semibold'
          : 'text-gray-400 hover:text-[#00D9FF] hover:bg-[#00D9FF]/5'
      }`}
    >
      {icon}
      <span className="text-sm">{label}</span>
    </motion.button>
  );
}

export default function TradingDashboard() {
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSD');
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [activeNav, setActiveNav] = useState('command-center');

  // Load user's real TradingView profile and watchlist
  const { watchlist: tvWatchlist, profile, loading } = useTradingViewProfile('dwise03');

  // Connect to WebSocket market data for watchlist symbols
  const symbols = tvWatchlist.map(w => w.symbol).slice(0, 6);
  const { quotes, connected, getPrice } = useMarketData(symbols.length > 0 ? symbols : ['BTCUSD', 'ETHUSD', 'AAPL', 'MSFT']);

  // Watchlist state (synced from TradingView)
  const [watchlist, setWatchlist] = useState<Array<{
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
    watched?: boolean;
  }>>([
    { symbol: 'BTCUSD', price: 43200, change: 700, changePercent: 1.65, watched: true },
    { symbol: 'ETHUSD', price: 2250, change: 45, changePercent: 2.0, watched: true },
    { symbol: 'AAPL', price: 225, change: 2, changePercent: 0.9, watched: false },
    { symbol: 'MSFT', price: 380, change: -5, changePercent: -1.3, watched: false },
  ]);

  // Sync TradingView watchlist with local state (only on mount or when tvWatchlist changes)
  useEffect(() => {
    if (tvWatchlist.length > 0) {
      setWatchlist(
        tvWatchlist.map((item, idx) => ({
          symbol: item.symbol,
          price: getPrice(item.symbol) || (43200 - idx * 1000),
          change: Math.random() * 100,
          changePercent: (Math.random() - 0.5) * 5,
          watched: idx < 2,
        }))
      );
    }
  }, [tvWatchlist.length]);

  // Alerts state
  const [alerts, setAlerts] = useState([
    {
      id: '1',
      symbol: 'BTCUSD',
      type: 'ABOVE' as const,
      price: 45000,
      active: true,
      triggered: false,
    },
    {
      id: '2',
      symbol: 'AAPL',
      type: 'BELOW' as const,
      price: 220,
      active: true,
      triggered: false,
    },
  ]);

  // Positions state
  const [positions, setPositions] = useState<Position[]>([
    {
      id: '1',
      symbol: 'BTCUSD',
      direction: 'LONG',
      entryPrice: 42500,
      quantity: 0.05,
      currentPrice: 43200,
      pnl: 35,
      pnlPercent: 1.64,
      stopPrice: 41500,
      target: 45000,
    },
  ]);

  const [marketData, setMarketData] = useState<MarketData>({
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

  const [chartData, setChartData] = useState<any[]>([
    { time: '2024-01-01', open: 40000, high: 41000, low: 39500, close: 40500, volume: 2000000 },
    { time: '2024-01-02', open: 40500, high: 41500, low: 40000, close: 41200, volume: 2100000 },
    { time: '2024-01-03', open: 41200, high: 42000, low: 40800, close: 41800, volume: 2200000 },
    { time: '2024-01-04', open: 41800, high: 42500, low: 41500, close: 42100, volume: 2300000 },
    { time: '2024-01-05', open: 42100, high: 43200, low: 42000, close: 43200, volume: 2400000 },
  ]);

  const [accountStats, setAccountStats] = useState({
    equity: 10000,
    available: 8650,
    pnl: 350,
    pnlPercent: 3.5,
    riskUsed: 13.5,
  });

  // Update market data from WebSocket quotes
  useEffect(() => {
    const quote = quotes.get(selectedSymbol);
    if (quote) {
      setMarketData(prev => ({
        ...prev,
        symbol: selectedSymbol,
        lastPrice: quote.price,
        change: quote.price - prev.lastPrice,
        changePercent: ((quote.price - prev.lastPrice) / prev.lastPrice) * 100,
        volume: quote.volume,
      }));

      // Update position P&L
      setPositions(prev =>
        prev.map(p => ({
          ...p,
          currentPrice: p.symbol === selectedSymbol ? quote.price : p.currentPrice,
          pnl: (quote.price - p.entryPrice) * p.quantity,
          pnlPercent: ((quote.price - p.entryPrice) / p.entryPrice) * 100,
        }))
      );
    }
  }, [quotes, selectedSymbol]);

  return (
    <div className="flex h-screen bg-[#050607] text-white">
      {/* Sidebar */}
      <div className="w-56 border-r border-[#1f2a38] bg-[#0a0f1a] p-6">
        <div className="mb-8">
          <h1 className="text-lg font-black tracking-tight">
            <span className="text-[#00D9FF]">WISE</span><span className="text-[#00FF7F]">²</span> TRADING
          </h1>
          <p className="text-xs text-[#00D9FF] mt-1 opacity-75">QUANT PLATFORM</p>
        </div>
        <nav className="space-y-2">
          <NavItem
            icon={<BarChart3 size={20} />}
            label="Command Center"
            active={activeNav === 'command-center'}
            onClick={() => setActiveNav('command-center')}
          />
          <NavItem
            icon={<TrendingUp size={20} />}
            label="Markets"
            active={activeNav === 'markets'}
            onClick={() => setActiveNav('markets')}
          />
          <NavItem
            icon={<Zap size={20} />}
            label="Strategy Lab"
            active={activeNav === 'strategy-lab'}
            onClick={() => setActiveNav('strategy-lab')}
          />
          <NavItem
            icon={<BookOpen size={20} />}
            label="Journal"
            active={activeNav === 'journal'}
            onClick={() => setActiveNav('journal')}
          />
          <NavItem
            icon={<Settings size={20} />}
            label="Settings"
            active={activeNav === 'settings'}
            onClick={() => setActiveNav('settings')}
          />
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Top Header - PRODUCTION POLISH */}
        <div className="border-b border-[#1f2a38] bg-[#0a0f1a] px-8 py-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-4xl font-black tracking-tighter mb-1">
                <span className="text-[#00D9FF]">TRADING</span> <span className="text-white">COMMAND CENTER</span>
              </h2>
              <p className="text-sm text-[#00D9FF] opacity-70 font-medium tracking-wide">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 12px rgba(0, 217, 255, 0.3)' }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#00D9FF]/10 border border-[#00D9FF] rounded font-semibold text-[#00D9FF] hover:bg-[#00D9FF]/20 transition-all shadow-lg shadow-[#00D9FF]/5"
              >
                <Disc3 size={18} />
                Record Session
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="p-2.5 hover:bg-[#1f2a38] rounded transition text-[#00D9FF] hover:text-[#00FF7F]"
              >
                <MessageSquare size={20} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="p-2.5 hover:bg-[#1f2a38] rounded transition text-[#C4A369] hover:text-[#00FF7F]"
              >
                <Settings size={20} />
              </motion.button>
            </div>
          </div>

          {/* Account Stats - PRODUCTION POLISH */}
          <div className="grid grid-cols-4 gap-3">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="border border-[#00D9FF]/20 rounded-lg p-4 bg-[#050607] hover:border-[#00D9FF]/40 hover:bg-[#0a0f1a] transition-all group"
            >
              <div className="text-xs font-bold text-[#00D9FF] uppercase tracking-wider mb-2 opacity-75 group-hover:opacity-100">Equity</div>
              <div className="text-3xl font-black text-[#00D9FF]">${accountStats.equity.toLocaleString()}</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="border border-[#C4A369]/20 rounded-lg p-4 bg-[#050607] hover:border-[#C4A369]/40 hover:bg-[#0a0f1a] transition-all group"
            >
              <div className="text-xs font-bold text-[#C4A369] uppercase tracking-wider mb-2 opacity-75 group-hover:opacity-100">Available</div>
              <div className="text-3xl font-black text-[#C4A369]">${accountStats.available.toLocaleString()}</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="border border-[#00FF7F]/20 rounded-lg p-4 bg-[#050607] hover:border-[#00FF7F]/40 hover:bg-[#0a0f1a] transition-all group"
            >
              <div className="text-xs font-bold text-[#00FF7F] uppercase tracking-wider mb-2 opacity-75 group-hover:opacity-100">Day P&L</div>
              <div className="text-3xl font-black text-[#00FF7F]">${accountStats.pnl.toLocaleString()}</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="border border-[#F59E0B]/20 rounded-lg p-4 bg-[#050607] hover:border-[#F59E0B]/40 hover:bg-[#0a0f1a] transition-all group"
            >
              <div className="text-xs font-bold text-[#F59E0B] uppercase tracking-wider mb-2 opacity-75 group-hover:opacity-100">Risk Used</div>
              <div className="text-3xl font-black text-[#F59E0B]">{accountStats.riskUsed.toFixed(1)}%</div>
            </motion.div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="p-8">
          <div className="grid grid-cols-3 gap-6">
            {/* Main Chart Section */}
            <div className="col-span-2 space-y-4">
              {/* Chart Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="border border-[#1f2a38] rounded-lg p-6 bg-[#0a0f1a] hover:border-[#00D9FF]/30 transition-all"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-3xl font-black text-[#00D9FF]">{selectedSymbol}</h2>
                    <p className="text-sm text-gray-400 mt-1">
                      <span className="text-xl font-bold text-white">${marketData.lastPrice.toFixed(2)}</span>
                      <span
                        className={`ml-3 font-semibold ${
                          marketData.changePercent > 0 ? 'text-[#00FF7F]' : 'text-red-400'
                        }`}
                      >
                        {marketData.changePercent > 0 ? '+' : ''}{marketData.changePercent.toFixed(2)}%
                      </span>
                    </p>
                  </div>
                  <div className="text-right text-sm text-gray-400 space-y-1">
                    <p className="font-medium">H: <span className="text-white font-bold">${marketData.high.toFixed(2)}</span></p>
                    <p className="font-medium">L: <span className="text-white font-bold">${marketData.low.toFixed(2)}</span></p>
                    <p className="font-medium">V: <span className="text-white font-bold">{(marketData.volume / 1000000).toFixed(1)}M</span></p>
                  </div>
                </div>
                <MarketChart symbol={selectedSymbol} data={chartData} />
              </motion.div>

              {/* Market Regime & Setups */}
              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="border border-[#1f2a38] rounded-lg p-4 bg-[#0a0f1a] hover:border-[#00FF7F]/30 transition-all"
                >
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Market Regime</p>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#00FF7F]" />
                    <span className="font-bold text-[#00FF7F]">{marketData.regime}</span>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="border border-[#1f2a38] rounded-lg p-4 bg-[#0a0f1a] hover:border-[#00D9FF]/30 transition-all"
                >
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Active Setups</p>
                  <span className="text-2xl font-black text-[#00D9FF]">{marketData.setups}</span>
                </motion.div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-4">
              {/* Quick Actions */}
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#00D9FF]/10 border border-[#00D9FF]/40 rounded-lg font-bold text-[#00D9FF] hover:bg-[#00D9FF]/20 transition-all"
              >
                <Plus size={20} />
                New Trade
              </motion.button>

              {/* Positions Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="border border-[#1f2a38] rounded-lg p-4 bg-[#0a0f1a]"
              >
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Open Positions</p>
                <div className="space-y-2">
                  {positions.map(pos => (
                    <motion.div
                      key={pos.id}
                      whileHover={{ x: 4 }}
                      className="p-2 rounded bg-[#050607] border border-[#1f2a38] hover:border-[#00D9FF]/20 transition-all cursor-pointer"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-bold text-white text-sm">{pos.symbol}</p>
                          <p className="text-xs text-gray-500">{pos.direction}</p>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold text-sm ${pos.pnl > 0 ? 'text-[#00FF7F]' : 'text-red-400'}`}>
                            {pos.pnl > 0 ? '+' : ''}{pos.pnl.toFixed(0)}
                          </p>
                          <p className={`text-xs ${pos.pnlPercent > 0 ? 'text-[#00FF7F]' : 'text-red-400'}`}>
                            {pos.pnlPercent > 0 ? '+' : ''}{pos.pnlPercent.toFixed(2)}%
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Alerts Card */}
              <TradingViewAlerts alerts={alerts} onCreateAlert={() => {}} onDeleteAlert={() => {}} onToggleAlert={() => {}} />
            </div>
          </div>

          {/* Watchlist Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 border border-[#1f2a38] rounded-lg p-6 bg-[#0a0f1a]"
          >
            <h3 className="text-lg font-bold text-[#00D9FF] mb-4">TradingView Watchlist</h3>
            <div className="grid grid-cols-2 gap-4">
              {watchlist.slice(0, 6).map((symbol, idx) => (
                <motion.div
                  key={symbol.symbol}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + idx * 0.05 }}
                  onClick={() => setSelectedSymbol(symbol.symbol)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedSymbol === symbol.symbol
                      ? 'border-[#00D9FF]/60 bg-[#00D9FF]/10'
                      : 'border-[#1f2a38] bg-[#050607] hover:border-[#00D9FF]/30'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-white">{symbol.symbol}</p>
                      <p className="text-sm text-gray-400">${symbol.price.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${symbol.changePercent > 0 ? 'text-[#00FF7F]' : 'text-red-400'}`}>
                        {symbol.changePercent > 0 ? '+' : ''}{symbol.changePercent.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* AI Assistant */}
      {isAssistantOpen && (
        <motion.div
          initial={{ opacity: 0, x: 400 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 400 }}
          className="w-96 border-l border-[#1f2a38] bg-[#0a0f1a] flex flex-col"
        >
          <AITradingAssistant
            symbol={selectedSymbol}
            price={marketData.lastPrice}
            regime={marketData.regime}
            setups={marketData.setups}
          />
        </motion.div>
      )}
    </div>
  );
}
