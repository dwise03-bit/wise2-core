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
    './app/**/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
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
          // WISE² Brand Colors - Core
          'bg-primary': '#050505',
          'bg-secondary': '#0D1117',
          'bg-card': '#10151D',

          // Text Colors
          'text-primary': '#FFFFFF',
          'text-secondary': '#C9CED6',
          'text-muted': '#8D98A5',

          // Primary Brand - Electric Blue (WISE²)
          'primary': '#0094FF',
          'primary-hover': '#00A8FF',
          'primary-active': '#0078D4',
          'primary-light': '#33B1FF',
          'primary-border': 'rgba(0, 148, 255, 0.3)',

          // Powered Business Colors
          'piff-city': '#A63CFF',
          'piff-city-hover': '#B850FF',
          'piff-city-active': '#8A28D4',
          'wise-shine': '#F2B632',
          'wise-shine-hover': '#FFB84D',
          'wise-shine-active': '#D49A1A',

          // Legacy surfaces (compatibility)
          'surface': '#0D1117',
          'surface-2': '#131922',
          'surface-3': '#1A2332',
          'surface-4': '#242D3A',
          'card': '#10151D',

          // Semantic colors
          'success': '#22C55E',
          'warning': '#F59E0B',
          'danger': '#E53935',

          // Legacy/deprecated (backward compat)
          'accent-green': '#2CD588',
          'accent-red': '#FF0040',
          'accent-orange': '#F59E0B',
          'info': '#22C55E',
        },
      },
      fontFamily: {
        cormorant: ['Cormorant', 'serif'],
        montserrat: ['Montserrat', 'sans-serif'],
        display: ['Inter', ...defaultTheme.fontFamily.sans],
        sans: ['Jost', 'Inter', ...defaultTheme.fontFamily.sans],
        mono: ['Fira Code', ...defaultTheme.fontFamily.mono],
        bebas: ['Bebas Neue', 'sans-serif'],
        oswald: ['Oswald', 'sans-serif'],
        script: ['cursive'],
        luxury: ['Bodoni Moda', 'serif'],
        jost: ['Jost', 'sans-serif'],
        roboto: ['Roboto', 'sans-serif'],
        'roboto-slab': ['Roboto Slab', 'serif'],
        prestige: ['Prestige', 'serif'],
      },
      boxShadow: {
        // Electric Blue glows (WISE²)
        'glow-blue-sm': '0 0 8px rgba(0, 148, 255, 0.3)',
        'glow-blue-md': '0 0 16px rgba(0, 148, 255, 0.5)',
        'glow-blue-lg': '0 0 32px rgba(0, 148, 255, 0.7)',
        'glow-blue-xl': '0 0 64px rgba(0, 148, 255, 0.8)',
        // Purple glows (PIFF CITY)
        'glow-purple-sm': '0 0 8px rgba(166, 60, 255, 0.3)',
        'glow-purple-md': '0 0 16px rgba(166, 60, 255, 0.5)',
        'glow-purple-lg': '0 0 32px rgba(166, 60, 255, 0.7)',
        // Gold glows (WISE SHINE)
        'glow-gold-sm': '0 0 8px rgba(242, 182, 50, 0.3)',
        'glow-gold-md': '0 0 16px rgba(242, 182, 50, 0.5)',
        'glow-gold-lg': '0 0 32px rgba(242, 182, 50, 0.7)',
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
          '0%, 100%': { boxShadow: '0 0 16px rgba(0, 148, 255, 0.3)' },
          '50%': { boxShadow: '0 0 32px rgba(0, 148, 255, 0.7)' },
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
