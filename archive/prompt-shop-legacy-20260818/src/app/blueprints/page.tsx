'use client';

import { AppShell } from '@/components/AppShell';
import { motion } from 'framer-motion';

export default function BlueprintsPage() {
  const blueprints = [
    { id: 1, name: 'Pro Writer Template', rating: 4.8, downloads: 1240, price: 9.99 },
    { id: 2, name: 'Developer\'s Toolkit', rating: 4.9, downloads: 2140, price: 14.99 },
    { id: 3, name: 'Creative Mix Standard', rating: 4.6, downloads: 890, price: 7.99 },
  ];

  return (
    <AppShell title="BLUEPRINTS MARKETPLACE">
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="industrial-panel p-8"
        >
          <h2 className="text-2xl font-bold mb-2">Blueprint Marketplace</h2>
          <p className="text-gunmetal">Discover and purchase community-created prompt blueprints.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {blueprints.map((bp) => (
            <motion.div
              key={bp.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="industrial-panel p-6"
            >
              <h3 className="font-bold text-lg mb-4">{bp.name}</h3>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gunmetal">Rating</span>
                  <span className="text-laser-orange">{bp.rating}★</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gunmetal">Downloads</span>
                  <span>{bp.downloads}</span>
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <span className="text-2xl font-bold text-laser-orange">${bp.price}</span>
                <button className="flex-1 industrial-button py-2 text-sm font-bold">
                  BUY
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
