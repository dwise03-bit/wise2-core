/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}', './lib/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // GET DOWN PRESSURE WASHING — brand surface stack (black → navy)
        gd: {
          void: '#02060C',      // page background
          abyss: '#040B16',     // deepest navy
          hull: '#071322',      // panel background
          panel: '#0A1B2E',     // card background
          raised: '#0F2439',    // elevated card / hover
          line: '#16324D',      // borders
          // Brand accents
          electric: '#22B8FF',  // electric blue — primary action
          deep: '#0E7BD1',      // deep blue
          neon: '#7CFF3D',      // neon green — success / signature
          lime: '#A6FF6B',
          chrome: '#C9D4E0',    // chrome / metallic text
          steel: '#8AA0B8',     // muted text
          amber: '#FFB020',     // warning
          red: '#FF4D5E',       // alert
          violet: '#A66BFF',    // AI accent
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Impact', 'Haettenschweiler', ...defaultTheme.fontFamily.sans],
        sans: ['var(--font-sans)', ...defaultTheme.fontFamily.sans],
        mono: ['ui-monospace', 'SFMono-Regular', 'JetBrains Mono', ...defaultTheme.fontFamily.mono],
      },
      boxShadow: {
        'glow-electric': '0 0 0 1px rgba(34,184,255,.35), 0 0 24px -4px rgba(34,184,255,.45)',
        'glow-neon': '0 0 0 1px rgba(124,255,61,.35), 0 0 24px -4px rgba(124,255,61,.4)',
        panel: '0 1px 0 0 rgba(255,255,255,.04) inset, 0 18px 40px -24px rgba(0,0,0,.9)',
      },
      backgroundImage: {
        'chrome-text': 'linear-gradient(180deg,#FFFFFF 0%,#D8E2EC 38%,#8FA3B8 55%,#EDF3F8 78%,#B9C7D6 100%)',
        'water': 'radial-gradient(1200px 600px at 15% -10%, rgba(34,184,255,.18), transparent 60%), radial-gradient(900px 500px at 95% 0%, rgba(124,255,61,.08), transparent 55%)',
      },
      keyframes: {
        sweep: { '0%': { transform: 'translateX(-100%)' }, '100%': { transform: 'translateX(200%)' } },
        pulseRing: {
          '0%': { boxShadow: '0 0 0 0 rgba(124,255,61,.5)' },
          '70%': { boxShadow: '0 0 0 12px rgba(124,255,61,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(124,255,61,0)' },
        },
        riseIn: { '0%': { opacity: 0, transform: 'translateY(10px)' }, '100%': { opacity: 1, transform: 'none' } },
      },
      animation: {
        sweep: 'sweep 2.4s linear infinite',
        pulseRing: 'pulseRing 2s ease-out infinite',
        riseIn: 'riseIn .45s cubic-bezier(.22,1,.36,1) both',
      },
    },
  },
  plugins: [],
};
