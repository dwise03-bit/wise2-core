import * as React from 'react'

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {}

export const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className = '', ...props }, ref) => (
    <div className="w-full overflow-x-auto">
      <table
        ref={ref}
        className={`w-full border-collapse text-sm ${className}`}
        {...props}
      />
    </div>
  )
)

Table.displayName = 'Table'

export interface TableHeadProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

export const TableHead = React.forwardRef<
  HTMLTableSectionElement,
  TableHeadProps
>(({ className = '', ...props }, ref) => (
  <thead
    ref={ref}
    className={`border-b border-gray-700 bg-gray-900/50 ${className}`}
    {...props}
  />
))

TableHead.displayName = 'TableHead'

export interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

export const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  TableBodyProps
>(({ className = '', ...props }, ref) => (
  <tbody ref={ref} className={className} {...props} />
))

TableBody.displayName = 'TableBody'

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {}

export const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className = '', ...props }, ref) => (
    <tr
      ref={ref}
      className={`border-b border-gray-800 hover:bg-gray-900/30 transition-colors ${className}`}
      {...props}
    />
  )
)

TableRow.displayName = 'TableRow'

export interface TableHeaderProps extends React.ThHTMLAttributes<HTMLTableCellElement> {}

export const TableHeader = React.forwardRef<
  HTMLTableCellElement,
  TableHeaderProps
>(({ className = '', ...props }, ref) => (
  <th
    ref={ref}
    className={`px-4 py-3 text-left text-xs font-semibold text-chrome/75 uppercase tracking-wide ${className}`}
    {...props}
  />
))

TableHeader.displayName = 'TableHeader'

export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {}

export const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className = '', ...props }, ref) => (
    <td
      ref={ref}
      className={`px-4 py-3 text-chrome ${className}`}
      {...props}
    />
  )
)

TableCell.displayName = 'TableCell'
