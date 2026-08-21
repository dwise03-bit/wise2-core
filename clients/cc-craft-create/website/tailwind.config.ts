import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cc: {
          purple: '#6D2DBD',
          lavender: '#B785D3',
          lilac: '#F3E8FF',
          gold: '#D4AF37',
          dark: '#29233D',
          white: '#FFFFFF',
        },
      },
      fontFamily: {
        lora: ['var(--font-lora)', 'serif'],
        poppins: ['var(--font-poppins)', 'sans-serif'],
        script: ['var(--font-script)', 'cursive'],
      },
    },
  },
  plugins: [],
}
export default config
