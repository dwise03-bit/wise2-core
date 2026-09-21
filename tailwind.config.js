/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    './apps/*/src/**/*.{js,ts,jsx,tsx}',
    './apps/*/app/**/*.{js,ts,jsx,tsx}',
    './apps/*/components/**/*.{js,ts,jsx,tsx}',
    './packages/ui-components/src/**/*.{js,ts,jsx,tsx}',
    './packages/ui-components/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // WISE² Brand Palette (Locked 2026-09-13)
        'wise-navy': '#050607',      // Primary background, authority
        'wise-charcoal': '#0a0f1a',  // Secondary background, depth
        'wise-cyan': '#00D9FF',      // Primary action, focus states
        'wise-neon': '#00FF7F',      // Success, active, hero accent
        'wise-gold': '#C4A369',      // Premium accent, secondary CTA
        'wise-gray-light': '#D1D5DB', // Body text, readability
        'wise-gray-dark': '#1f2937',  // Subtle text, disabled states

        // Semantic aliases (for component use)
        primary: '#00D9FF',
        secondary: '#C4A369',
        success: '#00FF7F',
        danger: '#FF4444',
        warning: '#F59E0B',
        info: '#3B82F6',
        background: '#050607',
        surface: '#0a0f1a',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
        mono: [
          '"SF Mono"',
          'Monaco',
          '"Cascadia Code"',
          '"Roboto Mono"',
          'monospace',
        ],
      },
      fontSize: {
        // Type scale (from WISE² Brand Brief)
        '3xl': ['56px', { lineHeight: '1.1', fontWeight: '900' }],  // Hero H1
        '2xl': ['36px', { lineHeight: '1.2', fontWeight: '700' }],  // Section H2
        'xl': ['24px', { lineHeight: '1.3', fontWeight: '600' }],   // Subsection H3
        'lg': ['18px', { lineHeight: '1.4', fontWeight: '600' }],   // Card Title H4
        'base': ['16px', { lineHeight: '1.6', fontWeight: '400' }], // Body Text
        'sm': ['14px', { lineHeight: '1.6', fontWeight: '400' }],   // Body Text Small
        'xs': ['12px', { lineHeight: '1.5', fontWeight: '400' }],   // Small/Caption
      },
      spacing: {
        // 4px grid alignment (multiples of 4)
        0: '0',
        1: '2px',
        2: '4px',
        3: '8px',
        4: '12px',
        5: '16px',
        6: '24px',
        8: '32px',
        12: '48px',
        16: '64px',
        24: '96px',
      },
      borderRadius: {
        // Sharp to subtle (no 9999px pills)
        none: '0',
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '16px',
      },
      letterSpacing: {
        tighter: '-0.02em',  // Headings
        normal: '0em',       // Body
        tracking: '0.12em',  // Button uppercase
      },
      boxShadow: {
        none: 'none',
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      },
      transitionDuration: {
        fast: '150ms',
        normal: '200ms',
      },
      transitionTimingFunction: {
        'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}
