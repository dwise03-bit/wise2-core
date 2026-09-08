'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Volume2, Activity, Eye } from 'lucide-react';

interface Symbol {
  symbol: string;
  price: number;
  bid?: number;
  ask?: number;
  change: number;
  changePercent: number;
  volume?: number;
  volatility?: number;
  regime: string;
  sessionContext: string;
}

export default function Markets() {
  const [symbols, setSymbols] = useState<Symbol[]>([
    {
      symbol: 'NQ',
      price: 20145.50,
      bid: 20145.25,
      ask: 20145.75,
      change: 245.50,
      changePercent: 1.23,
      volume: 2_450_000,
      volatility: 1.2,
      regime: 'TRENDING_UP',
      sessionContext: 'NEWYORK',
    },
    {
      symbol: 'MNQ',
      price: 20150.00,
      bid: 20149.75,
      ask: 20150.25,
      change: 240.00,
      changePercent: 1.20,
      volume: 1_850_000,
      volatility: 1.15,
      regime: 'TRENDING_UP',
      sessionContext: 'NEWYORK',
    },
    {
      symbol: 'ES',
      price: 5245.75,
      bid: 5245.50,
      ask: 5245.95,
      change: -15.25,
      changePercent: -0.29,
      volume: 3_200_000,
      volatility: 0.95,
      regime: 'RANGING',
      sessionContext: 'NEWYORK',
    },
    {
      symbol: 'MES',
      price: 5245.50,
      bid: 5245.25,
      ask: 5245.75,
      change: -15.50,
      changePercent: -0.30,
      volume: 2_100_000,
      volatility: 0.93,
      regime: 'RANGING',
      sessionContext: 'NEWYORK',
    },
  ]);

  const [selectedSymbol, setSelectedSymbol] = useState<string>('NQ');

  const getRegimeColor = (regime: string) => {
    switch (regime) {
      case 'TRENDING_UP':
        return 'text-emerald-400 bg-emerald-400/10';
      case 'TRENDING_DOWN':
        return 'text-red-400 bg-red-400/10';
      case 'RANGING':
        return 'text-blue-400 bg-blue-400/10';
      default:
        return 'text-slate-400 bg-slate-400/10';
    }
  };

  const getVolatilityLevel = (vol: number) => {
    if (vol < 0.5) return { label: 'LOW', color: 'text-blue-400' };
    if (vol < 1.5) return { label: 'MODERATE', color: 'text-yellow-400' };
    if (vol < 3) return { label: 'HIGH', color: 'text-orange-400' };
    return { label: 'EXTREME', color: 'text-red-400' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#070812] via-[#101329] to-[#070812] p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">Market Intelligence</h1>
        <p className="text-slate-400">Real-time market regime, liquidity, and session tracking</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Symbol List */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2"
        >
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg backdrop-blur overflow-hidden">
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-700 bg-slate-900/50 font-semibold text-xs text-slate-400 uppercase">
              <div className="col-span-3">Symbol</div>
              <div className="col-span-2">Price</div>
              <div className="col-span-2">Change</div>
              <div className="col-span-2">Volatility</div>
              <div className="col-span-2">Regime</div>
              <div className="col-span-1">Action</div>
            </div>

            <div className="divide-y divide-slate-700">
              {symbols.map(sym => (
                <motion.div
                  key={sym.symbol}
                  whileHover={{ backgroundColor: 'rgba(30, 41, 59, 0.5)' }}
                  onClick={() => setSelectedSymbol(sym.symbol)}
                  className={`grid grid-cols-12 gap-4 p-4 cursor-pointer transition ${selectedSymbol === sym.symbol ? 'bg-slate-700/30 border-l-2 border-l-emerald-400' : ''}`}
                >
                  <div className="col-span-3">
                    <p className="font-mono font-bold text-white">{sym.symbol}</p>
                  </div>

                  <div className="col-span-2">
                    <p className="font-mono text-white text-sm">
                      {sym.price.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>

                  <div className="col-span-2">
                    <div className="flex items-center gap-1">
                      {sym.changePercent >= 0 ? (
                        <>
                          <TrendingUp className="w-4 h-4 text-emerald-400" />
                          <span className="text-sm text-emerald-400 font-semibold">
                            +{sym.changePercent.toFixed(2)}%
                          </span>
                        </>
                      ) : (
                        <>
                          <TrendingDown className="w-4 h-4 text-red-400" />
                          <span className="text-sm text-red-400 font-semibold">
                            {sym.changePercent.toFixed(2)}%
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="col-span-2">
                    <div
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${getVolatilityLevel(sym.volatility || 0).color}`}
                    >
                      <Volume2 className="w-3 h-3" />
                      {getVolatilityLevel(sym.volatility || 0).label}
                    </div>
                  </div>

                  <div className="col-span-2">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getRegimeColor(sym.regime)}`}>
                      {sym.regime}
                    </span>
                  </div>

                  <div className="col-span-1">
                    <button className="text-slate-400 hover:text-emerald-400 transition">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Selected Symbol Details */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          key={selectedSymbol}
        >
          {symbols
            .filter(s => s.symbol === selectedSymbol)
            .map(sym => (
              <div key={sym.symbol} className="space-y-4">
                {/* Main Price Card */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur">
                  <p className="text-sm text-slate-400 mb-2">
                    {sym.sessionContext}
                  </p>
                  <p className="text-4xl font-bold text-white font-mono mb-2">
                    {sym.price.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  <div className="flex items-center gap-2">
                    {sym.changePercent >= 0 ? (
                      <>
                        <TrendingUp className="w-5 h-5 text-emerald-400" />
                        <span className="text-lg font-semibold text-emerald-400">
                          +{sym.change.toFixed(2)} ({sym.changePercent.toFixed(2)}%)
                        </span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="w-5 h-5 text-red-400" />
                        <span className="text-lg font-semibold text-red-400">
                          {sym.change.toFixed(2)} ({sym.changePercent.toFixed(2)}%)
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Bid/Ask */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 backdrop-blur">
                    <p className="text-xs text-slate-400 mb-1">Bid</p>
                    <p className="text-xl font-mono font-bold text-emerald-400">
                      ${sym.bid?.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 backdrop-blur">
                    <p className="text-xs text-slate-400 mb-1">Ask</p>
                    <p className="text-xl font-mono font-bold text-red-400">
                      ${sym.ask?.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Market Metrics */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 backdrop-blur space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-400">Volume</p>
                    <p className="font-mono font-semibold text-white">
                      {sym.volume?.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-400">Volatility</p>
                    <p className={`font-semibold ${getVolatilityLevel(sym.volatility || 0).color}`}>
                      {getVolatilityLevel(sym.volatility || 0).label}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-400">Regime</p>
                    <p className="font-semibold text-emerald-400">{sym.regime}</p>
                  </div>
                </div>

                {/* Actions */}
                <button className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition">
                  View Setup Details
                </button>
              </div>
            ))}
        </motion.div>
      </div>
    </div>
  );
}
