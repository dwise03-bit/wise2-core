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
        purple: '#3B1E54',
        gold: '#F4C542',
        cream: '#F7F2E9',
        sage: '#8B9B7F',
        blush: '#E8C4D0',
      },
      fontFamily: {
        serif: ['Playfair Display', 'serif'],
        display: ['Cinzel Decorative', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(244, 197, 66, 0.3)' },
          '50%': { boxShadow: '0 0 15px rgba(244, 197, 66, 0.6)' },
        },
      },
      animation: {
        fadeInUp: 'fadeInUp 0.6s ease-out',
        glow: 'glow 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
export default config
