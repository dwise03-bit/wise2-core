/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'jo-blue': '#0066CC',
        'jo-teal': '#00A8A8',
        'jo-success': '#00A651',
        'jo-warning': '#FFA500',
        'jo-error': '#CC0000',
      },
    },
  },
  plugins: [],
};
