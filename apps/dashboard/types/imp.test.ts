/**
 * Unit tests for WISE² IMP type system
 * Tests expression state machine, event mapping, and path resolution
 */

import {
  EXPRESSION_TRANSITIONS,
  getExpressionForEvent,
  getExpressionDuration,
  getImpImagePath,
  ImpEvent,
  ImpExpression,
} from './imp';

describe('IMP Type System', () => {
  describe('EXPRESSION_TRANSITIONS', () => {
    it('should define all valid transitions', () => {
      const allExpressions: ImpExpression[] = [
        'idle',
        'listening',
        'thinking',
        'speaking',
        'happy',
        'curious',
        'focused',
        'playful',
        'warning',
        'error',
        'sleeping',
        'offline',
      ];

      // All expressions should have transition rules
      allExpressions.forEach(expr => {
        expect(EXPRESSION_TRANSITIONS[expr]).toBeDefined();
        expect(Array.isArray(EXPRESSION_TRANSITIONS[expr])).toBe(true);
      });
    });

    it('should allow idle to transition to listening, thinking, sleeping, offline', () => {
      expect(EXPRESSION_TRANSITIONS.idle).toEqual(
        expect.arrayContaining(['listening', 'thinking', 'sleeping', 'offline'])
      );
    });

    it('should not allow invalid transitions from idle', () => {
      expect(EXPRESSION_TRANSITIONS.idle).not.toContain('error');
      expect(EXPRESSION_TRANSITIONS.idle).not.toContain('playful');
    });

    it('should allow listening to transition to thinking or idle', () => {
      expect(EXPRESSION_TRANSITIONS.listening).toEqual(
        expect.arrayContaining(['thinking', 'idle'])
      );
    });

    it('should allow thinking to transition to multiple states', () => {
      const validTransitions = [
        'speaking',
        'happy',
        'curious',
        'warning',
        'error',
        'idle',
      ];
      validTransitions.forEach(expr => {
        expect(EXPRESSION_TRANSITIONS.thinking).toContain(expr);
      });
    });

    it('should allow speaking to transition to happy, idle, or playful', () => {
      expect(EXPRESSION_TRANSITIONS.speaking).toEqual(
        expect.arrayContaining(['happy', 'idle', 'playful'])
      );
    });

    it('should allow error to transition to warning, thinking, or idle', () => {
      expect(EXPRESSION_TRANSITIONS.error).toEqual(
        expect.arrayContaining(['warning', 'thinking', 'idle'])
      );
    });

    it('should allow sleeping to only transition to idle', () => {
      expect(EXPRESSION_TRANSITIONS.sleeping).toEqual(['idle']);
    });

    it('should allow offline to only transition to idle', () => {
      expect(EXPRESSION_TRANSITIONS.offline).toEqual(['idle']);
    });
  });

  describe('getExpressionForEvent', () => {
    it('should map voice_start to listening', () => {
      const event: ImpEvent = {
        type: 'voice_start',
        timestamp: new Date(),
      };
      expect(getExpressionForEvent(event)).toBe('listening');
    });

    it('should map ai_thinking to thinking', () => {
      const event: ImpEvent = {
        type: 'ai_thinking',
        timestamp: new Date(),
      };
      expect(getExpressionForEvent(event)).toBe('thinking');
    });

    it('should map ai_stream_start to speaking', () => {
      const event: ImpEvent = {
        type: 'ai_stream_start',
        timestamp: new Date(),
      };
      expect(getExpressionForEvent(event)).toBe('speaking');
    });

    it('should map tool_start to focused', () => {
      const event: ImpEvent = {
        type: 'tool_start',
        timestamp: new Date(),
      };
      expect(getExpressionForEvent(event)).toBe('focused');
    });

    it('should map tool_success to happy', () => {
      const event: ImpEvent = {
        type: 'tool_success',
        timestamp: new Date(),
      };
      expect(getExpressionForEvent(event)).toBe('happy');
    });

    it('should map tool_error to error', () => {
      const event: ImpEvent = {
        type: 'tool_error',
        timestamp: new Date(),
      };
      expect(getExpressionForEvent(event)).toBe('error');
    });

    it('should map device_offline to offline', () => {
      const event: ImpEvent = {
        type: 'device_offline',
        timestamp: new Date(),
      };
      expect(getExpressionForEvent(event)).toBe('offline');
    });

    it('should map ai_stream_end to idle', () => {
      const event: ImpEvent = {
        type: 'ai_stream_end',
        timestamp: new Date(),
      };
      expect(getExpressionForEvent(event)).toBe('idle');
    });

    it('should default unknown events to idle', () => {
      const event: ImpEvent = {
        type: 'user_message',
        timestamp: new Date(),
      };
      expect(getExpressionForEvent(event)).toBe('idle');
    });

    it('should handle events with payload', () => {
      const event: ImpEvent = {
        type: 'ai_thinking',
        timestamp: new Date(),
        payload: { stage: 'planning' },
      };
      expect(getExpressionForEvent(event)).toBe('thinking');
    });

    it('should handle battery_status events', () => {
      const event: ImpEvent = {
        type: 'battery_status',
        timestamp: new Date(),
        payload: { level: 0.5 },
      };
      expect(getExpressionForEvent(event)).toBe('idle');
    });
  });

  describe('getExpressionDuration', () => {
    it('should return Infinity for listening', () => {
      expect(getExpressionDuration('listening')).toBe(Infinity);
    });

    it('should return Infinity for thinking', () => {
      expect(getExpressionDuration('thinking')).toBe(Infinity);
    });

    it('should return Infinity for speaking', () => {
      expect(getExpressionDuration('speaking')).toBe(Infinity);
    });

    it('should return 2000ms for happy', () => {
      expect(getExpressionDuration('happy')).toBe(2000);
    });

    it('should return 2500ms for playful', () => {
      expect(getExpressionDuration('playful')).toBe(2500);
    });

    it('should return 2000ms for curious', () => {
      expect(getExpressionDuration('curious')).toBe(2000);
    });

    it('should return 1500ms for focused', () => {
      expect(getExpressionDuration('focused')).toBe(1500);
    });

    it('should return 3000ms for warning', () => {
      expect(getExpressionDuration('warning')).toBe(3000);
    });

    it('should return 4000ms for error', () => {
      expect(getExpressionDuration('error')).toBe(4000);
    });

    it('should return Infinity for idle', () => {
      expect(getExpressionDuration('idle')).toBe(Infinity);
    });

    it('should return Infinity for sleeping', () => {
      expect(getExpressionDuration('sleeping')).toBe(Infinity);
    });

    it('should return Infinity for offline', () => {
      expect(getExpressionDuration('offline')).toBe(Infinity);
    });

    it('should have reasonable durations (between 1-5 seconds for transient states)', () => {
      const transientExpressions: ImpExpression[] = [
        'happy',
        'playful',
        'curious',
        'focused',
        'warning',
        'error',
      ];

      transientExpressions.forEach(expr => {
        const duration = getExpressionDuration(expr);
        expect(duration).toBeGreaterThanOrEqual(1000);
        expect(duration).toBeLessThanOrEqual(5000);
      });
    });
  });

  describe('getImpImagePath', () => {
    it('should generate correct path for idle blue expression', () => {
      const path = getImpImagePath('idle', 'blue', 'webp');
      expect(path).toBe('/wise-imp/idle-blue.webp');
    });

    it('should generate correct path for thinking green expression', () => {
      const path = getImpImagePath('thinking', 'green', 'png');
      expect(path).toBe('/wise-imp/thinking-green.png');
    });

    it('should default to webp format', () => {
      const path = getImpImagePath('idle', 'blue');
      expect(path).toEndWith('.webp');
    });

    it('should default to blue variant', () => {
      const path = getImpImagePath('idle');
      expect(path).toContain('-blue.');
    });

    it('should map happy to celebrate', () => {
      const path = getImpImagePath('happy', 'blue', 'webp');
      expect(path).toBe('/wise-imp/celebrate-blue.webp');
    });

    it('should map playful to celebrate', () => {
      const path = getImpImagePath('playful', 'gold', 'webp');
      expect(path).toBe('/wise-imp/celebrate-gold.webp');
    });

    it('should map curious to celebrate', () => {
      const path = getImpImagePath('curious', 'magenta', 'webp');
      expect(path).toBe('/wise-imp/celebrate-magenta.webp');
    });

    it('should map focused to thinking', () => {
      const path = getImpImagePath('focused', 'blue', 'webp');
      expect(path).toBe('/wise-imp/thinking-blue.webp');
    });

    it('should map warning to thinking', () => {
      const path = getImpImagePath('warning', 'blue', 'webp');
      expect(path).toBe('/wise-imp/thinking-blue.webp');
    });

    it('should map listening to wave', () => {
      const path = getImpImagePath('listening', 'blue', 'webp');
      expect(path).toBe('/wise-imp/wave-blue.webp');
    });

    it('should map error to idle', () => {
      const path = getImpImagePath('error', 'blue', 'webp');
      expect(path).toBe('/wise-imp/idle-blue.webp');
    });

    it('should handle all color variants', () => {
      const variants = ['blue', 'gold', 'green', 'magenta'] as const;
      variants.forEach(variant => {
        const path = getImpImagePath('idle', variant, 'webp');
        expect(path).toContain(`-${variant}.`);
      });
    });

    it('should handle all format types', () => {
      const formats = ['webp', 'png', 'svg'] as const;
      formats.forEach(format => {
        const path = getImpImagePath('idle', 'blue', format);
        expect(path).toEndWith(`.${format}`);
      });
    });

    it('should start with /wise-imp/', () => {
      const path = getImpImagePath('thinking', 'gold', 'webp');
      expect(path).toMatch(/^\/wise-imp\//);
    });
  });
});
