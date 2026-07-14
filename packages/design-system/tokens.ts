/**
 * WISE² Design System - Master Tokens
 *
 * This is the single source of truth for all design decisions across
 * the WISE² platform. Every color, spacing, typography, and animation
 * must reference these tokens.
 *
 * @see design-system/README.md for complete documentation
 */

export const WISE2_COLORS = {
  // Background & Surface
  background: '#050505',
  surface: '#0D1117',
  surface_secondary: '#131922',
  card: '#10151D',

  // Foreground & Text
  text_primary: '#FFFFFF',
  text_secondary: '#C9CED6',
  text_muted: '#8D98A5',

  // Primary Brand
  primary: '#0094FF',
  primary_hover: '#32A8FF',
  primary_active: '#0075CC',
  primary_light: '#1AA8FF',

  // Accent Colors
  accent_red: '#E53935',
  accent_orange: '#F59E0B',
  accent_green: '#22C55E',

  // Semantic
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#E53935',
  info: '#0094FF',

  // Borders
  border_subtle: 'rgba(255, 255, 255, 0.08)',
  border_medium: 'rgba(255, 255, 255, 0.12)',
  border_strong: 'rgba(255, 255, 255, 0.20)',

  // Transparent variants
  primary_transparent: 'rgba(0, 148, 255, 0.1)',
  primary_transparent_hover: 'rgba(0, 148, 255, 0.2)',
  danger_transparent: 'rgba(229, 57, 53, 0.1)',
  success_transparent: 'rgba(34, 197, 94, 0.1)',
} as const;

export const WISE2_TYPOGRAPHY = {
  fontFamily: {
    display: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto",
    sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto",
    mono: "'Fira Code', 'SF Mono', Monaco, monospace",
  },

  // Font Sizes
  fontSize: {
    // Display/Hero
    xs: '10px',
    sm: '13px',
    base: '16px',
    lg: '20px',
    xl: '25px',
    '2xl': '31px',
    '3xl': '39px',
    '4xl': '49px',
    '5xl': '61px',
    '6xl': '76px',
    '7xl': '95px',
  },

  // Font Weights
  fontWeight: {
    thin: 100,
    extralight: 200,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },

  // Line Heights
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  // Letter Spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
} as const;

export const WISE2_SPACING = {
  // 8px base unit
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  9: '36px',
  10: '40px',
  12: '48px',
  14: '56px',
  16: '64px',
  20: '80px',
  24: '96px',
  28: '112px',
  32: '128px',
  36: '144px',
  40: '160px',
  44: '176px',
  48: '192px',
  52: '208px',
  56: '224px',
  60: '240px',
  64: '256px',
} as const;

export const WISE2_BORDER_RADIUS = {
  none: '0px',
  xs: '4px',
  sm: '8px',
  base: '12px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  full: '9999px',
} as const;

export const WISE2_SHADOWS = {
  none: 'none',
  small: '0 2px 8px rgba(0, 0, 0, 0.3)',
  medium: '0 4px 16px rgba(0, 0, 0, 0.4)',
  large: '0 8px 32px rgba(0, 0, 0, 0.5)',
  xlarge: '0 16px 64px rgba(0, 0, 0, 0.6)',

  // Glow effects
  glow_blue_sm: '0 0 8px rgba(0, 148, 255, 0.3)',
  glow_blue_md: '0 0 16px rgba(0, 148, 255, 0.5)',
  glow_blue_lg: '0 0 32px rgba(0, 148, 255, 0.7)',
  glow_blue_xl: '0 0 64px rgba(0, 148, 255, 0.8)',

  // Inner shadows
  inner_sm: 'inset 0 2px 8px rgba(0, 0, 0, 0.5)',
  inner_md: 'inset 0 4px 16px rgba(0, 0, 0, 0.6)',
} as const;

export const WISE2_BACKDROP = {
  blur_sm: 'blur(4px)',
  blur_md: 'blur(8px)',
  blur_lg: 'blur(12px)',
  blur_xl: 'blur(16px)',
  blur_2xl: 'blur(20px)',
} as const;

export const WISE2_BREAKPOINTS = {
  xs: '320px',
  sm: '480px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1600px',
  '3xl': '1920px',
} as const;

export const WISE2_ANIMATION = {
  duration: {
    fast: '150ms',
    base: '200ms',
    slow: '300ms',
    slower: '500ms',
    slowest: '1000ms',
  },
  easing: {
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
  },
} as const;

export const WISE2_Z_INDEX = {
  hide: -1,
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modal_backdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  notification: 1080,
} as const;

/**
 * Semantic tokens - used for specific UI patterns
 */
export const WISE2_SEMANTIC = {
  // Buttons
  button: {
    primary: {
      bg: WISE2_COLORS.primary,
      bg_hover: WISE2_COLORS.primary_hover,
      text: WISE2_COLORS.background,
    },
    secondary: {
      bg: WISE2_COLORS.surface_secondary,
      border: WISE2_COLORS.border_medium,
      text: WISE2_COLORS.text_primary,
    },
    danger: {
      bg: WISE2_COLORS.accent_red,
      bg_hover: '#CC2E2E',
      text: WISE2_COLORS.text_primary,
    },
    ghost: {
      bg: 'transparent',
      border: WISE2_COLORS.border_subtle,
      text: WISE2_COLORS.text_secondary,
    },
  },

  // Cards & Containers
  card: {
    bg: WISE2_COLORS.card,
    border: WISE2_COLORS.border_subtle,
    shadow: WISE2_SHADOWS.small,
  },

  // Form elements
  input: {
    bg: WISE2_COLORS.surface,
    border: WISE2_COLORS.border_medium,
    border_hover: WISE2_COLORS.border_strong,
    border_focus: WISE2_COLORS.primary,
    text: WISE2_COLORS.text_primary,
    placeholder: WISE2_COLORS.text_muted,
  },

  // Status indicators
  status: {
    success: WISE2_COLORS.success,
    warning: WISE2_COLORS.warning,
    danger: WISE2_COLORS.danger,
    info: WISE2_COLORS.info,
  },
} as const;

export type WISE2ColorKey = keyof typeof WISE2_COLORS;
export type WISE2SemanticKey = keyof typeof WISE2_SEMANTIC;

export default {
  colors: WISE2_COLORS,
  typography: WISE2_TYPOGRAPHY,
  spacing: WISE2_SPACING,
  borderRadius: WISE2_BORDER_RADIUS,
  shadows: WISE2_SHADOWS,
  backdrop: WISE2_BACKDROP,
  breakpoints: WISE2_BREAKPOINTS,
  animation: WISE2_ANIMATION,
  zIndex: WISE2_Z_INDEX,
  semantic: WISE2_SEMANTIC,
} as const;
