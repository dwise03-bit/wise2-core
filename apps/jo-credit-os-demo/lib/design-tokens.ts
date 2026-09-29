export const colors = {
  backgrounds: {
    primary: '#050505',
    secondary: '#111111',
    card: '#161616',
    elevated: '#1D1D1D',
  },
  accent: {
    primary: '#0094FF',
    electric: '#0094FF',
    chrome: '#C8CCD2',
    success: '#22C55E',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#38BDF8',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#9CA3AF',
    muted: '#6B7280',
    disabled: '#4B5563',
  },
  borders: {
    light: 'rgba(255, 255, 255, 0.08)',
    default: 'rgba(255, 255, 255, 0.12)',
    strong: 'rgba(255, 255, 255, 0.16)',
  },
};

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
  '4xl': '96px',
};

export const typography = {
  fontFamily: {
    sans: [
      'Inter',
      'Geist',
      '-apple-system',
      'BlinkMacSystemFont',
      'Segoe UI',
      'Roboto',
      'sans-serif',
    ],
    heading: [
      'Geist',
      'Space Grotesk',
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      'sans-serif',
    ],
    mono: [
      'JetBrains Mono',
      'Courier New',
      'monospace',
    ],
  },
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px',
    '5xl': '48px',
  },
  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  letterSpacing: {
    tight: '-0.02em',
    normal: '0em',
    wide: '0.02em',
  },
  headings: {
    h1: {
      fontSize: '48px',
      fontWeight: 700,
      letterSpacing: '-0.02em',
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '36px',
      fontWeight: 700,
      letterSpacing: '-0.02em',
      lineHeight: 1.2,
    },
    h3: {
      fontSize: '30px',
      fontWeight: 600,
      letterSpacing: '-0.01em',
      lineHeight: 1.3,
    },
    h4: {
      fontSize: '24px',
      fontWeight: 600,
      letterSpacing: '0em',
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '20px',
      fontWeight: 600,
      letterSpacing: '0em',
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '18px',
      fontWeight: 500,
      letterSpacing: '0em',
      lineHeight: 1.5,
    },
  },
  body: {
    fontSize: '16px',
    fontWeight: 400,
    lineHeight: 1.5,
    letterSpacing: '0em',
  },
  mono: {
    fontSize: '14px',
    fontWeight: 400,
    lineHeight: 1.5,
    fontFamily: 'JetBrains Mono, monospace',
  },
};

export const radius = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '18px',
  '2xl': '24px',
  full: '9999px',
};

export const shadows = {
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  glow: {
    sm: '0 0 10px rgba(0, 148, 255, 0.3)',
    md: '0 0 20px rgba(0, 148, 255, 0.4)',
    lg: '0 0 40px rgba(0, 148, 255, 0.5)',
  },
};

export const animations = {
  duration: {
    fast: '100ms',
    base: '200ms',
    slow: '300ms',
    slower: '500ms',
  },
  timingFunction: {
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    linear: 'linear',
    spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
};

export const breakpoints = {
  xs: '375px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

export const zIndex = {
  hide: -1,
  base: 0,
  dropdown: 1000,
  sticky: 1010,
  fixed: 1020,
  modal: 1030,
  tooltip: 1040,
  notification: 1050,
  popover: 1060,
};

export type Colors = typeof colors;
export type Spacing = typeof spacing;
export type Typography = typeof typography;
export type Radius = typeof radius;
export type Shadows = typeof shadows;
export type Animations = typeof animations;
export type Breakpoints = typeof breakpoints;
export type ZIndex = typeof zIndex;
