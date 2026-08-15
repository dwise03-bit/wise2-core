'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ProjectComment, ReactionPayload } from '../types/collaboration';

interface CommentThreadProps {
  comments: ProjectComment[];
  onAddReaction?: (payload: ReactionPayload) => void;
  onResolve?: (commentId: string, resolved: boolean) => void;
  canDelete?: boolean;
  onDelete?: (commentId: string) => void;
}

const EMOJI_PICKER = ['👍', '❤️', '😀', '🎉', '🔥', '💯'];

export const CommentThread: React.FC<CommentThreadProps> = ({
  comments,
  onAddReaction,
  onResolve,
  canDelete = false,
  onDelete,
}) => {
  const [expandedReactions, setExpandedReactions] = useState<string | null>(null);

  const handleAddReaction = useCallback(
    (commentId: string, emoji: string) => {
      onAddReaction?.({
        commentId,
        emoji,
        action: 'add',
      });
      setExpandedReactions(null);
    },
    [onAddReaction],
  );

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

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {comments.map((comment, index) => (
          <motion.div
            key={comment.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ delay: index * 0.05 }}
            className={`
              p-3 rounded-lg border transition-colors
              ${comment.resolved
                ? 'bg-gray-800 border-gray-700 opacity-60'
                : 'bg-gray-800 border-gray-700 hover:border-gray-600'}
            `}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {/* Avatar */}
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-xs font-bold text-white">
                  {comment.user?.name?.[0] || '?'}
                </div>

                {/* User info */}
                <div>
                  <p className="text-xs font-medium text-white">
                    {comment.user?.name || 'Anonymous'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatTime(comment.createdAt)}
                  </p>
                </div>
              </div>

              {/* Status badges */}
              <div className="flex items-center gap-2">
                {comment.timestamp !== undefined && (
                  <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                    @{Math.floor(comment.timestamp)}s
                  </span>
                )}
                {comment.resolved && (
                  <span className="text-xs bg-green-500 text-gray-900 px-2 py-1 rounded font-bold">
                    ✓ Resolved
                  </span>
                )}
              </div>
            </div>

            {/* Content */}
            <p className="text-sm text-gray-200 mb-3 leading-relaxed">
              {comment.content}
            </p>

            {/* Reactions */}
            {Object.keys(comment.reactions).length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {Object.entries(comment.reactions).map(([emoji, reaction]) => (
                  <motion.button
                    key={emoji}
                    onClick={() =>
                      handleAddReaction(comment.id, emoji)
                    }
                    className="flex items-center gap-1 px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span>{emoji}</span>
                    <span className="text-gray-400">
                      {reaction.users?.length || 0}
                    </span>
                  </motion.button>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Add reaction */}
              <div className="relative">
                <motion.button
                  onClick={() =>
                    setExpandedReactions(
                      expandedReactions === comment.id ? null : comment.id,
                    )
                  }
                  className="text-xs text-gray-400 hover:text-gray-300 px-2 py-1 transition-colors"
                  whileHover={{ scale: 1.05 }}
                >
                  😀 React
                </motion.button>

                {/* Emoji picker */}
                <AnimatePresence>
                  {expandedReactions === comment.id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute bottom-full mb-2 left-0 bg-gray-900 border border-gray-700 rounded-lg p-2 flex gap-1 z-10"
                    >
                      {EMOJI_PICKER.map((emoji) => (
                        <motion.button
                          key={emoji}
                          onClick={() => handleAddReaction(comment.id, emoji)}
                          className="text-lg p-1 hover:bg-gray-800 rounded transition-colors"
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          {emoji}
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Resolve button */}
              {!comment.resolved && (
                <motion.button
                  onClick={() => onResolve?.(comment.id, true)}
                  className="text-xs text-green-400 hover:text-green-300 px-2 py-1 transition-colors"
                  whileHover={{ scale: 1.05 }}
                >
                  ✓ Resolve
                </motion.button>
              )}

              {comment.resolved && (
                <motion.button
                  onClick={() => onResolve?.(comment.id, false)}
                  className="text-xs text-gray-400 hover:text-gray-300 px-2 py-1 transition-colors"
                  whileHover={{ scale: 1.05 }}
                >
                  Reopen
                </motion.button>
              )}

              {canDelete && (
                <motion.button
                  onClick={() => onDelete?.(comment.id)}
                  className="text-xs text-red-400 hover:text-red-300 px-2 py-1 ml-auto transition-colors"
                  whileHover={{ scale: 1.05 }}
                >
                  Delete
                </motion.button>
              )}
            </div>

            {/* Track indicator */}
            {comment.trackId && (
              <div className="mt-2 pt-2 border-t border-gray-700">
                <span className="text-xs text-gray-400">
                  Track: <span className="text-cyan-400">{comment.trackId}</span>
                </span>
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {comments.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-6 text-gray-400"
        >
          <p className="text-sm">No comments yet</p>
          <p className="text-xs mt-1">Be the first to comment on this project</p>
        </motion.div>
      )}
    </div>
  );
};
