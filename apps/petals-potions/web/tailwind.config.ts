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
        // Petals & Potions Brand Palette
        'pp-purple': '#3B1E54',        // Deep Purple
        'pp-indigo': '#1D386F',        // Royal Indigo
        'pp-green': '#2E7D4E',         // Botanical Green
        'pp-gold': '#F4C542',          // Warm Gold
        'pp-cream': '#F7F2E9',         // Warm Cream
        'pp-dark': '#08090C',          // Deep Black
        'pp-navy': '#0D1117',          // Navy Black
        'pp-midnight': '#15101B',      // Midnight
      },
      fontFamily: {
        'serif-display': ['Playfair Display', 'serif'],
        'serif-header': ['Cinzel Decorative', 'serif'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'header-lg': '4rem',
        'header-md': '2.5rem',
        'header-sm': '1.875rem',
        'body-lg': '1.125rem',
        'body-md': '1rem',
        'body-sm': '0.875rem',
      },
      backgroundImage: {
        'gradient-ritual': 'linear-gradient(135deg, #3B1E54 0%, #1D386F 100%)',
        'gradient-gold': 'linear-gradient(135deg, #F4C542 0%, #F7F2E9 100%)',
      },
      boxShadow: {
        'luxury': '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        'card': '0 10px 30px rgba(0, 0, 0, 0.3)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}

export default config
