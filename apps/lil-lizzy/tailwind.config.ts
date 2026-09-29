import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}', './contexts/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        lizzy: {
          ink: '#0B0318',
          deep: '#160428',
          card: '#1C0A33',
          pink: '#FF3DA8',
          magenta: '#FF2D8A',
          cyan: '#3DF0FF',
          yellow: '#FFE14A',
          purple: '#8B5CFF',
          violet: '#5B2BFF',
          white: '#FFFFFF',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        pink: '0 0 28px rgba(255, 61, 168, 0.45)',
        cyan: '0 0 24px rgba(61, 240, 255, 0.35)',
        yellow: '0 0 20px rgba(255, 225, 74, 0.35)',
      },
      borderRadius: {
        lizzy: '22px',
        'lizzy-lg': '32px',
      },
    },
  },
  plugins: [],
};

export default config;
