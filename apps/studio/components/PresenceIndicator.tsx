'use client';

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { UserPresence } from '../types/collaboration';

interface PresenceIndicatorProps {
  presence: UserPresence[];
  maxVisible?: number;
  showTooltips?: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  online: 'bg-green-500',
  away: 'bg-yellow-500',
  idle: 'bg-gray-500',
  offline: 'bg-gray-300',
};

const AVATAR_COLORS = [
  'bg-blue-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-cyan-500',
  'bg-emerald-500',
  'bg-orange-500',
  'bg-rose-500',
];

export const PresenceIndicator: React.FC<PresenceIndicatorProps> = ({
  presence,
  maxVisible = 5,
  showTooltips = true,
}) => {
  const visible = useMemo(() => presence.slice(0, maxVisible), [presence, maxVisible]);
  const overflow = useMemo(() => Math.max(0, presence.length - maxVisible), [presence.length, maxVisible]);

  const getAvatarColor = (userId: string): string => {
    const index = userId.charCodeAt(0) % AVATAR_COLORS.length;
    return AVATAR_COLORS[index];
  };

  const getInitials = (name?: string): string => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center -space-x-2">
        <AnimatePresence>
          {visible.map((user, index) => (
            <motion.div
              key={user.userId}
              initial={{ scale: 0, x: index * 10 }}
              animate={{ scale: 1, x: 0 }}
              exit={{ scale: 0, x: index * 10 }}
              transition={{ delay: index * 0.05 }}
              className="relative"
              title={showTooltips ? user.user?.name : undefined}
            >
              {/* Avatar */}
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                  text-white border-2 border-gray-900 shadow-sm cursor-pointer
                  transition-all duration-200 hover:scale-110
                  ${getAvatarColor(user.userId)}
                `}
              >
                {getInitials(user.user?.name)}
              </div>

              {/* Status indicator */}
              <motion.div
                className={`
                  absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-900
                  ${STATUS_COLORS[user.status] || STATUS_COLORS.offline}
                `}
                animate={{
                  opacity: user.status === 'online' ? [1, 0.6, 1] : 1,
                }}
                transition={{
                  duration: 2,
                  repeat: user.status === 'online' ? Infinity : 0,
                }}
              />

              {/* Editing indicator */}
              {user.editingTrackId && (
                <motion.div
                  className="absolute -top-1 -right-1 bg-cyan-400 text-gray-900 text-xs px-1.5 py-0.5 rounded-full font-bold"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  ✏
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Overflow indicator */}
        {overflow > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`
              w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
              text-white border-2 border-gray-900 bg-gray-600 cursor-pointer
              transition-all duration-200 hover:scale-110
            `}
            title={`+${overflow} more users`}
          >
            +{overflow}
          </motion.div>
        )}
      </div>

      {/* User count */}
      <span className="text-xs text-gray-400 ml-2">
        {presence.length} online
      </span>
    </div>
  );
};

// Compact version for header
export const PresenceIndicatorCompact: React.FC<PresenceIndicatorProps> = ({
  presence,
  maxVisible = 3,
}) => {
  return (
    <div className="flex items-center gap-1">
      {presence.slice(0, maxVisible).map((user) => (
        <motion.div
          key={user.userId}
          className="relative w-6 h-6"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
        >
          <div
            className="w-6 h-6 rounded-full text-xs font-bold text-white flex items-center justify-center"
            style={{
              background:
                user.user?.color || `hsl(${Math.random() * 360}, 70%, 60%)`,
            }}
          >
            {user.user?.name?.[0] || '?'}
          </div>
          <div
            className={`
              absolute bottom-0 right-0 w-2 h-2 rounded-full border border-gray-900
              ${STATUS_COLORS[user.status] || STATUS_COLORS.offline}
            `}
          />
        </motion.div>
      ))}
    </div>
  );
};
