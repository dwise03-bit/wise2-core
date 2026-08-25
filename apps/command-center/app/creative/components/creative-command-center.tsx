import React, { useState, useEffect } from 'react';
import { LocalGPUStatus } from './local-gpu-status';
import { ProviderStatusPanel } from './provider-status-panel';
import { CreditWalletWidget } from './credit-wallet-widget';
import { GenerationQueuePanel } from './generation-queue-panel';
import { AssetLibraryBrowser } from './asset-library-browser';
import { GenerationForm } from './generation-form';

interface ProviderStatus {
  name: string;
  online: boolean;
  freeCredits: string | number;
  paidCredits?: number;
}

export function CreativeCommandCenter() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'generate' | 'history' | 'assets'>('dashboard');
  const [providers, setProviders] = useState<ProviderStatus[]>([
    { name: 'Local GPU (ComfyUI)', online: true, freeCredits: 'Unlimited' },
    { name: 'Kling', online: true, freeCredits: 'Loading...' },
    { name: 'Hailuo', online: true, freeCredits: 'Loading...' },
    { name: 'PixVerse', online: false, freeCredits: 'N/A' },
    { name: 'Pika', online: false, freeCredits: 'N/A' },
  ]);

  useEffect(() => {
    const fetchProviderStatus = async () => {
      try {
        const response = await fetch('/api/v1/creative/providers/status');
        if (response.ok) {
          const data = await response.json();
          // Map response to providers if needed
        }
      } catch (error) {
        console.error('Failed to fetch provider status:', error);
      }
    };

    const interval = setInterval(fetchProviderStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                WISE² Creative Command Center
              </h1>
              <p className="text-slate-400 mt-1">AI-Native Generation Pipeline</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-400">Status: Operational</p>
              <p className="text-xs text-slate-500">Build: WISE2-CC v1.0</p>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="border-b border-slate-700 bg-slate-900/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-8">
            {(['dashboard', 'generate', 'history', 'assets'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-2 border-b-2 font-medium transition-colors capitalize ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-300'
                }`}
              >
                {tab === 'dashboard' && '📊 Dashboard'}
                {tab === 'generate' && '✨ Generate'}
                {tab === 'history' && '📋 History'}
                {tab === 'assets' && '🎨 Assets'}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              <LocalGPUStatus />
              <ProviderStatusPanel providers={providers} />
              <GenerationQueuePanel />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <CreditWalletWidget />
            </div>
          </div>
        )}

        {activeTab === 'generate' && <GenerationForm />}

        {activeTab === 'history' && (
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-8 text-center">
            <p className="text-slate-400">Generation history coming soon</p>
          </div>
        )}

        {activeTab === 'assets' && <AssetLibraryBrowser />}
      </main>
    </div>
  );
}
