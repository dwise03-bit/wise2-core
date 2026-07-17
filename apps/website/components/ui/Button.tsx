'use client'

import React from 'react'
import { motion, MotionProps } from 'framer-motion'

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    MotionProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      icon,
      iconPosition = 'left',
      children,
      disabled,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-wise-bg focus-visible:ring-wise-primary disabled:opacity-50 disabled:cursor-not-allowed'

    const sizeStyles = {
      sm: 'px-3 py-2 text-sm min-h-10 gap-2',
      md: 'px-4 py-3 text-base min-h-11 gap-2',
      lg: 'px-6 py-3 text-lg min-h-12 gap-2',
    }

    const variantStyles = {
      primary:
        'bg-wise-primary text-white hover:bg-wise-primary-hover active:bg-wise-primary-active shadow-glow-blue-sm hover:shadow-glow-blue-md',
      secondary:
        'bg-wise-surface-2 text-wise-text-primary border border-wise-surface hover:bg-wise-surface hover:border-wise-primary/50',
      ghost:
        'text-wise-text-primary hover:bg-wise-surface/40 active:bg-wise-surface/60',
      danger:
        'bg-wise-accent-red text-white hover:bg-red-600 active:bg-red-700 shadow-glow-blue-sm hover:shadow-glow-blue-md',
    }

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: disabled ? 1 : 1.05 }}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
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
