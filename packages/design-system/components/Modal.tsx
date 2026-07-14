/**
 * WISE² Modal Component
 *
 * Accessible dialog/modal with backdrop and proper focus management.
 */

import React, { HTMLAttributes, ReactNode, forwardRef, useEffect, useRef } from 'react'

interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
  closeButton?: boolean
  footer?: ReactNode
}

const sizeStyles = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
}

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  ({ isOpen, onClose, title, children, size = 'md', closeButton = true, footer, className, ...props }, ref) => {
    const modalRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      if (!isOpen) return

      // Focus on modal when opened
      modalRef.current?.focus()

      // Handle escape key
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose()
        }
      }

      // Trap focus within modal
      const handleTabKey = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return

        const focusableElements = modalRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (!focusableElements || focusableElements.length === 0) return

        const firstElement = focusableElements[0] as HTMLElement
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus()
            e.preventDefault()
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus()
            e.preventDefault()
          }
        }
      }

      window.addEventListener('keydown', handleEscape)
      window.addEventListener('keydown', handleTabKey)

      return () => {
        window.removeEventListener('keydown', handleEscape)
        window.removeEventListener('keydown', handleTabKey)
      }
    }, [isOpen, onClose])

    if (!isOpen) return null

    return (
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-modal-backdrop"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Modal */}
        <div className="fixed inset-0 flex items-center justify-center p-4 z-modal">
          <div
            ref={(node) => {
              (modalRef as React.MutableRefObject<HTMLDivElement | null>).current = node
              if (typeof ref === 'function') ref(node)
              else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'modal-title' : undefined}
            className={`
              bg-wise-card border border-wise-border-medium
              rounded-base shadow-xlarge
              w-full ${sizeStyles[size]}
              max-h-[90vh] overflow-y-auto
              focus:outline-none
              ${className || ''}
            `}
            {...props}
          >
            {/* Header */}
            {(title || closeButton) && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-wise-border-subtle">
                {title && (
                  <h2 id="modal-title" className="text-lg font-bold text-wise-text-primary">
                    {title}
                  </h2>
                )}
                {closeButton && (
                  <button
                    onClick={onClose}
                    className="text-wise-text-muted hover:text-wise-text-primary transition-colors focus-visible:outline-2 focus-visible:outline-wise-primary"
                    aria-label="Close modal"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                )}
              </div>
            )}

            {/* Content */}
            <div className="px-6 py-4">{children}</div>

            {/* Footer */}
            {footer && (
              <div className="px-6 py-4 border-t border-wise-border-subtle bg-wise-surface/50">
                {footer}
              </div>
            )}
          </div>
        </div>
      </>
    )
  }
)

Modal.displayName = 'Modal'
