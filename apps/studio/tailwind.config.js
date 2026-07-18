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
        'wise-primary': '#0094FF',
        'wise-primary-hover': '#32A8FF',
        'wise-primary-active': '#0075CC',
        'wise-accent-red': '#E53935',
        'wise-accent-green': '#22C55E',
        'wise-accent-orange': '#F59E0B',
      },
      backgroundColor: {
        'wise-primary': '#0094FF',
      },
      borderColor: {
        'wise-subtle': 'rgba(255, 255, 255, 0.08)',
        'wise-medium': 'rgba(255, 255, 255, 0.12)',
        'wise-strong': 'rgba(255, 255, 255, 0.20)',
      },
    },
  },
  plugins: [],
};
