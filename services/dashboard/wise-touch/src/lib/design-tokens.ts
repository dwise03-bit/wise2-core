export const COLORS = {
  // Backgrounds
  bg: {
    primary: '#050505',
    secondary: '#111111',
    tertiary: '#1A1A1A',
  },

  // Chrome & Text
  chrome: {
    light: '#D1D5DB',
    default: '#9CA3AF',
    dark: '#4B5563',
  },

  // Electric Blue Accent
  blue: {
    electric: '#0094FF',
    light: '#5BC0FF',
    dark: '#0056CC',
  },

  // Status Colors
  status: {
    good: '#10B981',
    warning: '#F59E0B',
    critical: '#EF4444',
  },
}

export const SHADOWS = {
  steel: '0 8px 32px rgba(0, 0, 0, 0.6), inset 0 0 20px rgba(255, 255, 255, 0.05)',
  glow: {
    sm: '0 0 20px rgba(0, 148, 255, 0.3), inset 0 0 20px rgba(0, 148, 255, 0.1)',
    md: '0 0 40px rgba(0, 148, 255, 0.5), inset 0 0 30px rgba(0, 148, 255, 0.15)',
    red: '0 0 20px rgba(239, 68, 68, 0.3)',
  },
}

export const SPACING = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  xxl: '3rem',
}

export const BREAKPOINTS = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
}

export const ANIMATIONS = {
  duration: {
    instant: '0ms',
    fast: '150ms',
    base: '300ms',
    slow: '500ms',
    slower: '750ms',
  },
  easing: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
}

export const TYPOGRAPHY = {
  display: {
    fontSize: '3.5rem',
    lineHeight: '1.1',
    letterSpacing: '-0.02em',
    fontWeight: 900,
  },
  heading: {
    fontSize: '2rem',
    lineHeight: '1.2',
    letterSpacing: '-0.01em',
    fontWeight: 700,
  },
  subheading: {
    fontSize: '1.25rem',
    lineHeight: '1.3',
    fontWeight: 600,
  },
  body: {
    fontSize: '0.875rem',
    lineHeight: '1.5',
    fontWeight: 400,
  },
  caption: {
    fontSize: '0.75rem',
    lineHeight: '1.4',
    fontWeight: 500,
  },
}

export const SIDEBAR = {
  width: '280px',
  collapsedWidth: '80px',
  transitionDuration: '300ms',
}

export const ZINDEX = {
  hide: '-1',
  base: '0',
  dropdown: '1000',
  sticky: '1020',
  fixed: '1030',
  backdrop: '1040',
  modal: '1050',
  popover: '1060',
  tooltip: '1070',
}
