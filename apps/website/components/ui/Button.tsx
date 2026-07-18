'use client'

import React from 'react'
import { motion, MotionProps } from 'framer-motion'

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    MotionProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'success'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  isLoading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  glow?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      icon,
      iconPosition = 'left',
      glow = variant === 'primary',
      children,
      disabled,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-bold transition-all rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-wise-bg focus-visible:ring-wise-primary disabled:opacity-50 disabled:cursor-not-allowed'

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-xs min-h-9 gap-2',
      md: 'px-4 py-2.5 text-sm min-h-11 gap-2',
      lg: 'px-6 py-3 text-base min-h-12 gap-2',
      xl: 'px-8 py-4 text-lg min-h-14 gap-2',
    }

    const variantStyles = {
      // Primary - Bold gradient with blue glow
      primary: `
        bg-gradient-to-r from-wise-primary to-blue-600
        text-white border border-wise-primary/50
        hover:border-wise-primary hover:shadow-glow-blue-md
        active:shadow-glow-blue-sm
        ${glow ? 'shadow-glow-blue-lg hover:shadow-glow-blue-xl' : ''}
      `,

      // Secondary - Glassmorphism
      secondary: `
        bg-wise-surface-2/60 backdrop-blur-md
        text-wise-text-primary border border-wise-primary/20
        hover:border-wise-primary/40 hover:bg-wise-surface-2/80
        hover:shadow-glow-blue-sm
      `,

      // Ghost - Minimal
      ghost: `
        text-wise-text-secondary
        hover:text-wise-text-primary hover:bg-wise-surface/40
        active:bg-wise-surface/60
      `,

      // Danger - Red gradient with glow
      danger: `
        bg-gradient-to-r from-wise-danger to-red-700
        text-white border border-wise-danger/50
        hover:border-wise-danger hover:shadow-glow-red-md
        active:shadow-glow-red-sm
      `,

      // Outline - Bordered primary
      outline: `
        text-wise-primary border border-wise-primary
        hover:border-wise-primary hover:bg-wise-primary/5
        hover:shadow-glow-blue-sm
      `,

      // Success - Green gradient
      success: `
        bg-gradient-to-r from-wise-success to-green-600
        text-white border border-wise-success/50
        hover:border-wise-success hover:shadow-lg
      `,
    }

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: disabled ? 1 : 1.05, y: disabled ? 0 : -2 }}
        whileTap={{ scale: disabled ? 1 : 0.95, y: 0 }}
        transition={{ duration: 0.15 }}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
        aria-busy={isLoading}
        aria-disabled={disabled}
        {...props}
      >
        {isLoading ? (
          <>
            <motion.div
              className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
            />
            {children && <span>{children}</span>}
          </>
        ) : (
          <>
            {icon && iconPosition === 'left' && <span>{icon}</span>}
            {children && <span>{children}</span>}
            {icon && iconPosition === 'right' && <span>{icon}</span>}
          </>
        )}
      </motion.button>
    )
  }
)

Button.displayName = 'Button'

export default Button
