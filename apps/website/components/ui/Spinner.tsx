'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'white'
  label?: string
}

const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'primary',
  label,
}) => {
  const sizeStyles = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  const colorStyles = {
    primary: 'text-wise-primary',
    white: 'text-white',
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`relative ${sizeStyles[size]}`}
        role="status"
        aria-label={label || 'Loading'}
      >
        {/* Outer ring */}
        <motion.div
          className={`
            absolute
            inset-0
            border-2
            border-transparent
            border-t-current
            border-r-current
            rounded-full
            ${colorStyles[color]}
          `}
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        />

        {/* Inner ring */}
        <motion.div
          className={`
            absolute
            inset-2
            border-2
            border-transparent
            border-b-current
            border-l-current
            rounded-full
            ${colorStyles[color]}
            opacity-60
          `}
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />

        {/* Pulse effect */}
        <motion.div
          className={`
            absolute
            inset-0
            rounded-full
            ${colorStyles[color]}
            opacity-20
          `}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {label && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="text-sm text-wise-text-secondary"
        >
          {label}
        </motion.p>
      )}
    </div>
  )
}

Spinner.displayName = 'Spinner'

export default Spinner
