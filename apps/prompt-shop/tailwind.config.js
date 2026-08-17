/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // WISE TOUCH // PROMPT SHOP™ Brand Colors
        laser: {
          orange: '#FF5C00',
          orange2: '#FF9D00',
          burnt: '#B93400',
          cyan: '#00D9FF',
        },
        machine: {
          black: '#070707',
          graphite: '#151515',
          gunmetal: '#34383D',
        },
        blueprint: {
          white: '#F2F0EA',
          dark: '#1a1a1a',
        },
        wise: {
          green: '#00FF00', // W² ecosystem (secondary)
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      },
      boxShadow: {
        laser: '0 0 20px rgba(255, 92, 0, 0.5)',
        'laser-strong': '0 0 40px rgba(255, 92, 0, 0.8)',
        industrial: 'inset 0 1px 3px rgba(255, 255, 255, 0.1)',
        weld: '0 0 30px rgba(255, 92, 0, 0.4)',
      },
      animation: {
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'welding-spark': 'welding-spark 0.6s ease-out',
        'foreman-walk': 'foreman-walk 1.5s ease-in-out',
      },
      keyframes: {
        'welding-spark': {
          '0%': { opacity: '1', transform: 'scale(1)' },
          '100%': { opacity: '0', transform: 'scale(0)' },
        },
        'foreman-walk': {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(10px)' },
        },
      },
    },
  },
  plugins: [],
};
