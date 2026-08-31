import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        carbon: '#050505',
        smoked: '#101214',
        steel: '#1A1E22',
        chrome: '#C9D0D6',
        ice: '#27C7FF',
        snow: '#F7FBFF',
        emerald: '#2EE59D',
        amber: '#F5B942',
        critical: '#FF3B5C',
        violet: '#8B7CFF',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        ice: '0 0 24px rgba(39, 199, 255, 0.22)',
        critical: '0 0 20px rgba(255, 59, 92, 0.2)',
      },
      minHeight: {
        touch: '44px',
      },
      minWidth: {
        touch: '44px',
      },
    },
  },
  plugins: [],
};

export default config;
