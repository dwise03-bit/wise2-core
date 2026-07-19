'use client';

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ActivityLogEntry, ActivityAction } from '../types/collaboration';

interface ActivityStreamProps {
  activities: ActivityLogEntry[];
  maxVisible?: number;
  filterByUser?: string;
  filterByAction?: ActivityAction;
}

const ACTION_CONFIG: Record<ActivityAction, { icon: string; label: string; color: string }> =
  {
    track_added: { icon: '🎵', label: 'Added track', color: 'text-green-400' },
    track_removed: { icon: '🗑️', label: 'Removed track', color: 'text-red-400' },
    track_updated: { icon: '✏️', label: 'Updated track', color: 'text-blue-400' },
    volume_changed: { icon: '🔊', label: 'Changed volume', color: 'text-yellow-400' },
    mute_toggled: { icon: '🔇', label: 'Toggled mute', color: 'text-orange-400' },
    solo_toggled: { icon: '🎧', label: 'Toggled solo', color: 'text-purple-400' },
    bpm_changed: { icon: '⏱️', label: 'Changed BPM', color: 'text-cyan-400' },
    gallery_image_added: {
      icon: '🖼️',
      label: 'Added image',
      color: 'text-pink-400',
    },
    gallery_image_removed: {
      icon: '🗑️',
      label: 'Removed image',
      color: 'text-pink-400',
    },
    comment_added: { icon: '💬', label: 'Added comment', color: 'text-indigo-400' },
    collaborator_added: {
      icon: '👤',
      label: 'Added collaborator',
      color: 'text-green-400',
    },
    collaborator_removed: {
      icon: '👤',
      label: 'Removed collaborator',
      color: 'text-red-400',
    },
    permission_changed: {
      icon: '🔐',
      label: 'Changed permissions',
      color: 'text-blue-400',
    },
    version_created: { icon: '📸', label: 'Created version', color: 'text-violet-400' },
    version_reverted: { icon: '⏮️', label: 'Reverted version', color: 'text-violet-400' },
  };

export const ActivityStream: React.FC<ActivityStreamProps> = ({
  activities,
  maxVisible = 20,
  filterByUser,
  filterByAction,
}) => {
  const filtered = useMemo(() => {
    return activities
      .filter((a) => (!filterByUser || a.userId === filterByUser))
      .filter((a) => (!filterByAction || a.action === filterByAction))
      .slice(0, maxVisible);
  }, [activities, filterByUser, filterByAction, maxVisible]);

  const formatTime = (date: string): string => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;

    return d.toLocaleDateString();
  };

  const getActionConfig = (action: ActivityAction) => {
    return ACTION_CONFIG[action] || { icon: '📝', label: 'Updated', color: 'text-gray-400' };
  };

  return (
    <div className="space-y-2">
      <AnimatePresence mode="popLayout">
        {filtered.map((activity, index) => {
          const config = getActionConfig(activity.action);

          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: index * 0.03 }}
              className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-800 transition-colors group cursor-pointer"
            >
              {/* Icon */}
              <div className={`text-xl flex-shrink-0 mt-0.5`}>
                {config.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-white">
                    {activity.user?.name || 'Unknown'}
                  </p>
                  <p className={`text-sm ${config.color}`}>{config.label}</p>
                </div>

                <p className="text-xs text-gray-400 mt-1">
                  {formatTime(activity.createdAt)}
                </p>

                {/* Details */}
                {Object.keys(activity.details).length > 0 && (
                  <div className="mt-1 text-xs text-gray-500 space-y-0.5">
                    {activity.details.trackName && (
                      <p>
                        Track:{' '}
                        <span className="text-cyan-400">
                          {activity.details.trackName}
                        </span>
                      </p>
                    )}
                    {activity.details.volume !== undefined && (
                      <p>
                        Volume:{' '}
                        <span className="text-yellow-400">
                          {(activity.details.volume * 100).toFixed(0)}%
                        </span>
                      </p>
                    )}
                    {activity.details.newRole && (
                      <p>
                        Role:{' '}
                        <span className="text-green-400">
                          {activity.details.newRole}
                        </span>
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Status badge */}
              {activity.action === 'version_created' && (
                <motion.div
                  className="px-2 py-1 bg-violet-500 text-xs text-white rounded font-bold flex-shrink-0"
                  whileHover={{ scale: 1.05 }}
                >
                  📸
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>

      {filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-6 text-gray-400"
        >
          <p className="text-sm">No activity yet</p>
          <p className="text-xs mt-1">
            {filterByUser || filterByAction
              ? 'No matching activities found'
              : 'Start editing to see activity'}
          </p>
        </motion.div>
      )}
    </div>
  );
};

// Compact activity feed for sidebar
export const ActivityStreamCompact: React.FC<Pick<ActivityStreamProps, 'activities'>> = ({
  activities,
}) => {
  return (
    <div className="space-y-1">
      {activities.slice(0, 5).map((activity) => {
        const config = ACTION_CONFIG[activity.action] || {
          icon: '📝',
          label: 'Updated',
          color: 'text-gray-400',
        };

        return (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-xs text-gray-400"
          >
            <span>{config.icon}</span>
            <span className="truncate">
              <strong>{activity.user?.name || 'Unknown'}</strong> {config.label}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
};
