/**
 * useImpExpression Hook
 * Manages WISE² IMP expression state and transitions
 *
 * Features:
 * - State machine validation using EXPRESSION_TRANSITIONS rules
 * - Auto-transition after expression duration expires
 * - Event-driven expression updates
 * - Invalid transition prevention with warning logs
 */

import { useState, useCallback, useEffect } from 'react';
import {
  ImpState,
  ImpExpression,
  ImpEvent,
  ImpColorVariant,
  EXPRESSION_TRANSITIONS,
  getExpressionForEvent,
  getExpressionDuration,
} from '../types/imp';

export interface UseImpExpressionReturn {
  state: ImpState;
  setExpression: (expr: ImpExpression) => void;
  handleEvent: (event: ImpEvent) => void;
}

/**
 * Hook for managing IMP expression state and transitions
 *
 * @param initialExpression - Starting expression (default: 'idle')
 * @param initialColorVariant - Starting color variant (default: 'blue')
 * @returns Object containing state, setExpression, and handleEvent
 *
 * @example
 * const { state, setExpression, handleEvent } = useImpExpression('idle');
 *
 * // Programmatic transition
 * setExpression('thinking');
 *
 * // Event-driven transition
 * handleEvent({
 *   type: 'ai_thinking',
 *   timestamp: new Date(),
 * });
 */
export function useImpExpression(
  initialExpression: ImpExpression = 'idle',
  initialColorVariant: ImpColorVariant = 'blue'
): UseImpExpressionReturn {
  const [state, setState] = useState<ImpState>({
    expression: initialExpression,
    colorVariant: initialColorVariant,
    isAnimating: initialExpression !== 'idle',
    lastEventTime: new Date(),
  });

  /**
   * Transition to a new expression with validation
   * Validates against EXPRESSION_TRANSITIONS rules
   * Logs warning if transition is invalid, maintains current state
   */
  const setExpression = useCallback((newExpression: ImpExpression) => {
    setState((prevState) => {
      const validTransitions = EXPRESSION_TRANSITIONS[prevState.expression];

      // Validate transition
      if (!validTransitions.includes(newExpression)) {
        console.warn(
          `[IMP] Invalid transition: ${prevState.expression} -> ${newExpression}. ` +
            `Valid transitions: ${validTransitions.join(', ')}`
        );
        return prevState;
      }

      // Valid transition - update state
      return {
        ...prevState,
        expression: newExpression,
        isAnimating: true,
        lastEventTime: new Date(),
      };
    });
  }, []);

  /**
   * Handle incoming events and transition to appropriate expression
   * Maps event type to expression using getExpressionForEvent
   */
  const handleEvent = useCallback(
    (event: ImpEvent) => {
      const newExpression = getExpressionForEvent(event);
      setExpression(newExpression);
    },
    [setExpression]
  );

  /**
   * Auto-transition effect
   * Transitions to 'idle' after expression duration expires
   * Skips effect if duration is Infinity (indefinite states)
   */
  useEffect(() => {
    const duration = getExpressionDuration(state.expression);

    // Skip timer for indefinite states (listening, thinking, speaking, idle, sleeping, offline)
    if (duration === Infinity) {
      return;
    }

    // Set up auto-transition timer
    const timer = setTimeout(() => {
      setExpression('idle');
    }, duration);

    // Cleanup timer on unmount or expression change
    return () => clearTimeout(timer);
  }, [state.expression, setExpression]);

  return {
    state,
    setExpression,
    handleEvent,
  };
}
