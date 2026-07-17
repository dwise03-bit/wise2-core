/**
 * Responsive breakpoint utilities for WISE² Studio
 * Tailwind-aligned breakpoints with responsive design patterns
 */

export const BREAKPOINTS = {
  xs: 375,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export const BREAKPOINT_NAMES = {
  mobile: 'sm',
  tablet: 'md',
  laptop: 'lg',
  desktop: 'xl',
  ultraWide: '2xl',
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;
export type ResponsiveValue<T> = {
  xs?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  '2xl'?: T;
};

/**
 * Utility to generate Tailwind responsive classes
 * @example
 * responsive({ base: 'p-4', md: 'p-6', lg: 'p-8' })
 * // => 'p-4 md:p-6 lg:p-8'
 */
export const responsive = (
  values: {
    base?: string;
    xs?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
    '2xl'?: string;
  }
): string => {
  const classes: string[] = [];

  if (values.base) classes.push(values.base);
  if (values.xs) classes.push(`xs:${values.xs}`);
  if (values.sm) classes.push(`sm:${values.sm}`);
  if (values.md) classes.push(`md:${values.md}`);
  if (values.lg) classes.push(`lg:${values.lg}`);
  if (values.xl) classes.push(`xl:${values.xl}`);
  if (values['2xl']) classes.push(`2xl:${values['2xl']}`);

  return classes.join(' ');
};

/**
 * Container queries for mobile-first responsive design
 * Use when breakpoints alone aren't sufficient
 */
export const containerClasses = {
  full: 'w-full',
  mobile: 'max-w-sm', // 24rem / 384px
  tablet: 'max-w-2xl', // 42rem / 672px
  desktop: 'max-w-4xl', // 56rem / 896px
  ultraWide: 'max-w-6xl', // 72rem / 1152px
  prose: 'max-w-3xl', // 48rem / 768px
} as const;

/**
 * Common responsive padding utilities
 */
export const paddingClasses = {
  mobile: responsive({
    base: 'px-4 py-6',
    sm: 'px-4 py-6',
  }),
  tablet: responsive({
    sm: 'px-4 py-6',
    md: 'px-6 py-8',
    lg: 'px-8 py-10',
  }),
  desktop: responsive({
    lg: 'px-8 py-10',
    xl: 'px-10 py-12',
  }),
} as const;

/**
 * Responsive grid columns
 */
export const gridClasses = {
  single: 'grid-cols-1',
  twoColumn: responsive({
    base: 'grid-cols-1',
    md: 'grid-cols-2',
  }),
  threeColumn: responsive({
    base: 'grid-cols-1',
    md: 'grid-cols-2',
    lg: 'grid-cols-3',
  }),
  fourColumn: responsive({
    base: 'grid-cols-1',
    md: 'grid-cols-2',
    lg: 'grid-cols-4',
  }),
} as const;

/**
 * Responsive typography utilities
 */
export const typographyClasses = {
  h1: responsive({
    base: 'text-3xl md:text-4xl lg:text-5xl',
  }),
  h2: responsive({
    base: 'text-2xl md:text-3xl lg:text-4xl',
  }),
  h3: responsive({
    base: 'text-xl md:text-2xl lg:text-3xl',
  }),
  body: responsive({
    base: 'text-base md:text-lg',
  }),
  small: responsive({
    base: 'text-sm md:text-base',
  }),
} as const;

/**
 * Responsive spacing (gap, margin, padding)
 */
export const spacing = {
  xs: '0.5rem', // 8px
  sm: '1rem', // 16px
  md: '1.5rem', // 24px
  lg: '2rem', // 32px
  xl: '3rem', // 48px
  '2xl': '4rem', // 64px
} as const;

/**
 * Mobile-first touch target sizing (minimum 44x44px per WCAG)
 */
export const touchTargetClasses = {
  interactive: 'min-h-[44px] min-w-[44px]',
  button: 'h-[44px] px-4 py-2',
  input: 'h-[44px] px-3 py-2',
} as const;

/**
 * Responsive display utilities for show/hide patterns
 */
export const displayClasses = {
  mobileOnly: 'block sm:hidden',
  tabletOnly: 'hidden sm:block md:hidden',
  desktopOnly: 'hidden lg:block',
  mobileAndTablet: 'block lg:hidden',
  tabletAndUp: 'hidden sm:block',
  desktopAndUp: 'hidden lg:block',
  hideOnMobile: 'hidden sm:block',
  hideOnDesktop: 'block lg:hidden',
} as const;

/**
 * Foldable device support for fold line positioning
 * Used for devices with foldable screens (Samsung Galaxy Z Fold, etc.)
 */
export const foldableClasses = {
  /**
   * @supports (padding-left: env(viewport-segment-left))
   * Use this for positioning content that spans the fold
   */
  foldAware: 'env-fold-aware',
  /**
   * Split layout for foldable with content on left segment
   */
  foldLeft: responsive({
    base: 'w-full',
    md: 'w-[calc(50dvw-env(viewport-segment-left)/2)]',
  }),
  /**
   * Split layout for foldable with content on right segment
   */
  foldRight: responsive({
    base: 'w-full',
    md: 'w-[calc(50dvw-env(viewport-segment-right)/2)]',
  }),
} as const;

/**
 * Check if current viewport is within a breakpoint range
 * For use in media query conditions
 */
export const breakpointQuery = (breakpoint: Breakpoint): string => {
  const width = BREAKPOINTS[breakpoint];
  return `(min-width: ${width}px)`;
};

/**
 * Create a media query for a breakpoint range
 */
export const breakpointRangeQuery = (
  from: Breakpoint,
  to: Breakpoint
): string => {
  const fromWidth = BREAKPOINTS[from];
  const toWidth = BREAKPOINTS[to];
  return `(min-width: ${fromWidth}px) and (max-width: ${toWidth - 1}px)`;
};

/**
 * Utility to conditionally apply classes based on viewport
 * @example
 * const classes = classesForViewport('p-4', { md: 'p-6', lg: 'p-8' })
 * // Use with useMediaQuery hook to apply dynamically
 */
export const classesForViewport = (
  base: string,
  responsive: Record<string, string>
): Record<string, string> => {
  return { base, ...responsive };
};

/**
 * Common responsive layout patterns
 */
export const layoutPatterns = {
  /**
   * Mobile sidebar that becomes top navigation on tablet+
   */
  mobileNavigation: responsive({
    base: 'fixed bottom-0 left-0 right-0 z-40',
    sm: 'relative bottom-auto',
  }),
  /**
   * Mobile-first card layout
   */
  card: responsive({
    base: 'w-full',
    md: 'max-w-sm',
    lg: 'max-w-md',
  }),
  /**
   * Hero section that scales responsively
   */
  hero: responsive({
    base: 'min-h-[100dvh] px-4 py-12',
    md: 'min-h-[90dvh] px-6 py-16',
    lg: 'min-h-[80dvh] px-8 py-20',
  }),
} as const;

/**
 * Utility function to get dynamic font size based on viewport
 * @param size 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl'
 */
export const responsiveFontSize = (
  size: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl'
): Record<string, string> => {
  const fontSizes: Record<string, Record<string, string>> = {
    xs: { base: 'text-xs', sm: 'text-sm', lg: 'text-base' },
    sm: { base: 'text-sm', md: 'text-base', lg: 'text-lg' },
    base: { base: 'text-base', md: 'text-lg', lg: 'text-xl' },
    lg: { base: 'text-lg', md: 'text-xl', lg: 'text-2xl' },
    xl: { base: 'text-xl', md: 'text-2xl', lg: 'text-3xl' },
    '2xl': { base: 'text-2xl', md: 'text-3xl', lg: 'text-4xl' },
  };

  return fontSizes[size] || fontSizes.base;
};
