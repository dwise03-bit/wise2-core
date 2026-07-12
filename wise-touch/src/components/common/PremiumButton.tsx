'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface PremiumButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  icon?: LucideIcon
  iconPosition?: 'left' | 'right'
  isLoading?: boolean
  isActive?: boolean
  children: React.ReactNode
  fullWidth?: boolean
  premium?: boolean
}

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-base',
  lg: 'px-6 py-3 text-base',
  xl: 'px-8 py-4 text-lg',
}

const variantStyles = {
  primary: {
    base: 'bg-blue-electric text-bg-primary font-semibold',
    hover: 'hover:bg-blue-electric/90 hover:shadow-lg',
    active: 'active:scale-95',
  },
  secondary: {
    base: 'bg-bg-tertiary/50 text-chrome-light font-semibold border border-steel/30 backdrop-blur-sm',
    hover: 'hover:bg-bg-tertiary/70 hover:border-steel/50',
    active: 'active:bg-bg-tertiary/60',
  },
  ghost: {
    base: 'text-chrome-light font-semibold',
    hover: 'hover:bg-white/5',
    active: 'active:bg-white/10',
  },
  outline: {
    base: 'border border-blue-electric text-blue-electric font-semibold',
    hover: 'hover:bg-blue-electric/10 hover:border-blue-electric/80',
    active: 'active:bg-blue-electric/20',
  },
}

export const PremiumButton = React.forwardRef<HTMLButtonElement, PremiumButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      icon: Icon,
      iconPosition = 'left',
      isLoading = false,
      isActive = false,
      children,
      fullWidth = false,
      premium = true,
      className = '',
      disabled = false,
      ...props
    },
    ref
  ) => {
    const loadingVariants = {
      spin: {
        rotate: 360,
        transition: { duration: 2, repeat: Infinity, ease: 'linear' },
      },
    }

    const styles = variantStyles[variant]

    return (
      <motion.div
        whileHover={!disabled ? { scale: 1.02 } : undefined}
        whileTap={!disabled ? { scale: 0.98 } : undefined}
        className={fullWidth ? 'w-full' : 'inline-block'}
      >
        <button
          ref={ref}
          className={`
            inline-flex items-center justify-center gap-2 rounded-lg
            transition-all duration-200 ease-out
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-electric
            disabled:opacity-50 disabled:cursor-not-allowed
            ${sizeStyles[size]}
            ${styles.base}
            ${!disabled ? `${styles.hover} ${styles.active}` : ''}
            ${fullWidth ? 'w-full' : ''}
            ${isActive ? 'ring-2 ring-blue-electric' : ''}
            ${premium ? 'font-medium' : ''}
            ${className}
          `}
          disabled={disabled || isLoading}
          {...props}
        >
          {isLoading ? (
            <motion.div
              variants={loadingVariants}
              animate="spin"
              className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
            />
          ) : Icon && iconPosition === 'left' ? (
            <motion.div
              whileHover={!disabled ? { x: -2 } : undefined}
              transition={{ duration: 0.2 }}
            >
              <Icon size={18} />
            </motion.div>
          ) : null}

          <span>{children}</span>

          {!isLoading && Icon && iconPosition === 'right' && (
            <motion.div
              whileHover={!disabled ? { x: 2 } : undefined}
              transition={{ duration: 0.2 }}
            >
              <Icon size={18} />
            </motion.div>
          )}
        </button>
      </motion.div>
    )
  }
)

PremiumButton.displayName = 'PremiumButton'
