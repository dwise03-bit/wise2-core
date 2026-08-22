'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Plus, BarChart3, Play, Settings } from 'lucide-react';

interface Strategy {
  id: string;
  name: string;
  description: string;
  version: number;
  winRate?: number;
  totalTrades?: number;
  profitFactor?: number;
  lastBacktest?: Date;
  isActive: boolean;
}

const mockStrategies: Strategy[] = [
  {
    id: '1',
    name: 'ÆTHER-TRADER Core',
    description: 'Liquidity raids + Fibonacci + RSI momentum with 4H bias filter',
    version: 1,
    winRate: 68.5,
    totalTrades: 143,
    profitFactor: 1.82,
    lastBacktest: new Date('2026-08-22'),
    isActive: true,
  },
  {
    id: '2',
    name: 'Range Breakout',
    description: 'Momentum breakout strategy with ATR bands',
    version: 2,
    winRate: 52.3,
    totalTrades: 87,
    profitFactor: 1.15,
    lastBacktest: new Date('2026-08-20'),
    isActive: false,
  },
];

export default function StrategyLab() {
  const [strategies, setStrategies] = useState<Strategy[]>(mockStrategies);
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(strategies[0]?.id || null);
  const [showNewStrategy, setShowNewStrategy] = useState(false);
  const [showBacktest, setShowBacktest] = useState(false);

  const currentStrategy = strategies.find(s => s.id === selectedStrategy);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
            <Zap className="w-8 h-8 text-yellow-400" />
            Strategy Lab
          </h1>
          <p className="text-slate-400">
            Create, backtest, and optimize trading strategies
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() => setShowNewStrategy(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition"
        >
          <Plus className="w-5 h-5" />
          New Strategy
        </motion.button>
      </motion.div>

      {/* Strategy List & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Strategy List */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1"
        >
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg backdrop-blur overflow-hidden">
            <div className="p-4 border-b border-slate-700">
              <h2 className="text-lg font-bold text-white">Your Strategies</h2>
            </div>

            <div className="divide-y divide-slate-700">
              {strategies.map(strategy => (
                <motion.button
                  key={strategy.id}
                  onClick={() => setSelectedStrategy(strategy.id)}
                  whileHover={{ backgroundColor: 'rgba(30, 41, 59, 0.5)' }}
                  className={`w-full text-left p-4 transition ${
                    selectedStrategy === strategy.id
                      ? 'bg-slate-700/30 border-l-2 border-l-emerald-400'
                      : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-white">{strategy.name}</p>
                      <p className="text-xs text-slate-400">v{strategy.version}</p>
                    </div>
                    <div
                      className={`w-2.5 h-2.5 rounded-full mt-1 ${strategy.isActive ? 'bg-emerald-400' : 'bg-slate-500'}`}
                    />
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {strategy.description}
                  </p>
                  {strategy.winRate && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-slate-300">
                      <span>{strategy.winRate.toFixed(1)}% WR</span>
                      <span>•</span>
                      <span>{strategy.profitFactor?.toFixed(2)}:1 PF</span>
                    </div>
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Strategy Details */}
        {currentStrategy && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            key={currentStrategy.id}
            className="lg:col-span-2 space-y-6"
          >
            {/* Overview Card */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {currentStrategy.name}
                  </h2>
                  <p className="text-slate-400">{currentStrategy.description}</p>
                </div>
                <button className="p-2 hover:bg-slate-700 rounded transition">
                  <Settings className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4 p-4 bg-slate-700/20 rounded-lg">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Version</p>
                  <p className="text-2xl font-bold text-white">
                    {currentStrategy.version}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Status</p>
                  <p
                    className={`text-lg font-semibold ${currentStrategy.isActive ? 'text-emerald-400' : 'text-slate-400'}`}
                  >
                    {currentStrategy.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Last Backtest</p>
                  <p className="text-sm text-slate-300 font-mono">
                    {currentStrategy.lastBacktest?.toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            {currentStrategy.winRate && (
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Performance Metrics
                </h3>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Win Rate</p>
                    <div className="flex items-end gap-2">
                      <p className="text-3xl font-bold text-emerald-400">
                        {currentStrategy.winRate.toFixed(1)}%
                      </p>
                      <div className="flex-1 h-24 bg-slate-700/30 rounded-lg flex items-end gap-1 p-2">
                        {Array.from({ length: 10 }).map((_, i) => (
                          <div
                            key={i}
                            className={`flex-1 rounded-sm ${i < Math.round(currentStrategy.winRate! / 10) ? 'bg-emerald-500' : 'bg-slate-600/50'}`}
                            style={{ height: `${(i + 1) * 10}%` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Total Trades</p>
                      <p className="text-2xl font-bold text-white">
                        {currentStrategy.totalTrades}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Profit Factor</p>
                      <p className="text-2xl font-bold text-emerald-400">
                        {currentStrategy.profitFactor?.toFixed(2)}:1
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={() => setShowBacktest(true)}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition"
              >
                <BarChart3 className="w-5 h-5" />
                Backtest
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition"
              >
                <Play className="w-5 h-5" />
                Deploy
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Backtest Modal */}
      {showBacktest && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowBacktest(false)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            onClick={e => e.stopPropagation()}
            className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-md w-full"
          >
            <h3 className="text-xl font-bold text-white mb-4">Run Backtest</h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Start Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-emerald-500"
                  defaultValue="2026-01-01"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">End Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-emerald-500"
                  defaultValue="2026-08-22"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Symbols</label>
                <input
                  type="text"
                  placeholder="NQ, ES, MNQ"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition">
                Run
              </button>
              <button
                onClick={() => setShowBacktest(false)}
                className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
