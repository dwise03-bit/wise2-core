import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // WISE² Enterprise palette
        chaos: {
          black: '#0A0A0A',      // Midnight black base
          blue: '#007BFF',        // Chaos blue primary
          electric: '#00AEEF',    // Electric blue
          ice: '#4FC3FF',         // Neon ice blue
          white: '#FFFFFF',       // Chrome/white
          chrome: '#E8E8E8',      // Chrome accent
          success: '#00C853',     // Green (status only)
          urgent: '#FF4444',      // Red (live/error only)
          grid: '#003A7F',        // Blueprint grid
          glow: '#0077CC',        // Glow layer
          dark: '#050505',        // Darker than black
        },
      },
      backgroundImage: {
        'blueprint': 'linear-gradient(0deg, rgba(0,119,204,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,119,204,0.03) 1px, transparent 1px)',
        'blueprint-dense': 'linear-gradient(0deg, rgba(0,119,204,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,119,204,0.05) 1px, transparent 1px)',
        'gradient-blue': 'linear-gradient(135deg, #007BFF 0%, #00AEEF 50%, #4FC3FF 100%)',
        'gradient-dark': 'linear-gradient(180deg, #0A0A0A 0%, #050505 100%)',
      },
      backgroundSize: {
        'blueprint': '20px 20px',
        'blueprint-dense': '10px 10px',
      },
      boxShadow: {
        'glow-blue': '0 0 20px rgba(0, 174, 239, 0.3), 0 0 40px rgba(0, 123, 255, 0.2)',
        'glow-ice': '0 0 20px rgba(79, 195, 255, 0.4)',
        'glow-inner': 'inset 0 0 20px rgba(0, 174, 239, 0.1)',
        'panel': '0 0 30px rgba(0, 174, 239, 0.2), inset 0 0 1px rgba(255, 255, 255, 0.1)',
      },
      borderColor: {
        'glow': 'rgba(0, 174, 239, 0.5)',
        'chrome': 'rgba(232, 232, 232, 0.3)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'waveform': 'waveform 0.6s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '0.5', boxShadow: '0 0 20px rgba(0, 174, 239, 0.3)' },
          '50%': { opacity: '1', boxShadow: '0 0 40px rgba(0, 174, 239, 0.5)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'waveform': {
          '0%, 100%': { height: '8px' },
          '50%': { height: '24px' },
        },
      },
      fontFamily: {
        'display': ['system-ui', 'sans-serif'],
        'mono': ['ui-monospace', 'monospace'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
      },
      spacing: {
        'blueprint-sm': '8px',
        'blueprint-md': '16px',
        'blueprint-lg': '24px',
        'blueprint-xl': '32px',
      },
    },
  },
  plugins: [],
}
export default config
