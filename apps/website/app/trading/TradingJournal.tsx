'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Plus, Filter, Download } from 'lucide-react';

interface JournalEntry {
  id: string;
  date: Date;
  symbol: string;
  direction: 'LONG' | 'SHORT';
  result: 'WIN' | 'LOSS' | 'BREAKEVEN';
  pnl: number;
  setupType: string;
  whatWentWell?: string;
  lessonsLearned?: string;
  emotionalState?: string;
}

const mockEntries: JournalEntry[] = [
  {
    id: '1',
    date: new Date('2026-08-22'),
    symbol: 'NQ',
    direction: 'LONG',
    result: 'WIN',
    pnl: 450,
    setupType: 'LIQUIDITY_SWEEP',
    whatWentWell: 'Waited for confirmation, followed bias perfectly',
    lessonsLearned: 'Timing entry after liquidity event is critical',
    emotionalState: 'Disciplined',
  },
  {
    id: '2',
    date: new Date('2026-08-21'),
    symbol: 'ES',
    direction: 'SHORT',
    result: 'LOSS',
    pnl: -125,
    setupType: 'RANGE_BREAKOUT',
    whatWentWell: 'Stopped out quickly, preserved capital',
    lessonsLearned: 'This symbol favors ranging behavior, skip breakouts',
    emotionalState: 'Frustrated',
  },
];

export default function TradingJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>(mockEntries);
  const [filter, setFilter] = useState<'all' | 'WIN' | 'LOSS'>('all');
  const [showNewEntry, setShowNewEntry] = useState(false);

  const filteredEntries = entries.filter(
    e => filter === 'all' || e.result === filter
  );

  const stats = {
    totalEntries: entries.length,
    wins: entries.filter(e => e.result === 'WIN').length,
    losses: entries.filter(e => e.result === 'LOSS').length,
    breakevens: entries.filter(e => e.result === 'BREAKEVEN').length,
    totalPnL: entries.reduce((sum, e) => sum + e.pnl, 0),
    winRate: (entries.filter(e => e.result === 'WIN').length / entries.length) * 100,
  };

  return (
    <div className="min-h-full bg-[#050607] p-4 text-white sm:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex flex-col gap-4 rounded-xl border border-[#00D9FF]/25 bg-[linear-gradient(115deg,rgba(7,31,53,.96),rgba(5,6,7,.92))] p-4 shadow-[0_0_32px_rgba(0,217,255,0.10)] sm:mb-8 sm:flex-row sm:items-center sm:p-6"
      >
        <div>
          <h1 className="mb-2 flex items-center gap-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            <BookOpen className="w-8 h-8" />
            Trading Journal
          </h1>
          <p className="text-gray-400">Reflect on every trade for continuous improvement</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() => setShowNewEntry(!showNewEntry)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#00D9FF]/60 bg-[#006bff] px-4 py-2 font-semibold text-white shadow-[0_0_20px_rgba(0,217,255,0.22)] transition hover:bg-[#087cff]"
        >
          <Plus className="w-5 h-5" />
          New Entry
        </motion.button>
      </motion.div>

      {/* Stats Row */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 sm:gap-4 sm:mb-8"
      >
        <StatCard label="Total Entries" value={stats.totalEntries} />
        <StatCard
          label="Wins"
          value={stats.wins}
          color="text-[#00FF7F]"
        />
        <StatCard
          label="Losses"
          value={stats.losses}
          color="text-[#ff7197]"
        />
        <StatCard label="Win Rate" value={`${stats.winRate.toFixed(1)}%`} />
        <StatCard
          label="Total P&L"
          value={`$${stats.totalPnL.toLocaleString()}`}
          color={stats.totalPnL > 0 ? 'text-[#00FF7F]' : 'text-[#ff7197]'}
        />
      </motion.div>

      {/* New Entry Form */}
      {showNewEntry && <NewEntryForm onClose={() => setShowNewEntry(false)} />}

      {/* Filter */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-6 flex flex-wrap items-center gap-3 rounded-lg border border-[#00D9FF]/15 bg-[#07111f] p-3"
      >
        <Filter className="w-5 h-5 text-gray-400" />
        <div className="flex gap-2">
          {['all', 'WIN', 'LOSS'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                filter === f
                  ? 'border border-[#00D9FF]/60 bg-[#006bff] text-white'
                  : 'border border-[#00D9FF]/20 bg-[#0b0d1c] text-gray-400 hover:border-[#00D9FF]/50 hover:text-white'
              }`}
            >
              {f === 'all' ? 'All Trades' : f}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Journal Entries */}
      <div className="space-y-4">
        {filteredEntries.map((entry, idx) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="rounded-xl border border-[#00D9FF]/20 bg-[#0b0d1c] p-4 shadow-[0_0_26px_rgba(0,217,255,0.06)] transition hover:border-[#00D9FF]/45 sm:p-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm text-gray-400">
                    {entry.date.toLocaleDateString()}
                  </p>
                  <p className="text-lg font-bold text-white">
                    {entry.symbol} {entry.direction}
                  </p>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    entry.result === 'WIN'
                      ? 'border border-[#00FF7F]/30 bg-[#00FF7F]/10 text-[#00FF7F]'
                      : entry.result === 'LOSS'
                      ? 'border border-[#FF0055]/30 bg-[#FF0055]/10 text-[#ff7197]'
                      : 'border border-white/10 bg-white/5 text-gray-400'
                  }`}
                >
                  {entry.result}
                </div>
              </div>
              <div className="text-right">
                <p className={`text-2xl font-bold font-mono ${entry.pnl > 0 ? 'text-[#00FF7F]' : 'text-[#ff7197]'}`}>
                  {entry.pnl > 0 ? '+' : ''}{entry.pnl}
                </p>
                <p className="text-xs text-gray-400">{entry.setupType}</p>
              </div>
            </div>

            {/* Emotional State */}
            {entry.emotionalState && (
              <div className="mb-4 inline-block px-3 py-1 border border-[#00D9FF]/25 bg-[#00D9FF]/10 text-[#83edff] text-xs font-semibold rounded">
                Mood: {entry.emotionalState}
              </div>
            )}

            {/* Reflection */}
            {(entry.whatWentWell || entry.lessonsLearned) && (
              <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                {entry.whatWentWell && (
                  <div>
                    <p className="text-gray-400 mb-1 font-semibold">What went well</p>
                    <p className="text-slate-300">{entry.whatWentWell}</p>
                  </div>
                )}
                {entry.lessonsLearned && (
                  <div>
                    <p className="text-gray-400 mb-1 font-semibold">Lessons learned</p>
                    <p className="text-slate-300">{entry.lessonsLearned}</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Export Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg border border-[#00D9FF]/35 bg-[#07111f] px-4 py-3 font-semibold text-white transition hover:border-[#00D9FF]/70 hover:bg-[#0b0d1c]"
      >
        <Download className="w-5 h-5" />
        Export Journal (PDF)
      </motion.button>
    </div>
  );
}

function StatCard({
  label,
  value,
  color = 'text-gray-200',
}: {
  label: string;
  value: string | number;
  color?: string;
}) {
  return (
    <motion.div
      whileHover={{ borderColor: 'rgba(52, 211, 153, 0.3)' }}
      className="rounded-lg border border-[#00D9FF]/20 bg-[#07111f] p-4 shadow-[0_0_18px_rgba(0,217,255,0.05)] transition"
    >
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </motion.div>
  );
}

function NewEntryForm({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur mb-8"
    >
      <h3 className="text-lg font-bold text-white mb-4">New Journal Entry</h3>
      <form className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Symbol</label>
            <input
              type="text"
              placeholder="NQ"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Direction</label>
            <select className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-emerald-500">
              <option>LONG</option>
              <option>SHORT</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Result</label>
            <select className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-emerald-500">
              <option>WIN</option>
              <option>LOSS</option>
              <option>BREAKEVEN</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">P&L</label>
            <input
              type="number"
              placeholder="0"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Setup Type</label>
            <select className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-emerald-500">
              <option>LIQUIDITY_SWEEP</option>
              <option>RANGE_BREAKOUT</option>
              <option>REVERSAL</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">What went well?</label>
          <textarea
            placeholder="Describe what you did right..."
            rows={2}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Lessons learned</label>
          <textarea
            placeholder="What will you do differently next time?"
            rows={2}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="flex-1 py-2 rounded-lg border border-[#00D9FF]/60 bg-[#006bff] px-4 py-2 font-semibold text-white shadow-[0_0_20px_rgba(0,217,255,0.22)] transition hover:bg-[#087cff]"
          >
            Save Entry
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </motion.div>
  );
}
