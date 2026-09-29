import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    colors: {
      white: '#FFFFFF',
      black: '#000000',
      transparent: 'transparent',
      cc: {
        purple: '#6D2DBD',
        lavender: '#B785D3',
        lilac: '#F3E8FF',
        gold: '#D4AF37',
        dark: '#29233D',
        white: '#FFFFFF',
      },
      yellow: {
        600: '#C49D2B',
      },
      purple: {
        800: '#5A238F',
      },
      red: {
        600: '#DC2626',
        800: '#991B1B',
      },
      green: {
        100: '#DCFCE7',
      },
      gray: {
        300: '#D1D5DB',
        700: '#374151',
      },
    },
    fontFamily: {
      lora: ['var(--font-lora)', 'serif'],
      poppins: ['var(--font-poppins)', 'sans-serif'],
      script: ['var(--font-script)', 'cursive'],
    },
    extend: {},
  },
  plugins: [],
}
export default config
