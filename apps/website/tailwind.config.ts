import sharedConfig from '@wise2/design-system/tailwind.config'
import type { Config } from 'tailwindcss'

const config: Config = {
  ...sharedConfig,
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
}

export default config
