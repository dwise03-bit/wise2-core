'use client';

import React from 'react';

interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
}

export const Table: React.FC<TableProps> = ({ className = '', children, ...props }) => (
  <table className={`wise-table ${className}`} {...props}>
    {children}
  </table>
);

interface TableHeadProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

export const TableHead: React.FC<TableHeadProps> = ({ className = '', children, ...props }) => (
  <thead className={className} {...props}>
    {children}
  </thead>
);

interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

export const TableBody: React.FC<TableBodyProps> = ({ className = '', children, ...props }) => (
  <tbody className={className} {...props}>
    {children}
  </tbody>
);

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode;
}

export const TableRow: React.FC<TableRowProps> = ({ className = '', children, ...props }) => (
  <tr className={className} {...props}>
    {children}
  </tr>
);

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
}

export const TableCell: React.FC<TableCellProps> = ({ className = '', children, ...props }) => (
  <td className={className} {...props}>
    {children}
  </td>
);

interface TableHeaderCellProps extends React.ThHTMLAttributes<HTMLTableHeaderCellElement> {
  children: React.ReactNode;
}

export const TableHeaderCell: React.FC<TableHeaderCellProps> = ({ className = '', children, ...props }) => (
  <th className={className} {...props}>
    {children}
  </th>
);
