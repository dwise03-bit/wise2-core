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
        wise: {
          black: '#050505',
          steel: '#1A1A1A',
          surface: '#0D1117',
          surface_secondary: '#131922',
          card: '#10151D',
          chrome: '#9CA3AF',
          electric: '#0094FF',
          electric_hover: '#32A8FF',
          electric_active: '#0075CC',
          electric_light: '#1AA8FF',
          electric_muted: 'rgba(0, 148, 255, 0.08)',
          electric_dim: 'rgba(0, 148, 255, 0.15)',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#C9CED6',
          muted: '#6B7280',
        },
        success: { DEFAULT: '#22C55E', muted: 'rgba(34, 197, 94, 0.12)' },
        warning: { DEFAULT: '#F59E0B', muted: 'rgba(245, 158, 11, 0.12)' },
        danger: { DEFAULT: '#EF4444', muted: 'rgba(239, 68, 68, 0.12)' },
        border: {
          subtle: 'rgba(255, 255, 255, 0.06)',
          medium: 'rgba(255, 255, 255, 0.10)',
          strong: 'rgba(255, 255, 255, 0.18)',
        },
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
        'sidebar': '260px',
        'sidebar-collapsed': '64px',
        'topbar': '48px',
      },
      borderRadius: {
        'wise': '8px',
      },
      boxShadow: {
        'glow-sm': '0 0 8px rgba(0, 148, 255, 0.2)',
        'glow-md': '0 0 16px rgba(0, 148, 255, 0.3)',
        'glow-lg': '0 0 32px rgba(0, 148, 255, 0.4)',
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
      },
      animation: {
        'slide-up': 'slide-up 0.25s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
      },
    },
  },
  plugins: [],
};
