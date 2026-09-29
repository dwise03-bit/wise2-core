'use client';

/**
 * ShortcutHint Component
 * Displays keyboard shortcut information in tooltips and button titles
 */

import React from 'react';
import { formatKeysForDisplay } from '../../../hooks/useKeyboardShortcuts';

export interface ShortcutHintProps {
  keys: string[];
  description?: string;
  children?: React.ReactNode;
  showInTooltip?: boolean;
  className?: string;
}

/**
 * Component that wraps elements and shows shortcut hints
 */
export function ShortcutHint({
  keys,
  description,
  children,
  showInTooltip = true,
  className = '',
}: ShortcutHintProps) {
  const keyDisplay = formatKeysForDisplay(keys);
  const title = description
    ? `${description} (${keyDisplay})`
    : keyDisplay;

  return (
    <div className={className} title={showInTooltip ? title : undefined}>
      {children}
    </div>
  );
}

/**
 * Badge component for displaying shortcut keys
 */
export interface ShortcutBadgeProps {
  keys: string[];
  variant?: 'default' | 'minimal' | 'inline';
  className?: string;
}

export function ShortcutBadge({
  keys,
  variant = 'default',
  className = '',
}: ShortcutBadgeProps) {
  const keyDisplay = formatKeysForDisplay(keys);

  if (variant === 'inline') {
    return (
      <span className={`text-xs font-mono text-gray-400 ${className}`}>
        {keyDisplay}
      </span>
    );
  }

  if (variant === 'minimal') {
    return (
      <span className={`text-xs px-1 text-gray-500 font-mono ${className}`}>
        {keyDisplay}
      </span>
    );
  }

  // Default badge style
  return (
    <kbd className={`inline-block px-2 py-1 text-xs font-semibold text-gray-300 bg-gray-800 border border-gray-700 rounded ${className}`}>
      {keyDisplay}
    </kbd>
  );
}

/**
 * Enhanced button component with shortcut display
 */
export interface ShortcutButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  shortcutKeys?: string[];
  shortcutDescription?: string;
  showShortcutBadge?: boolean;
}

export const ShortcutButton = React.forwardRef<
  HTMLButtonElement,
  ShortcutButtonProps
>(({
  shortcutKeys,
  shortcutDescription,
  showShortcutBadge = false,
  className = '',
  title,
  children,
  ...props
}, ref) => {
  const displayTitle = shortcutKeys
    ? shortcutDescription
      ? `${shortcutDescription} (${formatKeysForDisplay(shortcutKeys)})`
      : formatKeysForDisplay(shortcutKeys)
    : title;

  return (
    <button
      ref={ref}
      title={displayTitle}
      className={className}
      {...props}
    >
      <div className="flex items-center gap-2">
        {children}
        {showShortcutBadge && shortcutKeys && (
          <ShortcutBadge keys={shortcutKeys} variant="minimal" />
        )}
      </div>
    </button>
  );
});

ShortcutButton.displayName = 'ShortcutButton';

/**
 * Hook helper for getting formatted shortcut display
 */
export function useFormattedShortcut(keys: string[]) {
  return formatKeysForDisplay(keys);
}
