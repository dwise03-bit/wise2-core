'use client'

import React from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'

type ToastVariant = 'success' | 'error' | 'info' | 'warning'

interface ToastItem {
  id: string
  message: string
  title?: string
  variant: ToastVariant
  duration: number
}

interface ToastContextValue {
  toasts: ToastItem[]
  addToast: (
    message: string,
    variant?: ToastVariant,
    options?: { title?: string; duration?: number }
  ) => string
  removeToast: (id: string) => void
}

const ToastContext = React.createContext<ToastContextValue | undefined>(
  undefined
)

const variantConfig: Record<
  ToastVariant,
  { bg: string; border: string; text: string; icon: React.ReactNode }
> = {
  success: {
    bg: 'bg-wise-success/10',
    border: 'border-wise-success/40',
    text: 'text-wise-success',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M16.667 5L7.5 14.167L3.333 10"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  error: {
    bg: 'bg-wise-danger/10',
    border: 'border-wise-danger/40',
    text: 'text-wise-danger',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M15 5L5 15M5 5L15 15"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  info: {
    bg: 'bg-wise-info/10',
    border: 'border-wise-info/40',
    text: 'text-wise-info',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M10 6.667V10M10 13.333h.008M18.333 10a8.333 8.333 0 11-16.666 0 8.333 8.333 0 0116.666 0z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  warning: {
    bg: 'bg-wise-warning/10',
    border: 'border-wise-warning/40',
    text: 'text-wise-warning',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M10 7.5v3.333M10 13.75h.008M8.575 3.517L1.842 15a1.667 1.667 0 001.425 2.5h13.466a1.667 1.667 0 001.425-2.5L11.425 3.517a1.667 1.667 0 00-2.85 0z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
}

const ToastCard: React.FC<{ toast: ToastItem; onDismiss: () => void }> = ({
  toast,
  onDismiss,
}) => {
  const config = variantConfig[toast.variant]

  React.useEffect(() => {
    if (toast.duration <= 0) return
    const timer = setTimeout(onDismiss, toast.duration)
    return () => clearTimeout(timer)
  }, [toast.duration, onDismiss])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 64, scale: 0.95 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      role="status"
      aria-live="polite"
      className={`
        w-full
        max-w-sm
        pointer-events-auto
        flex
        items-start
        gap-3
        px-4
        py-3
        rounded-lg
        border
        backdrop-blur-md
        shadow-lg
        bg-wise-surface-2/95
        ${config.border}
      `}
    >
      <span className={`flex-shrink-0 mt-0.5 ${config.text}`}>{config.icon}</span>

      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className="text-sm font-semibold text-wise-text-primary">
            {toast.title}
          </p>
        )}
        <p className="text-sm text-wise-text-secondary">{toast.message}</p>
      </div>

      <motion.button
        type="button"
        onClick={onDismiss}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="
          flex-shrink-0
          min-w-8
          min-h-8
          flex
          items-center
          justify-center
          rounded-md
          text-wise-text-muted
          hover:text-wise-text-primary
          hover:bg-wise-surface/50
          transition-colors
          focus-visible:outline-none
          focus-visible:ring-2
          focus-visible:ring-wise-primary
        "
        aria-label="Dismiss notification"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.button>
    </motion.div>
  )
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = React.useState<ToastItem[]>([])
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const addToast = React.useCallback(
    (
      message: string,
      variant: ToastVariant = 'info',
      options?: { title?: string; duration?: number }
    ) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
      setToasts((prev) => [
        ...prev,
        {
          id,
          message,
          title: options?.title,
          variant,
          duration: options?.duration ?? 5000,
        },
      ])
      return id
    },
    []
  )

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const value = React.useMemo(
    () => ({ toasts, addToast, removeToast }),
    [toasts, addToast, removeToast]
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      {mounted &&
        createPortal(
          <div
            className="
              fixed
              top-4
              right-4
              z-[100]
              flex
              flex-col
              gap-3
              pointer-events-none
              w-full
              max-w-sm
            "
          >
            <AnimatePresence mode="popLayout">
              {toasts.map((toast) => (
                <ToastCard
                  key={toast.id}
                  toast={toast}
                  onDismiss={() => removeToast(toast.id)}
                />
              ))}
            </AnimatePresence>
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export default ToastProvider
