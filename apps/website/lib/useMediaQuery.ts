'use client';

import { useState, useEffect, useCallback } from 'react';
import { BREAKPOINTS, Breakpoint, breakpointQuery } from './responsive';

/**
 * Custom hook for monitoring media queries and responsive breakpoints
 * Provides real-time viewport state for conditional rendering
 */
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);

    // Avoid SSR mismatch by only setting up listener after mount
    const mediaQueryList = window.matchMedia(query);

    // Set initial value
    setMatches(mediaQueryList.matches);

    // Create listener
    const handleChange = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };

    // Add listener with proper cleanup
    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener('change', handleChange);
      return () => mediaQueryList.removeEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQueryList.addListener(handleChange);
      return () => mediaQueryList.removeListener(handleChange);
    }
  }, [query]);

  // Return false during SSR to avoid hydration mismatch
  if (!hasMounted) {
    return false;
  }

  return matches;
};

/**
 * Viewport size detection hook
 * Returns boolean flags for common breakpoints
 *
 * @example
 * const { isMobile, isTablet, isDesktop } = useViewport();
 * return isMobile ? <MobileNav /> : <DesktopNav />;
 */
export const useViewport = () => {
  const isExtraSmall = useMediaQuery(`(max-width: ${BREAKPOINTS.xs - 1}px)`);
  const isSmall = useMediaQuery(`(min-width: ${BREAKPOINTS.xs}px) and (max-width: ${BREAKPOINTS.sm - 1}px)`);
  const isMobile = useMediaQuery(`(max-width: ${BREAKPOINTS.md - 1}px)`);
  const isTablet = useMediaQuery(
    `(min-width: ${BREAKPOINTS.md}px) and (max-width: ${BREAKPOINTS.lg - 1}px)`
  );
  const isDesktop = useMediaQuery(`(min-width: ${BREAKPOINTS.lg}px)`);
  const isLaptop = useMediaQuery(
    `(min-width: ${BREAKPOINTS.lg}px) and (max-width: ${BREAKPOINTS.xl - 1}px)`
  );
  const isUltraWide = useMediaQuery(`(min-width: ${BREAKPOINTS['2xl']}px)`);

  return {
    isExtraSmall,
    isSmall,
    isMobile,
    isTablet,
    isDesktop,
    isLaptop,
    isUltraWide,
    // Convenience combinations
    isMobileOrTablet: isMobile,
    isTabletOrUp: !isMobile,
    isDesktopOrUp: isDesktop,
  };
};

/**
 * Detect if device is in landscape orientation
 */
export const useIsLandscape = (): boolean => {
  return useMediaQuery('(orientation: landscape)');
};

/**
 * Detect if device is in portrait orientation
 */
export const useIsPortrait = (): boolean => {
  return useMediaQuery('(orientation: portrait)');
};

/**
 * Detect if device prefers reduced motion
 * For accessibility - respects user's motion preferences
 */
export const useReducedMotion = (): boolean => {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
};

/**
 * Detect if device is in dark mode
 */
export const useIsDarkMode = (): boolean => {
  return useMediaQuery('(prefers-color-scheme: dark)');
};

/**
 * Detect if device is in light mode
 */
export const useIsLightMode = (): boolean => {
  return useMediaQuery('(prefers-color-scheme: light)');
};

/**
 * Detect if device has high refresh rate (90Hz+)
 */
export const useHighRefreshRate = (): boolean => {
  return useMediaQuery('(update-frequency: fast)');
};

/**
 * Detect if user prefers high contrast
 */
export const useHighContrast = (): boolean => {
  return useMediaQuery('(prefers-contrast: more)');
};

/**
 * Detect if user prefers reduced contrast
 */
export const useReducedContrast = (): boolean => {
  return useMediaQuery('(prefers-contrast: less)');
};

/**
 * Check if pointer is coarse (touch/stylus - not mouse)
 * Useful for adjusting UI for touch devices
 */
export const useCoarsePointer = (): boolean => {
  return useMediaQuery('(pointer: coarse)');
};

/**
 * Check if pointer is fine (mouse)
 */
export const useFinePointer = (): boolean => {
  return useMediaQuery('(pointer: fine)');
};

/**
 * Detect if device is a touch device (has hover capability)
 */
export const useHasHover = (): boolean => {
  return useMediaQuery('(hover: hover)');
};

/**
 * Detect if device can't hover (important for mobile)
 */
export const useNoHover = (): boolean => {
  return useMediaQuery('(hover: none)');
};

/**
 * Detect foldable device support
 * Returns true if device has viewport-segment features
 */
export const useFoldableDevice = (): boolean => {
  if (typeof window === 'undefined') return false;

  const [isFoldable, setIsFoldable] = useState(false);

  useEffect(() => {
    // Check if browser supports viewport segments (foldable devices)
    const checkFoldable = () => {
      const root = document.documentElement;
      const style = getComputedStyle(root);
      const foldLeft = style.getPropertyValue('--viewport-segment-left');
      const foldRight = style.getPropertyValue('--viewport-segment-right');

      setIsFoldable(!!foldLeft && foldLeft !== '0px' && !!foldRight && foldRight !== '0px');
    };

    checkFoldable();
    window.addEventListener('resize', checkFoldable);
    return () => window.removeEventListener('resize', checkFoldable);
  }, []);

  return isFoldable;
};

/**
 * Get current viewport width
 * Updates on window resize
 *
 * @example
 * const width = useViewportWidth();
 * return width < 768 ? <MobileLayout /> : <DesktopLayout />;
 */
export const useViewportWidth = (): number | null => {
  const [width, setWidth] = useState<number | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    // Set initial width after mount
    setWidth(window.innerWidth);

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return width;
};

/**
 * Get current viewport height
 * Updates on window resize
 */
export const useViewportHeight = (): number | null => {
  const [height, setHeight] = useState<number | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setHeight(window.innerHeight);
    };

    // Set initial height after mount
    setHeight(window.innerHeight);

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return height;
};

/**
 * Get current viewport dimensions
 */
export const useViewportDimensions = () => {
  const [dimensions, setDimensions] = useState<{ width: number | null; height: number | null }>({
    width: null,
    height: null,
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Set initial dimensions after mount
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return dimensions;
};

/**
 * Get current breakpoint name based on viewport width
 * Useful for analytics or conditional logic
 *
 * @returns 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | null (null during SSR)
 */
export const useCurrentBreakpoint = (): Breakpoint | null => {
  const width = useViewportWidth();

  if (!width) return null;

  // Check from largest to smallest
  if (width >= BREAKPOINTS['2xl']) return '2xl';
  if (width >= BREAKPOINTS.xl) return 'xl';
  if (width >= BREAKPOINTS.lg) return 'lg';
  if (width >= BREAKPOINTS.md) return 'md';
  if (width >= BREAKPOINTS.sm) return 'sm';
  if (width >= BREAKPOINTS.xs) return 'xs';

  return 'xs';
};

/**
 * Hook to conditionally render based on breakpoint
 * Avoids hydration mismatch by returning null during SSR
 *
 * @example
 * <>{renderOnBreakpoint('md', <DesktopComponent />)}</>;
 */
export const useRenderOnBreakpoint = (
  breakpoint: Breakpoint,
  component: React.ReactNode,
  renderAbove: boolean = true
): React.ReactNode => {
  const currentBreakpoint = useCurrentBreakpoint();

  if (!currentBreakpoint) return null;

  const breakpoints: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
  const currentIndex = breakpoints.indexOf(currentBreakpoint);
  const targetIndex = breakpoints.indexOf(breakpoint);

  const shouldRender = renderAbove
    ? currentIndex >= targetIndex
    : currentIndex < targetIndex;

  return shouldRender ? component : null;
};

/**
 * Hook to get all viewport state at once
 * Useful for complex responsive logic
 */
export const useResponsiveState = () => {
  const viewport = useViewport();
  const dimensions = useViewportDimensions();
  const currentBreakpoint = useCurrentBreakpoint();
  const isLandscape = useIsLandscape();
  const isDarkMode = useIsDarkMode();
  const reducedMotion = useReducedMotion();
  const hasHover = useHasHover();
  const foldable = useFoldableDevice();

  return {
    ...viewport,
    dimensions,
    currentBreakpoint,
    isLandscape,
    isPortrait: !isLandscape,
    isDarkMode,
    reducedMotion,
    hasHover,
    noHover: !hasHover,
    isFoldable: foldable,
  };
};
