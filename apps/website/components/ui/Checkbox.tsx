'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  description?: string
  size?: 'sm' | 'md' | 'lg'
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      description,
      size = 'md',
      className = '',
      ...props
    },
    ref
  ) => {
    const [isChecked, setIsChecked] = React.useState(props.checked)

    const sizeStyles = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
    }

    const labelSizeStyles = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setIsChecked(e.target.checked)
      props.onChange?.(e)
    }

    return (
      <div className="flex items-start gap-3">
        <div className="flex items-center min-h-11 min-w-11 justify-center">
          <input
            ref={ref}
            type="checkbox"
            checked={isChecked}
            onChange={handleChange}
            className="sr-only"
            {...props}
          />

          <motion.div
            className={`
              relative
              ${sizeStyles[size]}
              bg-wise-surface/50
              border-2
              border-wise-surface
              rounded-md
              cursor-pointer
              transition-all
              duration-200
              flex
              items-center
              justify-center
              hover:border-wise-primary/50
              focus-visible:ring-2
              focus-visible:ring-wise-primary
              focus-visible:ring-offset-2
              focus-visible:ring-offset-wise-bg
            `}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              const input = ref as React.RefObject<HTMLInputElement>
              if (input.current) {
                input.current.click()
              }
            }}
            animate={{
              backgroundColor: isChecked ? '#0055FF' : 'rgba(13, 17, 23, 0.5)',
              borderColor: isChecked ? '#0055FF' : 'rgb(19, 25, 34)',
            }}
            transition={{ duration: 0.2 }}
          >
            {isChecked && (
              <motion.svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <path
                  d="M2 8L6 12L14 4"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </motion.svg>
            )}
          </motion.div>
        </div>

        {(label || description) && (
          <div className="flex-1 pt-1">
            {label && (
              <label
                htmlFor={props.id}
                className={`${labelSizeStyles[size]} font-medium text-wise-text-primary block cursor-pointer`}
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-sm text-wise-text-muted mt-1">{description}</p>
            )}
          </div>
        )}
      </div>
    )
  }
)

Checkbox.displayName = 'Checkbox'

export default Checkbox
