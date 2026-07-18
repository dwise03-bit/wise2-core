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
          <label className="block text-sm font-medium text-wise-text-primary mb-2.5">
            {label}
            {props.required && <span className="text-wise-danger ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {icon && iconPosition === 'left' && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-wise-text-muted pointer-events-none transition-colors duration-200">
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
                ? 'rgba(255, 0, 64, 0.6)'
                : isFocused
                  ? 'rgba(0, 85, 255, 0.6)'
                  : 'rgba(0, 85, 255, 0.15)',
              backgroundColor: isFocused
                ? 'rgba(13, 17, 23, 0.8)'
                : 'rgba(13, 17, 23, 0.5)',
              boxShadow: error
                ? '0 0 12px rgba(255, 0, 64, 0.2), inset 0 0 8px rgba(255, 0, 64, 0.05)'
                : isFocused
                  ? '0 0 24px rgba(0, 85, 255, 0.3), inset 0 0 12px rgba(0, 85, 255, 0.1)'
                  : 'inset 0 0 8px rgba(0, 0, 0, 0.2)',
            }}
            transition={{ duration: 0.2 }}
            className={`
              w-full
              backdrop-blur-sm
              border
              rounded-lg
              px-4
              py-3
              text-base
              text-wise-text-primary
              placeholder-wise-text-muted/60
              transition-all
              duration-200
              min-h-12
              focus-visible:outline-none
              disabled:opacity-50
              disabled:cursor-not-allowed
              ${icon && iconPosition === 'left' ? 'pl-11' : ''}
              ${icon && iconPosition === 'right' ? 'pr-11' : ''}
              ${className}
            `}
            {...props}
          />

          {icon && iconPosition === 'right' && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-wise-text-muted pointer-events-none transition-colors duration-200">
              {icon}
            </div>
          )}
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-2 text-sm text-wise-danger flex items-center gap-1"
            role="alert"
          >
            <span className="text-lg">⚠</span>
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
