/**
 * WISE² Button Component
 *
 * Reusable button with multiple variants and sizes.
 * Uses design system tokens for all styling.
 */

import React, { ButtonHTMLAttributes, forwardRef } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  fullWidth?: boolean
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: `
    bg-wise-primary hover:bg-wise-primary-hover active:bg-wise-primary-active
    text-black font-bold
    transition-colors duration-200
  `,
  secondary: `
    bg-wise-surface-2 hover:bg-wise-surface border border-wise-border-medium
    text-wise-text-primary
    transition-colors duration-200
  `,
  danger: `
    bg-wise-danger hover:bg-wise-accent-red
    text-white font-bold
    transition-colors duration-200
  `,
  ghost: `
    bg-transparent border border-wise-border-subtle hover:border-wise-border-medium
    text-wise-text-secondary hover:text-wise-text-primary
    transition-colors duration-200
  `,
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs font-medium rounded-xs',
  md: 'px-4 py-2 text-sm font-semibold rounded-sm',
  lg: 'px-6 py-3 text-base font-bold rounded-base',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      fullWidth = false,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      inline-flex items-center justify-center gap-2
      font-sans font-bold uppercase tracking-wider
      focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wise-primary
      disabled:opacity-50 disabled:cursor-not-allowed
      ${fullWidth ? 'w-full' : ''}
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
            Loading...
          </>
        ) : (
          children
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'
