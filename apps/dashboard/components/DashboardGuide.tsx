'use client';

import React, { ReactNode } from 'react';

interface DashboardGuideProps {
  title: string;
  message: string;
  animation?: 'help' | 'alert' | 'success' | 'info';
  children?: ReactNode;
  className?: string;
}

/**
 * Dashboard guide character with context-sensitive animations
 * Used for tutorials, alerts, and guidance in admin panel
 */
export default function DashboardGuide({
  title,
  message,
  animation = 'help',
  children,
  className = '',
}: DashboardGuideProps) {
  const animationEmoji = {
    help: '🤔',
    alert: '⚠️',
    success: '✨',
    info: 'ℹ️',
  };

  const animationClass = {
    help: 'animate-pulse',
    alert: 'animate-bounce',
    success: 'animate-spin',
    info: 'animate-none',
  };

  return (
    <div
      className={`
        rounded-lg border border-wise-medium bg-wise-surface p-6
        flex gap-4 items-start ${className}
      `}
    >
      {/* Character placeholder */}
      <div className={`text-5xl ${animationClass[animation]} flex-shrink-0`}>
        {animationEmoji[animation]}
      </div>

      {/* Guide content */}
      <div className="flex-grow">
        <h3 className="font-semibold text-wise-text-primary mb-2">{title}</h3>
        <p className="text-wise-text-secondary text-sm mb-4">{message}</p>
        {children}
      </div>
    </div>
  );
}

/**
 * Guide sprite sheet configurations for different scenarios
 * Generated via: /animate-character ./guide.png "specific animation description"
 */
export const GUIDE_SCENARIOS = {
  help: {
    spriteUrl: '/animations/guide-help-sprite.png',
    frameCount: 20,
    frameWidth: 80,
    frameHeight: 80,
    fps: 12,
    message: 'Need help? I can guide you through this feature.',
  },
  alert: {
    spriteUrl: '/animations/guide-alert-sprite.png',
    frameCount: 16,
    frameWidth: 80,
    frameHeight: 80,
    fps: 12,
    message: 'Please pay attention to this important information.',
  },
  success: {
    spriteUrl: '/animations/guide-success-sprite.png',
    frameCount: 24,
    frameWidth: 80,
    frameHeight: 80,
    fps: 12,
    message: 'Great! Everything is working perfectly.',
  },
  info: {
    spriteUrl: '/animations/guide-info-sprite.png',
    frameCount: 12,
    frameWidth: 80,
    frameHeight: 80,
    fps: 10,
    message: 'Here is some useful information for you.',
  },
};
