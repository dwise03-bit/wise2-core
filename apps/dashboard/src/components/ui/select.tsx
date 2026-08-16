'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

type SelectContextValue = {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  open: boolean;
  setOpen: (open: boolean) => void;
};

const SelectContext = React.createContext<SelectContextValue | null>(null);

export interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}

export function Select({ value, onValueChange, children }: SelectProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  );
}

export function SelectTrigger({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const ctx = React.useContext(SelectContext);
  const label = React.Children.toArray(children).find(Boolean);

  return (
    <button
      type="button"
      onClick={() => ctx?.setOpen(!ctx.open)}
      className={cn(
        'flex h-10 w-full items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <span className="truncate">
        {ctx?.value || (typeof label === 'string' ? label : 'Select an option')}
      </span>
      <span className="ml-2 text-xs text-muted-foreground">▾</span>
    </button>
  );
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
  const ctx = React.useContext(SelectContext);
  return <>{ctx?.value || placeholder || 'Select an option'}</>;
}

export function SelectContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const ctx = React.useContext(SelectContext);
  if (!ctx?.open) return null;

  return (
    <div
      className={cn(
        'absolute z-50 mt-1 max-h-72 w-full overflow-auto rounded-md border border-border bg-background p-1 shadow-md',
        className,
      )}
      {...props}
    />
  );
}

export function SelectItem({
  className,
  value,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }) {
  const ctx = React.useContext(SelectContext);

  return (
    <button
      type="button"
      onClick={() => {
        ctx?.onValueChange(value);
        ctx?.setOpen(false);
      }}
      className={cn(
        'flex w-full items-center rounded-sm px-2 py-1.5 text-left text-sm hover:bg-muted',
        ctx?.value === value && 'bg-muted font-medium',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
