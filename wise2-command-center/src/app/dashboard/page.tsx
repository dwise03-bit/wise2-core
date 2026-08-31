'use client';

import React, { useState } from 'react';
import { useSystemStatus } from '@/hooks/useSystemStatus';

export default function CommandCenterPage() {
  const [activeTab, setActiveTab] = useState(1);
  const { status } = useSystemStatus(30000); // Refetch every 30 seconds

  return (
    <div className="min-h-screen flex flex-col bg-[#020303]" style={{
      backgroundImage: 'radial-gradient(2px 2px at 20% 30%, rgba(101, 255, 0, 0.02), transparent), radial-gradient(2px 2px at 60% 70%, rgba(72, 200, 255, 0.02), transparent)',
      backgroundSize: '200px 200px'
    }}>
      {/* TAB BAR */}
      <div className="border-b border-[#3c4341] bg-[#050606]">
        <div className="max-w-full px-0">
          <div className="flex items-center gap-0">
            {[
              { id: 1, label: '1 WISE² GHOSTTY COMMAND CENTER', short: '1 COMMAND CENTER' },
              { id: 2, label: '2 DEVICE FABRIC', short: '2 DEVICES' },
              { id: 3, label: '3 MOBILE COMMAND', short: '3 MOBILE' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-3 sm:px-4 md:px-6 py-3 text-xs sm:text-sm font-mono border-r border-[#3c4341] transition-colors relative ${
                  activeTab === tab.id
                    ? 'bg-[#090b0b] text-[#48c8ff] font-semibold'
                    : 'bg-[#050606] text-[#a4aaa7] hover:text-[#e8ebe9]'
                }`}
              >
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.short}</span>
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#48c8ff]" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-3 sm:p-4 md:p-5 overflow-auto">
        {activeTab === 1 && <CommandCenterTab1 status={status} />}
        {activeTab === 2 && <DeviceFabricTab />}
        {activeTab === 3 && <MobileCommandTab />}
      </main>
    </div>
  );
}

function CommandCenterTab1({ status }: any) {
  return (
    <div className="max-w-full mx-auto space-y-3 sm:space-y-4 md:space-y-5">
      {/* HERO PANEL */}
      <div className="border border-[#c7cdca] bg-[#050606] rounded-sm p-4 sm:p-6 md:p-8 text-center">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-mono font-bold text-[#e8ebe9] tracking-wide">
          WISE² GHOSTTY COMMAND CENTER
        </h1>
        <p className="text-sm sm:text-base md:text-xl font-mono text-[#48c8ff] mt-2 tracking-wide">
          ONE TERMINAL. TOTAL CONTROL.
        </p>
      </div>

      {/* THREE-PANEL GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
        {/* WISE² CORE */}
        <SystemPanel
          icon="🧠"
          title="WISE² CORE"
          subtitle="MAIN BRAIN"
          rows={[
            { label: 'Ollama', value: status.wise2Core.ollama },
            { label: 'Hermes', value: status.wise2Core.hermes },
            { label: 'Codex', value: status.wise2Core.codex },
            { label: 'Local Models', value: status.wise2Core.modelCount.toString() },
          ]}
        />

        {/* VPS OPS */}
        <SystemPanel
          icon="☁️"
          title="VPS OPS"
          subtitle="CLOUD SERVER"
          rows={[
            { label: 'Docker', value: `${status.vpsOps.docker.healthy}/${status.vpsOps.docker.total} Healthy` },
            { label: 'Traefik', value: status.vpsOps.traefik },
            { label: 'PostgreSQL', value: status.vpsOps.postgresql },
            { label: 'Redis', value: status.vpsOps.redis },
            { label: 'wise2.net', value: status.vpsOps.wise2net },
          ]}
        />

        {/* GPU / AI */}
        <SystemPanel
          icon="⚡"
          title="GPU / AI"
          subtitle="AI POWER"
          rows={[
            { label: 'GPU STATUS', value: status.gpuAi.gpu },
            { label: 'CUDA', value: status.gpuAi.cuda },
            { label: 'Ollama Models', value: status.gpuAi.ollamaModels },
            { label: 'Claude Code', value: status.gpuAi.claudeCode },
          ]}
        />
      </div>

      {/* ACCESS AND NETWORK STRIP */}
      <div className="border border-[#c7cdca] bg-[#050606] rounded-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-x divide-[#c7cdca]">
          <div className="px-6 py-4 flex items-center gap-3">
            <span className="text-lg">🌐</span>
            <span className={`text-sm font-mono truncate ${
              status.access.tailscale === 'Connected' ? 'text-[#e8ebe9]' : 'text-[#ff625f]'
            }`}>
              TAILSCALE {(status.access.tailscale === 'Connected' ? 'CONNECTED' : status.access.tailscale).toUpperCase()}
            </span>
          </div>
          <div className="px-6 py-4 flex items-center gap-3">
            <span className="text-lg">👤</span>
            <span className="text-sm font-mono text-[#48c8ff]">{status.access.user} — {status.access.accessLevel}</span>
          </div>
          <div className="px-6 py-4 flex items-center gap-3">
            <span className="text-lg">👥</span>
            <span className="text-sm font-mono text-[#48c8ff]">DARRIN — FULL ACCESS</span>
          </div>
          <div className="px-6 py-4 flex items-center gap-3">
            <span className="text-lg">⚡</span>
            <span className="text-sm font-mono text-[#e8ebe9]">CREDIT SAVER MODE</span>
          </div>
        </div>
      </div>

      {/* QUICK COMMAND STRIP */}
      <div className="border border-[#c7cdca] bg-[#050606] rounded-sm">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 divide-x divide-[#c7cdca]">
          {[
            { num: '1', label: 'HEALTH' },
            { num: '2', label: 'DEVICES' },
            { num: '3', label: 'DEPLOY' },
            { num: '4', label: 'LOGS' },
            { num: '5', label: 'MOBILE' },
          ].map((cmd) => (
            <button
              key={cmd.num}
              className="px-6 py-4 text-center hover:bg-[#090b0b] transition-colors"
            >
              <div className="flex items-center justify-center gap-3">
                <div className="border border-[#48c8ff] w-6 h-6 flex items-center justify-center text-xs font-mono text-[#48c8ff] font-bold">
                  {cmd.num}
                </div>
                <span className="text-sm font-mono text-[#e8ebe9] font-semibold">{cmd.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* BOTTOM STATUS LINE */}
      <div className="border border-[#c7cdca] bg-[#050606] rounded-sm px-6 py-3">
        <p className="text-sm font-mono text-[#a4aaa7]">
          <span className="text-[#48c8ff] font-semibold">[MOBILE COMMAND]</span>
          {' '}Secure mobile dashboard ready through Tailscale
        </p>
      </div>
    </div>
  );
}

function SystemPanel({
  icon,
  title,
  subtitle,
  rows,
}: {
  icon: string;
  title: string;
  subtitle: string;
  rows: Array<{ label: string; value: string }>;
}) {
  return (
    <div className="border border-[#c7cdca] bg-[#050606] rounded-sm overflow-hidden">
      {/* PANEL HEADER */}
      <div className="px-4 py-3 border-b border-[#c7cdca]">
        <div className="flex items-start gap-3 mb-2">
          <span className="text-xl">{icon}</span>
          <div>
            <h3 className="text-sm font-mono font-bold text-[#65ff00] tracking-wide">{title}</h3>
            <p className="text-xs font-mono text-[#48c8ff] tracking-wide">{subtitle}</p>
          </div>
        </div>
      </div>

      {/* PANEL ROWS */}
      <div className="px-4 py-3 space-y-2">
        {rows.map((row, idx) => (
          <div key={idx} className="flex items-center justify-between gap-4 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-[#65ff00]">●</span>
              <span className="text-[#e8ebe9]">{row.label}</span>
            </div>
            <span className="text-[#65ff00] font-semibold">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DeviceFabricTab() {
  return (
    <div className="border border-[#c7cdca] bg-[#050606] rounded-sm p-8 text-center">
      <h2 className="text-3xl font-mono font-bold text-[#e8ebe9]">DEVICE FABRIC</h2>
      <p className="text-sm font-mono text-[#a4aaa7] mt-4">Connected devices and edge nodes</p>
      <p className="text-xs font-mono text-[#a4aaa7] mt-2">[Coming Soon]</p>
    </div>
  );
}

function MobileCommandTab() {
  return (
    <div className="border border-[#c7cdca] bg-[#050606] rounded-sm p-8 text-center">
      <h2 className="text-3xl font-mono font-bold text-[#e8ebe9]">MOBILE COMMAND</h2>
      <p className="text-sm font-mono text-[#a4aaa7] mt-4">Secure mobile dashboard</p>
      <p className="text-xs font-mono text-[#a4aaa7] mt-2">[Coming Soon]</p>
    </div>
  );
}
