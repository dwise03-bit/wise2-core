#!/usr/bin/env node

import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const outputDir = path.join(__dirname, '../dist/tokens')

// Canonical WISE² Design Tokens (from docs/DESIGN_SYSTEM.md v10.0)
const tokens = {
  colors: {
    chrome: '#E8E8E8',
    darkChrome: '#1a1a1a',
    blue: {
      500: '#00D9FF', // Electric Blue (primary)
    },
    purple: {
      500: '#B300FF', // Purple (accent)
    },
    red: {
      500: '#FF0040', // Alert red
    },
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px',
    '4xl': '80px',
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px',
    '5xl': '48px',
  },
  boxShadow: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },
  animation: {
    fadeIn: '0.3s ease-in',
    slideUp: '0.3s ease-out',
  },
}

// Generate JSON output
function generateJSON(tokens) {
  const output = {
    WISE2: {
      Color: {},
      Spacing: {},
      Radius: {},
      Typography: {},
      Shadow: {},
      Motion: {},
    },
  }

  // Flatten nested structures
  Object.entries(tokens.colors).forEach(([name, value]) => {
    if (typeof value === 'string') {
      output.WISE2.Color[name] = { value, type: 'color' }
    } else if (typeof value === 'object') {
      Object.entries(value).forEach(([shade, hex]) => {
        output.WISE2.Color[`${name}-${shade}`] = { value: hex, type: 'color' }
      })
    }
  })

  Object.entries(tokens.spacing).forEach(([name, value]) => {
    output.WISE2.Spacing[name] = { value, type: 'dimension' }
  })

  Object.entries(tokens.borderRadius).forEach(([name, value]) => {
    output.WISE2.Radius[name] = { value, type: 'dimension' }
  })

  Object.entries(tokens.fontSize).forEach(([name, value]) => {
    output.WISE2.Typography[name] = { value, type: 'typography' }
  })

  Object.entries(tokens.boxShadow).forEach(([name, value]) => {
    output.WISE2.Shadow[name] = { value, type: 'shadow' }
  })

  Object.entries(tokens.animation).forEach(([name, value]) => {
    output.WISE2.Motion[name] = { value, type: 'animation' }
  })

  fs.mkdirSync(outputDir, { recursive: true })
  fs.writeFileSync(
    path.join(outputDir, 'tokens.json'),
    JSON.stringify(output, null, 2)
  )
}

// Generate CSS custom properties export
function generateCSS(tokens) {
  let css = ':root {\n'

  Object.entries(tokens.colors).forEach(([name, value]) => {
    if (typeof value === 'string') {
      css += `  --color-${name}: ${value};\n`
    } else if (typeof value === 'object') {
      Object.entries(value).forEach(([shade, hex]) => {
        css += `  --color-${name}-${shade}: ${hex};\n`
      })
    }
  })

  Object.entries(tokens.spacing).forEach(([name, value]) => {
    css += `  --spacing-${name}: ${value};\n`
  })

  Object.entries(tokens.borderRadius).forEach(([name, value]) => {
    css += `  --radius-${name}: ${value};\n`
  })

  css += '}\n'

  fs.writeFileSync(path.join(outputDir, 'tokens.css'), css)
}

// Generate token files
generateJSON(tokens)
generateCSS(tokens)

console.log('✅ Tokens exported to dist/tokens/')
console.log('   - tokens.json (structured format)')
console.log('   - tokens.css (CSS custom properties)')
