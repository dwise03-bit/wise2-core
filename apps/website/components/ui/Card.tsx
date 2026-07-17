'use client'

import React from 'react'
import { motion, MotionProps } from 'framer-motion'

interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    MotionProps {
  variant?: 'glass' | 'metal'
  hoverable?: boolean
  children?: React.ReactNode
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'glass',
      hoverable = false,
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'rounded-lg overflow-hidden transition-all duration-300 backdrop-blur-md'

    const variantStyles = {
      glass:
        'bg-wise-card/40 border border-wise-surface/50 shadow-lg hover:shadow-xl hover:border-wise-primary/30',
      metal:
        'bg-gradient-to-br from-wise-surface-2 to-wise-card border border-wise-surface/40 shadow-lg hover:shadow-xl hover:from-wise-surface hover:to-wise-surface-2',
    }

    return (
      <motion.div
        ref={ref}
        whileHover={
          hoverable ? { y: -4, boxShadow: '0 20px 25px rgba(0, 85, 255, 0.1)' } : {}
        }
        transition={{ duration: 0.2 }}
        className={`${baseStyles} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)

Card.displayName = 'Card'

export default Card
