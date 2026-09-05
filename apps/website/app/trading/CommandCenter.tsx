'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, AlertCircle, Zap, Settings } from 'lucide-react';

interface Position {
  id: string;
  symbol: string;
  direction: 'LONG' | 'SHORT';
  entryPrice: number;
  quantity: number;
  currentPrice?: number;
  currentPnL?: number;
  currentPnLPercent?: number;
  stopPrice: number;
  target1: number;
}

interface Setup {
  id: string;
  symbol: string;
  direction: 'LONG' | 'SHORT';
  type: string;
  confidence: number;
  suggestedEntry?: number;
  expectedR?: number;
  rationale: string;
}

interface Signal {
  id: string;
  symbol: string;
  signalType: string;
  direction: 'LONG' | 'SHORT';
  confidence: number;
  status: string;
}

export default function CommandCenter() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [setups, setSetups] = useState<Setup[]>([]);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [account, setAccount] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [accountRes, positionsRes, setupsRes, signalsRes] = await Promise.all([
        fetch('/api/trading/account'),
        fetch('/api/trading/positions'),
        fetch('/api/trading/market-data/NQ'),
        fetch('/api/trading/signals'),
      ]);

      if (accountRes.ok) setAccount(await accountRes.json());
      if (positionsRes.ok) {
        const data = await positionsRes.json();
        setPositions(data.positions || []);
      }
      if (setupsRes.ok) {
        const data = await setupsRes.json();
        setSetups(data.setups || []);
      }
      if (signalsRes.ok) {
        const data = await signalsRes.json();
        setSignals(data.signals || []);
      }

      setLoading(false);
    } catch (error) {
      console.error('Failed to load trading data:', error);
    }
  };

  const totalOpenPnL = positions.reduce((sum, p) => sum + (p.currentPnL || 0), 0);
  const winRate =
    signals.length > 0
      ? (signals.filter(s => s.status === 'FILLED').length / signals.length) * 100
      : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#070812] via-[#101329] to-[#070812] p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              WISE² Trading Command
            </h1>
            <p className="text-slate-400">
              AI-Powered. Data-Driven. Disciplined.
            </p>
          </div>
          <button className="p-3 bg-slate-800 hover:bg-slate-700 rounded-lg transition">
            <Settings className="w-6 h-6 text-slate-300" />
          </button>
        </div>
      </motion.div>

      {/* KPI Row */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
      >
        <KPICard
          label="Account Equity"
          value={`$${account?.paperEquity?.toLocaleString() || '10,000'}`}
          change={`${totalOpenPnL > 0 ? '+' : ''}$${totalOpenPnL.toFixed(2)}`}
          changeColor={totalOpenPnL > 0 ? 'text-emerald-400' : 'text-red-400'}
          icon={<BarChart3 className="w-5 h-5" />}
        />
        <KPICard
          label="Win Rate"
          value={`${winRate.toFixed(1)}%`}
          subtext={`${signals.length} signals`}
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <KPICard
          label="Open Positions"
          value={positions.length}
          subtext={`${positions.filter(p => p.direction === 'LONG').length}L / ${positions.filter(p => p.direction === 'SHORT').length}S`}
          icon={<Zap className="w-5 h-5 text-yellow-400" />}
        />
        <KPICard
          label="Risk Status"
          value={account?.riskPerTrade ? `${account.riskPerTrade}%` : '1%'}
          subtext="Per trade"
          icon={<AlertCircle className="w-5 h-5 text-amber-400" />}
        />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Positions */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-emerald-400" />
              Live Positions
            </h2>

            {positions.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                No open positions. Waiting for setup confirmation...
              </div>
            ) : (
              <div className="space-y-3">
                {positions.map(position => (
                  <PositionRow key={position.id} position={position} />
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Top Opportunities */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur">
            <h2 className="text-lg font-bold text-white mb-4">Top Setups</h2>

            {setups.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                Scanning for opportunities...
              </div>
            ) : (
              <div className="space-y-3">
                {setups.slice(0, 5).map(setup => (
                  <div
                    key={setup.id}
                    className="p-3 bg-slate-700/30 rounded border border-slate-600 hover:border-emerald-500/50 transition cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${setup.direction === 'LONG' ? 'bg-emerald-400' : 'bg-red-400'}`}
                        />
                        <span className="font-mono text-white text-sm">
                          {setup.symbol}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-emerald-400">
                        {(setup.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 line-clamp-2">
                      {setup.rationale}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Signals Feed */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6"
      >
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur">
          <h2 className="text-lg font-bold text-white mb-4">Live Signals</h2>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {signals.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                No active signals at this time
              </div>
            ) : (
              signals.slice(0, 10).map(signal => (
                <div
                  key={signal.id}
                  className="flex items-center justify-between p-3 bg-slate-700/20 rounded border border-slate-600"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2.5 h-2.5 rounded-full animate-pulse ${signal.direction === 'LONG' ? 'bg-emerald-400' : 'bg-red-400'}`}
                    />
                    <div>
                      <p className="font-semibold text-white text-sm">
                        {signal.symbol} {signal.direction}
                      </p>
                      <p className="text-xs text-slate-400">{signal.signalType}</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-slate-300">
                    {(signal.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

interface KPICardProps {
  label: string;
  value: string | number;
  change?: string;
  changeColor?: string;
  subtext?: string;
  icon: React.ReactNode;
}

function KPICard({
  label,
  value,
  change,
  changeColor,
  subtext,
  icon,
}: KPICardProps) {
  return (
    <motion.div
      whileHover={{ borderColor: 'rgba(52, 211, 153, 0.3)' }}
      className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 backdrop-blur transition"
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm text-slate-400">{label}</p>
        <div className="text-slate-500">{icon}</div>
      </div>
      <p className="text-2xl font-bold text-white mb-2">{value}</p>
      {change && <p className={`text-sm ${changeColor}`}>{change}</p>}
      {subtext && <p className="text-xs text-slate-400">{subtext}</p>}
    </motion.div>
  );
}

interface PositionRowProps {
  position: Position;
}

function PositionRow({ position }: PositionRowProps) {
  const pnlPercent = position.currentPnLPercent || 0;
  const isProfit = (position.currentPnL || 0) >= 0;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="p-4 bg-slate-700/20 border border-slate-600 rounded hover:border-emerald-500/50 transition cursor-pointer"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${position.direction === 'LONG' ? 'bg-emerald-400' : 'bg-red-400'}`}
          />
          <span className="font-mono font-semibold text-white">
            {position.symbol} {position.direction}
          </span>
        </div>
        <span className={`text-sm font-bold ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
          {isProfit ? '+' : ''}{pnlPercent.toFixed(2)}%
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2 text-xs">
        <div>
          <p className="text-slate-400">Entry</p>
          <p className="font-mono font-semibold text-white">
            ${position.entryPrice.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-slate-400">Current</p>
          <p className="font-mono font-semibold text-white">
            ${position.currentPrice?.toFixed(2) || position.entryPrice.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-slate-400">Stop</p>
          <p className="font-mono text-red-300">${position.stopPrice.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-slate-400">Target</p>
          <p className="font-mono text-emerald-300">
            ${position.target1.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="mt-2 flex gap-2">
        <button className="flex-1 py-1 text-xs font-semibold text-slate-300 hover:text-white transition">
          Adjust
        </button>
        <button className="flex-1 py-1 text-xs font-semibold text-red-400 hover:text-red-300 transition">
          Close
        </button>
      </div>
    </motion.div>
  );
}
