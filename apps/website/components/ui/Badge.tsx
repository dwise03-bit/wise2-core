'use client'

import React from 'react'
import { motion, MotionProps } from 'framer-motion'

interface BadgeProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, keyof MotionProps>,
    MotionProps {
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md' | 'lg'
  children?: React.ReactNode
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      variant = 'primary',
      size = 'sm',
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    const sizeStyles = {
      sm: 'px-2 py-1 text-xs',
      md: 'px-3 py-1.5 text-sm',
      lg: 'px-4 py-2 text-base',
    }

    const variantStyles = {
      primary:
        'bg-wise-primary/20 text-wise-primary border border-wise-primary/30',
      success:
        'bg-wise-success/20 text-wise-success border border-wise-success/30',
      warning:
        'bg-wise-warning/20 text-wise-warning border border-wise-warning/30',
      danger:
        'bg-wise-danger/20 text-wise-danger border border-wise-danger/30',
      info: 'bg-wise-info/20 text-wise-info border border-wise-info/30',
    }

    return (
      <motion.span
        ref={ref}
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.15 }}
        className={`
          inline-flex
          items-center
          justify-center
          font-medium
          rounded-full
          whitespace-nowrap
          transition-all
          duration-200
          ${sizeStyles[size]}
          ${variantStyles[variant]}
          ${className}
        `}
        {...props}
      >
        {children}
      </motion.span>
    )
  }
)

Badge.displayName = 'Badge'

export default Badge
