'use client';

/**
 * SubscriptionBadge Component
 * Displays current subscription tier in navbar with color coding
 */

import { useAuthContext } from '../../context/AuthContext';
import { getTierColor, getTierBadge } from '../../lib/subscription-config';

interface SubscriptionBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  onClick?: () => void;
}

export function SubscriptionBadge({
  size = 'md',
  showLabel = true,
  onClick,
}: SubscriptionBadgeProps) {
  const { tier, subscription } = useAuthContext();

  const color = getTierColor(tier);
  const badge = getTierBadge(tier);
  const tierLabel = tier.charAt(0).toUpperCase() + tier.slice(1);

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <button
      onClick={onClick}
      style={{
        borderColor: color,
        color: color,
      }}
      className={`
        flex items-center gap-2 border rounded-full transition-all
        hover:bg-opacity-10 active:scale-95
        ${sizeClasses[size]}
        ${!showLabel && 'rounded-full'}
      `}
      title={`${tierLabel} Plan - Click to manage`}
    >
      <span className="text-lg leading-none">{badge}</span>
      {showLabel && (
        <>
          <span className="font-semibold">{tierLabel}</span>
          {subscription?.status === 'active' && tier !== 'free' && (
            <span className="text-xs opacity-75 ml-1">
              Until {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
            </span>
          )}
        </>
      )}
    </button>
  );
}

export default SubscriptionBadge;
