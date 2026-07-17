module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'wise-primary': '#0034FF',
        'wise-primary-hover': '#2340FF',
        'wise-accent': '#E53935',
      },
    },
  },
  plugins: [],
};
