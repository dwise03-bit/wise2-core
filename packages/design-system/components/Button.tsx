/**
 * WISE² Button Component (Redesigned)
 *
 * Enhanced button with glassmorphism, glow effects, and command center aesthetic.
 * Supports multiple variants with modern design system tokens.
 */

import React, { ButtonHTMLAttributes, forwardRef } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'ghost' | 'outline'
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  fullWidth?: boolean
  glow?: boolean
}

const variantStyles: Record<ButtonVariant, string> = {
  // Primary - Bold blue gradient with glow
  primary: `
    bg-gradient-to-r from-wise-primary to-blue-600
    text-white font-bold
    border border-wise-primary/50
    hover:border-wise-primary
    hover:shadow-glow-blue-md
    active:shadow-glow-blue-sm
    transition-all duration-300
  `,

  // Secondary - Glassmorphism style
  secondary: `
    bg-wise-surface-2/60 backdrop-blur-md
    text-wise-text-primary font-semibold
    border border-wise-primary/20
    hover:border-wise-primary/40
    hover:bg-wise-surface-2/80
    hover:shadow-glow-blue-sm
    transition-all duration-300
  `,

  // Danger - Red with glow
  danger: `
    bg-gradient-to-r from-wise-danger to-red-700
    text-white font-bold
    border border-wise-danger/50
    hover:border-wise-danger
    hover:shadow-glow-red-md
    active:shadow-glow-red-sm
    transition-all duration-300
  `,

  // Success - Green gradient
  success: `
    bg-gradient-to-r from-wise-success to-green-600
    text-white font-bold
    border border-wise-success/50
    hover:border-wise-success
    hover:shadow-lg
    transition-all duration-300
  `,

  // Ghost - Minimal style
  ghost: `
    bg-transparent
    text-wise-text-secondary font-semibold
    border border-wise-text-secondary/30
    hover:border-wise-text-secondary/60
    hover:text-wise-text-primary
    hover:bg-wise-surface/30
    transition-all duration-300
  `,

  // Outline - Bordered style
  outline: `
    bg-transparent
    text-wise-primary font-semibold
    border border-wise-primary
    hover:border-wise-primary
    hover:bg-wise-primary/5
    hover:shadow-glow-blue-sm
    transition-all duration-300
  `,
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs font-medium rounded-md',
  md: 'px-4 py-2.5 text-sm font-semibold rounded-lg',
  lg: 'px-6 py-3 text-base font-bold rounded-lg',
  xl: 'px-8 py-4 text-lg font-bold rounded-xl',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      fullWidth = false,
      glow = false,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      inline-flex items-center justify-center gap-2
      font-sans cursor-pointer
      focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wise-primary
      disabled:opacity-50 disabled:cursor-not-allowed
      ${fullWidth ? 'w-full' : ''}
      ${glow && variant === 'primary' ? 'shadow-glow-blue-lg hover:shadow-glow-blue-xl' : ''}
    `

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`
          ${baseStyles}
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${className || ''}
        `}
        {...props}
      >
        {isLoading ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span>Loading...</span>
          </>
        ) : (
          children
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'
