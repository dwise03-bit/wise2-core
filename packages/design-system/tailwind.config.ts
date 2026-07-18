/**
 * WISE² Shared Tailwind Configuration
 *
 * This configuration should be imported by all Next.js apps:
 *
 * tailwind.config.ts:
 * import sharedConfig from '@wise2/design-system/tailwind.config'
 * export default sharedConfig
 */

import type { Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
  ],

  theme: {
    extend: {
      colors: {
        // Backgrounds
        wise: {
          DEFAULT: '#050505',
          bg: '#050505',
          surface: '#0D1117',
          'surface-2': '#131922',
          'surface-3': '#1A2332',
          'surface-4': '#242D3A',
          card: '#10151D',

          // Text
          'text-primary': '#FFFFFF',
          'text-secondary': '#C9CED6',
          'text-muted': '#8D98A5',

          // Primary - Blue
          primary: '#0055FF',
          'primary-hover': '#2874FF',
          'primary-active': '#0044CC',
          'primary-light': '#1AA8FF',

          // Accents
          electric: '#00D9FF',
          cyan: '#00D9FF',
          purple: '#B300FF',
          'accent-red': '#FF0040',
          'accent-orange': '#F59E0B',
          'accent-green': '#22C55E',

          // Semantic
          success: '#22C55E',
          warning: '#F59E0B',
          danger: '#FF0040',
          info: '#0055FF',
        },
      },

      backgroundColor: {
        wise: {
          DEFAULT: '#050505',
          surface: '#0D1117',
          'surface-2': '#131922',
          card: '#10151D',
        },
      },

      textColor: {
        wise: {
          primary: '#FFFFFF',
          secondary: '#C9CED6',
          muted: '#8D98A5',
        },
      },

      borderColor: {
        wise: {
          subtle: 'rgba(255, 255, 255, 0.08)',
          medium: 'rgba(255, 255, 255, 0.12)',
          strong: 'rgba(255, 255, 255, 0.20)',
        },
      },

      fontFamily: {
        display: ['Inter', ...defaultTheme.fontFamily.sans],
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
        mono: ["'Fira Code'", ...defaultTheme.fontFamily.mono],
      },

      fontSize: {
        xs: ['10px', { lineHeight: '14px', letterSpacing: '0.025em' }],
        sm: ['13px', { lineHeight: '16px', letterSpacing: '0.025em' }],
        base: ['16px', { lineHeight: '24px' }],
        lg: ['20px', { lineHeight: '28px' }],
        xl: ['25px', { lineHeight: '32px' }],
        '2xl': ['31px', { lineHeight: '40px' }],
        '3xl': ['39px', { lineHeight: '48px' }],
        '4xl': ['49px', { lineHeight: '56px' }],
        '5xl': ['61px', { lineHeight: '72px' }],
        '6xl': ['76px', { lineHeight: '88px' }],
        '7xl': ['95px', { lineHeight: '112px' }],
      },

      spacing: {
        0: '0px',
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        5: '20px',
        6: '24px',
        7: '28px',
        8: '32px',
        9: '36px',
        10: '40px',
        12: '48px',
        14: '56px',
        16: '64px',
        20: '80px',
        24: '96px',
        28: '112px',
        32: '128px',
        36: '144px',
        40: '160px',
        44: '176px',
        48: '192px',
        52: '208px',
        56: '224px',
        60: '240px',
        64: '256px',
      },

      borderRadius: {
        none: '0px',
        xs: '4px',
        sm: '8px',
        base: '12px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        full: '9999px',
      },

      boxShadow: {
        none: 'none',
        small: '0 2px 8px rgba(0, 0, 0, 0.3)',
        medium: '0 4px 16px rgba(0, 0, 0, 0.4)',
        large: '0 8px 32px rgba(0, 0, 0, 0.5)',
        xlarge: '0 16px 64px rgba(0, 0, 0, 0.6)',
        card: '0 4px 16px rgba(0, 0, 0, 0.3)',
        'card-lg': '0 8px 32px rgba(0, 0, 0, 0.4)',

        // Glow - Blue (Primary)
        'glow-blue-sm': '0 0 12px rgba(0, 85, 255, 0.35)',
        'glow-blue-md': '0 0 24px rgba(0, 85, 255, 0.5)',
        'glow-blue-lg': '0 0 44px rgba(0, 217, 255, 0.38)',
        'glow-blue-xl': '0 0 60px rgba(0, 85, 255, 0.4)',

        // Glow - Cyan
        'glow-cyan-sm': '0 0 12px rgba(0, 217, 255, 0.25)',
        'glow-cyan-md': '0 0 24px rgba(0, 217, 255, 0.35)',
        'glow-cyan-lg': '0 0 44px rgba(0, 217, 255, 0.5)',

        // Glow - Red
        'glow-red-sm': '0 0 12px rgba(255, 0, 64, 0.25)',
        'glow-red-md': '0 0 24px rgba(255, 0, 64, 0.35)',
        'glow-red-lg': '0 0 44px rgba(255, 0, 64, 0.4)',

        // Inner
        'inner-sm': 'inset 0 2px 8px rgba(0, 0, 0, 0.5)',
        'inner-md': 'inset 0 4px 16px rgba(0, 0, 0, 0.6)',
      },

      backdropBlur: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
      },

      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-out': 'fadeOut 0.3s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-out': 'slideOut 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
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
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 16px rgba(0, 148, 255, 0.5)' },
          '50%': { boxShadow: '0 0 32px rgba(0, 148, 255, 0.8)' },
        },
      },

      transitionTimingFunction: {
        wise: 'cubic-bezier(0.4, 0, 0.2, 1)',
        'wise-out': 'cubic-bezier(0, 0, 0.2, 1)',
        'wise-in': 'cubic-bezier(0.4, 0, 1, 1)',
      },

      transitionDuration: {
        fast: '150ms',
        base: '200ms',
        slow: '300ms',
        slower: '500ms',
      },

      zIndex: {
        hide: '-1',
        base: '0',
        dropdown: '1000',
        sticky: '1020',
        fixed: '1030',
        'modal-backdrop': '1040',
        modal: '1050',
        popover: '1060',
        tooltip: '1070',
        notification: '1080',
      },

      screens: {
        xs: '320px',
        sm: '480px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1600px',
        '3xl': '1920px',
      },
    },
  },

  plugins: [],

  // Dark mode handling - using 'class' selector for flexibility
  darkMode: 'class',

  // Disable important variants for cleaner output
  corePlugins: {
    preflight: true,
  },
}

export default config
