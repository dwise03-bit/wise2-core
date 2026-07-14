/**
 * WISE² Table Component
 *
 * Data table with striped rows and hover effects.
 */

import React, { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes, forwardRef } from 'react'

interface TableProps extends HTMLAttributes<HTMLTableElement> {}

interface TableHeadProps extends HTMLAttributes<HTMLTableSectionElement> {}

interface TableBodyProps extends HTMLAttributes<HTMLTableSectionElement> {}

interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {}

interface TableHeaderCellProps extends ThHTMLAttributes<HTMLTableCellElement> {}

interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {}

export const Table = forwardRef<HTMLTableElement, TableProps>(({ className, ...props }, ref) => (
  <div className="w-full overflow-x-auto">
    <table ref={ref} className={`w-full text-left text-sm ${className || ''}`} {...props} />
  </div>
))

Table.displayName = 'Table'

export const TableHead = forwardRef<HTMLTableSectionElement, TableHeadProps>(
  ({ className, ...props }, ref) => (
    <thead
      ref={ref}
      className={`
        bg-wise-surface border-b border-wise-border-medium
        ${className || ''}
      `}
      {...props}
    />
  )
)

TableHead.displayName = 'TableHead'

export const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className, ...props }, ref) => <tbody ref={ref} className={className} {...props} />
)

TableBody.displayName = 'TableBody'

export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={`
        border-b border-wise-border-subtle
        hover:bg-wise-surface/50 transition-colors
        ${className || ''}
      `}
      {...props}
    />
  )
)

TableRow.displayName = 'TableRow'

export const TableHeaderCell = forwardRef<HTMLTableCellElement, TableHeaderCellProps>(
  ({ className, ...props }, ref) => (
    <th
      ref={ref}
      className={`
        px-4 py-3 font-semibold text-wise-text-secondary
        ${className || ''}
      `}
      {...props}
    />
  )
)

TableHeaderCell.displayName = 'TableHeaderCell'

export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, ...props }, ref) => (
    <td ref={ref} className={`px-4 py-3 text-wise-text-primary ${className || ''}`} {...props} />
  )
)

TableCell.displayName = 'TableCell'
