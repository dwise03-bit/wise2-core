/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');

const config = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary colors
        black: '#000000',
        white: '#FFFFFF',
        chrome: '#E8E8E8',

        // Secondary colors
        blue: {
          50: '#E6FFFE',
          100: '#B3FFFD',
          200: '#80FFFC',
          300: '#4DFFFB',
          400: '#1AFFFA',
          500: '#00D9FF', // Electric Blue (primary action)
          600: '#00A3CC',
          700: '#006D99',
          800: '#003766',
          900: '#001A33',
        },
        purple: {
          50: '#F3E6FF',
          100: '#E0B3FF',
          200: '#CD80FF',
          300: '#BA4DFF',
          400: '#A71AFF',
          500: '#B300FF', // Primary accent
          600: '#8A00CC',
          700: '#610099',
          800: '#380066',
          900: '#0F0033',
        },
        red: {
          50: '#FFE6E8',
          100: '#FFB3B8',
          200: '#FF8088',
          300: '#FF4D58',
          400: '#FF1A28',
          500: '#FF0040', // Alert red
          600: '#CC0033',
          700: '#990026',
          800: '#660019',
          900: '#330D0D',
        },

        // Semantic colors
        success: '#00D966',
        warning: '#FFB800',
        error: '#FF0040',
        info: '#0099FF',

        // Grayscale
        gray: {
          50: '#F9F9F9',
          100: '#F5F5F5',
          200: '#ECECEC',
          300: '#D0D0D0',
          400: '#A3A3A3',
          500: '#808080',
          600: '#606060',
          700: '#404040',
          800: '#303030',
          900: '#0F0F0F',
        },
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        '2xl': '48px',
        '3xl': '64px',
        '4xl': '80px',
      },
      borderRadius: {
        none: '0',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
        full: '9999px',
      },
      boxShadow: {
        xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
        sm: '0 2px 4px rgba(0, 0, 0, 0.1)',
        md: '0 4px 8px rgba(0, 0, 0, 0.15)',
        lg: '0 8px 16px rgba(0, 0, 0, 0.2)',
        xl: '0 16px 32px rgba(0, 0, 0, 0.25)',
        '2xl': '0 32px 64px rgba(0, 0, 0, 0.3)',
        'focus': '0 0 0 3px #000000, 0 0 0 5px #00D9FF',
      },
      fontSize: {
        xs: ['12px', { lineHeight: '1.4', letterSpacing: '0.01em' }],
        sm: ['14px', { lineHeight: '1.5', letterSpacing: '0em' }],
        base: ['16px', { lineHeight: '1.6', letterSpacing: '0em' }],
        lg: ['18px', { lineHeight: '1.6', letterSpacing: '0em' }],
        xl: ['20px', { lineHeight: '1.4', letterSpacing: '0em' }],
        '2xl': ['28px', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
        '3xl': ['36px', { lineHeight: '1.25', letterSpacing: '-0.02em' }],
        '4xl': ['48px', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
      },
      fontFamily: {
        sans: ['system-ui', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', ...defaultTheme.fontFamily.sans],
        mono: ['"SF Mono"', 'Monaco', '"Cascadia Code"', '"Roboto Mono"', 'Courier New', ...defaultTheme.fontFamily.mono],
      },
      fontWeight: {
        thin: '100',
        extralight: '200',
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
        black: '900',
      },
      letterSpacing: {
        tighter: '-0.02em',
        tight: '-0.01em',
        normal: '0em',
        wide: '0.01em',
        wider: '0.02em',
        widest: '0.04em',
      },
      transitionDuration: {
        0: '0ms',
        75: '75ms',
        100: '100ms',
        150: '150ms',
        200: '200ms',
        300: '300ms',
        500: '500ms',
        700: '700ms',
        1000: '1000ms',
      },
      transitionTimingFunction: {
        'ease-in': 'cubic-bezier(0.4, 0, 1, 1)',
        'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
        'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      animation: {
        'spin': 'spin 1s linear infinite',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce': 'bounce 1s infinite',
        'fade-in': 'fadeIn 300ms ease-in-out',
        'fade-out': 'fadeOut 300ms ease-in-out',
        'slide-in': 'slideIn 300ms ease-out',
        'slide-out': 'slideOut 300ms ease-in',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideIn: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideOut: {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(10px)', opacity: '0' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};

module.exports = config;
