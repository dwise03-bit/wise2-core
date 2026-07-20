'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Search, Bell, User, ChevronDown, MoreVertical, Play, Pause, Plus } from 'lucide-react';

// ============ THEME & COLORS ============
const COLORS = {
  accent: '#39FF14',
  accentDim: 'rgba(57, 255, 20, 0.1)',
  accentDarkBg: 'rgba(57, 255, 20, 0.08)',
  accentLowAlpha: 'rgba(57, 255, 20, 0.35)',
  accentGlow: 'rgba(57, 255, 20, 0.25)',
  black: '#050505',
  deepBlack: '#020203',
  darkBg: '#0a0a0a',
  cardBg: '#0d0d0d',
  cardBgElevated: '#141414',
  borderColor: '#262626',
  borderDim: '#222222',
  borderSoft: 'rgba(255, 255, 255, 0.08)',
  textPrimary: '#e6e6e6',
  textSecondary: '#999999',
  textTertiary: '#555555',
  red: '#ff5c5c',
  yellow: '#e0a83c',
  blue: '#0369A1',
  blueSoft: 'rgba(3, 105, 161, 0.15)',
};

// ============ UTILITY FUNCTIONS ============
const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

// ============ TOP BAR ============
const TopBar = ({ currentPage, onPageChange }: any) => (
  <div className="flex items-center gap-5 h-14 px-5 bg-gradient-to-b from-[#111] to-[#0a0a0a] border-b border-[#262626] flex-none">
    {/* Logo */}
    <div className="flex items-baseline gap-1">
      <span className="font-orbitron font-black text-xl bg-gradient-to-b from-white to-[#777] bg-clip-text text-transparent">WISE</span>
      <span className="font-orbitron font-black text-xs" style={{ color: COLORS.accent, textShadow: `0 0 8px rgba(57,255,20,.6)` }}>2</span>
    </div>
    <div className="text-xs tracking-widest text-[#666] uppercase border-l border-[#2a2a2a] pl-3">Creative Studio</div>
    <div className="flex items-center gap-2 text-xs text-[#777]">
      <span>Workspace</span>
      <span className="text-[#333]">/</span>
      <button className="flex gap-1 items-center bg-[#161616] border border-[#2c2c2c] text-[#ccc] rounded px-2 py-1 font-semibold text-xs hover:border-[#39FF14] transition">
        <span className="w-1.5 h-1.5 rounded-xs bg-[#39FF14]"></span>Wise Defense HQ<span className="text-[#555] text-[0.625rem]">▾</span>
      </button>
      <span className="text-[#333]">/</span>
      <span className="text-[#aaa] font-semibold">command</span>
    </div>
    <div className="flex-1"></div>
    <button className="flex items-center gap-2 w-80 bg-[#0d0d0d] border border-[#2c2c2c] rounded px-3 py-1.5 text-[#666] text-xs hover:border-[#39FF14] transition group">
      <span className="text-[#444]">⌕</span>
      <span>Search or run a command…</span>
      <span className="ml-auto text-[0.625rem] bg-[#1a1a1a] border border-[#333] rounded px-1 text-[#888]">⌘K</span>
    </button>
    <button className="relative flex items-center justify-center w-8 h-8 bg-[#141414] border border-[#2c2c2c] rounded hover:border-[#39FF14] transition text-[#bbb]">
      ◔
      <span className="absolute top-1.5 right-2 w-1.5 h-1.5 rounded-full bg-[#39FF14]" style={{ animation: 'pulse 2s infinite' }}></span>
    </button>
    <button className="flex items-center gap-2 bg-[#141414] border border-[#2c2c2c] rounded px-2 py-1 hover:border-[#39FF14] transition cursor-pointer text-[#ddd]">
      <div className="w-7 h-7 rounded border border-[#333] bg-[#1a1a1a]"></div>
      <span className="text-xs font-semibold">Darrin W.</span>
      <span className="text-[0.625rem] text-[#555]">▾</span>
    </button>
  </div>
);

// ============ SIDEBAR ============
const Sidebar = ({ currentPage, onPageChange, credits }: any) => (
  <div className="w-56 flex-none bg-[#0a0a0a] border-r border-[#1f1f1f] flex flex-col p-3 gap-1 max-h-screen overflow-y-auto">
    <div className="text-xs tracking-widest text-[#555] uppercase p-2">Studio Modules</div>
    {[
      { id: 'command', label: 'Command Center', abbr: 'CC' },
      { id: 'sound', label: 'Sound Lab', abbr: 'SL' },
      { id: 'live', label: 'Live Studio', abbr: 'LV' },
      { id: 'jingle', label: 'Jingle Lab', abbr: 'JL' },
      { id: 'voice', label: 'Voice Lab', abbr: 'VL' },
      { id: 'factory', label: 'Content Factory', abbr: 'CF' },
      { id: 'showcase', label: 'Client Showcase', abbr: 'SH' },
    ].map((mod) => (
      <button
        key={mod.id}
        onClick={() => onPageChange(mod.id)}
        className={`flex items-center gap-2 px-3 py-2 rounded border font-bold text-sm tracking-widest text-left w-full transition ${
          currentPage === mod.id ? 'bg-[rgba(57,255,20,.1)] border-[rgba(57,255,20,.4)] text-white' : 'border-transparent text-[#909090] hover:text-white'
        }`}
      >
        <span className={`font-orbitron text-xs w-5 ${currentPage === mod.id ? 'text-[#39FF14]' : 'text-[#555]'}`}>{mod.abbr}</span>
        <span className="flex-1">{mod.label}</span>
        <span className="text-xs text-transparent">●</span>
      </button>
    ))}
    <div className="flex-1"></div>
    <div className="bg-[#0f0f0f] border border-[#222] rounded-lg p-3 space-y-3">
      <div className="flex justify-between text-xs tracking-widest text-[#666] uppercase"><span>AI Credits</span><span className="text-[#ccc]">{credits}</span></div>
      <div className="h-1 bg-[#1c1c1c] rounded-full overflow-hidden"><div className="w-2/3 h-full bg-[#39FF14]" style={{ boxShadow: '0 0 8px rgba(57,255,20,.6)' }}></div></div>
      <div className="flex justify-between text-xs tracking-widest text-[#666] uppercase"><span>Storage</span><span className="text-[#ccc]">61.8 GB</span></div>
      <div className="h-1 bg-[#1c1c1c] rounded-full overflow-hidden"><div className="w-2/5 h-full bg-[#8a8a8a]"></div></div>
      <div className="flex justify-between text-xs text-[#666]"><span>Render queue</span><span className="text-[#39FF14] font-bold">2 jobs</span></div>
      <button className="w-full bg-[rgba(57,255,20,.1)] border border-[rgba(57,255,20,.35)] text-[#39FF14] rounded px-3 py-2 font-bold text-xs tracking-widest uppercase hover:bg-[rgba(57,255,20,.2)] transition">+ Top Up Credits</button>
    </div>
    <div className="flex gap-2 items-center p-2 text-xs text-[#666] uppercase tracking-widest"><span className="w-2 h-2 rounded-full bg-[#39FF14]" style={{ animation: 'pulse 2.4s infinite' }}></span>All systems operational</div>
  </div>
);

// ============ COMMAND CENTER DASHBOARD ============
const CommandCenter = () => {
  const cardVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.06, duration: 0.4, ease: 'easeOut' },
    }),
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  };

  return (
    <div className="p-7 space-y-5">
      <motion.div className="flex items-end gap-4" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: 'easeOut' }}>
        <div>
          <h1 className="font-orbitron font-black text-3xl bg-gradient-to-b from-white via-[#e6e6e6] to-[#6f6f6f] bg-clip-text text-transparent uppercase" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.4)' }}>Command Center</h1>
          <p className="text-[#999] font-medium tracking-widest mt-1">Welcome back, Darrin. 3 renders finished overnight.</p>
        </div>
        <div className="flex-1"></div>
        <motion.button
          className="bg-[#39FF14] text-[#050505] border-none rounded px-4 py-2.5 font-bold text-sm tracking-widest uppercase hover:brightness-125 transition-all"
          whileHover={{ scale: 1.05, boxShadow: '0 0 24px rgba(57,255,20,0.6)' }}
          whileTap={{ scale: 0.98 }}
          style={{ animation: 'pulse 3s infinite' }}
        >
          + New Session
        </motion.button>
      </motion.div>

      {/* KPI Cards */}
      <motion.div
        className="grid grid-cols-4 gap-3.5"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {[
          { title: 'Assets Produced', value: '312', change: '+24%', desc: 'this month · all modules' },
          { title: 'AI Generations', value: '1,486', change: '+38%', desc: '7,214 credits remaining' },
          { title: 'Stream Watch Time', value: '412h', change: '+18%', desc: 'across 6 platforms' },
          { title: 'Revenue Attributed', value: '$18.9K', change: '+31%', desc: 'from studio content' },
        ].map((kpi, i) => (
          <motion.div
            key={i}
            custom={i}
            variants={cardVariants}
            whileHover={{ y: -4, borderColor: '#39FF14', boxShadow: '0 12px 32px rgba(57,255,20,0.2)' }}
            className="bg-gradient-to-br from-[#151515] via-[#0f0f0f] to-[#0a0a0a] border border-[#1f1f1f] rounded-xl p-4 transition-all duration-300 group cursor-pointer backdrop-blur-sm"
            style={{
              background: 'linear-gradient(135deg, rgba(21,21,21,0.8) 0%, rgba(15,15,15,0.6) 50%, rgba(10,10,10,0.4) 100%)',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 8px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
            }}
          >
            <div className="text-xs tracking-widest text-[#888] uppercase font-semibold">{kpi.title}</div>
            <div className="flex items-baseline gap-2.5 mt-2">
              <span className="font-orbitron font-black text-2xl text-[#f5f5f5]">{kpi.value}</span>
              <motion.span
                className="text-xs font-bold text-[#39FF14] bg-[rgba(57,255,20,.12)] border border-[rgba(57,255,20,.35)] rounded px-2 py-1 font-semibold"
                whileHover={{ backgroundColor: 'rgba(57,255,20,0.2)' }}
              >
                {kpi.change}
              </motion.span>
            </div>
            <div className="text-xs text-[#777] mt-2 font-medium">{kpi.desc}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts & Feeds */}
      <motion.div
        className="grid grid-cols-[1.7fr_1fr] gap-3.5"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          custom={4}
          variants={cardVariants}
          className="rounded-2xl p-5 transition-all duration-300"
          whileHover={{ y: -4, boxShadow: '0 16px 40px rgba(57,255,20,0.15)' }}
          style={{
            background: 'linear-gradient(135deg, rgba(21,21,21,0.8) 0%, rgba(15,15,15,0.6) 50%, rgba(10,10,10,0.4) 100%)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(39,39,39,0.6)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}
        >
          <div className="flex items-center gap-2.5 mb-5">
            <h3 className="text-xs tracking-widest text-[#e6e6e6] uppercase font-bold">Production Output</h3>
            <div className="flex-1"></div>
            <motion.span
              className="text-xs text-[#999] border border-[#333] rounded px-2 py-1 font-medium cursor-pointer"
              whileHover={{ borderColor: '#39FF14', color: '#39FF14' }}
            >
              Last 14 days ▾
            </motion.span>
          </div>
          <svg viewBox="0 0 620 190" className="w-full h-40">
            <defs>
              <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: 'rgba(57,255,20,0.2)', stopOpacity: 0.3 }} />
                <stop offset="100%" style={{ stopColor: 'rgba(57,255,20,0.05)', stopOpacity: 0.1 }} />
              </linearGradient>
            </defs>
            <polyline points="0,150 620,150" fill="none" stroke="#1a1a1a" strokeWidth="1"></polyline>
            <polygon points="0,180 20,130 40,140 60,110 80,120 100,80 120,90 140,60 160,70 180,40 200,50 220,30 240,20 260,15" fill="url(#chartGradient)"></polygon>
            <polyline
              points="0,180 20,130 40,140 60,110 80,120 100,80 120,90 140,60 160,70 180,40 200,50 220,30 240,20 260,15"
              fill="none"
              stroke="#39FF14"
              strokeWidth="3"
              strokeLinejoin="round"
              style={{ filter: 'drop-shadow(0 0 8px rgba(57,255,20,0.8))' }}
            ></polyline>
          </svg>
          <div className="flex justify-between text-xs text-[#777] tracking-widest mt-3 font-medium">
            <span>JUL 05</span><span>JUL 08</span><span>JUL 11</span><span>JUL 14</span><span>JUL 17</span><span>TODAY</span>
          </div>
        </motion.div>

        <motion.div
          custom={5}
          variants={cardVariants}
          className="rounded-2xl p-4 transition-all duration-300"
          style={{
            background: 'linear-gradient(135deg, rgba(21,21,21,0.8) 0%, rgba(15,15,15,0.6) 50%, rgba(10,10,10,0.4) 100%)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(39,39,39,0.6)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}
        >
          <h3 className="text-xs tracking-widest text-[#e6e6e6] uppercase font-bold mb-3">AI Activity Feed</h3>
          <div className="space-y-2 overflow-y-auto max-h-48">
            {[
              { label: 'MASTER', text: 'AI mastered "Midnight Anthem" — LUFS -9.4', time: '2m' },
              { label: 'CLIP', text: '6 highlights detected in Friday broadcast', time: '18m' },
              { label: 'VOICE', text: '"Coach K" clone finished training', time: '54m' },
              { label: 'RENDER', text: 'Summer Promo vertical cut exported', time: '1h' },
              { label: 'PUBLISH', text: 'Blog "Recovery Guide" pushed to site', time: '3h' },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="flex gap-2 p-2.5 rounded transition-all"
                whileHover={{ backgroundColor: 'rgba(57,255,20,0.08)', paddingLeft: 14 }}
              >
                <span className="font-orbitron text-xs text-[#39FF14] border border-[rgba(57,255,20,.35)] rounded px-1.5 py-0.5 flex-none font-semibold">{item.label}</span>
                <div className="flex-1">
                  <div className="font-semibold text-xs text-[#e6e6e6]">{item.text}</div>
                </div>
                <span className="text-xs text-[#777] flex-none">{item.time}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Quick Actions & Recommendations */}
      <motion.div
        className="grid grid-cols-3 gap-3.5"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          custom={6}
          variants={cardVariants}
          className="rounded-2xl p-4 transition-all duration-300"
          style={{
            background: 'linear-gradient(135deg, rgba(21,21,21,0.8) 0%, rgba(15,15,15,0.6) 50%, rgba(10,10,10,0.4) 100%)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(39,39,39,0.6)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}
        >
          <h3 className="text-xs tracking-widest text-[#e6e6e6] uppercase font-bold mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            {['▸ New Mix Session', '▸ Go Live Now', '▸ Generate Jingle', '▸ Batch Content Run'].map((action, i) => (
              <motion.button
                key={i}
                className="rounded px-2.5 py-2.5 text-[#e6e6e6] font-bold text-xs text-left transition-all"
                style={{
                  background: 'rgba(20,20,20,0.6)',
                  border: '1px solid rgba(42,42,42,0.8)',
                  backdropFilter: 'blur(4px)',
                }}
                whileHover={{
                  backgroundColor: 'rgba(57,255,20,0.1)',
                  borderColor: '#39FF14',
                  color: '#39FF14',
                  boxShadow: '0 4px 12px rgba(57,255,20,0.15)',
                }}
              >
                {action}
              </motion.button>
            ))}
          </div>
        </motion.div>

        <motion.div
          custom={7}
          variants={cardVariants}
          className="rounded-2xl p-4 transition-all duration-300"
          style={{
            background: 'linear-gradient(135deg, rgba(15,21,12,0.8) 0%, rgba(11,11,11,0.6) 50%, rgba(10,10,10,0.4) 100%)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(57,255,20,0.2)',
            boxShadow: '0 8px 24px rgba(57,255,20,0.1), inset 0 1px 0 rgba(255,255,255,0.02)',
          }}
        >
          <h3 className="text-xs tracking-widest text-[#39FF14] uppercase font-bold mb-3">WISE² AI Recommends</h3>
          <motion.div className="space-y-2.5">
            {[
              'Your Friday streams out-perform weekdays 3.1× — schedule launch Friday 7PM.',
              '"Ironclad Anthem" ready for 15s ad cut. One click to Content Factory.',
              'Vocal bus clips at 2:14 — apply De-Noise AI preset "Stage Mic".',
            ].map((rec, i) => (
              <motion.div
                key={i}
                className="flex gap-2 text-xs text-[#e6e6e6] font-medium"
                whileHover={{ paddingLeft: 4, color: '#39FF14' }}
              >
                <span className="text-[#39FF14] flex-shrink-0">▸</span>
                <span>{rec}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          custom={8}
          variants={cardVariants}
          className="rounded-2xl p-4 transition-all duration-300"
          style={{
            background: 'linear-gradient(135deg, rgba(21,21,21,0.8) 0%, rgba(15,15,15,0.6) 50%, rgba(10,10,10,0.4) 100%)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(39,39,39,0.6)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}
        >
          <h3 className="text-xs tracking-widest text-[#e6e6e6] uppercase font-bold mb-3">Team Online</h3>
          <motion.div className="space-y-2.5">
            {[
              { name: 'Darrin Wise', status: 'Mixing · Sound Lab', online: true },
              { name: 'Daniel Wise', status: 'Prepping · Live Studio', online: true },
              { name: 'Maya Reyes', status: 'Away · Content Factory', online: false },
            ].map((member, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-2.5 p-2 rounded transition-all"
                whileHover={{ backgroundColor: 'rgba(57,255,20,0.05)' }}
              >
                <motion.div
                  className="w-8 h-8 rounded flex-shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, rgba(57,255,20,0.15), rgba(3,105,161,0.15))',
                    border: '1px solid rgba(57,255,20,0.2)',
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-xs text-[#e6e6e6]">{member.name}</div>
                  <div className="text-xs text-[#999]">{member.status}</div>
                </div>
                <motion.span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: member.online ? '#39FF14' : '#e0a83c' }}
                  animate={member.online ? { opacity: [0.6, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

// ============ LIVE STUDIO ============
const LiveStudio = () => (
  <div className="p-7 space-y-5">
    <div><h1 className="font-orbitron font-black text-3xl text-[#39FF14]">🔴 LIVE STREAM ACTIVE</h1></div>
    <div className="rounded-2xl p-6 bg-red-950 border-2 border-red-600">
      <div className="text-xl font-bold text-white">LIVE NOW - Friday Night Beats</div>
      <div className="text-2xl font-bold text-[#39FF14] mt-2">2,847 viewers</div>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-red-900 border border-red-600 rounded p-4 text-white font-bold">⏹ Stop Stream</div>
      <div className="bg-green-900 border border-green-600 rounded p-4 text-white font-bold">⚙️ Settings</div>
    </div>
    <div className="grid grid-cols-4 gap-3">
      <div className="bg-[#1a1a1a] border border-[#333] rounded p-3"><div className="text-[#39FF14] font-bold">6 Mbps</div><div className="text-xs text-[#999]">Bitrate</div></div>
      <div className="bg-[#1a1a1a] border border-[#333] rounded p-3"><div className="text-[#39FF14] font-bold">60</div><div className="text-xs text-[#999]">FPS</div></div>
      <div className="bg-[#1a1a1a] border border-[#333] rounded p-3"><div className="text-[#39FF14] font-bold">23m</div><div className="text-xs text-[#999]">Uptime</div></div>
      <div className="bg-[#1a1a1a] border border-[#333] rounded p-3"><div className="text-yellow-500 font-bold">45%</div><div className="text-xs text-[#999]">CPU</div></div>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-[#1a1a1a] border border-[#333] rounded p-4"><div className="text-[#39FF14] font-bold mb-2">💬 Live Chat</div><div className="text-xs text-[#999]">+DarrinW: Fire! 🔥</div></div>
      <div className="bg-[#1a1a1a] border border-[#333] rounded p-4"><div className="text-[#39FF14] font-bold mb-2">👍 Engagement</div><div className="text-xs text-[#999]">342 reactions</div></div>
    </div>
  </div>
);

// ============ JINGLE LAB ============
const JingleLab = () => (
  <div className="p-7 space-y-5">
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: 'easeOut' }}>
      <h1 className="font-orbitron font-black text-3xl bg-gradient-to-b from-white via-[#e6e6e6] to-[#6f6f6f] bg-clip-text text-transparent uppercase">Jingle Lab</h1>
      <p className="text-[#999] font-medium tracking-widest mt-1">CREATE. BRAND. IMPACT.</p>
    </motion.div>

    {/* Quick Generate */}
    <motion.button
      className="w-full rounded-xl p-6 font-bold text-lg tracking-widest uppercase"
      style={{
        background: 'linear-gradient(135deg, rgba(57,255,20,0.2) 0%, rgba(57,255,20,0.1) 100%)',
        border: '2px solid rgba(57,255,20,0.4)',
      }}
      whileHover={{ scale: 1.02, boxShadow: '0 0 24px rgba(57,255,20,0.4)' }}
      animate={{ boxShadow: ['0 0 12px rgba(57,255,20,0.2)', '0 0 20px rgba(57,255,20,0.3)', '0 0 12px rgba(57,255,20,0.2)'] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      ✨ Generate New Jingle
    </motion.button>

    {/* Template Gallery */}
    <div>
      <h3 className="text-xs tracking-widest text-[#e6e6e6] uppercase font-bold mb-4">Featured Templates</h3>
      <motion.div
        className="grid grid-cols-4 gap-4"
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } }}
        initial="hidden"
        animate="visible"
      >
        {[
          { name: 'Bright & Bold', duration: '15s', bpm: '120' },
          { name: 'Corporate Pro', duration: '30s', bpm: '100' },
          { name: 'Upbeat Energy', duration: '10s', bpm: '140' },
          { name: 'Smooth Jazz', duration: '20s', bpm: '95' },
          { name: 'Tech Vibe', duration: '15s', bpm: '130' },
          { name: 'Minimal Clean', duration: '25s', bpm: '110' },
          { name: 'Epic Intro', duration: '5s', bpm: '160' },
          { name: 'Calm Focus', duration: '30s', bpm: '80' },
        ].map((template, i) => (
          <motion.div
            key={i}
            className="rounded-lg p-4 cursor-pointer group"
            style={{
              background: 'linear-gradient(135deg, rgba(21,21,21,0.8) 0%, rgba(15,15,15,0.6) 100%)',
              border: '1px solid rgba(39,39,39,0.6)',
            }}
            whileHover={{ y: -4, borderColor: '#39FF14', boxShadow: '0 8px 20px rgba(57,255,20,0.2)' }}
          >
            <div className="w-full h-16 bg-[#0a0a0a] rounded mb-3 flex items-center justify-center border border-[#333]">
              <span className="text-[#39FF14] text-xl">♪</span>
            </div>
            <div className="text-xs font-bold text-[#e6e6e6]">{template.name}</div>
            <div className="flex justify-between text-xs text-[#999] mt-2 font-medium">
              <span>{template.duration}</span>
              <span>{template.bpm} BPM</span>
            </div>
            <motion.button
              className="w-full mt-3 bg-[#39FF14] text-[#050505] rounded px-2 py-1 font-bold text-xs tracking-widest uppercase opacity-0 group-hover:opacity-100"
              whileHover={{ scale: 1.05 }}
            >
              Use Template
            </motion.button>
          </motion.div>
        ))}
      </motion.div>
    </div>

    {/* Recent Projects */}
    <div>
      <h3 className="text-xs tracking-widest text-[#e6e6e6] uppercase font-bold mb-4">Your Projects</h3>
      <motion.div
        className="space-y-2"
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } }}
        initial="hidden"
        animate="visible"
      >
        {[
          { name: 'Brand Jingle v3', status: 'Ready', date: '2 hours ago' },
          { name: 'Product Launch SFX', status: 'Rendering', date: '5 min ago' },
          { name: 'Podcast Intro Mix', status: 'Ready', date: '1 day ago' },
        ].map((proj, i) => (
          <motion.div
            key={i}
            className="rounded-lg p-4 flex justify-between items-center"
            style={{
              background: 'linear-gradient(135deg, rgba(21,21,21,0.8) 0%, rgba(15,15,15,0.6) 100%)',
              border: '1px solid rgba(39,39,39,0.6)',
            }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex-1">
              <div className="font-bold text-sm text-[#e6e6e6]">{proj.name}</div>
              <div className="text-xs text-[#999]">{proj.date}</div>
            </div>
            <div className="flex gap-2 items-center">
              <span className={`text-xs font-bold px-2 py-1 rounded ${proj.status === 'Ready' ? 'bg-[#39FF14] text-[#050505]' : 'bg-[#e0a83c] text-[#050505]'}`}>
                {proj.status}
              </span>
              <button className="text-[#39FF14] hover:text-white transition">▶</button>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  </div>
);

// ============ CLIENT SHOWCASE ============
const ClientShowcase = () => (
  <div className="p-7 space-y-5">
    <div>
      <h1 className="font-orbitron font-black text-3xl bg-gradient-to-b from-white via-[#e6e6e6] to-[#6f6f6f] bg-clip-text text-transparent uppercase">Client Showcase</h1>
      <p className="text-[#999] font-medium tracking-widest mt-1">COMPLETED PROJECTS. REAL RESULTS.</p>
    </div>

    <div className="grid grid-cols-3 gap-4">
      {[
        { brand: 'Velocity Media', project: 'Audio Branding Suite', result: '+340% Engagement', color: 'from-purple-600 to-purple-900' },
        { brand: 'Luna Creatives', project: 'Live Stream Production', result: '2.3M Views', color: 'from-pink-600 to-pink-900' },
        { brand: 'Quantum Studios', project: 'Sonic Identity', result: 'Award Winning', color: 'from-blue-600 to-blue-900' },
      ].map((client, i) => (
        <div key={i} className="rounded-xl overflow-hidden border border-[#333]" style={{ background: `linear-gradient(135deg, rgba(21,21,21,0.9) 0%, rgba(15,15,15,0.7) 100%)` }}>
          <div className={`h-32 bg-gradient-to-br ${client.color} flex items-center justify-center text-3xl font-bold`}>{client.brand[0]}</div>
          <div className="p-4 space-y-2">
            <div className="text-sm font-bold text-[#e6e6e6]">{client.brand}</div>
            <div className="text-xs text-[#999]">{client.project}</div>
            <div className="text-[#39FF14] font-bold text-sm mt-2">{client.result}</div>
          </div>
        </div>
      ))}
    </div>

    <div>
      <h3 className="text-xs tracking-widest text-[#e6e6e6] uppercase font-bold mb-3">Featured Case Study</h3>
      <div className="rounded-2xl p-6 border border-[#333]" style={{ background: 'linear-gradient(135deg, rgba(21,21,21,0.8) 0%, rgba(15,15,15,0.6) 100%)' }}>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-xs text-[#999] uppercase tracking-widest font-bold">Client</div>
            <div className="text-lg font-bold text-white mt-1">Velocity Media</div>
          </div>
          <div>
            <div className="text-xs text-[#999] uppercase tracking-widest font-bold">Deliverables</div>
            <div className="text-sm text-[#39FF14] font-bold mt-1">Audio Suite + Branding</div>
          </div>
          <div>
            <div className="text-xs text-[#999] uppercase tracking-widest font-bold">Timeline</div>
            <div className="text-sm text-[#39FF14] font-bold mt-1">6 Weeks</div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-[#444]">
          <p className="text-sm text-[#ccc]">"WISE² transformed our audio identity. The integrated branding suite increased engagement by 340% and set us apart in a crowded market. Professional, innovative, and delivered ahead of schedule."</p>
          <div className="text-xs text-[#999] mt-3">— Sarah Chen, Creative Director</div>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-xs tracking-widest text-[#e6e6e6] uppercase font-bold mb-3">Recent Projects</h3>
      <div className="space-y-2">
        {[
          { title: 'Luna Creatives Live Stream', status: 'Completed', date: '2 weeks ago', metrics: '2.3M views' },
          { title: 'Quantum Studios Sonic ID', status: 'Completed', date: '1 month ago', metrics: 'Award winning' },
          { title: 'Echo Labs Podcast Suite', status: 'Completed', date: '6 weeks ago', metrics: '#1 ranked' },
        ].map((proj, i) => (
          <div key={i} className="rounded-lg p-3 flex justify-between items-center border border-[#333]" style={{ background: 'rgba(20,20,20,0.6)' }}>
            <div>
              <div className="font-bold text-sm text-[#e6e6e6]">{proj.title}</div>
              <div className="text-xs text-[#999] mt-1">{proj.date} • {proj.metrics}</div>
            </div>
            <span className="text-xs font-bold px-2 py-1 rounded bg-[#39FF14] text-[#050505]">{proj.status}</span>
          </div>
        ))}
      </div>
    </div>

    <div className="rounded-2xl p-4 border border-[#39FF14] border-opacity-30" style={{ background: 'linear-gradient(135deg, rgba(57,255,20,0.05) 0%, rgba(57,255,20,0.02) 100%)' }}>
      <div className="flex justify-between items-start">
        <div>
          <div className="text-xs tracking-widest text-[#39FF14] uppercase font-bold">Portfolio Stats</div>
          <div className="text-2xl font-bold text-white mt-2">47+ Projects</div>
          <div className="text-sm text-[#999] mt-1">Successfully delivered</div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-[#39FF14]">98%</div>
          <div className="text-xs text-[#999] mt-1">Client satisfaction</div>
        </div>
      </div>
    </div>
  </div>
);

// ============ PLACEHOLDER PAGES ============
const PagePlaceholder = ({ title, subtitle }: any) => (
  <div className="p-7 space-y-5">
    <div>
      <h1 className="font-orbitron font-black text-3xl bg-gradient-to-b from-white to-[#6f6f6f] bg-clip-text text-transparent uppercase">{title}</h1>
      <p className="text-[#777] font-semibold tracking-widest">{subtitle}</p>
    </div>
    <div className="bg-[#0d0d0d] border border-[#222] rounded-2xl p-12 text-center">
      <p className="text-[#666] text-sm">Full {title} interface coming soon...</p>
    </div>
  </div>
);

// ============ MAIN PAGE ============
export default function CreativeStudioPage() {
  const [currentPage, setCurrentPage] = useState('command');
  const [credits, setCredits] = useState(7214);
  const mainRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to top on page change
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
  }, [currentPage]);

  // Add Orbitron and Rajdhani fonts
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;900&family=Rajdhani:wght@400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    // Add custom CSS for keyframes and cinematic effects
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0%, 100% { box-shadow: 0 0 12px rgba(57,255,20,.4), 0 0 24px rgba(57,255,20,0); }
        50% { box-shadow: 0 0 20px rgba(57,255,20,.8), 0 0 40px rgba(57,255,20,.4); }
      }

      @keyframes glow {
        0%, 100% { text-shadow: 0 0 10px rgba(57,255,20,.5); }
        50% { text-shadow: 0 0 20px rgba(57,255,20,.8); }
      }

      @keyframes shimmer {
        0% { opacity: 0.5; }
        50% { opacity: 1; }
        100% { opacity: 0.5; }
      }

      .font-orbitron {
        font-family: 'Orbitron', sans-serif;
        letter-spacing: -0.02em;
      }

      .font-rajdhani {
        font-family: 'Rajdhani', sans-serif;
      }

      /* Glassmorphism support */
      .glass {
        background: linear-gradient(135deg, rgba(21,21,21,0.8) 0%, rgba(15,15,15,0.6) 50%, rgba(10,10,10,0.4) 100%) !important;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(39,39,39,0.6);
      }

      /* Smooth transitions */
      * {
        transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
      }
    `;
    document.head.appendChild(style);
  }, []);

  return (
    <div className="flex flex-col h-screen" style={{ background: `linear-gradient(180deg, ${COLORS.deepBlack} 0%, ${COLORS.black} 50%, ${COLORS.deepBlack} 100%)` }}>
      {/* Ambient Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute rounded-full"
          style={{
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(57,255,20,0.08) 0%, transparent 70%)',
            top: '-100px',
            right: '200px',
            filter: 'blur(60px)',
          }}
          animate={{ y: [0, -30, 0], x: [0, 15, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute rounded-full"
          style={{
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(3,105,161,0.06) 0%, transparent 70%)',
            bottom: '100px',
            left: '50px',
            filter: 'blur(50px)',
          }}
          animate={{ y: [0, 20, 0], x: [0, -10, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Top Bar */}
      <TopBar currentPage={currentPage} onPageChange={setCurrentPage} />

      {/* Body */}
      <div className="flex flex-1 min-h-0 relative z-10">
        {/* Sidebar */}
        <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} credits={credits} />

        {/* Main Content */}
        <div
          ref={mainRef}
          className="flex-1 min-w-0 overflow-y-auto"
          style={{
            background: `radial-gradient(1400px 600px at 70% -10%, rgba(57,255,20,.06), transparent 65%), ${COLORS.black}`,
          }}
        >
          <AnimatePresence mode="wait">
            {currentPage === 'command' && (
              <motion.div key="command" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }}>
                <CommandCenter />
              </motion.div>
            )}
            {currentPage === 'sound' && (
              <motion.div key="sound" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }}>
                <PagePlaceholder title="Sound Lab" subtitle="CREATE. PRODUCE. MASTER." />
              </motion.div>
            )}
            {currentPage === 'live' && (
              <motion.div key="live" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }}>
                <LiveStudio />
              </motion.div>
            )}
            {currentPage === 'jingle' && (
              <motion.div key="jingle" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }}>
                <JingleLab />
              </motion.div>
            )}
            {currentPage === 'voice' && (
              <motion.div key="voice" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }}>
                <PagePlaceholder title="Voice Lab" subtitle="GENERATE. CLONE. DOMINATE." />
              </motion.div>
            )}
            {currentPage === 'factory' && (
              <motion.div key="factory" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }}>
                <PagePlaceholder title="Content Factory" subtitle="ONE PROMPT. EVERY CHANNEL." />
              </motion.div>
            )}
            {currentPage === 'showcase' && (
              <motion.div key="showcase" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }}>
                <ClientShowcase />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Custom Scrollbar */}
      <style>{`
        div::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        div::-webkit-scrollbar-thumb {
          background: #2a2a2a;
          border-radius: 4px;
        }
        div::-webkit-scrollbar-track {
          background: #0a0a0a;
        }
      `}</style>
    </div>
  );
}
