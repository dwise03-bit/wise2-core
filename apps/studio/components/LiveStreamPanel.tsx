'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVideoStream } from '../hooks/useVideoStream';

export function LiveStreamPanel() {
  const {
    videoRef,
    isStreaming,
    cameraActive,
    stats,
    error,
    startCamera,
    stopCamera,
    startStream,
    stopStream,
  } = useVideoStream();

  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);

  // Load available cameras
  useEffect(() => {
    const loadCameras = async () => {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((d) => d.kind === 'videoinput');
      setCameras(videoDevices);
      if (videoDevices.length > 0) {
        setSelectedCamera(videoDevices[0].deviceId);
      }
    };
    loadCameras();
  }, []);

  const handleCameraSelect = async (deviceId: string) => {
    setSelectedCamera(deviceId);
    if (cameraActive) {
      stopCamera();
      setTimeout(() => startCamera(deviceId), 500);
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent':
        return 'text-green-500';
      case 'good':
        return 'text-yellow-500';
      case 'fair':
        return 'text-orange-500';
      case 'poor':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="space-y-4"
    >
      {/* Video Preview */}
      <motion.div
        className="relative bg-black rounded-lg overflow-hidden border border-wise-medium aspect-video"
        whileHover={{ scale: 1.01 }}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />

        {/* Stream Indicator */}
        <AnimatePresence>
          {isStreaming && (
            <motion.div
              className="absolute top-4 left-4 flex items-center gap-2 bg-wise-accent-red/90 px-3 py-2 rounded-lg"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <motion.div
                className="w-2 h-2 bg-white rounded-full"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <span className="text-white font-semibold text-sm">LIVE</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quality Indicator */}
        <motion.div
          className="absolute top-4 right-4 bg-wise-surface/80 backdrop-blur rounded-lg px-3 py-2 text-xs"
          whileHover={{ scale: 1.05 }}
        >
          <div className={`font-bold ${getQualityColor(stats.quality)}`}>
            {stats.quality.toUpperCase()}
          </div>
          <div className="text-wise-text-muted">{stats.bitrate.toFixed(0)} kbps</div>
        </motion.div>

        {/* FPS Counter */}
        <motion.div
          className="absolute bottom-4 right-4 bg-wise-surface/80 backdrop-blur rounded-lg px-3 py-2 text-xs"
          whileHover={{ scale: 1.05 }}
        >
          <div className="text-wise-text-muted">{stats.fps} FPS</div>
          <div className="text-wise-accent-green font-bold">{stats.fps} Hz</div>
        </motion.div>
      </motion.div>

      {/* Camera Selection */}
      {cameras.length > 1 && (
        <motion.div
          className="bg-wise-surface rounded-lg p-4 border border-wise-medium"
          whileHover={{ scale: 1.01 }}
        >
          <label className="text-sm font-semibold mb-2 block">Camera</label>
          <select
            value={selectedCamera}
            onChange={(e) => handleCameraSelect(e.target.value)}
            disabled={isStreaming}
            className="w-full px-3 py-2 bg-wise-surface-secondary border border-wise-medium rounded text-wise-text-primary disabled:opacity-50 transition"
          >
            {cameras.map((camera) => (
              <option key={camera.deviceId} value={camera.deviceId}>
                {camera.label || `Camera ${camera.deviceId.slice(0, 5)}`}
              </option>
            ))}
          </select>
        </motion.div>
      )}

      {/* Stream Stats */}
      <div className="grid grid-cols-2 gap-3">
        {[
          {
            label: 'Bitrate',
            value: `${stats.bitrate.toFixed(0)} kbps`,
            color: 'from-blue-500 to-blue-600',
          },
          {
            label: 'FPS',
            value: `${stats.fps}`,
            color: 'from-green-500 to-green-600',
          },
          {
            label: 'Quality',
            value: stats.quality.charAt(0).toUpperCase() + stats.quality.slice(1),
            color: 'from-purple-500 to-purple-600',
          },
          {
            label: 'Status',
            value: isStreaming ? 'STREAMING' : 'STANDBY',
            color: isStreaming
              ? 'from-red-500 to-red-600'
              : 'from-gray-500 to-gray-600',
          },
        ].map((stat, i) => (
          <motion.div
            key={i}
            className={`bg-gradient-to-br ${stat.color} rounded-lg p-3 text-white`}
            whileHover={{ scale: 1.05 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="text-xs opacity-80">{stat.label}</div>
            <div className="font-bold text-sm">{stat.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Control Buttons */}
      <div className="space-y-2">
        {!cameraActive && (
          <motion.button
            onClick={() => startCamera(selectedCamera)}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            📷 Start Camera
          </motion.button>
        )}

        {cameraActive && !isStreaming && (
          <motion.button
            onClick={() => startStream()}
            className="w-full py-3 bg-wise-accent-red hover:bg-wise-accent-red/90 text-white rounded-lg font-semibold transition"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🔴 Start Streaming
          </motion.button>
        )}

        {isStreaming && (
          <motion.button
            onClick={() => stopStream()}
            className="w-full py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ⏹ Stop Streaming
          </motion.button>
        )}

        {cameraActive && (
          <motion.button
            onClick={() => stopCamera()}
            className="w-full py-3 bg-wise-surface hover:bg-wise-surface/80 text-wise-text-primary rounded-lg font-semibold transition border border-wise-medium"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Stop Camera
          </motion.button>
        )}
      </div>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            className="bg-wise-accent-red/20 border border-wise-accent-red rounded-lg p-3 text-wise-accent-red text-sm"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
