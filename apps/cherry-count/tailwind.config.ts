import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cherry: {
          black: '#050505',
          soft: '#111111',
          plum: '#17081B',
          bubblegum: '#FF5FA2',
          hot: '#FF2E88',
          red: '#C91C4A',
          royal: '#7A2EFF',
          lavender: '#C98BFF',
          chrome: '#C0C0C0',
        },
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        script: ['var(--font-script)', 'cursive'],
      },
      boxShadow: {
        glow: '0 0 40px rgba(255, 46, 136, 0.25)',
        'glow-sm': '0 0 24px rgba(255, 46, 136, 0.35)',
      },
      borderRadius: {
        cherry: '16px',
        'cherry-lg': '20px',
      },
    },
  },
  plugins: [],
};

export default config;
