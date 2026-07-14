import type { Config } from 'tailwindcss'
import sharedConfig from '../../packages/design-system/tailwind.config'

const config: Config = {
  presets: [sharedConfig as any],
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
}

export default config
