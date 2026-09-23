'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Plus,
  MessageSquare,
  Eye,
  EyeOff,
  Settings,
} from 'lucide-react';
import { useMarketData } from '@/hooks/useMarketData';
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

export default function TradingDashboard() {
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSD');
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // Connect to WebSocket market data
  const { quotes, connected, getPrice } = useMarketData(['BTCUSD', 'ETHUSD', 'AAPL', 'MSFT']);

  // Watchlist state
  const [watchlist, setWatchlist] = useState([
    { symbol: 'BTCUSD', price: 43200, change: 700, changePercent: 1.65, watched: true },
    { symbol: 'ETHUSD', price: 2250, change: 45, changePercent: 2.0, watched: true },
    { symbol: 'AAPL', price: 225, change: 2, changePercent: 0.9, watched: false },
    { symbol: 'MSFT', price: 380, change: -5, changePercent: -1.3, watched: false },
  ]);

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

  const [positions, setPositions] = useState<Position[]>([
    {
      id: '1',
      symbol: 'BTCUSD',
      direction: 'LONG',
      entryPrice: 42500,
      quantity: 0.5,
      currentPrice: 43200,
      pnl: 350,
      pnlPercent: 1.65,
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
    low: 42100,
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
    <div className="min-h-screen bg-[#070812] text-white p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-cyan-100">Trading Command Center</h1>
          <p className="text-slate-400 text-sm mt-1">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ScreenRecorder isRecording={isRecording} onToggle={setIsRecording} />
          <button
            onClick={() => setIsAssistantOpen(!isAssistantOpen)}
            className="p-3 rounded-lg bg-violet-900/20 border border-violet-400/30 text-violet-300 hover:bg-violet-900/30 transition"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
          <button className="p-3 rounded-lg bg-violet-900/20 border border-violet-400/30 text-violet-300 hover:bg-violet-900/30 transition">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Account Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Account Equity', value: `$${accountStats.equity.toLocaleString()}`, color: 'cyan' },
          { label: 'Available', value: `$${accountStats.available.toLocaleString()}`, color: 'slate' },
          { label: 'Day P&L', value: `$${accountStats.pnl.toFixed(2)}`, color: accountStats.pnl > 0 ? 'green' : 'red' },
          { label: 'Risk Used', value: `${accountStats.riskUsed.toFixed(1)}%`, color: 'orange' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`bg-gradient-to-br from-${stat.color}-900/10 to-${stat.color}-900/5 border border-${stat.color}-500/20 rounded-lg p-4`}
          >
            <p className={`text-sm text-${stat.color}-300 mb-1`}>{stat.label}</p>
            <p className={`text-2xl font-bold text-${stat.color}-100`}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0b0d1c] rounded-lg border border-cyan-500/20 p-4"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-cyan-100">{selectedSymbol}</h2>
                <p className="text-sm text-slate-400">
                  <span className="text-lg font-bold text-cyan-100">${marketData.lastPrice.toFixed(2)}</span>
                  <span className={`ml-2 ${marketData.changePercent > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {marketData.changePercent > 0 ? '+' : ''}{marketData.changePercent.toFixed(2)}%
                  </span>
                </p>
              </div>
              <div className="text-right text-sm text-slate-400">
                <p>High: ${marketData.high.toFixed(2)}</p>
                <p>Low: ${marketData.low.toFixed(2)}</p>
                <p>Vol: {(marketData.volume / 1000000).toFixed(1)}M</p>
              </div>
            </div>
            <MarketChart symbol={selectedSymbol} data={chartData} />
          </motion.div>

          {/* Market Regime & Setups */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 gap-4 mt-4"
          >
            <div className="bg-[#0b0d1c] rounded-lg border border-violet-500/20 p-4">
              <p className="text-sm text-slate-400 mb-2">Market Regime</p>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <span className="font-bold text-green-300">{marketData.regime}</span>
              </div>
            </div>
            <div className="bg-[#0b0d1c] rounded-lg border border-violet-500/20 p-4">
              <p className="text-sm text-slate-400 mb-2">Active Setups</p>
              <span className="text-2xl font-bold text-cyan-100">{marketData.setups}</span>
            </div>
          </motion.div>
        </div>

        {/* Right Sidebar: Positions & Quick Actions */}
        <div className="space-y-4">
          {/* New Trade Button */}
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full py-3 px-4 bg-gradient-to-r from-cyan-600 to-cyan-500 text-white font-bold rounded-lg hover:from-cyan-500 hover:to-cyan-400 transition flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Trade
          </motion.button>

          {/* TradingView Watchlist */}
          <TradingViewWatchlist
            items={watchlist}
            onAddSymbol={(symbol) => {
              if (!watchlist.find(w => w.symbol === symbol)) {
                setWatchlist([...watchlist, { symbol, price: 0, change: 0, changePercent: 0 }]);
              }
            }}
            onRemoveSymbol={(symbol) => {
              setWatchlist(watchlist.filter(w => w.symbol !== symbol));
            }}
            onToggleWatch={(symbol) => {
              setWatchlist(
                watchlist.map(w =>
                  w.symbol === symbol ? { ...w, watched: !w.watched } : w
                )
              );
            }}
          />

          {/* TradingView Alerts */}
          <TradingViewAlerts
            alerts={alerts}
            onCreateAlert={(symbol, type, price) => {
              setAlerts([
                ...alerts,
                {
                  id: Date.now().toString(),
                  symbol,
                  type,
                  price,
                  active: true,
                  triggered: false,
                },
              ]);
            }}
            onDeleteAlert={(id) => {
              setAlerts(alerts.filter(a => a.id !== id));
            }}
            onToggleAlert={(id) => {
              setAlerts(
                alerts.map(a =>
                  a.id === id ? { ...a, active: !a.active } : a
                )
              );
            }}
          />

          {/* Open Positions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#0b0d1c] rounded-lg border border-violet-500/20 p-4"
          >
            <h3 className="font-bold text-cyan-100 mb-3">Open Positions ({positions.length})</h3>
            <div className="space-y-3">
              {positions.map(pos => (
                <motion.div
                  key={pos.id}
                  whileHover={{ backgroundColor: 'rgba(15, 23, 42, 0.8)' }}
                  className="bg-[#0f1729] rounded p-3 cursor-pointer transition"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white">{pos.symbol}</span>
                    <span
                      className={`text-sm font-bold px-2 py-1 rounded ${
                        pos.direction === 'LONG'
                          ? 'bg-green-900/30 text-green-300'
                          : 'bg-red-900/30 text-red-300'
                      }`}
                    >
                      {pos.direction}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 space-y-1 mb-2">
                    <p>Entry: ${pos.entryPrice} | Current: ${pos.currentPrice.toFixed(2)}</p>
                    <p>Qty: {pos.quantity} | Stop: ${pos.stopPrice} | Target: ${pos.target}</p>
                  </div>
                  <div className={`text-sm font-bold ${pos.pnl > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {pos.pnl > 0 ? '+' : ''} ${pos.pnl.toFixed(2)} ({pos.pnlPercent > 0 ? '+' : ''}{pos.pnlPercent.toFixed(2)}%)
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Trading Statistics */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#0b0d1c] rounded-lg border border-violet-500/20 p-4 text-sm"
          >
            <h3 className="font-bold text-cyan-100 mb-3">Trading Stats</h3>
            <div className="space-y-2 text-slate-400">
              <div className="flex justify-between">
                <span>Win Rate</span>
                <span className="text-green-400 font-semibold">68%</span>
              </div>
              <div className="flex justify-between">
                <span>Profit Factor</span>
                <span className="text-green-400 font-semibold">2.3</span>
              </div>
              <div className="flex justify-between">
                <span>Avg Win / Loss</span>
                <span className="text-cyan-400 font-semibold">1.8R</span>
              </div>
              <div className="flex justify-between">
                <span>Total Trades</span>
                <span className="text-cyan-400 font-semibold">127</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* AI Assistant */}
      <AITradingAssistant
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        marketContext={{
          symbol: selectedSymbol,
          lastPrice: marketData.lastPrice,
          change: marketData.changePercent,
          regime: marketData.regime,
          setups: marketData.setups,
        }}
      />
    </div>
  );
}
