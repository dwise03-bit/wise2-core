/**
 * WISE² Card Component (Redesigned)
 *
 * Enhanced card with glassmorphism, glow effects, and command center aesthetic.
 */

import React, { HTMLAttributes, forwardRef } from 'react'

type CardVariant = 'default' | 'glass' | 'glass-primary' | 'glass-cyan' | 'elevated' | 'flat'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
  interactive?: boolean
  glow?: boolean
}

const variantStyles: Record<CardVariant, string> = {
  // Default - Soft surface with subtle border
  default: `
    bg-wise-surface-2/50 backdrop-blur-sm
    border border-wise-primary/15
    shadow-card
    hover:border-wise-primary/30 hover:bg-wise-surface-2/70
  `,

  // Glass - Premium glassmorphism effect
  glass: `
    bg-wise-surface-2/60 backdrop-blur-md
    border border-wise-primary/20
    shadow-card-lg
    hover:border-wise-primary/40 hover:bg-wise-surface-2/80
  `,

  // Glass Primary - Blue-tinted glassmorphism with glow
  'glass-primary': `
    bg-wise-surface-2/65 backdrop-blur-lg
    border border-wise-primary/30
    shadow-glow-blue-sm
    hover:border-wise-primary/50 hover:bg-wise-surface-2/85
    hover:shadow-glow-blue-md
  `,

  // Glass Cyan - Cyan-tinted glassmorphism
  'glass-cyan': `
    bg-wise-surface-2/65 backdrop-blur-lg
    border border-wise-cyan/25
    shadow-glow-cyan-sm
    hover:border-wise-cyan/40 hover:bg-wise-surface-2/85
    hover:shadow-glow-cyan-md
  `,

  // Elevated - Strong shadow with depth
  elevated: `
    bg-wise-surface-2/80 backdrop-blur-md
    border border-wise-primary/25
    shadow-card-lg
    hover:border-wise-primary/40 hover:shadow-glow-blue-md
  `,

  // Flat - Minimal style
  flat: `
    bg-wise-surface-2/40
    border border-wise-primary/10
    hover:border-wise-primary/20 hover:bg-wise-surface-2/60
  `,
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', interactive = false, glow = false, className, children, ...props }, ref) => {
    const baseStyles = `
      rounded-lg transition-all duration-300
      ${interactive ? 'hover:scale-[1.02] cursor-pointer' : ''}
      ${glow && variant.includes('primary') ? 'shadow-glow-blue-lg' : ''}
    `

    return (
      <div
        ref={ref}
        className={`
          ${baseStyles}
          ${variantStyles[variant]}
          ${className || ''}
        `}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

/**
 * CardContent - Helper component for padding
 */
export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={`p-6 ${className || ''}`} {...props}>
      {children}
    </div>
  )
)

CardContent.displayName = 'CardContent'

/**
 * CardHeader - Helper component for header section
 */
export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={`px-6 py-4 border-b border-wise-primary/15 ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  )
)

CardHeader.displayName = 'CardHeader'

/**
 * CardFooter - Helper component for footer section
 */
export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={`px-6 py-4 border-t border-wise-primary/15 ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  )
)

CardFooter.displayName = 'CardFooter'
