'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Zap, Activity, Users } from 'lucide-react';

interface StreamStatsData {
  viewers: number;
  bitrate: number;
  frameDrops: number;
  encodingTime: number;
  fps: number;
  cpuLoad: number;
  gpuLoad: number;
  memoryUsage: number;
  networkStatus: 'good' | 'okay' | 'poor';
  followers: number;
}

interface OBSStreamStatsProps {
  stats: StreamStatsData;
  isLive: boolean;
}

export function OBSStreamStats({ stats, isLive }: OBSStreamStatsProps) {
  const [peakViewers, setPeakViewers] = useState(stats.viewers);
  const [avgBitrate, setAvgBitrate] = useState(stats.bitrate);
  const [bitrateTrend, setBitrateTrend] = useState<'up' | 'down' | 'stable'>('stable');

  useEffect(() => {
    if (stats.viewers > peakViewers) {
      setPeakViewers(stats.viewers);
    }
  }, [stats.viewers, peakViewers]);

  useEffect(() => {
    setAvgBitrate((prev) => (prev + stats.bitrate) / 2);
    if (stats.bitrate > avgBitrate * 1.1) {
      setBitrateTrend('up');
    } else if (stats.bitrate < avgBitrate * 0.9) {
      setBitrateTrend('down');
    } else {
      setBitrateTrend('stable');
    }
  }, [stats.bitrate, avgBitrate]);

  const getNetworkColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-green-400';
      case 'okay':
        return 'text-yellow-400';
      case 'poor':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getNetworkBgColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'bg-green-900/20 border-green-700';
      case 'okay':
        return 'bg-yellow-900/20 border-yellow-700';
      case 'poor':
        return 'bg-red-900/20 border-red-700';
      default:
        return 'bg-gray-800 border-gray-700';
    }
  };

  const frameDropPercentage = stats.fps > 0 ? ((stats.frameDrops / 100) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-3">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Viewers */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-900/30 to-blue-900/10 border border-blue-700/30 rounded-lg p-3"
        >
          <div className="flex items-center gap-2 mb-2">
            <Users size={14} className="text-blue-400" />
            <span className="text-xs font-semibold text-blue-400 uppercase">Viewers</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats.viewers.toLocaleString()}</div>
          <div className="text-xs text-blue-300/60 mt-1">Peak: {peakViewers.toLocaleString()}</div>
        </motion.div>

        {/* Bitrate */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-gradient-to-br from-purple-900/30 to-purple-900/10 border border-purple-700/30 rounded-lg p-3"
        >
          <div className="flex items-center gap-2 mb-2">
            <Zap size={14} className="text-purple-400" />
            <span className="text-xs font-semibold text-purple-400 uppercase">Bitrate</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {stats.bitrate.toFixed(1)} <span className="text-sm text-purple-300">Mbps</span>
          </div>
          <div className={`text-xs mt-1 flex items-center gap-1 ${
            bitrateTrend === 'up' ? 'text-red-400' : bitrateTrend === 'down' ? 'text-green-400' : 'text-gray-400'
          }`}>
            {bitrateTrend === 'up' ? '↑' : bitrateTrend === 'down' ? '↓' : '→'} {avgBitrate.toFixed(1)} Mbps avg
          </div>
        </motion.div>

        {/* FPS */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-900/30 to-green-900/10 border border-green-700/30 rounded-lg p-3"
        >
          <div className="flex items-center gap-2 mb-2">
            <Activity size={14} className="text-green-400" />
            <span className="text-xs font-semibold text-green-400 uppercase">FPS</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {stats.fps} <span className="text-sm text-green-300">/60</span>
          </div>
          <div className="text-xs text-red-400 mt-1">
            {stats.frameDrops} drops {frameDropPercentage === '0' ? '' : `(${frameDropPercentage}%)`}
          </div>
        </motion.div>

        {/* Encoding Time */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-gradient-to-br from-orange-900/30 to-orange-900/10 border border-orange-700/30 rounded-lg p-3"
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={14} className="text-orange-400" />
            <span className="text-xs font-semibold text-orange-400 uppercase">Encoding</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {stats.encodingTime.toFixed(1)} <span className="text-sm text-orange-300">ms</span>
          </div>
          <div className={`text-xs mt-1 ${
            stats.encodingTime > 30 ? 'text-red-400' : stats.encodingTime > 20 ? 'text-yellow-400' : 'text-green-400'
          }`}>
            {stats.encodingTime > 30 ? 'High load' : stats.encodingTime > 20 ? 'Moderate' : 'Good'}
          </div>
        </motion.div>
      </div>

      {/* Network Status */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`border rounded-lg p-3 ${getNetworkBgColor(stats.networkStatus)}`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-300 uppercase">Network</span>
          <span className={`text-xs font-bold uppercase ${getNetworkColor(stats.networkStatus)}`}>
            {stats.networkStatus === 'good' ? '✓ Good' : stats.networkStatus === 'okay' ? '⚠ Okay' : '✗ Poor'}
          </span>
        </div>
        <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${
              stats.networkStatus === 'good'
                ? 'bg-green-500'
                : stats.networkStatus === 'okay'
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
            }`}
            initial={{ width: 0 }}
            animate={{
              width:
                stats.networkStatus === 'good' ? '100%' : stats.networkStatus === 'okay' ? '60%' : '30%',
            }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </motion.div>

      {/* Resource Usage */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-gray-400 uppercase px-1">Resources</h3>

        {/* CPU Load */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-gray-800/50 border border-gray-700 rounded p-2.5"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-gray-300">CPU Load</span>
            <span className={`text-xs font-bold ${
              stats.cpuLoad > 80 ? 'text-red-400' : stats.cpuLoad > 60 ? 'text-yellow-400' : 'text-green-400'
            }`}>
              {stats.cpuLoad.toFixed(0)}%
            </span>
          </div>
          <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className={`h-full ${
                stats.cpuLoad > 80 ? 'bg-red-500' : stats.cpuLoad > 60 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(stats.cpuLoad, 100)}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </motion.div>

        {/* GPU Load */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800/50 border border-gray-700 rounded p-2.5"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-gray-300">GPU Load</span>
            <span className={`text-xs font-bold ${
              stats.gpuLoad > 80 ? 'text-red-400' : stats.gpuLoad > 60 ? 'text-yellow-400' : 'text-green-400'
            }`}>
              {stats.gpuLoad.toFixed(0)}%
            </span>
          </div>
          <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className={`h-full ${
                stats.gpuLoad > 80 ? 'bg-red-500' : stats.gpuLoad > 60 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(stats.gpuLoad, 100)}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </motion.div>

        {/* Memory Usage */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-gray-800/50 border border-gray-700 rounded p-2.5"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-gray-300">Memory</span>
            <span className={`text-xs font-bold ${
              stats.memoryUsage > 80 ? 'text-red-400' : stats.memoryUsage > 60 ? 'text-yellow-400' : 'text-green-400'
            }`}>
              {stats.memoryUsage.toFixed(0)}%
            </span>
          </div>
          <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className={`h-full ${
                stats.memoryUsage > 80 ? 'bg-red-500' : stats.memoryUsage > 60 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(stats.memoryUsage, 100)}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </motion.div>
      </div>

      {/* Followers */}
      {isLive && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-pink-900/30 to-pink-900/10 border border-pink-700/30 rounded-lg p-3"
        >
          <div className="text-xs font-semibold text-pink-400 uppercase mb-1">Followers (Live)</div>
          <div className="text-lg font-bold text-white">
            +{stats.followers.toLocaleString()} {stats.followers !== 1 ? 'followers' : 'follower'}
          </div>
        </motion.div>
      )}

      {/* Status Summary */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-3 text-xs text-gray-400 space-y-1.5">
        <div className="font-mono flex items-center justify-between">
          <span>Status:</span>
          {isLive ? (
            <motion.span
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-red-400 font-bold"
            >
              🔴 LIVE
            </motion.span>
          ) : (
            <span className="text-gray-500">Idle</span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <span>Last update:</span>
          <span className="text-gray-500">Just now</span>
        </div>
      </div>
    </div>
  );
}
