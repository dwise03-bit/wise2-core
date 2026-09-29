'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Users, Gift, TrendingUp } from 'lucide-react';
import { ChatAlert as ChatAlertType } from './types/chat';

interface ChatAlertProps {
  alert: ChatAlertType;
  isAnimated?: boolean;
  onSoundPlay?: () => void;
}

export function ChatAlertComponent({
  alert,
  isAnimated = true,
  onSoundPlay,
}: ChatAlertProps) {
  const [isVisible, setIsVisible] = useState(true);

  // Auto-hide alert after duration
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, alert.duration);

    return () => clearTimeout(timer);
  }, [alert.duration]);

  useEffect(() => {
    onSoundPlay?.();
  }, [onSoundPlay]);

  if (!isVisible) return null;

  const getAlertConfig = (type: string) => {
    switch (type) {
      case 'subscribe':
        return {
          icon: Heart,
          bgClass: 'from-purple-600 to-purple-700',
          title: 'New Subscriber!',
          titleColor: 'text-purple-100',
        };
      case 'giftsub':
        return {
          icon: Gift,
          bgClass: 'from-pink-600 to-pink-700',
          title: 'Gift Subscription!',
          titleColor: 'text-pink-100',
        };
      case 'raid':
        return {
          icon: TrendingUp,
          bgClass: 'from-red-600 to-red-700',
          title: 'Raid!',
          titleColor: 'text-red-100',
        };
      case 'follow':
        return {
          icon: Users,
          bgClass: 'from-blue-600 to-blue-700',
          title: 'New Follower!',
          titleColor: 'text-blue-100',
        };
      case 'tip':
        return {
          icon: TrendingUp,
          bgClass: 'from-yellow-600 to-yellow-700',
          title: 'Tip!',
          titleColor: 'text-yellow-100',
        };
      default:
        return {
          icon: Heart,
          bgClass: 'from-slate-600 to-slate-700',
          title: 'Alert',
          titleColor: 'text-slate-100',
        };
    }
  };

  const config = getAlertConfig(alert.type);
  const Icon = config.icon;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.5, y: -20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 25,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: -20,
      transition: { duration: 0.3 },
    },
  };

  const pulseVariants = {
    pulse: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 0.6,
        repeat: isAnimated ? 3 : 0,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="pointer-events-auto"
    >
      <motion.div
        variants={pulseVariants}
        animate="pulse"
        className={`bg-gradient-to-r ${config.bgClass} rounded-lg shadow-2xl border border-white/20 overflow-hidden max-w-md`}
      >
        <div className="px-6 py-4">
          {/* Header with icon */}
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className={`text-lg font-bold ${config.titleColor}`}>
                {config.title}
              </h3>
            </div>
          </div>

          {/* Alert details */}
          <div className="space-y-2 text-white/90">
            {/* Username */}
            <div className="text-sm font-semibold">
              {alert.userName}
            </div>

            {/* Message/Amount */}
            {alert.message && (
              <div className="text-sm italic">
                "{alert.message}"
              </div>
            )}

            {/* Amount (for tips/subs) */}
            {alert.amount && (
              <div className="text-lg font-bold text-white">
                {alert.currency || '$'}{alert.amount.toFixed(2)}
              </div>
            )}

            {/* Viewer count (for raids) */}
            {alert.viewerCount && (
              <div className="text-sm font-semibold">
                {alert.viewerCount.toLocaleString()} viewers raiding
              </div>
            )}

            {/* Gift count (for gift subs) */}
            {alert.giftCount && (
              <div className="text-sm font-semibold">
                {alert.giftCount} gift{alert.giftCount !== 1 ? 's' : ''} sent
              </div>
            )}
          </div>

          {/* Avatar (if available) */}
          {alert.userAvatar && (
            <div className="mt-3 flex justify-center">
              <img
                src={alert.userAvatar}
                alt={alert.userName}
                className="w-12 h-12 rounded-full border-2 border-white/30"
              />
            </div>
          )}
        </div>

        {/* Progress bar */}
        <motion.div
          className="h-1 bg-white/30 origin-left"
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={{ duration: alert.duration / 1000 }}
        />
      </motion.div>
    </motion.div>
  );
}

export default ChatAlertComponent;
