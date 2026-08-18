'use client';

import { System } from '@/types';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface SystemBaysProps {
  systems: System[];
  onSelect?: (system: System) => void;
}

export const SystemBays = ({ systems, onSelect }: SystemBaysProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');

  const categories = ['all', ...Array.from(new Set(systems.map((s) => s.category)))];

  const filteredSystems =
    selectedCategory === 'all'
      ? systems
      : systems.filter((s) => s.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded whitespace-nowrap transition-all ${
              selectedCategory === category
                ? 'bg-laser-orange text-machine-black font-bold'
                : 'industrial-panel hover:border-laser-orange'
            }`}
          >
            {category === 'all' ? 'ALL SYSTEMS' : category.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Systems Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSystems.map((system, index) => (
          <motion.div
            key={system.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelect?.(system)}
            className="industrial-panel p-6 cursor-pointer group hover:border-laser-orange transition-all"
          >
            {/* Bay Number */}
            <div className="absolute top-2 right-2 text-xs text-gunmetal font-mono">
              BAY-{String(index + 1).padStart(2, '0')}
            </div>

            {/* Content */}
            <div className="space-y-3">
              <div className="text-4xl group-hover:scale-110 transition-transform">
                {system.icon}
              </div>

              <div>
                <h4 className="font-bold text-lg">{system.name}</h4>
                <p className="text-xs text-gunmetal mt-1">{system.description}</p>
              </div>

              {/* Category Badge */}
              <div className="flex justify-between items-end">
                <span className="text-xs px-2 py-1 bg-gunmetal/30 rounded">
                  {system.category}
                </span>
                <div className="w-6 h-6 border-2 border-laser-orange rounded opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            {/* Inspection Mark */}
            <div className="absolute bottom-2 left-2 text-xs text-laser-orange opacity-0 group-hover:opacity-100 transition-opacity">
              INSPECT ✓
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
