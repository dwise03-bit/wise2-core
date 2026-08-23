/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        wise: {
          void: '#04060D',
          panel: '#0B1020',
          shell: '#11192B',
          line: '#22314E',
          text: '#EAF3FF',
          mute: '#97A7C5',
          blue: '#24A7FF',
          cyan: '#63D7FF',
          orange: '#FF7A18',
          ember: '#FFB15A',
          glow: '#4CC7FF',
          success: '#79D86B',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Impact', 'Haettenschweiler', ...defaultTheme.fontFamily.sans],
        sans: ['var(--font-sans)', ...defaultTheme.fontFamily.sans],
      },
      boxShadow: {
        panel: '0 20px 60px -34px rgba(0, 0, 0, 0.9)',
        neon: '0 0 0 1px rgba(36,167,255,.25), 0 0 28px -10px rgba(36,167,255,.55)',
        ember: '0 0 0 1px rgba(255,122,24,.2), 0 0 28px -10px rgba(255,122,24,.5)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
        riseIn: {
          '0%': { opacity: 0, transform: 'translateY(18px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: 0, transform: 'translateY(32px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        stagger: {
          '0%': { opacity: 0, transform: 'translateY(24px) scale(0.95)' },
          '100%': { opacity: 1, transform: 'translateY(0) scale(1)' },
        },
        scaleIn: {
          '0%': { opacity: 0, transform: 'scale(0.9)' },
          '100%': { opacity: 1, transform: 'scale(1)' },
        },
        fadeInUp: {
          '0%': { opacity: 0, transform: 'translateY(40px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        pulseGlow: 'pulseGlow 3.2s ease-in-out infinite',
        riseIn: 'riseIn .7s cubic-bezier(.22,1,.36,1) both',
        slideUp: 'slideUp 0.8s cubic-bezier(.34,.1,.68,.55) forwards',
        stagger: 'stagger 0.6s cubic-bezier(.22,.82,.56,1) forwards',
        scaleIn: 'scaleIn 0.7s cubic-bezier(.34,1.56,.64,1) forwards',
        fadeInUp: 'fadeInUp 1s ease-out forwards',
      },
      backgroundImage: {
        'wise-grid':
          'linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
};
