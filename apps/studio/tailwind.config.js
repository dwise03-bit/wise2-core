module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // WISE² Brand Colors (Official Design System)
        'wise-bg': '#050505',
        'wise-surface': '#0D1117',
        'wise-surface-secondary': '#131922',
        'wise-card': '#10151D',
        'wise-text-primary': '#FFFFFF',
        'wise-text-secondary': '#C9CED6',
        'wise-text-muted': '#8D98A5',
        // NOTE: per WISE2_DESIGN_SYSTEM.md, #0094FF is the *Info* status color,
        // not the brand accent. It is retained here as `wise-primary` because
        // ~97 existing usages depend on it. New Creative Studio surfaces use
        // `wise-accent` (neon green) below, which is the canonical brand accent.
        'wise-primary': '#0094FF',
        'wise-primary-hover': '#32A8FF',
        'wise-primary-active': '#0075CC',
        'wise-accent-red': '#E53935',
        'wise-accent-green': '#22C55E',
        'wise-accent-orange': '#F59E0B',

        // Creative Studio — canonical brand accent (WISE2_DESIGN_SYSTEM.md)
        'wise-accent': 'var(--acc, #39FF14)',
        'wise-accent-dim': '#1f4d18',
        'wise-accent-soft': '#9be07c',
        'wise-accent-bright': '#b6ff9e',
        'wise-chrome': '#BFC4C9',

        // Creative Studio surfaces (denser/darker than the marketing scale)
        'studio-bg': '#050505',
        'studio-panel': '#0a0a0a',
        'studio-raised': '#111111',
        'studio-input': '#161616',
        'studio-line': '#262626',
        'studio-line-soft': '#1f1f1f',
        'studio-meter-off': '#181818',
      },
      backgroundColor: {
        'wise-primary': '#0094FF',
      },
      borderColor: {
        'wise-subtle': 'rgba(255, 255, 255, 0.08)',
        'wise-medium': 'rgba(255, 255, 255, 0.12)',
        'wise-strong': 'rgba(255, 255, 255, 0.20)',
      },
      fontFamily: {
        display: ["'Orbitron'", 'sans-serif'],
        studio: ["'Rajdhani'", 'sans-serif'],
      },
      keyframes: {
        w2pulse: {
          '0%,100%': { boxShadow: '0 0 6px rgba(57,255,20,.35)' },
          '50%': { boxShadow: '0 0 18px rgba(57,255,20,.7)' },
        },
        w2blink: {
          '0%,100%': { opacity: '1' },
          '50%': { opacity: '.25' },
        },
        w2rise: {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'none' },
        },
        w2ticker: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        w2pulse: 'w2pulse 2s ease-in-out infinite',
        w2blink: 'w2blink 1.2s ease-in-out infinite',
        w2rise: 'w2rise .22s ease-out both',
        w2ticker: 'w2ticker 30s linear infinite',
      },
    },
  },
  plugins: [],
};
