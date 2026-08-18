'use client';

import { AppShell } from '@/components/AppShell';
import { InfluenceMixer } from '@/components/InfluenceMixer';
import { mockSystems } from '@/data/mockSystems';
import { useBuildStore } from '@/utils/store';
import { motion } from 'framer-motion';
import { useEffect } from 'react';

export default function MixerPage() {
  const { influence, getInfluenceTotal, isInfluenceValid, setForemanState } = useBuildStore();

  useEffect(() => {
    const total = getInfluenceTotal();
    if (total === 0) {
      setForemanState({
        currentState: 'measuring',
        message: 'Boss, I need measurements. Gimme somethin\' to work with.',
      });
    } else if (total === 100) {
      setForemanState({
        currentState: 'approving',
        message: 'There we go. Hundred percent. Now we\'re up to code.',
      });
    } else if (total > 100) {
      setForemanState({
        currentState: 'error',
        message: `Whoa, Picasso. We got ${total}%. Math ain't optional on this job.`,
      });
    } else {
      setForemanState({
        currentState: 'adjusting',
        message: `Need ${100 - total}% more to make this work.`,
      });
    }
  }, [influence, getInfluenceTotal, setForemanState]);

  return (
    <AppShell title="HYBRID MIXER ENGINE ROOM">
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="industrial-panel p-8"
        >
          <h2 className="text-2xl font-bold mb-2">Hybrid Mixer Control Panel</h2>
          <p className="text-gunmetal mb-4">
            Adjust system influence percentages. Mix must equal exactly 100%.
          </p>

          {/* Visual DNA Controls */}
          <div className="space-y-4 mt-6">
            <h3 className="text-sm font-bold text-laser-orange">VISUAL DNA ASSEMBLY</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="industrial-panel p-3">
                <label className="text-xs font-semibold block mb-2">LINE STYLE</label>
                <select className="w-full bg-gunmetal text-blueprint-white rounded px-2 py-1 text-sm">
                  <option>Sharp</option>
                  <option>Smooth</option>
                  <option>Organic</option>
                </select>
              </div>
              <div className="industrial-panel p-3">
                <label className="text-xs font-semibold block mb-2">COLOR PALETTE</label>
                <select className="w-full bg-gunmetal text-blueprint-white rounded px-2 py-1 text-sm">
                  <option>Vibrant</option>
                  <option>Monochrome</option>
                  <option>Pastel</option>
                  <option>Neon</option>
                </select>
              </div>
              <div className="industrial-panel p-3">
                <label className="text-xs font-semibold block mb-2">LIGHTING</label>
                <select className="w-full bg-gunmetal text-blueprint-white rounded px-2 py-1 text-sm">
                  <option>Soft</option>
                  <option>Harsh</option>
                  <option>Ambient</option>
                  <option>Dramatic</option>
                </select>
              </div>
              <div className="industrial-panel p-3">
                <label className="text-xs font-semibold block mb-2">MOOD</label>
                <select className="w-full bg-gunmetal text-blueprint-white rounded px-2 py-1 text-sm">
                  <option>Creative</option>
                  <option>Professional</option>
                  <option>Playful</option>
                  <option>Serious</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Mixer */}
        <InfluenceMixer systems={mockSystems} />

        {/* Status */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`industrial-panel p-6 text-center ${
            isInfluenceValid() ? 'border-laser-orange' : 'border-yellow-500'
          }`}
        >
          <p className={`text-2xl font-bold ${isInfluenceValid() ? 'text-laser-orange' : 'text-yellow-500'}`}>
            {isInfluenceValid() ? '✓ SYSTEM READY' : '⚠ ADJUST MIX'}
          </p>
          <p className="text-sm text-gunmetal mt-2">
            {isInfluenceValid()
              ? 'Your build is ready to generate!'
              : 'Adjust sliders to reach exactly 100%'}
          </p>
        </motion.div>

        {/* Action */}
        <button
          disabled={!isInfluenceValid()}
          className={`w-full py-4 text-xl font-bold rounded transition-all ${
            isInfluenceValid()
              ? 'industrial-button hover:shadow-laser-strong'
              : 'bg-gunmetal text-gunmetal cursor-not-allowed opacity-50'
          }`}
        >
          GENERATE MASTERPIECE
        </button>
      </div>
    </AppShell>
  );
}
