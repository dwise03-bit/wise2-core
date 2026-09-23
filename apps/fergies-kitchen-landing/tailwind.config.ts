import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        sage: '#9CAF88',
        cream: '#FFF8F3',
        bronze: '#8B7355',
        charcoal: '#2C2C2C',
      },
    },
  },
  plugins: [],
}

export default config
