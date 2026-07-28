/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    screens: {
      xs: '320px',
      sm: '375px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1440px',
    },
    extend: {
      colors: {
        // WISE² Master Design System v2.1 (Master Reference Aligned)
        wise: {
          // Foundation Colors (Color Hierarchy)
          'black': '#030504',          // Deep black - page backgrounds
          'carbon': '#070B09',         // Carbon black - alternative darkest
          'gunmetal': '#111815',       // Gunmetal - cards
          'surface-elevated': '#101A15', // Elevated panel
          'surface-secondary': '#16211B', // Secondary panel
          'chrome': '#BFC4C9',         // Chrome - premium accents

          // Action Colors (Master Reference)
          'green-neon': '#72FF3B',     // WISE² Neon Green (PRIMARY)
          'green-lime': '#8AFF52',     // Bright lime
          'blue-electric': '#27C7FF',  // Electric blue (SECONDARY)
          'purple-ai': '#9d4edd',      // AI accent
          'red-alert': '#ff006e',      // Error
          'orange-warning': '#ffa500', // Warning

          // Semantic Aliases (backwards compatibility)
          'bg-darkest': '#030504',
          'surface-1': '#101A15',
          'surface-2': '#16211B',
          'border': '#3d3d3d',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#BFC4C9',
          muted: '#8D98A5',
        },
        border: {
          subtle: 'rgba(191, 196, 201, 0.15)',
          medium: 'rgba(191, 196, 201, 0.25)',
          strong: 'rgba(191, 196, 201, 0.4)',
          electric: 'rgba(39, 199, 255, 0.3)',
          neon: 'rgba(114, 255, 59, 0.3)',
        },
        success: { DEFAULT: '#22C55E', muted: 'rgba(34, 197, 94, 0.15)' },
        warning: { DEFAULT: '#F2B632', muted: 'rgba(242, 182, 50, 0.15)' },
        danger: { DEFAULT: '#E53935', muted: 'rgba(229, 57, 53, 0.15)' },
        info: { DEFAULT: '#27C7FF', muted: 'rgba(39, 199, 255, 0.15)' },
      },
      fontFamily: {
        display: ['Inter', ...defaultTheme.fontFamily.sans],
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
        mono: ['JetBrains Mono', 'Fira Code', ...defaultTheme.fontFamily.mono],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '6': '24px',
        '8': '32px',
        '12': '48px',
        '16': '64px',
        'sidebar': '260px',
        'sidebar-collapsed': '64px',
        'topbar': '48px',
      },
      borderRadius: {
        'wise': '8px',
      },
      boxShadow: {
        // Glassmorphic shadows
        'sm': '0 2px 8px rgba(0, 0, 0, 0.24)',
        'md': '0 4px 16px rgba(0, 0, 0, 0.32)',
        'lg': '0 8px 24px rgba(0, 0, 0, 0.40)',

        // Electric Blue accents (Master Reference: #27C7FF)
        'blue-glow': '0 0 12px rgba(39, 199, 255, 0.2)',
        'blue-glow-md': '0 0 24px rgba(39, 199, 255, 0.4)',

        // Neon Green accents (Master Reference: #72FF3B)
        'green-glow': '0 0 12px rgba(114, 255, 59, 0.2)',
        'green-glow-md': '0 0 24px rgba(114, 255, 59, 0.4)',

        // Surface shadows
        'surface': '0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)',
        'elevated': '0 4px 12px rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.3)',
        'overlay': '0 8px 32px rgba(0, 0, 0, 0.5)',
      },
      keyframes: {
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'green-pulse': {
          '0%, 100%': { boxShadow: '0 0 12px rgba(114, 255, 59, 0.2)' },
          '50%': { boxShadow: '0 0 24px rgba(114, 255, 59, 0.4)' },
        },
        'blue-pulse': {
          '0%, 100%': { boxShadow: '0 0 12px rgba(39, 199, 255, 0.2)' },
          '50%': { boxShadow: '0 0 24px rgba(39, 199, 255, 0.4)' },
        },
      },
      animation: {
        'slide-up': 'slide-up 0.25s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
        'green-pulse': 'green-pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'blue-pulse': 'blue-pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};
