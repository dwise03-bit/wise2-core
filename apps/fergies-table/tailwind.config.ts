import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}', './contexts/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        fergie: {
          royal: '#6A22E2',
          deep: '#3A0D6E',
          gold: '#FFD700',
          rose: '#EEC1C6',
          black: '#0A0A0A',
          charcoal: '#121212',
          white: '#FFFFFF',
        },
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        script: ['var(--font-script)', 'cursive'],
      },
      boxShadow: {
        glow: '0 0 40px rgba(106, 34, 226, 0.35)',
        'glow-gold': '0 0 28px rgba(255, 215, 0, 0.35)',
        'glow-sm': '0 0 20px rgba(106, 34, 226, 0.4)',
      },
      borderRadius: {
        fergie: '16px',
        'fergie-lg': '24px',
      },
    },
  },
  plugins: [],
};

export default config;
