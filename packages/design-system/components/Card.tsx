/**
 * WISE² Card Component
 *
 * Reusable card container with glass morphism and elevation support.
 */

import React, { HTMLAttributes, forwardRef } from 'react'

type CardVariant = 'default' | 'glass' | 'elevated'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
  interactive?: boolean
}

const variantStyles: Record<CardVariant, string> = {
  default: `
    bg-wise-card border border-wise-border-subtle
    shadow-small
  `,
  glass: `
    bg-wise-surface/80 backdrop-blur-lg border border-wise-border-subtle
    shadow-medium
  `,
  elevated: `
    bg-wise-card border border-wise-border-medium
    shadow-large
  `,
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', interactive = false, className, children, ...props }, ref) => {
    const baseStyles = `
      rounded-base transition-all duration-200
      ${interactive ? 'hover:border-wise-border-strong hover:shadow-medium cursor-pointer' : ''}
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
    <div ref={ref} className={`px-6 py-4 border-b border-wise-border-subtle ${className || ''}`} {...props}>
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
    <div ref={ref} className={`px-6 py-4 border-t border-wise-border-subtle ${className || ''}`} {...props}>
      {children}
    </div>
  )
)

CardFooter.displayName = 'CardFooter'
