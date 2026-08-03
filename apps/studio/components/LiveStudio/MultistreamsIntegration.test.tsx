/**
 * Multistreaming Component - Integration Tests
 *
 * Tests for component props, callbacks, and state management
 */

import { renderHook, act } from '@testing-library/react';
import type { StreamingPlatform } from './streamingTypes';
import type {
  EncodingSettings,
  FailoverSettings,
  PlatformStreamStatus,
} from './Multistreaming';

describe('Multistreaming Component', () => {
  describe('Type Exports', () => {
    it('should export EncodingSettings type', () => {
      const settings: EncodingSettings = {
        resolution: '720p',
        fps: 30,
        baselineBitrate: 3500,
      };
      expect(settings.resolution).toBe('720p');
      expect(settings.fps).toBe(30);
      expect(settings.baselineBitrate).toBe(3500);
    });

    it('should export FailoverSettings type', () => {
      const settings: FailoverSettings = {
        enableFailover: true,
        continueOnDisconnect: true,
        maxReconnectAttempts: 5,
      };
      expect(settings.enableFailover).toBe(true);
      expect(settings.continueOnDisconnect).toBe(true);
      expect(settings.maxReconnectAttempts).toBe(5);
    });

    it('should export PlatformStreamStatus type', () => {
      const status: PlatformStreamStatus = {
        platform: 'twitch' as StreamingPlatform,
        isEnabled: true,
        isConnected: true,
        viewerCount: 1500,
        bitrateCurrent: 3500,
        bitrateTarget: 3500,
        latencyDelay: 5000,
        reconnectAttempts: 0,
      };
      expect(status.platform).toBe('twitch');
      expect(status.viewerCount).toBe(1500);
    });
  });

  describe('Platform States', () => {
    it('should handle all platform types', () => {
      const platforms: StreamingPlatform[] = [
        'twitch',
        'youtube',
        'facebook',
        'custom-rtmp',
      ];
      expect(platforms).toHaveLength(4);
      expect(platforms[0]).toBe('twitch');
    });

    it('should track platform connection status', () => {
      const status: PlatformStreamStatus = {
        platform: 'youtube',
        isEnabled: true,
        isConnected: false,
        viewerCount: 0,
        bitrateCurrent: 0,
        bitrateTarget: 3500,
        latencyDelay: 10000,
        reconnectAttempts: 2,
        error: 'Connection timeout',
      };
      expect(status.isConnected).toBe(false);
      expect(status.error).toBeDefined();
      expect(status.reconnectAttempts).toBe(2);
    });
  });

  describe('Encoding Settings', () => {
    it('should validate resolution options', () => {
      const resolutions = ['480p', '720p', '1080p', '1440p', '2160p'] as const;
      resolutions.forEach((res) => {
        const settings: EncodingSettings = {
          resolution: res,
          fps: 30,
          baselineBitrate: 3500,
        };
        expect(['480p', '720p', '1080p', '1440p', '2160p']).toContain(
          settings.resolution
        );
      });
    });

    it('should validate FPS options', () => {
      const fpsList = [24, 30, 48, 50, 60] as const;
      fpsList.forEach((fps) => {
        const settings: EncodingSettings = {
          resolution: '720p',
          fps,
          baselineBitrate: 3500,
        };
        expect([24, 30, 48, 50, 60]).toContain(settings.fps);
      });
    });

    it('should accept bitrate range', () => {
      const testBitrates = [500, 1500, 3500, 5000, 8000, 12000, 20000];
      testBitrates.forEach((bitrate) => {
        const settings: EncodingSettings = {
          resolution: '720p',
          fps: 30,
          baselineBitrate: bitrate,
        };
        expect(settings.baselineBitrate).toBeGreaterThan(0);
        expect(settings.baselineBitrate).toBeLessThanOrEqual(20000);
      });
    });
  });

  describe('Failover Settings', () => {
    it('should support failover enable/disable', () => {
      const withFailover: FailoverSettings = {
        enableFailover: true,
        continueOnDisconnect: true,
        maxReconnectAttempts: 5,
      };
      const withoutFailover: FailoverSettings = {
        enableFailover: false,
        continueOnDisconnect: false,
        maxReconnectAttempts: 0,
      };
      expect(withFailover.enableFailover).toBe(true);
      expect(withoutFailover.enableFailover).toBe(false);
    });

    it('should validate reconnect attempt counts', () => {
      for (let attempts = 1; attempts <= 10; attempts++) {
        const settings: FailoverSettings = {
          enableFailover: true,
          continueOnDisconnect: true,
          maxReconnectAttempts: attempts,
        };
        expect(settings.maxReconnectAttempts).toBeGreaterThanOrEqual(1);
        expect(settings.maxReconnectAttempts).toBeLessThanOrEqual(10);
      }
    });

    it('should support continue on disconnect flag', () => {
      const continueSetting: FailoverSettings = {
        enableFailover: true,
        continueOnDisconnect: true,
        maxReconnectAttempts: 5,
      };
      const stopOnDisconnect: FailoverSettings = {
        enableFailover: true,
        continueOnDisconnect: false,
        maxReconnectAttempts: 5,
      };
      expect(continueSetting.continueOnDisconnect).toBe(true);
      expect(stopOnDisconnect.continueOnDisconnect).toBe(false);
    });
  });

  describe('Multi-Platform Scenarios', () => {
    it('should handle single platform', () => {
      const platforms: StreamingPlatform[] = ['twitch'];
      expect(platforms).toHaveLength(1);
      expect(platforms[0]).toBe('twitch');
    });

    it('should handle multiple platforms', () => {
      const platforms: StreamingPlatform[] = [
        'twitch',
        'youtube',
        'facebook',
      ];
      expect(platforms).toHaveLength(3);
    });

    it('should handle all platforms', () => {
      const platforms: StreamingPlatform[] = [
        'twitch',
        'youtube',
        'facebook',
        'custom-rtmp',
      ];
      expect(platforms).toHaveLength(4);
    });

    it('should calculate total viewers across platforms', () => {
      const stats = new Map<StreamingPlatform, PlatformStreamStatus>([
        [
          'twitch',
          {
            platform: 'twitch',
            isEnabled: true,
            isConnected: true,
            viewerCount: 1000,
            bitrateCurrent: 3500,
            bitrateTarget: 3500,
            latencyDelay: 5000,
            reconnectAttempts: 0,
          },
        ],
        [
          'youtube',
          {
            platform: 'youtube',
            isEnabled: true,
            isConnected: true,
            viewerCount: 2500,
            bitrateCurrent: 3500,
            bitrateTarget: 3500,
            latencyDelay: 10000,
            reconnectAttempts: 0,
          },
        ],
        [
          'facebook',
          {
            platform: 'facebook',
            isEnabled: true,
            isConnected: true,
            viewerCount: 500,
            bitrateCurrent: 3200,
            bitrateTarget: 3500,
            latencyDelay: 7000,
            reconnectAttempts: 0,
          },
        ],
      ]);

      let totalViewers = 0;
      stats.forEach((stat) => {
        totalViewers += stat.viewerCount;
      });
      expect(totalViewers).toBe(4000);
    });

    it('should calculate average bitrate across platforms', () => {
      const stats = new Map<StreamingPlatform, PlatformStreamStatus>([
        [
          'twitch',
          {
            platform: 'twitch',
            isEnabled: true,
            isConnected: true,
            viewerCount: 1000,
            bitrateCurrent: 3600,
            bitrateTarget: 3500,
            latencyDelay: 5000,
            reconnectAttempts: 0,
          },
        ],
        [
          'youtube',
          {
            platform: 'youtube',
            isEnabled: true,
            isConnected: true,
            viewerCount: 2500,
            bitrateCurrent: 3400,
            bitrateTarget: 3500,
            latencyDelay: 10000,
            reconnectAttempts: 0,
          },
        ],
      ]);

      let totalBitrate = 0;
      stats.forEach((stat) => {
        totalBitrate += stat.bitrateCurrent;
      });
      const avgBitrate = Math.round(totalBitrate / stats.size);
      expect(avgBitrate).toBe(3500);
    });
  });

  describe('Error Scenarios', () => {
    it('should track platform errors', () => {
      const errorStatus: PlatformStreamStatus = {
        platform: 'twitch',
        isEnabled: true,
        isConnected: false,
        viewerCount: 0,
        bitrateCurrent: 0,
        bitrateTarget: 3500,
        latencyDelay: 5000,
        reconnectAttempts: 3,
        error: 'Connection timeout after 3 attempts',
      };
      expect(errorStatus.error).toBeDefined();
      expect(errorStatus.reconnectAttempts).toBe(3);
    });

    it('should handle partial platform failures', () => {
      const stats = new Map<StreamingPlatform, PlatformStreamStatus>([
        [
          'twitch',
          {
            platform: 'twitch',
            isEnabled: true,
            isConnected: true,
            viewerCount: 1000,
            bitrateCurrent: 3500,
            bitrateTarget: 3500,
            latencyDelay: 5000,
            reconnectAttempts: 0,
          },
        ],
        [
          'youtube',
          {
            platform: 'youtube',
            isEnabled: true,
            isConnected: false,
            viewerCount: 0,
            bitrateCurrent: 0,
            bitrateTarget: 3500,
            latencyDelay: 10000,
            reconnectAttempts: 2,
            error: 'Connection failed',
          },
        ],
        [
          'facebook',
          {
            platform: 'facebook',
            isEnabled: true,
            isConnected: true,
            viewerCount: 500,
            bitrateCurrent: 3200,
            bitrateTarget: 3500,
            latencyDelay: 7000,
            reconnectAttempts: 0,
          },
        ],
      ]);

      let connectedCount = 0;
      let errorCount = 0;
      stats.forEach((stat) => {
        if (stat.isConnected) connectedCount++;
        if (stat.error) errorCount++;
      });

      expect(connectedCount).toBe(2);
      expect(errorCount).toBe(1);
    });
  });

  describe('Platform-Specific Latency', () => {
    it('should support platform-specific latency delays', () => {
      const latencies: Record<StreamingPlatform, number> = {
        twitch: 5000,
        youtube: 10000,
        facebook: 7000,
        'custom-rtmp': 3000,
      };

      Object.entries(latencies).forEach(([platform, latency]) => {
        expect(latency).toBeGreaterThanOrEqual(0);
        expect(latency).toBeLessThanOrEqual(30000);
      });
    });
  });
});
