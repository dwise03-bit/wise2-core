/**
 * Unit tests for useImpExpression hook
 * Tests state machine, transitions, events, and auto-transitions
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useImpExpression } from './useImpExpression';
import { ImpEvent } from '../types/imp';

describe('useImpExpression Hook', () => {
  describe('Initial State', () => {
    it('should initialize with default idle state', () => {
      const { result } = renderHook(() => useImpExpression());
      expect(result.current.state.expression).toBe('idle');
      expect(result.current.state.colorVariant).toBe('blue');
      expect(result.current.state.isAnimating).toBe(false);
      expect(result.current.state.lastEventTime).toBeInstanceOf(Date);
    });

    it('should initialize with custom expression', () => {
      const { result } = renderHook(() => useImpExpression('thinking'));
      expect(result.current.state.expression).toBe('thinking');
      expect(result.current.state.isAnimating).toBe(true);
    });

    it('should initialize with custom color variant', () => {
      const { result } = renderHook(() =>
        useImpExpression('idle', 'green')
      );
      expect(result.current.state.colorVariant).toBe('green');
    });

    it('should set isAnimating to false for idle initial state', () => {
      const { result } = renderHook(() => useImpExpression('idle'));
      expect(result.current.state.isAnimating).toBe(false);
    });

    it('should set isAnimating to true for non-idle initial states', () => {
      const { result } = renderHook(() => useImpExpression('thinking'));
      expect(result.current.state.isAnimating).toBe(true);
    });
  });

  describe('setExpression()', () => {
    it('should transition to valid expression', () => {
      const { result } = renderHook(() => useImpExpression('idle'));

      act(() => {
        result.current.setExpression('listening');
      });

      expect(result.current.state.expression).toBe('listening');
    });

    it('should set isAnimating to true on valid transition', () => {
      const { result } = renderHook(() => useImpExpression('idle'));

      act(() => {
        result.current.setExpression('listening');
      });

      expect(result.current.state.isAnimating).toBe(true);
    });

    it('should update lastEventTime on valid transition', () => {
      const { result } = renderHook(() => useImpExpression('idle'));
      const beforeTime = result.current.state.lastEventTime;

      act(() => {
        result.current.setExpression('listening');
      });

      expect(result.current.state.lastEventTime?.getTime()).toBeGreaterThan(
        beforeTime?.getTime() ?? 0
      );
    });

    it('should prevent invalid transitions', () => {
      const { result } = renderHook(() => useImpExpression('sleeping'));

      act(() => {
        // sleeping can only transition to idle
        result.current.setExpression('thinking');
      });

      // Should remain in sleeping state
      expect(result.current.state.expression).toBe('sleeping');
    });

    it('should log warning on invalid transition', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const { result } = renderHook(() => useImpExpression('sleeping'));

      act(() => {
        result.current.setExpression('thinking');
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid transition')
      );
      consoleSpy.mockRestore();
    });

    it('should allow multiple valid transitions in sequence', () => {
      const { result } = renderHook(() => useImpExpression('idle'));

      act(() => {
        result.current.setExpression('listening');
      });
      expect(result.current.state.expression).toBe('listening');

      act(() => {
        result.current.setExpression('thinking');
      });
      expect(result.current.state.expression).toBe('thinking');

      act(() => {
        result.current.setExpression('speaking');
      });
      expect(result.current.state.expression).toBe('speaking');
    });

    it('should handle rapid transitions', () => {
      const { result } = renderHook(() => useImpExpression('idle'));

      act(() => {
        result.current.setExpression('listening');
        result.current.setExpression('thinking');
      });

      // Last valid transition should win
      expect(result.current.state.expression).toBe('thinking');
    });

    it('should allow happy -> idle transition', () => {
      const { result } = renderHook(() => useImpExpression('happy'));

      act(() => {
        result.current.setExpression('idle');
      });

      expect(result.current.state.expression).toBe('idle');
    });

    it('should allow error -> idle transition', () => {
      const { result } = renderHook(() => useImpExpression('error'));

      act(() => {
        result.current.setExpression('idle');
      });

      expect(result.current.state.expression).toBe('idle');
    });
  });

  describe('handleEvent()', () => {
    it('should transition to appropriate expression for voice_start event', () => {
      const { result } = renderHook(() => useImpExpression());
      const event: ImpEvent = {
        type: 'voice_start',
        timestamp: new Date(),
      };

      act(() => {
        result.current.handleEvent(event);
      });

      expect(result.current.state.expression).toBe('listening');
    });

    it('should transition to thinking for ai_thinking event', () => {
      const { result } = renderHook(() => useImpExpression('listening'));
      const event: ImpEvent = {
        type: 'ai_thinking',
        timestamp: new Date(),
      };

      act(() => {
        result.current.handleEvent(event);
      });

      expect(result.current.state.expression).toBe('thinking');
    });

    it('should transition to speaking for ai_stream_start event', () => {
      const { result } = renderHook(() => useImpExpression('thinking'));
      const event: ImpEvent = {
        type: 'ai_stream_start',
        timestamp: new Date(),
      };

      act(() => {
        result.current.handleEvent(event);
      });

      expect(result.current.state.expression).toBe('speaking');
    });

    it('should transition to happy for tool_success event', () => {
      const { result } = renderHook(() => useImpExpression('speaking'));
      const event: ImpEvent = {
        type: 'tool_success',
        timestamp: new Date(),
      };

      act(() => {
        result.current.handleEvent(event);
      });

      expect(result.current.state.expression).toBe('happy');
    });

    it('should transition to error for tool_error event', () => {
      const { result } = renderHook(() => useImpExpression('focused'));
      const event: ImpEvent = {
        type: 'tool_error',
        timestamp: new Date(),
      };

      act(() => {
        result.current.handleEvent(event);
      });

      expect(result.current.state.expression).toBe('error');
    });

    it('should transition to offline for device_offline event', () => {
      const { result } = renderHook(() => useImpExpression());
      const event: ImpEvent = {
        type: 'device_offline',
        timestamp: new Date(),
      };

      act(() => {
        result.current.handleEvent(event);
      });

      expect(result.current.state.expression).toBe('offline');
    });

    it('should handle events with payload', () => {
      const { result } = renderHook(() => useImpExpression());
      const event: ImpEvent = {
        type: 'ai_thinking',
        timestamp: new Date(),
        payload: { stage: 'analyzing', confidence: 0.95 },
      };

      act(() => {
        result.current.handleEvent(event);
      });

      expect(result.current.state.expression).toBe('thinking');
    });

    it('should handle tool_start event', () => {
      const { result } = renderHook(() => useImpExpression('thinking'));
      const event: ImpEvent = {
        type: 'tool_start',
        timestamp: new Date(),
      };

      act(() => {
        result.current.handleEvent(event);
      });

      expect(result.current.state.expression).toBe('focused');
    });
  });

  describe('Auto-transitions', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.runOnlyPendingTimers();
      vi.useRealTimers();
    });

    it('should auto-transition happy to idle after 2000ms', async () => {
      const { result } = renderHook(() => useImpExpression('idle'));

      act(() => {
        result.current.setExpression('happy');
      });

      expect(result.current.state.expression).toBe('happy');

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(result.current.state.expression).toBe('idle');
    });

    it('should auto-transition playful to idle after 2500ms', async () => {
      const { result } = renderHook(() => useImpExpression('idle'));

      act(() => {
        result.current.setExpression('playful');
      });

      act(() => {
        vi.advanceTimersByTime(2500);
      });

      expect(result.current.state.expression).toBe('idle');
    });

    it('should auto-transition error to idle after 4000ms', async () => {
      const { result } = renderHook(() => useImpExpression('idle'));

      act(() => {
        result.current.setExpression('error');
      });

      act(() => {
        vi.advanceTimersByTime(4000);
      });

      expect(result.current.state.expression).toBe('idle');
    });

    it('should not auto-transition idle state', async () => {
      const { result } = renderHook(() => useImpExpression('idle'));

      act(() => {
        vi.advanceTimersByTime(10000);
      });

      expect(result.current.state.expression).toBe('idle');
    });

    it('should not auto-transition listening state', async () => {
      const { result } = renderHook(() => useImpExpression('idle'));

      act(() => {
        result.current.setExpression('listening');
      });

      act(() => {
        vi.advanceTimersByTime(10000);
      });

      expect(result.current.state.expression).toBe('listening');
    });

    it('should not auto-transition thinking state', async () => {
      const { result } = renderHook(() => useImpExpression('idle'));

      act(() => {
        result.current.setExpression('thinking');
      });

      act(() => {
        vi.advanceTimersByTime(10000);
      });

      expect(result.current.state.expression).toBe('thinking');
    });

    it('should clear previous timer on expression change', async () => {
      const { result } = renderHook(() => useImpExpression('idle'));

      act(() => {
        result.current.setExpression('happy');
      });

      // Advance 1000ms (half of 2000ms for happy)
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // Change expression before auto-transition occurs
      act(() => {
        result.current.setExpression('curious');
      });

      // Advance another 1000ms
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // Should still be in curious (not auto-transitioned yet)
      expect(result.current.state.expression).toBe('curious');
    });
  });

  describe('Cleanup', () => {
    it('should cleanup timer on unmount', () => {
      vi.useFakeTimers();
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

      const { unmount, result } = renderHook(() => useImpExpression('idle'));

      act(() => {
        result.current.setExpression('happy');
      });

      unmount();

      expect(clearTimeoutSpy).toHaveBeenCalled();
      clearTimeoutSpy.mockRestore();
      vi.useRealTimers();
    });

    it('should not have memory leaks with multiple state changes', () => {
      const { result } = renderHook(() => useImpExpression('idle'));

      // Rapid state changes should not accumulate timers
      for (let i = 0; i < 10; i++) {
        act(() => {
          result.current.setExpression('happy');
        });
        act(() => {
          result.current.setExpression('idle');
        });
      }

      expect(result.current.state.expression).toBe('idle');
    });
  });

  describe('Edge Cases', () => {
    it('should handle unknown expressions gracefully', () => {
      const { result } = renderHook(() => useImpExpression('idle'));
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      act(() => {
        // Try to set an invalid expression
        result.current.setExpression('invalid_state' as any);
      });

      // Should warn and maintain current state
      expect(consoleSpy).toHaveBeenCalled();
      expect(result.current.state.expression).toBe('idle');
      consoleSpy.mockRestore();
    });

    it('should handle rapid event processing', () => {
      const { result } = renderHook(() => useImpExpression('idle'));

      const events: ImpEvent[] = [
        { type: 'voice_start', timestamp: new Date() },
        { type: 'ai_thinking', timestamp: new Date() },
        { type: 'ai_stream_start', timestamp: new Date() },
        { type: 'ai_stream_end', timestamp: new Date() },
      ];

      act(() => {
        events.forEach(event => {
          result.current.handleEvent(event);
        });
      });

      // Should end up in idle (last event mapping)
      expect(result.current.state.expression).toBe('idle');
    });

    it('should maintain state consistency across multiple calls', () => {
      const { result } = renderHook(() => useImpExpression('idle'));
      const initialTime = result.current.state.lastEventTime;

      act(() => {
        result.current.setExpression('listening');
      });

      const afterListeningTime = result.current.state.lastEventTime;

      act(() => {
        result.current.setExpression('thinking');
      });

      const afterThinkingTime = result.current.state.lastEventTime;

      // Times should be monotonically increasing
      expect(afterListeningTime?.getTime()).toBeGreaterThan(
        initialTime?.getTime() ?? 0
      );
      expect(afterThinkingTime?.getTime()).toBeGreaterThan(
        afterListeningTime?.getTime() ?? 0
      );
    });
  });
});
