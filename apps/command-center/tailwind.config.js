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
        // WISE² Brand Identity - ORGANIZED CHAOS
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
        },
        // Text
        text: {
          primary: '#FFFFFF',
          secondary: '#C9CED6',
          muted: '#8D98A5',
        },
        // Semantic
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#E53935',
        // Borders (transparencies)
        border: {
          subtle: 'rgba(255, 255, 255, 0.08)',
          medium: 'rgba(255, 255, 255, 0.12)',
          strong: 'rgba(255, 255, 255, 0.20)',
        },
      },
      fontFamily: {
        display: ['Inter', ...defaultTheme.fontFamily.sans],
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
        mono: ['Fira Code', ...defaultTheme.fontFamily.mono],
      },
      boxShadow: {
        'glow-electric-sm': '0 0 8px rgba(0, 148, 255, 0.3)',
        'glow-electric-md': '0 0 16px rgba(0, 148, 255, 0.5)',
        'glow-electric-lg': '0 0 32px rgba(0, 148, 255, 0.7)',
      },
      backgroundColor: {
        base: '#050505',
        surface: '#0D1117',
      },
      textColor: {
        base: '#FFFFFF',
      },
    },
  },
  plugins: [],
};
