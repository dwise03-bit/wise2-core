'use client';

import { AppShell } from '@/components/AppShell';
import { SystemBays } from '@/components/SystemBays';
import { mockSystems } from '@/data/mockSystems';
import { motion } from 'framer-motion';

export default function SystemsPage() {
  return (
    <AppShell title="SYSTEM BAYS // PROMPT BROWSER">
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="industrial-panel p-8"
        >
          <h2 className="text-2xl font-bold mb-2">Available Systems</h2>
          <p className="text-gunmetal">
            Browse all available prompt systems. Click on a system to add it to your current build.
          </p>
        </motion.div>

        <SystemBays systems={mockSystems} />
      </div>
    </AppShell>
  );
}
