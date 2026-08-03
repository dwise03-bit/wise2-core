'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CollaboratorRole } from '../types/collaboration';

interface InviteModalProps {
  isOpen: boolean;
  projectId: string;
  onClose: () => void;
  onInvite?: (email: string, role: CollaboratorRole) => Promise<void>;
  onCopyLink?: (link: string) => void;
}

export const InviteModal: React.FC<InviteModalProps> = ({
  isOpen,
  projectId,
  onClose,
  onInvite,
  onCopyLink,
}) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<CollaboratorRole>('EDITOR');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  const handleInviteSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setSuccess(false);

      if (!email) {
        setError('Please enter an email address');
        return;
      }

      setIsLoading(true);

      try {
        await onInvite?.(email, role);
        setSuccess(true);
        setEmail('');
        setTimeout(() => setSuccess(false), 3000);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to send invite',
        );
      } finally {
        setIsLoading(false);
      }
    },
    [email, role, onInvite],
  );

  const handleGenerateLink = useCallback(() => {
    const link = `${window.location.origin}/join/${projectId}`;
    setInviteLink(link);
  }, [projectId]);

  const handleCopyLink = useCallback(() => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 2000);
      onCopyLink?.(inviteLink);
    }
  }, [inviteLink, onCopyLink]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', bounce: 0.3 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
          >
            <div className="bg-gray-900 rounded-lg border border-gray-700 shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="p-6 border-b border-gray-700 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Share Project</h2>
                <motion.button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors"
                  whileHover={{ rotate: 90 }}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </motion.button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Email invite */}
                <div>
                  <h3 className="text-sm font-bold text-white mb-4">
                    📧 Invite by Email
                  </h3>

                  <form onSubmit={handleInviteSubmit} className="space-y-3">
                    {/* Email input */}
                    <div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="colleague@example.com"
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                        disabled={isLoading}
                      />
                    </div>

                    {/* Role selector */}
                    <div>
                      <label className="text-xs text-gray-400 mb-2 block">
                        Role
                      </label>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as CollaboratorRole)}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition-colors"
                        disabled={isLoading}
                      >
                        <option value="VIEWER">👁️ Viewer (Read-only)</option>
                        <option value="EDITOR">✏️ Editor (Can edit)</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Editors can modify tracks, mixer, and gallery
                      </p>
                    </div>

                    {/* Error message */}
                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-red-500/20 border border-red-500/50 text-red-400 text-xs px-3 py-2 rounded"
                        >
                          {error}
                        </motion.div>
                      )}

                      {success && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-green-500/20 border border-green-500/50 text-green-400 text-xs px-3 py-2 rounded"
                        >
                          ✓ Invite sent successfully!
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Submit button */}
                    <motion.button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 text-gray-900 font-bold py-2 rounded-lg transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isLoading ? 'Sending...' : 'Send Invite'}
                    </motion.button>
                  </form>
                </div>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-700" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-gray-900 text-gray-400">or</span>
                  </div>
                </div>

                {/* Link share */}
                <div>
                  <h3 className="text-sm font-bold text-white mb-4">
                    🔗 Share Link
                  </h3>

                  {!inviteLink ? (
                    <motion.button
                      onClick={handleGenerateLink}
                      className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white rounded-lg transition-colors text-sm font-medium"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Generate Invite Link
                    </motion.button>
                  ) : (
                    <div className="space-y-2">
                      {/* Link display */}
                      <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
                        <p className="text-xs text-gray-400 mb-2">
                          Share this link with anyone
                        </p>
                        <code className="text-xs text-cyan-400 break-all">
                          {inviteLink}
                        </code>
                      </div>

                      {/* Copy button */}
                      <motion.button
                        onClick={handleCopyLink}
                        className={`
                          w-full px-4 py-2 rounded-lg font-medium text-sm transition-colors
                          ${
                            copiedToClipboard
                              ? 'bg-green-500 text-white'
                              : 'bg-cyan-500 hover:bg-cyan-600 text-gray-900'
                          }
                        `}
                        whileHover={{ scale: copiedToClipboard ? 1 : 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {copiedToClipboard ? '✓ Copied!' : 'Copy Link'}
                      </motion.button>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
                  <p className="text-xs text-gray-400">
                    <strong>Permissions:</strong> Anyone with the link can view and comment on this project.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
