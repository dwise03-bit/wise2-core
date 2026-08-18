'use client';

import { useBuildStore } from '@/utils/store';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export const ForemanAssistant = () => {
  const { foremanState, setForemanState } = useBuildStore();
  const [isWalking, setIsWalking] = useState(false);

  useEffect(() => {
    if (foremanState.isAnimating) {
      setIsWalking(true);
      const timer = setTimeout(() => setIsWalking(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [foremanState.isAnimating]);

  const getStateEmoji = () => {
    const stateEmojis: { [key: string]: string } = {
      idle: '🧑‍🔧',
      analyzing: '🧐',
      measuring: '📏',
      adjusting: '⚙️',
      welding: '🔥',
      approving: '✅',
      error: '⚠️',
      saving: '💾',
      exporting: '📦',
      coffee: '☕',
    };
    return stateEmojis[foremanState.currentState] || '🧑‍🔧';
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Foreman Character */}
      <motion.div
        animate={{ x: isWalking ? [0, 10, 0] : 0 }}
        transition={{ duration: 1.5, repeat: isWalking ? Infinity : 0 }}
        className="mb-4 text-5xl"
      >
        {getStateEmoji()}
      </motion.div>

      {/* Speech Bubble */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="foreman-speech max-w-xs"
      >
        <p className="text-sm font-medium">{foremanState.message}</p>
      </motion.div>

      {/* Status Indicator */}
      <div className="mt-2 flex items-center gap-2 text-xs">
        <div className={`w-2 h-2 rounded-full ${
          foremanState.currentState === 'error' ? 'bg-red-500' : 'bg-laser-orange'
        } glow`} />
        <span className="text-gunmetal">{foremanState.currentState}</span>
      </div>
    </div>
  );
};
