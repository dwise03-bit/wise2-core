'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { DISCORD_CONFIG } from '@/lib/discord';

interface DiscordLinkProps {
  variant?: 'button' | 'icon' | 'text';
  className?: string;
  label?: string;
  showIcon?: boolean;
}

/**
 * Discord Community Link Component
 * Renders a link to WISE² Discord community in various styles
 */
export function DiscordLink({
  variant = 'button',
  className = '',
  label = 'Join Discord Community',
  showIcon = true,
}: DiscordLinkProps) {
  const handleClick = () => {
    window.open(DISCORD_CONFIG.communityLink, '_blank', 'noopener,noreferrer');
  };

  if (variant === 'icon') {
    return (
      <motion.button
        onClick={handleClick}
        className={`p-2 rounded-lg hover:bg-[#5865F2]/10 transition-colors ${className}`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        title="Join WISE² Discord"
      >
        <MessageCircle className="w-6 h-6 text-[#5865F2]" />
      </motion.button>
    );
  }

  if (variant === 'text') {
    return (
      <motion.a
        href={DISCORD_CONFIG.communityLink}
        target="_blank"
        rel="noopener noreferrer"
        className={`text-[#5865F2] hover:text-[#7289DA] transition-colors inline-flex items-center gap-2 ${className}`}
        whileHover={{ x: 4 }}
      >
        {showIcon && <MessageCircle className="w-4 h-4" />}
        {label}
      </motion.a>
    );
  }

  // Button variant (default)
  return (
    <motion.a
      href={DISCORD_CONFIG.communityLink}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-3 px-6 py-3 bg-[#5865F2] hover:bg-[#7289DA] text-white rounded-lg font-semibold transition-all duration-300 ${className}`}
      whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(88, 101, 242, 0.4)' }}
      whileTap={{ scale: 0.95 }}
    >
      {showIcon && <MessageCircle className="w-5 h-5" />}
      {label}
    </motion.a>
  );
}

export default DiscordLink;
