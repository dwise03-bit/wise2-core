'use client';

import { AppShell } from '@/components/AppShell';
import { SystemBays } from '@/components/SystemBays';
import { InfluenceMixer } from '@/components/InfluenceMixer';
import { mockSystems } from '@/data/mockSystems';
import { useBuildStore } from '@/utils/store';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function Home() {
  const { setForemanState } = useBuildStore();
  const [activeTab, setActiveTab] = useState<'browser' | 'mixer'>('browser');

  useEffect(() => {
    setForemanState({
      currentState: 'idle',
      message: "Aight, lemme see the blueprints.",
    });
  }, [setForemanState]);

  return (
    <AppShell title="BUILD FLOOR">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="industrial-panel p-8"
        >
          <h2 className="text-3xl font-bold mb-2">
            Welcome to WISE TOUCH // PROMPT SHOP™
          </h2>
          <p className="text-gunmetal">
            Build custom AI prompts by mixing systems to create your perfect blend.
            Total influence must equal 100% to generate.
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-gunmetal">
          <button
            onClick={() => setActiveTab('browser')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'browser'
                ? 'text-laser-orange border-b-2 border-laser-orange'
                : 'text-gunmetal hover:text-blueprint-white'
            }`}
          >
            SYSTEM BAYS // PROMPT BROWSER
          </button>
          <button
            onClick={() => setActiveTab('mixer')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'mixer'
                ? 'text-laser-orange border-b-2 border-laser-orange'
                : 'text-gunmetal hover:text-blueprint-white'
            }`}
          >
            HYBRID MIXER
          </button>
        </div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'browser' && (
            <SystemBays systems={mockSystems} />
          )}
          {activeTab === 'mixer' && (
            <InfluenceMixer systems={mockSystems} />
          )}
        </motion.div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button className="industrial-button px-6 py-3 text-lg font-bold">
            PREVIEW BUILD
          </button>
          <button className="industrial-panel px-6 py-3 text-lg font-bold hover:border-laser-orange transition-colors">
            SAVE BLUEPRINT
          </button>
          <button className="industrial-panel px-6 py-3 text-lg font-bold hover:border-laser-orange transition-colors">
            GENERATE MASTERPIECE
          </button>
        </div>

        {/* Quick Info Panels */}
        <div className="grid grid-cols-3 gap-4">
          <div className="industrial-panel p-4 text-center">
            <p className="text-xs text-gunmetal mb-1">TOTAL BUILDS</p>
            <p className="text-2xl font-bold text-laser-orange">47</p>
          </div>
          <div className="industrial-panel p-4 text-center">
            <p className="text-xs text-gunmetal mb-1">FAVORITES</p>
            <p className="text-2xl font-bold text-laser-orange">12</p>
          </div>
          <div className="industrial-panel p-4 text-center">
            <p className="text-xs text-gunmetal mb-1">IN PROGRESS</p>
            <p className="text-2xl font-bold text-yellow-500">3</p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
