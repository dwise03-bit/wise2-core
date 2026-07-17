'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helpText?: string
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helpText,
      icon,
      iconPosition = 'left',
      type = 'text',
      className = '',
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = React.useState(false)

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-wise-text-primary mb-2">
            {label}
            {props.required && <span className="text-wise-accent-red ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {icon && iconPosition === 'left' && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-wise-text-muted pointer-events-none">
              {icon}
            </div>
          )}

          <motion.input
            ref={ref}
            type={type}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            animate={{
              borderColor: error
                ? '#FF0040'
                : isFocused
                  ? '#0055FF'
                  : 'rgba(13, 17, 23, 1)',
              boxShadow: error
                ? '0 0 0 3px rgba(255, 0, 64, 0.1)'
                : isFocused
                  ? '0 0 12px rgba(0, 85, 255, 0.3)'
                  : 'none',
            }}
            transition={{ duration: 0.2 }}
            className={`
              w-full
              bg-wise-surface/50
              border-2
              rounded-lg
              px-3
              py-3
              text-base
              text-wise-text-primary
              placeholder-wise-text-muted
              transition-all
              duration-200
              min-h-11
              focus-visible:outline-none
              disabled:opacity-50
              disabled:cursor-not-allowed
              ${icon && iconPosition === 'left' ? 'pl-10' : ''}
              ${icon && iconPosition === 'right' ? 'pr-10' : ''}
              ${className}
            `}
            {...props}
          />

          {icon && iconPosition === 'right' && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-wise-text-muted pointer-events-none">
              {icon}
            </div>
          )}
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-2 text-sm text-wise-accent-red"
            role="alert"
          >
            {error}
          </motion.p>
        )}

        {helpText && !error && (
          <p className="mt-2 text-sm text-wise-text-muted">{helpText}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
