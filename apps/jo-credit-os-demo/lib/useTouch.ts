'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Touch event configuration
 */
export interface TouchConfig {
  /** Minimum distance in pixels to register a swipe */
  swipeThreshold?: number;
  /** Duration in ms for long press detection */
  longPressDuration?: number;
  /** Debounce delay for touch events */
  debounceDelay?: number;
}

/**
 * Swipe direction type
 */
export type SwipeDirection = 'left' | 'right' | 'up' | 'down' | 'none';

/**
 * Swipe event data
 */
export interface SwipeEvent {
  direction: SwipeDirection;
  distance: number;
  velocity: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  duration: number;
}

/**
 * Long press event data
 */
export interface LongPressEvent {
  x: number;
  y: number;
  duration: number;
}

/**
 * Detect if device supports touch events
 */
export const useIsTouchDevice = (): boolean => {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const checkTouch = () => {
      const hasTouchPoints =
        typeof window !== 'undefined' &&
        'ontouchstart' in window &&
        navigator.maxTouchPoints > 0;

      const hasCoarsePointer =
        typeof window !== 'undefined' &&
        window.matchMedia('(pointer: coarse)').matches;

      setIsTouch(hasTouchPoints || hasCoarsePointer);
    };

    checkTouch();
    window.addEventListener('resize', checkTouch);
    return () => window.removeEventListener('resize', checkTouch);
  }, []);

  return isTouch;
};

/**
 * Hook for swipe gesture detection
 * Detects swipe direction, distance, and velocity
 *
 * @example
 * const { onTouchStart, onTouchEnd } = useSwipe((event) => {
 *   if (event.direction === 'left') {
 *     // Handle left swipe
 *   }
 * });
 */
export const useSwipe = (
  onSwipe: (event: SwipeEvent) => void,
  config: TouchConfig = {}
) => {
  const {
    swipeThreshold = 50,
    debounceDelay = 0,
  } = config;

  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const startTimeRef = useRef(0);
  const debounceRef = useRef<NodeJS.Timeout>();

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    startXRef.current = touch.clientX;
    startYRef.current = touch.clientY;
    startTimeRef.current = Date.now();
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!e.changedTouches.length) return;

      const touch = e.changedTouches[0];
      const endX = touch.clientX;
      const endY = touch.clientY;
      const duration = Date.now() - startTimeRef.current;

      const deltaX = endX - startXRef.current;
      const deltaY = endY - startYRef.current;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const velocity = distance / duration;

      if (distance < swipeThreshold) {
        onSwipe({
          direction: 'none',
          distance,
          velocity,
          startX: startXRef.current,
          startY: startYRef.current,
          endX,
          endY,
          duration,
        });
        return;
      }

      let direction: SwipeDirection = 'none';
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      if (absDeltaX > absDeltaY) {
        direction = deltaX > 0 ? 'right' : 'left';
      } else {
        direction = deltaY > 0 ? 'down' : 'up';
      }

      const dispatchSwipe = () => {
        onSwipe({
          direction,
          distance,
          velocity,
          startX: startXRef.current,
          startY: startYRef.current,
          endX,
          endY,
          duration,
        });
      };

      if (debounceDelay > 0) {
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(dispatchSwipe, debounceDelay);
      } else {
        dispatchSwipe();
      }
    },
    [onSwipe, swipeThreshold, debounceDelay]
  );

  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
  };
};

/**
 * Hook for long press detection
 * Useful for context menus or alternative actions
 *
 * @example
 * const { onTouchStart, onTouchEnd } = useLongPress((event) => {
 *   console.log('Long press detected at', event.x, event.y);
 * });
 */
export const useLongPress = (
  onLongPress: (event: LongPressEvent) => void,
  config: TouchConfig = {}
) => {
  const { longPressDuration = 500 } = config;

  const timeoutRef = useRef<NodeJS.Timeout>();
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const startTimeRef = useRef(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    startXRef.current = touch.clientX;
    startYRef.current = touch.clientY;
    startTimeRef.current = Date.now();

    timeoutRef.current = setTimeout(() => {
      onLongPress({
        x: touch.clientX,
        y: touch.clientY,
        duration: Date.now() - startTimeRef.current,
      });
    }, longPressDuration);
  }, [onLongPress, longPressDuration]);

  const handleTouchEnd = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!e.touches.length) return;

    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - startXRef.current);
    const deltaY = Math.abs(touch.clientY - startYRef.current);

    // Cancel long press if finger moved too much (10px threshold)
    if (deltaX > 10 || deltaY > 10) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }
  }, []);

  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
    onTouchMove: handleTouchMove,
  };
};

/**
 * Hook for pinch zoom detection (multi-touch)
 * Useful for image galleries or maps
 *
 * @example
 * const { onTouchStart, onTouchMove } = usePinch((scale) => {
 *   setZoomLevel(scale);
 * });
 */
export const usePinch = (
  onPinch: (scale: number) => void,
  config: TouchConfig = {}
) => {
  const { debounceDelay = 0 } = config;

  const startDistanceRef = useRef(0);
  const debounceRef = useRef<NodeJS.Timeout>();

  const getDistance = (
    touch1: { clientX: number; clientY: number },
    touch2: { clientX: number; clientY: number }
  ): number => {
    const deltaX = touch2.clientX - touch1.clientX;
    const deltaY = touch2.clientY - touch1.clientY;
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  };

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      startDistanceRef.current = getDistance(e.touches[0], e.touches[1]);
    }
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length !== 2) return;

      const currentDistance = getDistance(e.touches[0], e.touches[1]);
      const scale = currentDistance / startDistanceRef.current;

      const dispatchPinch = () => {
        onPinch(scale);
      };

      if (debounceDelay > 0) {
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(dispatchPinch, debounceDelay);
      } else {
        dispatchPinch();
      }
    },
    [onPinch, debounceDelay]
  );

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
  };
};

/**
 * Hook to detect double tap
 * Useful for zoom or quick actions
 *
 * @example
 * const { onTouchEnd } = useDoubleTap(() => {
 *   console.log('Double tap detected');
 * });
 */
export const useDoubleTap = (
  onDoubleTap: () => void,
  config: TouchConfig = {}
) => {
  const { debounceDelay = 300 } = config;

  const lastTapRef = useRef(0);
  const debounceRef = useRef<NodeJS.Timeout>();

  const handleTouchEnd = useCallback(() => {
    const now = Date.now();
    const tapLength = now - lastTapRef.current;

    if (tapLength < debounceDelay && tapLength > 0) {
      // Double tap detected
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      onDoubleTap();
      lastTapRef.current = 0;
    } else {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      lastTapRef.current = now;
    }
  }, [onDoubleTap, debounceDelay]);

  return {
    onTouchEnd: handleTouchEnd,
  };
};

/**
 * Hook for managing touch states
 * Returns current touch state (touching, number of fingers)
 */
export const useTouchState = () => {
  const [isTouching, setIsTouching] = useState(false);
  const [touchPoints, setTouchPoints] = useState(0);
  const [touchPosition, setTouchPosition] = useState({ x: 0, y: 0 });

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsTouching(true);
    setTouchPoints(e.touches.length);
    if (e.touches.length > 0) {
      setTouchPosition({
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      });
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    setTouchPoints(e.touches.length);
    if (e.touches.length > 0) {
      setTouchPosition({
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      });
    }
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 0) {
      setIsTouching(false);
    } else {
      setTouchPoints(e.touches.length);
    }
  }, []);

  return {
    isTouching,
    touchPoints,
    touchPosition,
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };
};

/**
 * Ref-based touch gesture detector for DOM elements
 * More flexible than component-based hooks
 *
 * @example
 * const ref = useTouchGestures({
 *   onSwipe: (e) => console.log(e.direction),
 *   onLongPress: (e) => console.log(e),
 * });
 */
export const useTouchGestures = (handlers: {
  onSwipe?: (event: SwipeEvent) => void;
  onLongPress?: (event: LongPressEvent) => void;
  onDoubleTap?: () => void;
  onPinch?: (scale: number) => void;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const element = ref.current;
    let startX = 0;
    let startY = 0;
    let startTime = 0;
    let lastTapTime = 0;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      startTime = Date.now();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!e.changedTouches.length) return;

      const touch = e.changedTouches[0];
      const endX = touch.clientX;
      const endY = touch.clientY;
      const duration = Date.now() - startTime;
      const now = Date.now();

      // Detect double tap
      const tapLength = now - lastTapTime;
      if (tapLength < 300 && tapLength > 0 && handlers.onDoubleTap) {
        handlers.onDoubleTap();
        lastTapTime = 0;
        return;
      }
      lastTapTime = now;

      // Detect swipe
      if (handlers.onSwipe) {
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        if (distance >= 50) {
          let direction: SwipeDirection = 'none';
          const absDeltaX = Math.abs(deltaX);
          const absDeltaY = Math.abs(deltaY);

          if (absDeltaX > absDeltaY) {
            direction = deltaX > 0 ? 'right' : 'left';
          } else {
            direction = deltaY > 0 ? 'down' : 'up';
          }

          handlers.onSwipe({
            direction,
            distance,
            velocity: distance / duration,
            startX,
            startY,
            endX,
            endY,
            duration,
          });
        }
      }
    };

    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchend', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handlers]);

  return ref;
};

/**
 * Hook to disable scroll while touch interaction is active
 * Useful for modals or fullscreen interactions
 */
export const useDisableTouchScroll = (shouldDisable: boolean = false) => {
  useEffect(() => {
    if (!shouldDisable) return;

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
    };

    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, [shouldDisable]);
};

/**
 * Hook for haptic feedback on touch devices
 * Requires user interaction to work
 */
export const useHapticFeedback = () => {
  const trigger = useCallback((type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'light') => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      const patterns: Record<string, number | number[]> = {
        light: 10,
        medium: 20,
        heavy: 30,
        success: [10, 20, 10],
        warning: [30, 30, 30],
        error: [50, 10, 50],
      };

      navigator.vibrate(patterns[type]);
    }
  }, []);

  return { triggerHaptic: trigger };
};
