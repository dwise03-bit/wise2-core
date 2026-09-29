'use client';

import { useEffect, useState } from 'react';
import { EmbedBuilder } from 'discord.js';

interface Portfolio {
  account: { id: string; name: string; type: string; equity: number };
  metrics: {
    totalEquity: number;
    unrealizedPL: number;
    realizedPL: number;
    totalPL: number;
    openPositions: number;
    closedTrades: number;
    winRate: number;
  };
  positions: any[];
  recentTrades: any[];
  alerts: { active: number };
  watchlist: any[];
}

interface Stats {
  accountType: string;
  equity: number;
  totalTrades: number;
  winRate: number;
  totalPL: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
  bestTrade: number;
  worstTrade: number;
  openPositions: number;
}

export default function TradingDashboard() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [portfolioRes, statsRes] = await Promise.all([
          fetch('/api/trading/portfolio'),
          fetch('/api/trading/stats'),
        ]);

        if (portfolioRes.ok) {
          setPortfolio(await portfolioRes.json());
        }
        if (statsRes.ok) {
          setStats(await statsRes.json());
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#050505]">
        <div className="text-center">
          <div className="text-3xl font-bold text-cyan-400 mb-2">📊 Trading Dashboard</div>
          <div className="text-gray-400">Loading portfolio data...</div>
        </div>
      </div>
    );
  }

  const pl = portfolio?.metrics.totalPL || 0;
  const plPercent = portfolio && portfolio.account.equity ? (pl / portfolio.account.equity) * 100 : 0;
  const isPositive = pl >= 0;

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Header */}
      <div className="border-b border-[#161616] p-6">
        <h1 className="text-4xl font-bold text-cyan-400">📊 Trading Dashboard</h1>
        <p className="text-gray-400 mt-2">{portfolio?.account.name} • {portfolio?.account.type} Account</p>
      </div>

      {/* Main Grid */}
      <div className="p-6 space-y-6">
        {/* Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Equity Card */}
          <div className="bg-[#0a0a0a] border border-[#161616] rounded-lg p-4 hover:border-cyan-500/30 transition">
            <div className="text-sm text-gray-500">Total Equity</div>
            <div className="text-3xl font-bold text-cyan-400 mt-2">
              ${portfolio?.metrics.totalEquity.toFixed(2)}
            </div>
            <div className="text-xs text-gray-600 mt-1">Initial: ${portfolio?.account.equity}</div>
          </div>

          {/* P&L Card */}
          <div className={`bg-[#0a0a0a] border rounded-lg p-4 hover:border-${isPositive ? 'lime' : 'red'}-500/30 transition border-[#161616]`}>
            <div className="text-sm text-gray-500">Total P&L</div>
            <div className={`text-3xl font-bold mt-2 ${isPositive ? 'text-lime-400' : 'text-red-400'}`}>
              {isPositive ? '+' : ''}${pl.toFixed(2)}
            </div>
            <div className={`text-xs mt-1 ${isPositive ? 'text-lime-600' : 'text-red-600'}`}>
              {isPositive ? '+' : ''}{plPercent.toFixed(2)}%
            </div>
          </div>

          {/* Win Rate Card */}
          <div className="bg-[#0a0a0a] border border-[#161616] rounded-lg p-4 hover:border-cyan-500/30 transition">
            <div className="text-sm text-gray-500">Win Rate</div>
            <div className="text-3xl font-bold text-emerald-400 mt-2">
              {portfolio?.metrics.winRate.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-600 mt-1">{portfolio?.metrics.closedTrades} closed trades</div>
          </div>

          {/* Open Positions Card */}
          <div className="bg-[#0a0a0a] border border-[#161616] rounded-lg p-4 hover:border-cyan-500/30 transition">
            <div className="text-sm text-gray-500">Open Positions</div>
            <div className="text-3xl font-bold text-yellow-400 mt-2">
              {portfolio?.metrics.openPositions}
            </div>
            <div className="text-xs text-gray-600 mt-1">Active trades</div>
          </div>
        </div>

        {/* Positions Table */}
        {portfolio && portfolio.positions.length > 0 && (
          <div className="bg-[#0a0a0a] border border-[#161616] rounded-lg overflow-hidden">
            <div className="p-4 border-b border-[#161616]">
              <h2 className="text-xl font-bold text-cyan-400">📈 Open Positions</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#161616]">
                  <tr>
                    <th className="px-4 py-3 text-left">Symbol</th>
                    <th className="px-4 py-3 text-right">Direction</th>
                    <th className="px-4 py-3 text-right">Qty</th>
                    <th className="px-4 py-3 text-right">Entry</th>
                    <th className="px-4 py-3 text-right">Current</th>
                    <th className="px-4 py-3 text-right">P&L</th>
                    <th className="px-4 py-3 text-right">%</th>
                    <th className="px-4 py-3 text-right">R:R</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#161616]">
                  {portfolio.positions.map((pos) => {
                    const posPlPercent = pos.profitLossPercent;
                    return (
                      <tr key={pos.id} className="hover:bg-[#161616] transition">
                        <td className="px-4 py-3 font-semibold">{pos.symbol}</td>
                        <td className={`px-4 py-3 text-right font-bold ${pos.direction === 'LONG' ? 'text-lime-400' : 'text-red-400'}`}>
                          {pos.direction}
                        </td>
                        <td className="px-4 py-3 text-right">{pos.quantity}</td>
                        <td className="px-4 py-3 text-right">${pos.entryPrice.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right">${pos.currentPrice.toFixed(2)}</td>
                        <td className={`px-4 py-3 text-right font-semibold ${pos.profitLoss >= 0 ? 'text-lime-400' : 'text-red-400'}`}>
                          {pos.profitLoss >= 0 ? '+' : ''}${pos.profitLoss.toFixed(2)}
                        </td>
                        <td className={`px-4 py-3 text-right ${posPlPercent >= 0 ? 'text-lime-400' : 'text-red-400'}`}>
                          {posPlPercent >= 0 ? '+' : ''}{posPlPercent.toFixed(2)}%
                        </td>
                        <td className="px-4 py-3 text-right text-yellow-400">{pos.riskReward.toFixed(2)}:1</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Recent Trades Table */}
        {portfolio && portfolio.recentTrades.length > 0 && (
          <div className="bg-[#0a0a0a] border border-[#161616] rounded-lg overflow-hidden">
            <div className="p-4 border-b border-[#161616]">
              <h2 className="text-xl font-bold text-cyan-400">📋 Recent Trades</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#161616]">
                  <tr>
                    <th className="px-4 py-3 text-left">Symbol</th>
                    <th className="px-4 py-3 text-right">Direction</th>
                    <th className="px-4 py-3 text-right">Entry</th>
                    <th className="px-4 py-3 text-right">Exit</th>
                    <th className="px-4 py-3 text-right">P&L</th>
                    <th className="px-4 py-3 text-right">Duration</th>
                    <th className="px-4 py-3 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#161616]">
                  {portfolio.recentTrades.slice(0, 10).map((trade) => (
                    <tr key={trade.id} className="hover:bg-[#161616] transition">
                      <td className="px-4 py-3 font-semibold">{trade.symbol}</td>
                      <td className={`px-4 py-3 text-right font-bold ${trade.direction === 'LONG' ? 'text-lime-400' : 'text-red-400'}`}>
                        {trade.direction}
                      </td>
                      <td className="px-4 py-3 text-right">${trade.entryPrice.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right">${trade.exitPrice?.toFixed(2) || 'N/A'}</td>
                      <td className={`px-4 py-3 text-right font-semibold ${trade.profitLoss >= 0 ? 'text-lime-400' : 'text-red-400'}`}>
                        {trade.profitLoss >= 0 ? '+' : ''}${trade.profitLoss.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-400">{Math.floor(trade.duration / 60)}h {trade.duration % 60}m</td>
                      <td className="px-4 py-3 text-right text-gray-500">
                        {new Date(trade.exitTime).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#0a0a0a] border border-[#161616] rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-2">Avg Win / Loss</div>
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-lg font-bold text-lime-400">${stats.avgWin.toFixed(2)}</div>
                  <div className="text-xs text-gray-600">Win</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-red-400">${stats.avgLoss.toFixed(2)}</div>
                  <div className="text-xs text-gray-600">Loss</div>
                </div>
              </div>
            </div>

            <div className="bg-[#0a0a0a] border border-[#161616] rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-2">Best / Worst Trade</div>
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-lg font-bold text-lime-400">+${stats.bestTrade.toFixed(2)}</div>
                  <div className="text-xs text-gray-600">Best</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-red-400">${stats.worstTrade.toFixed(2)}</div>
                  <div className="text-xs text-gray-600">Worst</div>
                </div>
              </div>
            </div>

            <div className="bg-[#0a0a0a] border border-[#161616] rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-2">Profit Factor</div>
              <div className="text-3xl font-bold text-cyan-400">{stats.profitFactor.toFixed(2)}x</div>
              <div className="text-xs text-gray-600 mt-1">Total wins / Total losses</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
