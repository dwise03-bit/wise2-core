'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StatusIndicator } from '@/types/navigation';

interface StatusBarProps {
  status: StatusIndicator;
  onDeployClick?: () => void;
  gpuUsage?: number;
  modelStatus?: string;
  showServerStats?: boolean;
}

export default function StatusBar({
  status,
  onDeployClick,
  gpuUsage,
  modelStatus,
  showServerStats = false,
}: StatusBarProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const getConnectionColor = () => {
    switch (status.status) {
      case 'connected':
        return 'bg-green-500';
      case 'connecting':
        return 'bg-yellow-500 animate-pulse';
      case 'disconnected':
        return 'bg-red-500';
      default:
        return 'bg-slate-500';
    }
  };

  const getDeployStatusColor = () => {
    switch (status.deploymentStatus) {
      case 'deploying':
        return 'text-yellow-400';
      case 'success':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-slate-400';
    }
  };

  return (
    <motion.footer
      initial={{ y: 40 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed bottom-0 left-0 right-0 z-30 h-8 border-t border-white/10 bg-gradient-to-r from-slate-900/90 to-slate-900/80 backdrop-blur-md"
    >
      <div className="flex h-full items-center justify-between px-4 lg:px-6 text-xs">
        {/* Left: Connection + Sync */}
        <div className="flex items-center gap-4">
          {/* Connection Status */}
          <div className="flex items-center gap-1.5">
            <motion.span
              animate={{ scale: status.status === 'connected' ? [1, 1.2, 1] : 1 }}
              transition={{ duration: 2, repeat: Infinity }}
              className={`w-2 h-2 rounded-full ${getConnectionColor()}`}
            />
            <span className="text-slate-400 capitalize">{status.status}</span>
          </div>

          {/* Sync Indicator */}
          <AnimatePresence>
            {status.syncing && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-1.5"
              >
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="text-blue-400"
                >
                  ↻
                </motion.span>
                <span className="text-slate-400">Syncing</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Last Sync Time */}
          {status.lastSyncTime && !status.syncing && (
            <span className="hidden md:inline text-slate-500">
              Last sync: {new Date(status.lastSyncTime).toLocaleTimeString()}
            </span>
          )}
        </div>

        {/* Right: Deploy + AI + Server Stats */}
        <div className="flex items-center gap-4">
          {/* Server Stats */}
          {showServerStats && (
            <div className="hidden lg:flex items-center gap-3">
              {gpuUsage !== undefined && (
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500">GPU:</span>
                  <div className="w-16 h-1.5 rounded-full bg-slate-700 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${gpuUsage}%` }}
                      transition={{ duration: 0.5 }}
                      className={`h-full ${gpuUsage > 80 ? 'bg-red-500' : gpuUsage > 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
                    />
                  </div>
                  <span className="text-slate-400">{gpuUsage}%</span>
                </div>
              )}
              {modelStatus && (
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500">Model:</span>
                  <span className="text-green-400">{modelStatus}</span>
                </div>
              )}
            </div>
          )}

          {/* AI Processing Indicator */}
          <AnimatePresence>
            {status.aiProcessing && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-1.5"
              >
                <motion.span
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-purple-400"
                >
                  ✨
                </motion.span>
                <span className="text-slate-400">AI Processing</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Deploy Button */}
          <motion.button
            onClick={onDeployClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1.5 rounded-md bg-blue-600/20 border border-blue-500/30 px-3 py-1 hover:bg-blue-600/30 transition-colors"
          >
            <span className={getDeployStatusColor()}>
              {status.deploymentStatus === 'deploying' && '⏳'}
              {status.deploymentStatus === 'success' && '✓'}
              {status.deploymentStatus === 'error' && '✕'}
              {(!status.deploymentStatus || status.deploymentStatus === 'idle') && '🚀'}
            </span>
            <span className="text-blue-400 font-medium capitalize">
              {status.deploymentStatus === 'deploying' ? 'Deploying...' : 'Deploy'}
            </span>
          </motion.button>
        </div>
      </div>
    </motion.footer>
  );
}
