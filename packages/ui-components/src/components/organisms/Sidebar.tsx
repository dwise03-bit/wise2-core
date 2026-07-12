import * as React from 'react';
import { Icon } from '../atoms/Icon';

// eslint-disable-next-line no-unused-vars
export interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ collapsed = false, onCollapsedChange, className = '', ...props }, ref) => {
    return (
      <aside
        ref={ref}
        className={`border-r border-gray-700 bg-black transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-64'
        } ${className}`}
        {...props}
      >
        <div className="flex h-16 items-center justify-between px-4">
          {!collapsed && (
            <h1 className="text-lg font-bold text-blue-500">WISE²</h1>
          )}
          {onCollapsedChange && (
            <button
              onClick={() => onCollapsedChange(!collapsed)}
              className="text-chrome/50 hover:text-chrome"
            >
              <Icon name={collapsed ? 'ChevronRight' : 'ChevronLeft'} size={20} />
            </button>
          )}
        </div>
      </aside>
    );
  }
);

Sidebar.displayName = 'Sidebar';

export interface SidebarNavProps extends React.HTMLAttributes<HTMLDivElement> {}

export const SidebarNav = React.forwardRef<HTMLDivElement, SidebarNavProps>(
  ({ className = '', ...props }, ref) => (
    <div
      ref={ref}
      className={`space-y-2 px-3 py-4 ${className}`}
      role="navigation"
      {...props}
    />
  )
);

SidebarNav.displayName = 'SidebarNav';

export interface SidebarItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: keyof typeof import('lucide-react')
  active?: boolean
  collapsed?: boolean
}

export const SidebarItem = React.forwardRef<
  HTMLButtonElement,
  SidebarItemProps
>(
  (
    {
      icon,
      active = false,
      collapsed = false,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
          active
            ? 'bg-blue-500/20 text-blue-500'
            : 'text-chrome/70 hover:bg-gray-900 hover:text-chrome'
        } ${className}`}
        {...props}
      >
        {icon && <Icon name={icon} size={18} className="flex-shrink-0" />}
        {!collapsed && <span>{children}</span>}
      </button>
    );
  }
);

SidebarItem.displayName = 'SidebarItem';
