'use client';

import { useBuildStore } from '@/utils/store';
import { System } from '@/types';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface InfluenceMixerProps {
  systems: System[];
}

export const InfluenceMixer = ({ systems }: InfluenceMixerProps) => {
  const { influence, updateInfluence, getInfluenceTotal, isInfluenceValid } = useBuildStore();
  const total = getInfluenceTotal();
  const isValid = isInfluenceValid();

  const [hoveredSystem, setHoveredSystem] = useState<string | null>(null);

  const getSystemValue = (systemId: string) => influence[systemId] || 0;

  const handleSliderChange = (systemId: string, newValue: number) => {
    updateInfluence(systemId, newValue);
  };

  return (
    <div className="space-y-6">
      {/* Total Influence Display */}
      <div className="industrial-panel p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">INFLUENCE MIX</h3>
          <div className={`text-2xl font-bold ${isValid ? 'text-laser-orange' : 'text-burnt-orange'}`}>
            {total}%
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full h-2 bg-gunmetal rounded overflow-hidden">
          <motion.div
            animate={{ width: `${Math.min(total, 100)}%` }}
            className={`h-full rounded transition-colors ${
              total > 100 ? 'bg-red-500' : isValid ? 'bg-laser-orange' : 'bg-yellow-500'
            } glow`}
          />
        </div>

        {/* Status Message */}
        <p className={`mt-3 text-xs ${isValid ? 'text-wise-green' : 'text-yellow-500'}`}>
          {total > 100 && `Over by ${total - 100}%`}
          {total < 100 && `Need ${100 - total}% more`}
          {total === 100 && '✓ System balanced'}
        </p>
      </div>

      {/* System Sliders */}
      <div className="space-y-4">
        {systems.map((system) => {
          const value = getSystemValue(system.id);
          const isHovered = hoveredSystem === system.id;

          return (
            <motion.div
              key={system.id}
              onHoverStart={() => setHoveredSystem(system.id)}
              onHoverEnd={() => setHoveredSystem(null)}
              className="industrial-panel p-4"
              animate={{ boxShadow: isHovered ? '0 0 20px rgba(255, 92, 0, 0.3)' : 'none' }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{system.icon}</span>
                  <div>
                    <p className="font-semibold text-sm">{system.name}</p>
                    <p className="text-xs text-gunmetal">{system.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-laser-orange">{value}%</p>
                </div>
              </div>

              {/* Slider */}
              <input
                type="range"
                min="0"
                max="100"
                value={value}
                onChange={(e) => handleSliderChange(system.id, parseInt(e.target.value))}
                className="w-full h-2 bg-gunmetal rounded appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #FF5C00 0%, #FF5C00 ${value}%, #34383D ${value}%, #34383D 100%)`,
                }}
              />

              {/* Category Badge */}
              <div className="mt-2 flex justify-end">
                <span className="text-xs px-2 py-1 bg-gunmetal/50 rounded text-gunmetal">
                  {system.category}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Control Panels */}
      <div className="grid grid-cols-3 gap-4">
        <button className="industrial-panel p-3 text-center text-sm font-medium hover:bg-laser-orange/10 transition-colors">
          RESET
        </button>
        <button className="industrial-panel p-3 text-center text-sm font-medium hover:bg-laser-orange/10 transition-colors">
          LOAD
        </button>
        <button className="industrial-panel p-3 text-center text-sm font-medium hover:bg-laser-orange/10 transition-colors">
          SAVE
        </button>
      </div>
    </div>
  );
};
