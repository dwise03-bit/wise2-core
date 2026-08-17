'use client';

import { AppShell } from '@/components/AppShell';
import { motion } from 'framer-motion';

export default function BuildsPage() {
  const builds = [
    { id: 1, name: 'Technical Writer', influence: 100, date: '2 days ago' },
    { id: 2, name: 'Creative Storyteller', influence: 100, date: '5 days ago' },
    { id: 3, name: 'Code Expert', influence: 100, date: '1 week ago' },
  ];

  return (
    <AppShell title="MY BUILDS // PROJECT YARD">
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="industrial-panel p-8"
        >
          <h2 className="text-2xl font-bold mb-2">Your Saved Builds</h2>
          <p className="text-gunmetal">Manage and remix your saved prompt builds.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {builds.map((build) => (
            <motion.div
              key={build.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="industrial-panel p-6 hover:border-laser-orange transition-all cursor-pointer group"
            >
              <h3 className="font-bold text-lg mb-2">{build.name}</h3>
              <p className="text-sm text-gunmetal mb-4">Saved {build.date}</p>
              <div className="flex gap-2">
                <button className="flex-1 px-3 py-2 bg-laser-orange/20 text-laser-orange rounded text-sm font-semibold hover:bg-laser-orange/40 transition-colors">
                  EDIT
                </button>
                <button className="flex-1 px-3 py-2 border border-gunmetal rounded text-sm font-semibold hover:border-laser-orange transition-colors">
                  REMIX
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <button className="industrial-button px-8 py-3 text-lg font-bold">
          + NEW BUILD
        </button>
      </div>
    </AppShell>
  );
}
