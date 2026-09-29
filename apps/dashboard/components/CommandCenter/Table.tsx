'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
}

interface TableProps<T> {
  title?: string;
  columns: TableColumn<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  selectable?: boolean;
  onSelectionChange?: (selected: T[]) => void;
}

export function Table<T extends Record<string, any>>({
  title,
  columns,
  data,
  onRowClick,
  selectable = false,
  onSelectionChange,
}: TableProps<T>) {
  const [sortColumn, setSortColumn] = React.useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');
  const [selectedRows, setSelectedRows] = React.useState<Set<number>>(new Set());

  const handleSort = (key: keyof T) => {
    if (sortColumn === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(key);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = () => {
    if (selectedRows.size === data.length) {
      setSelectedRows(new Set());
      onSelectionChange?.([]);
    } else {
      const newSelected = new Set(data.map((_, i) => i));
      setSelectedRows(newSelected);
      onSelectionChange?.(data);
    }
  };

  const handleSelectRow = (index: number) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedRows(newSelected);
    onSelectionChange?.(data.filter((_, i) => newSelected.has(i)));
  };

  const sortedData = React.useMemo(() => {
    if (!sortColumn) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];

      if (typeof aVal === 'string') {
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [data, sortColumn, sortDirection]);

  return (
    <div className="glass-medium rounded-lg overflow-hidden">
      {title && (
        <div className="px-6 py-4 border-b border-cyan-500/10">
          <h3 className="font-semibold text-white">{title}</h3>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full striped-rows">
          <thead>
            <tr className="glass-light border-b border-cyan-500/10">
              {selectable && (
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === data.length && data.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 cursor-pointer accent-cyan-500"
                    aria-label="Select all rows"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-widest text-gray-400 ${
                    col.sortable ? 'cursor-pointer hover:text-white transition-colors' : ''
                  }`}
                  style={{ width: col.width }}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-2">
                    {col.label}
                    {col.sortable && sortColumn === col.key && (
                      <ChevronDown
                        size={16}
                        className={`transition-transform ${
                          sortDirection === 'desc' ? 'rotate-180' : ''
                        }`}
                      />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-6 py-8 text-center text-gray-500">
                  No data available
                </td>
              </tr>
            ) : (
              sortedData.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={`border-b border-cyan-500/5 transition-colors hover:bg-cyan-500/5 ${
                    onRowClick ? 'cursor-pointer' : ''
                  }`}
                  onClick={() => onRowClick?.(row)}
                >
                  {selectable && (
                    <td className="px-6 py-3">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(rowIndex)}
                        onChange={() => handleSelectRow(rowIndex)}
                        className="w-4 h-4 cursor-pointer accent-cyan-500"
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`Select row ${rowIndex}`}
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td
                      key={String(col.key)}
                      className="px-6 py-3 text-sm text-gray-300"
                      style={{ width: col.width }}
                    >
                      {col.render ? col.render(row[col.key], row) : String(row[col.key] ?? '-')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedRows.size > 0 && (
        <div className="px-6 py-3 bg-cyan-500/10 border-t border-cyan-500/10 text-sm text-cyan-300">
          {selectedRows.size} row{selectedRows.size !== 1 ? 's' : ''} selected
        </div>
      )}
    </div>
  );
}
