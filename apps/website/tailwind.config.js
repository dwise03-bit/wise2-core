/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');

/**
 * This application owns its Tailwind configuration.  Do not add a second
 * configuration at the repository root or use a preset here: Next resolves
 * PostCSS from the application directory during both local and Docker builds.
 */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        wise: {
          // WISE² Brand Colors - PRIMARY (All references)
          'bg-primary': '#050505',
          'bg-secondary': '#0D1117',
          'bg-card': '#10151D',

          // Text Colors
          'text-primary': '#FFFFFF',
          'text-secondary': '#C9CED6',
          'text-muted': '#8D98A5',

          // Accent Green - PRIMARY (Only correct green)
          'accent-green': '#22C55E',
          'accent-green-border': 'rgba(34, 197, 94, 0.3)',

          // Legacy surfaces (compatibility)
          'surface': '#0D1117',
          'surface-2': '#131922',
          'surface-3': '#1A2332',
          'surface-4': '#242D3A',
          'card': '#10151D',

          // Semantic colors
          'success': '#22C55E',
          'warning': '#F59E0B',
          'danger': '#FF0040',

          // DO NOT USE - Deprecated blues
          'primary': '#22C55E',
          'primary-hover': '#1ea853',
          'primary-active': '#16a34a',
          'electric': '#22C55E',
          'purple': '#B300FF',
          'accent-red': '#FF0040',
          'accent-orange': '#F59E0B',
          'info': '#22C55E',
        },
      },
      fontFamily: {
        display: ['Inter', ...defaultTheme.fontFamily.sans],
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
        mono: ['Fira Code', ...defaultTheme.fontFamily.mono],
      },
      boxShadow: {
        // Blue glows
        'glow-blue-sm': '0 0 12px rgba(0, 85, 255, 0.35)',
        'glow-blue-md': '0 0 24px rgba(0, 85, 255, 0.5)',
        'glow-blue-lg': '0 0 44px rgba(0, 217, 255, 0.38)',
        'glow-blue-xl': '0 0 60px rgba(0, 85, 255, 0.4)',
        // Cyan glows
        'glow-cyan-sm': '0 0 12px rgba(0, 217, 255, 0.25)',
        'glow-cyan-md': '0 0 24px rgba(0, 217, 255, 0.35)',
        'glow-cyan-lg': '0 0 44px rgba(0, 217, 255, 0.5)',
        // Red glows
        'glow-red-sm': '0 0 12px rgba(255, 0, 64, 0.25)',
        'glow-red-md': '0 0 24px rgba(255, 0, 64, 0.35)',
        // Subtle card shadow
        'card': '0 4px 16px rgba(0, 0, 0, 0.3)',
        'card-lg': '0 8px 32px rgba(0, 0, 0, 0.4)',
      },
      borderColor: {
        wise: {
          'border-primary': 'rgba(0, 85, 255, 0.2)',
          'border-cyan': 'rgba(0, 217, 255, 0.2)',
          'border-light': 'rgba(255, 255, 255, 0.1)',
        },
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '16px',
        xl: '24px',
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 16px rgba(0, 85, 255, 0.35)' },
          '50%': { boxShadow: '0 0 34px rgba(0, 217, 255, 0.55)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
};
