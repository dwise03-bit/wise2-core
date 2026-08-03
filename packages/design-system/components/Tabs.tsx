/**
 * WISE² Tabs Component
 *
 * Tabbed content interface with keyboard navigation support.
 */

import React, { HTMLAttributes, ReactNode, forwardRef, useState } from 'react'

interface TabItem {
  id: string
  label: string
  content: ReactNode
  icon?: ReactNode
  disabled?: boolean
}

interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  tabs: TabItem[]
  defaultTab?: string
  onChange?: (tabId: string) => void
}

export const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  ({ tabs, defaultTab, onChange, className, ...props }, ref) => {
    const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id)

    const handleTabChange = (tabId: string) => {
      if (!tabs.find((t) => t.id === tabId)?.disabled) {
        setActiveTab(tabId)
        onChange?.(tabId)
      }
    }

    const handleKeyDown = (e: React.KeyboardEvent, tabId: string) => {
      const enabledTabs = tabs.filter((t) => !t.disabled)
      const currentIndex = enabledTabs.findIndex((t) => t.id === tabId)

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        const nextTab = enabledTabs[(currentIndex + 1) % enabledTabs.length]
        handleTabChange(nextTab.id)
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        const prevTab = enabledTabs[(currentIndex - 1 + enabledTabs.length) % enabledTabs.length]
        handleTabChange(prevTab.id)
      } else if (e.key === 'Home') {
        e.preventDefault()
        handleTabChange(enabledTabs[0].id)
      } else if (e.key === 'End') {
        e.preventDefault()
        handleTabChange(enabledTabs[enabledTabs.length - 1].id)
      }
    }

    const activeContent = tabs.find((t) => t.id === activeTab)?.content

    return (
      <div ref={ref} className={className} {...props}>
        <div
          role="tablist"
          className="flex border-b border-wise-border-medium overflow-x-auto"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`panel-${tab.id}`}
              disabled={tab.disabled}
              onClick={() => handleTabChange(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, tab.id)}
              className={`
                px-4 py-3 text-sm font-semibold whitespace-nowrap
                transition-all duration-200
                focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wise-primary
                ${
                  tab.disabled
                    ? 'opacity-50 cursor-not-allowed text-wise-text-muted'
                    : activeTab === tab.id
                      ? 'text-wise-primary border-b-2 border-wise-primary -mb-px'
                      : 'text-wise-text-secondary hover:text-wise-text-primary'
                }
              `}
            >
              <div className="flex items-center gap-2">
                {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
                {tab.label}
              </div>
            </button>
          ))}
        </div>

        <div
          id={`panel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={`tab-${activeTab}`}
          className="pt-4"
        >
          {activeContent}
        </div>
      </div>
    )
  }
)

Tabs.displayName = 'Tabs'
