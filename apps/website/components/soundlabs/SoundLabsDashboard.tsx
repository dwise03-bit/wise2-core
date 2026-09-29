'use client';

import { useState, useEffect } from 'react';
import { useSoundLabsProduction } from '@/lib/hooks/useSoundLabsProduction';
import { LoginPanel } from './LoginPanel';
import { DashboardOverview } from './DashboardOverview';
import { MusicGenerationPanel } from './MusicGenerationPanel';
import { ReaperControls } from './ReaperControls';
import { StreamingPanel } from './StreamingPanel';
import { ProjectsManager } from './ProjectsManager';

export function SoundLabsDashboard() {
  const {
    client,
    projects,
    isLoading,
    error,
    login,
    logout,
    listProjects,
  } = useSoundLabsProduction();

  const [activeTab, setActiveTab] = useState<'overview' | 'generate' | 'reaper' | 'stream' | 'projects'>('overview');

  useEffect(() => {
    if (client?.token) {
      listProjects();
    }
  }, [client?.token, listProjects]);

  if (!client) {
    return <LoginPanel onLogin={login} isLoading={isLoading} error={error} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050607] via-[#0a0a0c] to-[#050607] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#00D9FF]/10 bg-[#050607]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00D9FF] to-[#00FF7F] flex items-center justify-center">
              <span className="text-[#050607] font-bold text-lg">♪</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Sound Labs</h1>
              <p className="text-xs text-[#00D9FF]">{client.name}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 rounded-lg border border-[#00D9FF]/30 hover:border-[#00D9FF] text-[#00D9FF] text-sm transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-6 py-4 border-b border-[#00D9FF]/10 flex gap-2 overflow-x-auto">
        {[
          { id: 'overview', label: 'Dashboard' },
          { id: 'generate', label: 'Music Generation' },
          { id: 'reaper', label: 'REAPER Control' },
          { id: 'stream', label: 'Live Stream' },
          { id: 'projects', label: 'Projects' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-lg text-sm transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-[#00D9FF] text-[#050607] font-semibold'
                : 'text-[#00D9FF] hover:bg-[#00D9FF]/10'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        {activeTab === 'overview' && <DashboardOverview client={client} projectCount={projects.length} />}
        {activeTab === 'generate' && <MusicGenerationPanel client={client} />}
        {activeTab === 'reaper' && <ReaperControls />}
        {activeTab === 'stream' && <StreamingPanel client={client} />}
        {activeTab === 'projects' && <ProjectsManager projects={projects} isLoading={isLoading} />}
      </main>
    </div>
  );
}
