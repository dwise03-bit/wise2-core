/**
 * WISE² Responsive Utilities
 *
 * Provides responsive design helpers for mobile-first development
 * Breakpoints: Mobile (< 768px), Tablet (768px-1023px), Desktop (1024px+)
 */

import React from 'react';

/**
 * Hook to detect current viewport size
 * Returns device type and viewport dimensions
 */
export const useResponsive = () => {
  const [viewport, setViewport] = React.useState({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    width: 1024,
    height: 768,
    orientation: 'landscape' as const,
  });

  React.useEffect(() => {
    const checkViewport = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const orientation = width > height ? 'landscape' : 'portrait';

      setViewport({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        width,
        height,
        orientation,
      });
    };

    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  return viewport;
};

/**
 * Hook to get device-specific spacing
 * Automatically scales spacing based on viewport size
 */
export const useResponsiveSpacing = () => {
  const { isMobile, isTablet } = useResponsive();

  return {
    p: isMobile ? 12 : isTablet ? 16 : 24, // Padding
    gap: isMobile ? 8 : isTablet ? 12 : 16, // Gap between items
    gapLg: isMobile ? 12 : isTablet ? 16 : 24, // Large gap
    rounded: isMobile ? 4 : 6, // Border radius
  };
};

/**
 * Hook for device-specific column counts
 * Used with grid layouts
 */
export const useResponsiveColumns = () => {
  const { isMobile, isTablet } = useResponsive();

  return isMobile ? 1 : isTablet ? 2 : 4;
};

/**
 * Hook to handle mobile menu state
 */
export const useMobileMenu = (initialOpen = false) => {
  const [isOpen, setIsOpen] = React.useState(initialOpen);
  const { isMobile } = useResponsive();

  // Close menu when transitioning to desktop
  React.useEffect(() => {
    if (!isMobile) {
      setIsOpen(false);
    }
  }, [isMobile]);

  return {
    isOpen,
    toggle: () => setIsOpen(!isOpen),
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  };
};

/**
 * Responsive breakpoint values
 */
export const Breakpoints = {
  mobile: 375,
  mobileLg: 425,
  tablet: 768,
  tabletLg: 1024,
  desktop: 1280,
  desktopLg: 1440,
  desktopXl: 1920,
} as const;

/**
 * Media query helpers
 */
export const MediaQueries = {
  mobile: '@media (max-width: 767px)',
  tablet: '@media (min-width: 768px) and (max-width: 1023px)',
  desktop: '@media (min-width: 1024px)',
  tabletUp: '@media (min-width: 768px)',
  desktopUp: '@media (min-width: 1024px)',
  smallMobile: '@media (max-width: 480px)',
  largeMobile: '@media (min-width: 481px) and (max-width: 767px)',
  wideDesktop: '@media (min-width: 1920px)',
} as const;

/**
 * Responsive container queries
 */
export const ContainerQueries = {
  /* Container queries for size-based responsive design */
  small: '@container (max-width: 400px)',
  medium: '@container (min-width: 401px) and (max-width: 700px)',
  large: '@container (min-width: 701px)',
} as const;

/**
 * Spacing scale responsive utilities
 * Returns appropriate value based on viewport
 */
export const getResponsiveValue = (
  mobile: number | string,
  tablet: number | string,
  desktop: number | string
) => {
  const viewport = typeof window !== 'undefined' ? window.innerWidth : 1024;

  if (viewport < 768) return mobile;
  if (viewport < 1024) return tablet;
  return desktop;
};

/**
 * Component rendering helpers for responsive design
 */
export const ResponsiveHelper = {
  /**
   * Show/hide elements based on viewport
   */
  show: (type: 'mobile' | 'tablet' | 'desktop') => {
    const classMap = {
      mobile: 'block md:hidden',
      tablet: 'hidden md:block lg:hidden',
      desktop: 'hidden lg:block',
    };
    return classMap[type];
  },

  /**
   * Get grid column class based on item count
   */
  gridCols: (itemCount: number, maxCols: number = 4) => {
    const classes = {
      1: 'grid-cols-1',
      2: 'md:grid-cols-2',
      3: 'md:grid-cols-2 lg:grid-cols-3',
      4: 'md:grid-cols-2 lg:grid-cols-4',
    };
    return `grid ${classes[Math.min(itemCount, maxCols) as keyof typeof classes]}`;
  },

  /**
   * Get font size class based on viewport
   */
  fontSize: (mobile: string, tablet: string = mobile, desktop: string = tablet) => {
    return `${mobile} md:${tablet} lg:${desktop}`;
  },

  /**
   * Get padding class based on viewport
   */
  padding: (mobile: string, tablet: string = mobile, desktop: string = tablet) => {
    return `p-${mobile} md:p-${tablet} lg:p-${desktop}`;
  },

  /**
   * Get gap class based on viewport
   */
  gap: (mobile: string, tablet: string = mobile, desktop: string = tablet) => {
    return `gap-${mobile} md:gap-${tablet} lg:gap-${desktop}`;
  },
};

/**
 * Touch-friendly sizing for mobile
 * Ensures buttons/inputs are at least 44x44px on mobile
 */
export const useTouchFriendly = () => {
  const { isMobile } = useResponsive();

  return {
    buttonHeight: isMobile ? 48 : 40,
    inputHeight: isMobile ? 48 : 40,
    touchTarget: isMobile ? 44 : 32,
  };
};

/**
 * Safe area insets for notched devices
 * Returns padding values for iPhone notch/Dynamic Island
 */
export const useSafeAreaInsets = () => {
  const [insets, setInsets] = React.useState({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  });

  React.useEffect(() => {
    const style = getComputedStyle(document.documentElement);
    setInsets({
      top: parseInt(style.getPropertyValue('--safe-area-inset-top') || '0'),
      bottom: parseInt(style.getPropertyValue('--safe-area-inset-bottom') || '0'),
      left: parseInt(style.getPropertyValue('--safe-area-inset-left') || '0'),
      right: parseInt(style.getPropertyValue('--safe-area-inset-right') || '0'),
    });
  }, []);

  return insets;
};

/**
 * Hook to detect if device supports hover
 * Returns true for desktop, false for touch devices
 */
export const useHoverSupport = () => {
  const [supportsHover, setSupportsHover] = React.useState(false);

  React.useEffect(() => {
    // Check if device supports hover media query
    if (window.matchMedia('(hover: hover)').matches) {
      setSupportsHover(true);
    }
  }, []);

  return supportsHover;
};

/**
 * Hook for orientation detection
 */
export const useOrientation = () => {
  const [orientation, setOrientation] = React.useState<'portrait' | 'landscape'>('portrait');

  React.useEffect(() => {
    const checkOrientation = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };

    checkOrientation();
    window.addEventListener('orientationchange', checkOrientation);
    window.addEventListener('resize', checkOrientation);

    return () => {
      window.removeEventListener('orientationchange', checkOrientation);
      window.removeEventListener('resize', checkOrientation);
    };
  }, []);

  return orientation;
};

export default {
  useResponsive,
  useResponsiveSpacing,
  useResponsiveColumns,
  useMobileMenu,
  useTouchFriendly,
  useSafeAreaInsets,
  useHoverSupport,
  useOrientation,
  Breakpoints,
  MediaQueries,
  ResponsiveHelper,
};
