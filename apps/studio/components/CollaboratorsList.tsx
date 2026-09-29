'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Collaborator, CollaboratorRole } from '../types/collaboration';

interface CollaboratorsListProps {
  collaborators: Collaborator[];
  currentUserId: string;
  onRemove?: (collaboratorId: string) => void;
  onChangeRole?: (collaboratorId: string, newRole: CollaboratorRole) => void;
  canManagePermissions?: boolean;
}

const ROLE_LABELS: Record<CollaboratorRole, { label: string; color: string }> =
  {
    OWNER: { label: 'Owner', color: 'bg-purple-500' },
    EDITOR: { label: 'Editor', color: 'bg-blue-500' },
    VIEWER: { label: 'Viewer', color: 'bg-gray-500' },
  };

export const CollaboratorsList: React.FC<CollaboratorsListProps> = ({
  collaborators,
  currentUserId,
  onRemove,
  onChangeRole,
  canManagePermissions = false,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleRemove = useCallback(
    (id: string) => {
      if (confirm('Remove this collaborator?')) {
        onRemove?.(id);
      }
    },
    [onRemove],
  );

  return (
    <div className="space-y-2">
      <AnimatePresence>
        {collaborators.map((collaborator, index) => {
          const isCurrentUser = collaborator.userId === currentUserId;
          const roleConfig = ROLE_LABELS[collaborator.role];

          return (
            <motion.div
              key={collaborator.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: index * 0.05 }}
              className="p-3 bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
            >
              <div className="flex items-center justify-between">
                {/* User info */}
                <div className="flex items-center gap-3 flex-1">
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-xs font-bold text-white">
                    {collaborator.user?.name?.[0] || '?'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-white truncate">
                        {collaborator.user?.name || 'Unknown User'}
                      </p>
                      {isCurrentUser && (
                        <span className="text-xs bg-cyan-500 text-gray-900 px-2 py-0.5 rounded-full font-bold">
                          You
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 truncate">
                      {collaborator.user?.email}
                    </p>
                  </div>
                </div>

                {/* Role badge */}
                <motion.div
                  className={`
                    text-xs font-bold text-white px-3 py-1 rounded-full ml-2
                    ${roleConfig.color}
                  `}
                  whileHover={{ scale: 1.05 }}
                >
                  {roleConfig.label}
                </motion.div>

                {/* Actions */}
                {canManagePermissions && !isCurrentUser && (
                  <motion.button
                    onClick={() =>
                      setExpandedId(
                        expandedId === collaborator.id ? null : collaborator.id,
                      )
                    }
                    className="ml-2 p-1 hover:bg-gray-700 rounded transition-colors"
                    whileHover={{ scale: 1.1 }}
                  >
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </motion.button>
                )}
              </div>

              {/* Expanded options */}
              <AnimatePresence>
                {expandedId === collaborator.id && canManagePermissions && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 pt-3 border-t border-gray-700 space-y-2"
                  >
                    {/* Role selector */}
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-gray-400">Role:</label>
                      <select
                        value={collaborator.role}
                        onChange={(e) =>
                          onChangeRole?.(
                            collaborator.id,
                            e.target.value as CollaboratorRole,
                          )
                        }
                        className="text-xs bg-gray-700 text-white border border-gray-600 rounded px-2 py-1"
                      >
                        <option value="VIEWER">Viewer</option>
                        <option value="EDITOR">Editor</option>
                        <option value="OWNER">Owner</option>
                      </select>
                    </div>

                    {/* Remove button */}
                    <motion.button
                      onClick={() => handleRemove(collaborator.id)}
                      className="w-full text-xs bg-red-600 hover:bg-red-700 text-white py-1.5 rounded transition-colors font-medium"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Remove Access
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {collaborators.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-6 text-gray-400"
        >
          <p className="text-sm">No collaborators yet</p>
          <p className="text-xs mt-1">Invite team members to collaborate</p>
        </motion.div>
      )}
    </div>
  );
};
