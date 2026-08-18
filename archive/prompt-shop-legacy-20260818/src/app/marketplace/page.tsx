'use client';

import { AppShell } from '@/components/AppShell';
import { motion } from 'framer-motion';

export default function MarketplacePage() {
  return (
    <AppShell title="MARKETPLACE">
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="industrial-panel p-8"
        >
          <h2 className="text-2xl font-bold mb-2">Community Marketplace</h2>
          <p className="text-gunmetal">Discover prompts, packs, and tools created by the community.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="industrial-panel p-8 text-center"
          >
            <p className="text-4xl mb-2">🏗️</p>
            <h3 className="text-lg font-bold mb-2">Community Blueprints</h3>
            <p className="text-gunmetal text-sm mb-4">Browse verified prompts from creators</p>
            <button className="industrial-button px-4 py-2 text-sm font-bold">BROWSE</button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="industrial-panel p-8 text-center"
          >
            <p className="text-4xl mb-2">📦</p>
            <h3 className="text-lg font-bold mb-2">Creator Collections</h3>
            <p className="text-gunmetal text-sm mb-4">Curated system packs from experts</p>
            <button className="industrial-button px-4 py-2 text-sm font-bold">EXPLORE</button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="industrial-panel p-8"
        >
          <h3 className="text-lg font-bold mb-4">Featured This Week</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 border border-gunmetal rounded hover:border-laser-orange transition-colors cursor-pointer">
                <p className="text-3xl mb-2">✨</p>
                <p className="font-bold text-sm mb-2">Featured Blueprint #{i}</p>
                <p className="text-xs text-gunmetal">Trending this week</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </AppShell>
  );
}
