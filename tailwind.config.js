/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    './apps/*/src/**/*.{js,ts,jsx,tsx}',
    './apps/*/app/**/*.{js,ts,jsx,tsx}',
    './apps/*/components/**/*.{js,ts,jsx,tsx}',
    './packages/ui-components/src/**/*.{js,ts,jsx,tsx}',
    './packages/ui-components/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {},
  plugins: [],
}
