'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface PanelProps {
  title: string
  subtitle?: string
  defaultOpen?: boolean
  children?: React.ReactNode
  icon?: React.ReactNode
  className?: string
  onToggle?: (isOpen: boolean) => void
}

const Panel: React.FC<PanelProps> = ({
  title,
  subtitle,
  defaultOpen = false,
  children,
  icon,
  className = '',
  onToggle,
}) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)
  const contentId = React.useId()

  const handleToggle = () => {
    const newState = !isOpen
    setIsOpen(newState)
    onToggle?.(newState)
  }

  return (
    <div
      className={`
        bg-wise-card/40
        border
        border-wise-surface/50
        rounded-lg
        overflow-hidden
        backdrop-blur-md
        transition-all
        duration-300
        ${className}
      `}
    >
      <motion.button
        type="button"
        onClick={handleToggle}
        whileHover={{ backgroundColor: 'rgba(0, 85, 255, 0.05)' }}
        transition={{ duration: 0.15 }}
        className="
          w-full
          px-4
          py-4
          flex
          items-center
          justify-between
          gap-3
          text-left
          min-h-11
          focus-visible:outline-none
          focus-visible:ring-2
          focus-visible:ring-wise-primary
          focus-visible:ring-inset
        "
        aria-expanded={isOpen}
        aria-controls={contentId}
      >
        <div className="flex items-center gap-3 flex-1">
          {icon && <span className="text-wise-primary">{icon}</span>}
          <div>
            <h3 className="text-base font-semibold text-wise-text-primary">
              {title}
            </h3>
            {subtitle && (
              <p className="text-sm text-wise-text-muted mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>

        <motion.svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-wise-text-muted flex-shrink-0"
        >
          <path
            d="M5 7.5L10 12.5L15 7.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </motion.svg>
      </motion.button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={contentId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 border-t border-wise-surface/30">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

Panel.displayName = 'Panel'

export default Panel
