'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface TabItem {
  value: string
  label: string
  icon?: React.ReactNode
  disabled?: boolean
  content?: React.ReactNode
}

interface TabsProps {
  items: TabItem[]
  defaultValue?: string
  value?: string
  onChange?: (value: string) => void
  className?: string
}

const Tabs: React.FC<TabsProps> = ({
  items,
  defaultValue,
  value,
  onChange,
  className = '',
}) => {
  const [internalValue, setInternalValue] = React.useState(
    defaultValue || items[0]?.value
  )
  const isControlled = value !== undefined
  const activeValue = isControlled ? value : internalValue

  const tabRefs = React.useRef<Record<string, HTMLButtonElement | null>>({})
  const groupId = React.useId()

  const enabledItems = items.filter((item) => !item.disabled)

  const setActiveValue = (newValue: string) => {
    if (!isControlled) {
      setInternalValue(newValue)
    }
    onChange?.(newValue)
  }

  const handleKeyDown = (e: React.KeyboardEvent, currentValue: string) => {
    const currentIndex = enabledItems.findIndex(
      (item) => item.value === currentValue
    )
    let nextIndex = currentIndex

    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault()
        nextIndex = (currentIndex + 1) % enabledItems.length
        break
      case 'ArrowLeft':
        e.preventDefault()
        nextIndex = (currentIndex - 1 + enabledItems.length) % enabledItems.length
        break
      case 'Home':
        e.preventDefault()
        nextIndex = 0
        break
      case 'End':
        e.preventDefault()
        nextIndex = enabledItems.length - 1
        break
      default:
        return
    }

    const nextTab = enabledItems[nextIndex]
    if (nextTab) {
      setActiveValue(nextTab.value)
      tabRefs.current[nextTab.value]?.focus()
    }
  }

  const activeContent = items.find((item) => item.value === activeValue)?.content

  return (
    <div className={className}>
      <div
        role="tablist"
        aria-orientation="horizontal"
        className="
          relative
          flex
          items-center
          gap-1
          p-1
          bg-wise-surface/50
          border
          border-wise-surface
          rounded-lg
          w-fit
          max-w-full
          overflow-x-auto
        "
      >
        {items.map((item) => {
          const isActive = item.value === activeValue
          const tabId = `${groupId}-tab-${item.value}`
          const panelId = `${groupId}-panel-${item.value}`

          return (
            <button
              key={item.value}
              ref={(el) => {
                tabRefs.current[item.value] = el
              }}
              id={tabId}
              role="tab"
              type="button"
              aria-selected={isActive}
              aria-controls={panelId}
              tabIndex={isActive ? 0 : -1}
              disabled={item.disabled}
              onClick={() => !item.disabled && setActiveValue(item.value)}
              onKeyDown={(e) => handleKeyDown(e, item.value)}
              className={`
                relative
                z-10
                flex
                items-center
                gap-2
                px-4
                py-2.5
                min-h-11
                text-sm
                font-medium
                whitespace-nowrap
                rounded-md
                transition-colors
                duration-200
                disabled:opacity-40
                disabled:cursor-not-allowed
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-wise-primary
                ${
                  isActive
                    ? 'text-white'
                    : 'text-wise-text-secondary hover:text-wise-text-primary'
                }
              `}
            >
              {isActive && (
                <motion.div
                  layoutId={`${groupId}-active-tab`}
                  className="absolute inset-0 bg-wise-primary rounded-md shadow-glow-blue-sm -z-10"
                  transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                />
              )}
              {item.icon && <span>{item.icon}</span>}
              {item.label}
            </button>
          )
        })}
      </div>

      {items.some((item) => item.content) && (
        <div className="mt-4">
          <AnimatePresence mode="wait">
            {items.map(
              (item) =>
                item.value === activeValue && (
                  <motion.div
                    key={item.value}
                    id={`${groupId}-panel-${item.value}`}
                    role="tabpanel"
                    aria-labelledby={`${groupId}-tab-${item.value}`}
                    tabIndex={0}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="focus-visible:outline-none"
                  >
                    {item.content}
                  </motion.div>
                )
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

Tabs.displayName = 'Tabs'

export default Tabs
