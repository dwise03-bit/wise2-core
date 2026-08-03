/**
 * Unit Tests for useClipPlayback Hook
 *
 * Tests cover:
 * - Clip registration and unregistration
 * - Playback start/stop
 * - Pause/resume functionality
 * - Volume control
 * - Muting/unmuting
 * - State tracking
 * - Error handling
 * - Memory cleanup
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useClipPlayback } from '../useClipPlayback';
import type { ClipData } from '../useClips';

/**
 * Create a mock AudioBuffer for testing
 */
function createMockAudioBuffer(duration: number = 1, sampleRate: number = 44100): AudioBuffer {
  const buffer = new AudioBuffer({
    length: duration * sampleRate,
    sampleRate,
  });

  // Fill with test data
  const channel = buffer.getChannelData(0);
  for (let i = 0; i < channel.length; i++) {
    channel[i] = Math.sin((i / channel.length) * Math.PI * 2) * 0.1;
  }

  return buffer;
}

/**
 * Create a mock ClipData for testing
 */
function createMockClip(
  overrides?: Partial<ClipData>
): ClipData {
  return {
    id: 'test-clip-1',
    trackId: 'track-1',
    name: 'Test Clip',
    audioBuffer: createMockAudioBuffer(2),
    startTime: 0,
    duration: 2,
    displayStart: 0,
    displayEnd: 2,
    fadeIn: 0.1,
    fadeOut: 0.1,
    isSelected: false,
    ...overrides,
  };
}

describe('useClipPlayback', () => {
  /**
   * Test: Hook initialization
   */
  describe('Initialization', () => {
    it('should initialize without errors', () => {
      const { result } = renderHook(() => useClipPlayback());

      expect(result.current).toBeDefined();
      expect(result.current.playingClips).toEqual([]);
      expect(result.current.getMasterGain()).toBeDefined();
    });

    it('should accept custom options', () => {
      const onClipEnded = jest.fn();
      const { result } = renderHook(() =>
        useClipPlayback({
          fadeDuration: 0.2,
          onClipEnded,
        })
      );

      expect(result.current).toBeDefined();
    });
  });

  /**
   * Test: Clip registration
   */
  describe('Clip Registration', () => {
    it('should register a clip', () => {
      const { result } = renderHook(() => useClipPlayback());
      const clip = createMockClip();

      act(() => {
        result.current.registerClip(clip);
      });

      // Verify by attempting to play (would fail if not registered)
      act(async () => {
        await result.current.playClip(clip.id);
      });
    });

    it('should unregister a clip', () => {
      const { result } = renderHook(() => useClipPlayback());
      const clip = createMockClip();

      act(() => {
        result.current.registerClip(clip);
      });

      act(() => {
        result.current.unregisterClip(clip.id);
      });

      // Unregistered clip should not play
      expect(result.current.isClipPlaying(clip.id)).toBe(false);
    });

    it('should stop playing when unregistered', () => {
      const { result } = renderHook(() => useClipPlayback());
      const clip = createMockClip();

      act(() => {
        result.current.registerClip(clip);
      });

      act(async () => {
        await result.current.playClip(clip.id);
      });

      expect(result.current.playingClips).toContain(clip.id);

      act(() => {
        result.current.unregisterClip(clip.id);
      });

      expect(result.current.playingClips).not.toContain(clip.id);
    });
  });

  /**
   * Test: Basic playback
   */
  describe('Playback Control', () => {
    it('should play a clip', async () => {
      const { result } = renderHook(() => useClipPlayback());
      const clip = createMockClip();

      act(() => {
        result.current.registerClip(clip);
      });

      await act(async () => {
        await result.current.playClip(clip.id);
      });

      expect(result.current.playingClips).toContain(clip.id);
    });

    it('should stop a clip', async () => {
      const { result } = renderHook(() => useClipPlayback());
      const clip = createMockClip();

      act(() => {
        result.current.registerClip(clip);
      });

      await act(async () => {
        await result.current.playClip(clip.id);
      });

      expect(result.current.playingClips).toContain(clip.id);

      act(() => {
        result.current.stopClip(clip.id);
      });

      // May need to wait for fade to complete
      await waitFor(() => {
        expect(result.current.playingClips).not.toContain(clip.id);
      }, { timeout: 500 });
    });

    it('should stop all clips', async () => {
      const { result } = renderHook(() => useClipPlayback());
      const clip1 = createMockClip({ id: 'clip-1' });
      const clip2 = createMockClip({ id: 'clip-2' });

      act(() => {
        result.current.registerClip(clip1);
        result.current.registerClip(clip2);
      });

      await act(async () => {
        await Promise.all([
          result.current.playClip(clip1.id),
          result.current.playClip(clip2.id),
        ]);
      });

      expect(result.current.playingClips.length).toBe(2);

      act(() => {
        result.current.stopAllClips();
      });

      await waitFor(() => {
        expect(result.current.playingClips.length).toBe(0);
      }, { timeout: 500 });
    });

    it('should check if clip is playing', async () => {
      const { result } = renderHook(() => useClipPlayback());
      const clip = createMockClip();

      act(() => {
        result.current.registerClip(clip);
      });

      expect(result.current.isClipPlaying(clip.id)).toBe(false);

      await act(async () => {
        await result.current.playClip(clip.id);
      });

      expect(result.current.isClipPlaying(clip.id)).toBe(true);
    });
  });

  /**
   * Test: Pause/Resume
   */
  describe('Pause/Resume', () => {
    it('should pause all clips', async () => {
      const { result } = renderHook(() => useClipPlayback());
      const clip = createMockClip();

      act(() => {
        result.current.registerClip(clip);
      });

      await act(async () => {
        await result.current.playClip(clip.id);
      });

      act(() => {
        result.current.pauseAllClips();
      });

      // After pause, clips should be stopped (can't directly observe paused state)
      await waitFor(() => {
        expect(result.current.playingClips).not.toContain(clip.id);
      }, { timeout: 500 });
    });

    it('should resume paused clips', async () => {
      const { result } = renderHook(() => useClipPlayback());
      const clip = createMockClip();

      act(() => {
        result.current.registerClip(clip);
      });

      await act(async () => {
        await result.current.playClip(clip.id);
      });

      act(() => {
        result.current.pauseAllClips();
      });

      await waitFor(() => {
        expect(result.current.playingClips).not.toContain(clip.id);
      }, { timeout: 500 });

      act(() => {
        result.current.resumeAllClips();
      });

      expect(result.current.playingClips).toContain(clip.id);
    });
  });

  /**
   * Test: Volume Control
   */
  describe('Volume Control', () => {
    it('should set clip volume', async () => {
      const { result } = renderHook(() => useClipPlayback());
      const clip = createMockClip();

      act(() => {
        result.current.registerClip(clip);
      });

      await act(async () => {
        await result.current.playClip(clip.id);
      });

      act(() => {
        result.current.setClipVolume(clip.id, 0.5);
      });

      // Volume is applied to gain node (hard to test directly)
      expect(result.current.isClipPlaying(clip.id)).toBe(true);
    });

    it('should clamp volume to 0-1', async () => {
      const { result } = renderHook(() => useClipPlayback());
      const clip = createMockClip();

      act(() => {
        result.current.registerClip(clip);
      });

      await act(async () => {
        await result.current.playClip(clip.id);
      });

      // Should not throw, even with out-of-range values
      act(() => {
        result.current.setClipVolume(clip.id, 2.0); // Should clamp to 1
        result.current.setClipVolume(clip.id, -1.0); // Should clamp to 0
      });

      expect(result.current.isClipPlaying(clip.id)).toBe(true);
    });

    it('should set track volume', async () => {
      const { result } = renderHook(() => useClipPlayback());
      const clip1 = createMockClip({ id: 'clip-1', trackId: 'track-1' });
      const clip2 = createMockClip({ id: 'clip-2', trackId: 'track-2' });

      act(() => {
        result.current.registerClip(clip1);
        result.current.registerClip(clip2);
      });

      await act(async () => {
        await Promise.all([
          result.current.playClip(clip1.id),
          result.current.playClip(clip2.id),
        ]);
      });

      act(() => {
        result.current.setTrackVolume('track-1', 0.3);
      });

      // Both clips should still be playing
      expect(result.current.playingClips.length).toBe(2);
    });

    it('should set master volume', () => {
      const { result } = renderHook(() => useClipPlayback());

      act(() => {
        result.current.setMasterVolume(0.5);
      });

      const masterGain = result.current.getMasterGain();
      expect(masterGain).toBeDefined();
    });
  });

  /**
   * Test: Mute Control
   */
  describe('Mute Control', () => {
    it('should mute a clip', async () => {
      const { result } = renderHook(() => useClipPlayback());
      const clip = createMockClip();

      act(() => {
        result.current.registerClip(clip);
      });

      await act(async () => {
        await result.current.playClip(clip.id);
      });

      act(() => {
        result.current.muteClip(clip.id);
      });

      // Clip should still be "playing" but silenced
      expect(result.current.isClipPlaying(clip.id)).toBe(true);
    });

    it('should unmute a clip', async () => {
      const { result } = renderHook(() => useClipPlayback());
      const clip = createMockClip();

      act(() => {
        result.current.registerClip(clip);
      });

      await act(async () => {
        await result.current.playClip(clip.id);
      });

      act(() => {
        result.current.muteClip(clip.id);
      });

      act(() => {
        result.current.unmuteClip(clip.id);
      });

      expect(result.current.isClipPlaying(clip.id)).toBe(true);
    });
  });

  /**
   * Test: Error Handling
   */
  describe('Error Handling', () => {
    it('should handle playing unregistered clip gracefully', async () => {
      const { result } = renderHook(() => useClipPlayback());

      // Should log error but not throw
      await expect(result.current.playClip('non-existent')).rejects.toBeDefined();
    });

    it('should handle stopping non-playing clip', () => {
      const { result } = renderHook(() => useClipPlayback());

      // Should not throw
      expect(() => {
        result.current.stopClip('non-existent');
      }).not.toThrow();
    });
  });

  /**
   * Test: Cleanup
   */
  describe('Cleanup', () => {
    it('should clean up resources on unmount', async () => {
      const { result, unmount } = renderHook(() => useClipPlayback());
      const clip = createMockClip();

      act(() => {
        result.current.registerClip(clip);
      });

      await act(async () => {
        await result.current.playClip(clip.id);
      });

      expect(result.current.playingClips.length).toBeGreaterThan(0);

      unmount();

      // After unmount, should have cleaned up
      // (Can't directly verify internal state, but should not crash)
    });
  });

  /**
   * Test: State Tracking
   */
  describe('State Tracking', () => {
    it('should track playing clips', async () => {
      const { result } = renderHook(() => useClipPlayback());
      const clip1 = createMockClip({ id: 'clip-1' });
      const clip2 = createMockClip({ id: 'clip-2' });

      act(() => {
        result.current.registerClip(clip1);
        result.current.registerClip(clip2);
      });

      await act(async () => {
        await result.current.playClip(clip1.id);
      });

      expect(result.current.playingClips).toContain(clip1.id);
      expect(result.current.playingClips).not.toContain(clip2.id);

      await act(async () => {
        await result.current.playClip(clip2.id);
      });

      expect(result.current.playingClips).toContain(clip1.id);
      expect(result.current.playingClips).toContain(clip2.id);
    });
  });
});
