'use client';

import { useState, useEffect } from 'react';

type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const BREAKPOINTS = {
  xs: 375,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
};

export function useResponsive() {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('lg');
  const [width, setWidth] = useState<number>(0);

  useEffect(() => {
    const handleResize = () => {
      const w = typeof window !== 'undefined' ? window.innerWidth : 0;
      setWidth(w);

      if (w < BREAKPOINTS.sm) {
        setBreakpoint('xs');
      } else if (w < BREAKPOINTS.md) {
        setBreakpoint('sm');
      } else if (w < BREAKPOINTS.lg) {
        setBreakpoint('md');
      } else if (w < BREAKPOINTS.xl) {
        setBreakpoint('lg');
      } else {
        setBreakpoint('xl');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    breakpoint,
    width,
    isMobile: breakpoint === 'xs' || breakpoint === 'sm',
    isTablet: breakpoint === 'md' || breakpoint === 'lg',
    isDesktop: breakpoint === 'xl',
    is: {
      xs: breakpoint === 'xs',
      sm: breakpoint === 'sm',
      md: breakpoint === 'md',
      lg: breakpoint === 'lg',
      xl: breakpoint === 'xl',
    },
  };
}
