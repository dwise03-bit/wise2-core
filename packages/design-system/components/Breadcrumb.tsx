/**
 * WISE² Breadcrumb Component
 *
 * Navigation path showing current location in hierarchy.
 */

import React, { HTMLAttributes, forwardRef } from 'react'

interface BreadcrumbItem {
  label: string
  href?: string
  current?: boolean
}

interface BreadcrumbProps extends HTMLAttributes<HTMLDivElement> {
  items: BreadcrumbItem[]
}

export const Breadcrumb = forwardRef<HTMLDivElement, BreadcrumbProps>(
  ({ items, className, ...props }, ref) => {
    return (
      <nav ref={ref} aria-label="Breadcrumb" className={className} {...props}>
        <ol className="flex items-center gap-2">
          {items.map((item, index) => (
            <li key={index} className="flex items-center gap-2">
              {item.href && !item.current ? (
                <a
                  href={item.href}
                  className="text-wise-primary hover:text-wise-primary-hover transition-colors text-sm"
                >
                  {item.label}
                </a>
              ) : (
                <span
                  className={
                    item.current ? 'text-wise-text-primary text-sm font-semibold' : 'text-wise-text-muted text-sm'
                  }
                  aria-current={item.current ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}

              {index < items.length - 1 && (
                <span className="text-wise-text-muted">/</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    )
  }
)

Breadcrumb.displayName = 'Breadcrumb'
