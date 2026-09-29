'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface ServiceCardProps {
  id: string;
  name: string;
  description: string;
  hourlyRate: number;
  icon?: string;
  tags?: string[];
  consultantCount?: number;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  id,
  name,
  description,
  hourlyRate,
  icon,
  tags = [],
  consultantCount = 0,
}) => {
  const getIcon = (iconName?: string) => {
    const iconMap: Record<string, string> = {
      strategy: '🎯',
      implementation: '🛠️',
      training: '📚',
      audit: '🔍',
      custom: '⚡',
    };
    return iconMap[iconName || 'strategy'] || '💡';
  };

  return (
    <Link href={`/consulting/${id}`}>
      <motion.div
        className="h-full bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 cursor-pointer overflow-hidden group relative border border-slate-700 hover:border-blue-500/50 transition-colors"
        whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(59, 130, 246, 0.1)' }}
        transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* Gradient background effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity"
          transition={{ duration: 0.3 }}
        />

        <div className="relative z-10">
          {/* Icon */}
          <motion.div
            className="text-4xl mb-4"
            whileHover={{ scale: 1.2, rotate: 12 }}
            transition={{ duration: 0.3 }}
          >
            {getIcon(icon)}
          </motion.div>

          {/* Title */}
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
            {name}
          </h3>

          {/* Description */}
          <p className="text-sm text-slate-400 mb-4 line-clamp-2 group-hover:text-slate-300 transition-colors">
            {description}
          </p>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/30"
                >
                  {tag}
                </span>
              ))}
              {tags.length > 2 && (
                <span className="text-xs px-2 py-1 bg-slate-700/50 text-slate-400 rounded-full">
                  +{tags.length - 2}
                </span>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-700">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-blue-400">${hourlyRate}</span>
              <span className="text-xs text-slate-500">/hour</span>
            </div>

            <motion.div
              className="flex items-center gap-2 text-sm text-slate-400 group-hover:text-blue-400 transition-colors"
              whileHover={{ x: 4 }}
              transition={{ duration: 0.2 }}
            >
              <span className="hidden sm:inline">Browse</span>
              <ArrowRight size={16} />
            </motion.div>
          </div>

          {/* Consultant count */}
          {consultantCount > 0 && (
            <motion.p
              className="text-xs text-slate-500 mt-3"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {consultantCount} {consultantCount === 1 ? 'consultant' : 'consultants'} available
            </motion.p>
          )}
        </div>
      </motion.div>
    </Link>
  );
};
