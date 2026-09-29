'use client';

import { AppShell } from '@/components/AppShell';
import { motion } from 'framer-motion';

export default function PacksPage() {
  const packs = [
    { id: 1, name: 'Starter Pack', systems: 3, price: 4.99 },
    { id: 2, name: 'Pro Pack', systems: 8, price: 12.99 },
    { id: 3, name: 'Creator Bundle', systems: 15, price: 24.99 },
  ];

  return (
    <AppShell title="SUPPLY DEPOT // PACKS">
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="industrial-panel p-8"
        >
          <h2 className="text-2xl font-bold mb-2">System Packs</h2>
          <p className="text-gunmetal">Unlock additional systems and capabilities with packs.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {packs.map((pack) => (
            <motion.div
              key={pack.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="industrial-panel p-6"
            >
              <h3 className="font-bold text-lg mb-2">{pack.name}</h3>
              <p className="text-sm text-gunmetal mb-4">{pack.systems} systems included</p>
              <div className="flex gap-2 items-center">
                <span className="text-2xl font-bold text-laser-orange">${pack.price}</span>
                <button className="flex-1 industrial-button py-2 text-sm font-bold">
                  ADD TO CART
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
