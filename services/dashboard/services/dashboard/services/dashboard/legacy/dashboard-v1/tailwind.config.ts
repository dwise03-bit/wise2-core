import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'primary-black': '#0a0a0a',
        'secondary-black': '#1a1a1a',
        'neon-red': '#ff1744',
        'standard-red': '#cc0000',
        'silver': '#c0c0c0',
        'gray': '#666666',
        'cyan': '#00d9ff',
      },
      backgroundColor: {
        'primary-black': '#0a0a0a',
        'secondary-black': '#1a1a1a',
        'neon-red': '#ff1744',
      },
      borderColor: {
        'neon-red': '#ff1744',
      },
      textColor: {
        'neon-red': '#ff1744',
        'silver': '#c0c0c0',
      },
    },
  },
  plugins: [],
};

export default config;
