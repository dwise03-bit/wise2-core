import * as React from 'react'
import { Icon } from '../atoms/Icon'

export interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      open,
      onOpenChange,
      title,
      description,
      children,
      footer,
      className = '',
      ...props
    },
    ref
  ) => {
    if (!open) return null

    return (
      <>
        {/* Overlay */}
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => onOpenChange(false)}
        />

        {/* Modal */}
        <div
          ref={ref}
          className={`fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-gray-700 bg-black shadow-xl ${className}`}
          {...props}
        >
          {/* Header */}
          {(title || description) && (
            <div className="border-b border-gray-700 px-6 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  {title && (
                    <h2 className="text-lg font-semibold text-chrome">
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p className="mt-1 text-sm text-chrome/60">
                      {description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => onOpenChange(false)}
                  className="text-chrome/50 hover:text-chrome"
                >
                  <Icon name="X" size={20} />
                </button>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="px-6 py-4">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="border-t border-gray-700 px-6 py-4">
              {footer}
            </div>
          )}
        </div>
      </>
    )
  }
)

Modal.displayName = 'Modal'
