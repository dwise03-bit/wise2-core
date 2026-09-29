import * as React from 'react';
import { Icon } from '../atoms/Icon';

export type AlertVariant = 'default' | 'success' | 'warning' | 'error' | 'info'

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant
  title?: string
  description?: string
  onClose?: () => void
}

const variantStyles: Record<AlertVariant, { bg: string; border: string; icon: string; text: string }> = {
  default: {
    bg: 'bg-gray-900',
    border: 'border-gray-700',
    icon: 'text-chrome',
    text: 'text-chrome',
  },
  success: {
    bg: 'bg-success/10',
    border: 'border-success/30',
    icon: 'text-success',
    text: 'text-success',
  },
  warning: {
    bg: 'bg-warning/10',
    border: 'border-warning/30',
    icon: 'text-warning',
    text: 'text-warning',
  },
  error: {
    bg: 'bg-error/10',
    border: 'border-error/30',
    icon: 'text-error',
    text: 'text-error',
  },
  info: {
    bg: 'bg-info/10',
    border: 'border-info/30',
    icon: 'text-info',
    text: 'text-info',
  },
};

const iconMap: Record<AlertVariant, keyof typeof import('lucide-react')> = {
  default: 'Info',
  success: 'CheckCircle',
  warning: 'AlertCircle',
  error: 'XCircle',
  info: 'Info',
};

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      variant = 'default',
      title,
      description,
      onClose,
      className = '',
      ...props
    },
    ref
  ) => {
    const styles = variantStyles[variant];

    return (
      <div
        ref={ref}
        className={`flex gap-4 rounded-lg border p-4 ${styles.bg} ${styles.border} ${className}`}
        {...props}
      >
        <Icon
          name={iconMap[variant]}
          size={20}
          className={`mt-0.5 flex-shrink-0 ${styles.icon}`}
        />
        <div className="flex-1">
          {title && (
            <h4 className={`font-semibold ${styles.text}`}>{title}</h4>
          )}
          {description && (
            <p className={`mt-1 text-sm ${styles.text}/75`}>{description}</p>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 text-chrome/50 hover:text-chrome"
          >
            <Icon name="X" size={16} />
          </button>
        )}
      </div>
    );
  }
);

Alert.displayName = 'Alert';
