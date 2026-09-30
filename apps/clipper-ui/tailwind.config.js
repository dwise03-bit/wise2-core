/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        wise: {
          navy: "#050607",
          cyan: "#00D9FF",
          neon: "#00FF7F",
          gold: "#C4A369",
        },
      },
    },
  },
  plugins: [],
};
