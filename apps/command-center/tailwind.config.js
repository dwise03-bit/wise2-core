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
        // WISE² Enterprise Design System v2.0
        wise: {
          // Dark Enterprise Foundation
          'bg-darkest': '#050505',
          'surface-1': '#1a1a1a',
          'surface-2': '#2d2d2d',
          'border': '#3d3d3d',
          'text-primary': '#e8e8e8',
          'text-secondary': '#999999',

          // Action Colors
          'blue-electric': '#00d4ff',
          'green-neon': '#39ff14',
          'purple-ai': '#9d4edd',
          'red-alert': '#ff006e',
          'orange-warning': '#ffa500',

          // Semantic Aliases (for backwards compatibility)
          black: '#050505',
          steel: '#1a1a1a',
          'dark-steel': '#2d2d2d',
          chrome: '#999999',
        },
        text: {
          primary: '#e8e8e8',
          secondary: '#999999',
          muted: '#666666',
        },
        border: {
          subtle: 'rgba(61, 61, 61, 0.5)',
          medium: 'rgba(61, 61, 61, 0.8)',
          strong: 'rgba(61, 61, 61, 1)',
          electric: 'rgba(0, 212, 255, 0.3)',
          neon: 'rgba(57, 255, 20, 0.3)',
        },
        success: { DEFAULT: '#39ff14', muted: 'rgba(57, 255, 20, 0.15)' },
        warning: { DEFAULT: '#ffa500', muted: 'rgba(255, 165, 0, 0.15)' },
        danger: { DEFAULT: '#ff006e', muted: 'rgba(255, 0, 110, 0.15)' },
        info: { DEFAULT: '#00d4ff', muted: 'rgba(0, 212, 255, 0.15)' },
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

        // Electric Blue accents
        'blue-glow': '0 0 12px rgba(0, 212, 255, 0.2)',
        'blue-glow-md': '0 0 24px rgba(0, 212, 255, 0.4)',

        // Neon Green accents
        'green-glow': '0 0 12px rgba(57, 255, 20, 0.2)',
        'green-glow-md': '0 0 24px rgba(57, 255, 20, 0.4)',

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
          '0%, 100%': { boxShadow: '0 0 12px rgba(57, 255, 20, 0.2)' },
          '50%': { boxShadow: '0 0 24px rgba(57, 255, 20, 0.4)' },
        },
        'blue-pulse': {
          '0%, 100%': { boxShadow: '0 0 12px rgba(0, 212, 255, 0.2)' },
          '50%': { boxShadow: '0 0 24px rgba(0, 212, 255, 0.4)' },
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
