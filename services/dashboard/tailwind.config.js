/** @type {import('tailwindcss').Config} */

// ⚠️  DO NOT define colors/spacing/brand tokens here.
// This file EXTENDS packages/ui-components/tailwind.config.ts (the single source of truth).

const uiComponentsConfig = require('./packages/ui-components/tailwind.config.ts')

module.exports = {
  presets: [uiComponentsConfig],
  content: [
    './apps/*/app/**/*.{js,ts,jsx,tsx}',
    './apps/*/components/**/*.{js,ts,jsx,tsx}',
    './packages/ui-components/src/**/*.{js,ts,jsx,tsx}',
  ],
  // Theme tokens come from the preset (ui-components)
  // Only add app-specific extensions here if absolutely necessary
  theme: {
    extend: {
      // Reserve for true app-only extensions only
      // NOT for brand colors/spacing (that lives in ui-components)
    },
  },
  plugins: [],
}
