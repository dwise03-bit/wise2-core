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
          DEFAULT: '#050505',
          bg: '#050505',
          surface: '#0D1117',
          'surface-2': '#131922',
          card: '#10151D',
          'text-primary': '#FFFFFF',
          'text-secondary': '#C9CED6',
          'text-muted': '#8D98A5',
          primary: '#0055FF',
          'primary-hover': '#2874FF',
          'primary-active': '#0044CC',
          electric: '#00D9FF',
          purple: '#B300FF',
          'accent-red': '#FF0040',
          'accent-orange': '#F59E0B',
          'accent-green': '#22C55E',
          success: '#22C55E',
          warning: '#F59E0B',
          danger: '#FF0040',
          info: '#0055FF',
        },
      },
      fontFamily: {
        display: ['Inter', ...defaultTheme.fontFamily.sans],
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
        mono: ['Fira Code', ...defaultTheme.fontFamily.mono],
      },
      boxShadow: {
        'glow-blue-sm': '0 0 12px rgba(0, 85, 255, 0.35)',
        'glow-blue-md': '0 0 24px rgba(0, 85, 255, 0.5)',
        'glow-blue-lg': '0 0 44px rgba(0, 217, 255, 0.38)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 16px rgba(0, 85, 255, 0.35)' },
          '50%': { boxShadow: '0 0 34px rgba(0, 217, 255, 0.55)' },
        },
      },
    },
  },
  plugins: [],
};
