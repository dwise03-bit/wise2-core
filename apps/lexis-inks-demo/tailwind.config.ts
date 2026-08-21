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
        navy: '#0a1f3d',
        'navy-light': '#0d2850',
        'navy-dark': '#051428',
        blue: '#0066ff',
        'blue-light': '#3d8fff',
        cyan: '#00d4ff',
        'cyan-glow': '#00d4ff',
        silver: '#e8e8e8',
        'silver-dark': '#999',
      },
      backgroundImage: {
        'glow-blue': 'radial-gradient(circle, rgba(0, 102, 255, 0.1) 0%, transparent 70%)',
        'glow-cyan': 'radial-gradient(circle, rgba(0, 212, 255, 0.1) 0%, transparent 70%)',
      },
      boxShadow: {
        glow: '0 0 20px rgba(0, 212, 255, 0.3)',
        'glow-blue': '0 0 20px rgba(0, 102, 255, 0.2)',
      },
    },
  },
  plugins: [],
}
export default config
