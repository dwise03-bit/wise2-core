'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface SwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: string
  description?: string
  size?: 'sm' | 'md' | 'lg'
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
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
      sm: { track: 'w-10 h-5', thumb: 'w-4 h-4', translate: 'translate-x-5' },
      md: { track: 'w-12 h-6', thumb: 'w-5 h-5', translate: 'translate-x-6' },
      lg: { track: 'w-14 h-7', thumb: 'w-6 h-6', translate: 'translate-x-7' },
    }

    const current = sizeStyles[size]

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
              ${current.track}
              rounded-full
              cursor-pointer
              transition-all
              duration-200
              flex
              items-center
              bg-wise-surface-2
              border
              border-wise-surface
              hover:border-wise-primary/50
              focus-visible:ring-2
              focus-visible:ring-wise-primary
              focus-visible:ring-offset-2
              focus-visible:ring-offset-wise-bg
            `}
            onClick={() => {
              const input = ref as React.RefObject<HTMLInputElement>
              if (input.current) {
                input.current.click()
              }
            }}
            animate={{
              backgroundColor: isChecked ? '#0055FF' : 'rgb(19, 25, 34)',
              borderColor: isChecked ? '#0055FF' : 'rgb(19, 25, 34)',
            }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className={`
                ${current.thumb}
                bg-white
                rounded-full
                absolute
                left-1
                shadow-lg
              `}
              animate={{
                x: isChecked ? current.translate : 0,
              }}
              transition={{ type: 'spring', stiffness: 500, damping: 40 }}
            />
          </motion.div>
        </div>

        {(label || description) && (
          <div className="flex-1 pt-1">
            {label && (
              <label
                htmlFor={props.id}
                className="text-base font-medium text-wise-text-primary block cursor-pointer"
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

Switch.displayName = 'Switch'

export default Switch
