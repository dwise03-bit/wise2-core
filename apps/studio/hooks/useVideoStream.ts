'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface StreamQuality {
  bitrate: number;
  fps: number;
  resolution: string;
}

export interface StreamStats {
  bitrate: number;
  fps: number;
  connections: number;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
}

export const useVideoStream = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const statsIntervalRef = useRef<NodeJS.Timeout>();

  const [isStreaming, setIsStreaming] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [stats, setStats] = useState<StreamStats>({
    bitrate: 0,
    fps: 30,
    connections: 0,
    quality: 'excellent',
  });
  const [error, setError] = useState<string | null>(null);

  // Get available cameras
  const getCameras = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter((device) => device.kind === 'videoinput');
    } catch (err) {
      console.error('Failed to enumerate devices:', err);
      return [];
    }
  }, []);

  // Start camera feed
  const startCamera = useCallback(async (deviceId?: string) => {
    try {
      setError(null);
      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          deviceId: deviceId ? { exact: deviceId } : undefined,
        },
        audio: true,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setCameraActive(true);
      return stream;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to access camera';
      setError(errorMsg);
      console.error('Camera error:', err);
      return null;
    }
  }, []);

  // Stop camera feed
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setIsStreaming(false);
  }, []);

  // Start WebRTC streaming
  const startStream = useCallback(async () => {
    try {
      if (!streamRef.current) {
        throw new Error('Camera not initialized');
      }

      // Create peer connection
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: ['stun:stun.l.google.com:19302'] },
          { urls: ['stun:stun1.l.google.com:19302'] },
        ],
      });

      // Add stream tracks
      streamRef.current.getTracks().forEach((track) => {
        if (streamRef.current) {
          pc.addTrack(track, streamRef.current);
        }
      });

      peerConnectionRef.current = pc;
      setIsStreaming(true);

      // Simulate stats updates
      statsIntervalRef.current = setInterval(() => {
        setStats((prev) => ({
          ...prev,
          bitrate: Math.random() * 8000 + 2000,
          fps: Math.random() < 0.1 ? 24 : 30,
          quality: Math.random() > 0.2 ? 'excellent' : 'good',
        }));
      }, 1000);

      return pc;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to start stream';
      setError(errorMsg);
      setIsStreaming(false);
      return null;
    }
  }, []);

  // Stop streaming
  const stopStream = useCallback(() => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (statsIntervalRef.current) {
      clearInterval(statsIntervalRef.current);
    }
    setIsStreaming(false);
    setStats({
      bitrate: 0,
      fps: 30,
      connections: 0,
      quality: 'excellent',
    });
  }, []);

  // Capture current frame to canvas
  const captureFrame = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0);
        return canvasRef.current.toDataURL('image/jpeg');
      }
    }
    return null;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      stopStream();
    };
  }, [stopCamera, stopStream]);

  return {
    videoRef,
    canvasRef,
    isStreaming,
    cameraActive,
    stats,
    error,
    startCamera,
    stopCamera,
    startStream,
    stopStream,
    captureFrame,
    getCameras,
  };
};
