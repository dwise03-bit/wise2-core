import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary backgrounds
        'bg-primary': '#050505',
        'bg-secondary': '#111111',
        'bg-tertiary': '#1A1A1A',

        // Chrome & accents
        'chrome': '#9CA3AF',
        'chrome-light': '#D1D5DB',
        'chrome-dark': '#4B5563',

        // Electric blue - primary accent
        'blue-electric': '#0094FF',
        'blue-electric-light': '#5BC0FF',
        'blue-electric-dark': '#0056CC',

        // Glow colors
        'glow-blue': 'rgba(0, 148, 255, 0.5)',
        'glow-red': 'rgba(239, 68, 68, 0.5)',
        'glow-orange': 'rgba(249, 115, 22, 0.3)',
      },
      backgroundColor: {
        'hud': 'rgba(17, 17, 17, 0.5)',
        'panel': 'rgba(26, 26, 26, 0.8)',
      },
      boxShadow: {
        'glow-blue': '0 0 20px rgba(0, 148, 255, 0.3), inset 0 0 20px rgba(0, 148, 255, 0.1)',
        'glow-blue-lg': '0 0 40px rgba(0, 148, 255, 0.5), inset 0 0 30px rgba(0, 148, 255, 0.15)',
        'glow-red': '0 0 20px rgba(239, 68, 68, 0.3)',
        'steel': '0 8px 32px rgba(0, 0, 0, 0.6), inset 0 0 20px rgba(255, 255, 255, 0.05)',
      },
      backdropBlur: {
        'glass': '10px',
        'glass-thick': '20px',
      },
      borderColor: {
        'electric-blue': '#0094FF',
        'steel': '#3F4754',
      },
      fontSize: {
        'display': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'heading': ['2rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'subheading': ['1.25rem', { lineHeight: '1.3' }],
      },
      fontFamily: {
        'sans': ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        'mono': ['Courier New', 'monospace'],
      },
      animation: {
        'pulse-blue': 'pulse-blue 2s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'scan-line': 'scan-line 8s linear infinite',
        'flicker': 'flicker 0.15s infinite',
      },
      keyframes: {
        'pulse-blue': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 148, 255, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 148, 255, 0.6)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
        'scan-line': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        'flicker': {
          '0%, 19%, 21%, 23%, 25%, 54%, 56%, 100%': { opacity: '1' },
          '20%, 24%, 55%': { opacity: '0.8' },
        },
      },
      spacing: {
        'gutter': '1.5rem',
        'gutter-lg': '3rem',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
export default config
