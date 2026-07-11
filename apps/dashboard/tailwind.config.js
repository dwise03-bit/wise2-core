/** @type {import('tailwindcss').Config} */

// Extend the canonical WISE² design tokens from @wise2/ui-components
const uiComponentsConfig = require('../../packages/ui-components/tailwind.config.ts')

module.exports = {
  presets: [uiComponentsConfig],
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    '../../packages/ui-components/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      // Dashboard-specific theme extensions (if any)
      // Brand tokens come from the preset
    },
}
