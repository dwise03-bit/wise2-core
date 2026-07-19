'use client';

/**
 * FeatureLock Component
 * Wraps features to restrict access based on subscription tier
 * Shows upgrade prompt for locked features
 */

import { useState } from 'react';
import { useAuthContext } from '../../context/AuthContext';
import { isFeatureAvailable, getTierColor, getTierBadge } from '../../lib/subscription-config';
import { SubscriptionTier } from '../../types/subscription';
import { UpgradeModal } from './UpgradeModal';

interface FeatureLockProps {
  feature: keyof typeof FEATURE_REQUIREMENTS;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onAttemptLocked?: () => void;
}

/**
 * Define which tier is required for each feature
 */
export const FEATURE_REQUIREMENTS: Record<string, SubscriptionTier> = {
  export_stems: 'pro',
  live_streaming: 'pro',
  advanced_effects: 'pro',
  ai_music_generation: 'enterprise',
  unlimited_projects: 'pro',
  unlimited_storage: 'pro',
  priority_support: 'enterprise',
  discord_support: 'enterprise',
};

export function FeatureLock({
  feature,
  children,
  fallback,
  onAttemptLocked,
}: FeatureLockProps) {
  const { tier } = useAuthContext();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const requiredTier = FEATURE_REQUIREMENTS[feature];
  const isAvailable = isFeatureAvailable(tier, feature as any);

  if (isAvailable) {
    return <>{children}</>;
  }

  // Feature is locked
  const handleClick = () => {
    onAttemptLocked?.();
    setShowUpgradeModal(true);
  };

  const lockColor = getTierColor(requiredTier);
  const lockBadge = getTierBadge(requiredTier);

  return (
    <>
      <div
        onClick={handleClick}
        className="relative group cursor-pointer"
        title={`${feature.replace(/_/g, ' ')} requires ${requiredTier} plan`}
      >
        {/* Locked overlay */}
        <div className="absolute inset-0 bg-black/50 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <div className="text-center">
            <div className="text-3xl mb-2">{lockBadge}</div>
            <div className="text-white font-semibold text-sm">
              {requiredTier.charAt(0).toUpperCase() + requiredTier.slice(1)} Feature
            </div>
            <div className="text-gray-300 text-xs mt-1">Click to upgrade</div>
          </div>
        </div>

        {/* Disabled content */}
        <div className="opacity-50 pointer-events-none">{children || fallback}</div>
      </div>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        highlightTier={requiredTier}
      />
    </>
  );
}

/**
 * Inline FeatureLock Badge - Shows lock icon with feature name
 */
interface FeatureLockBadgeProps {
  feature: keyof typeof FEATURE_REQUIREMENTS;
  text?: string;
}

export function FeatureLockBadge({ feature, text }: FeatureLockBadgeProps) {
  const { tier } = useAuthContext();
  const isAvailable = isFeatureAvailable(tier, feature as any);

  if (isAvailable) {
    return null;
  }

  const requiredTier = FEATURE_REQUIREMENTS[feature];
  const lockColor = getTierColor(requiredTier);

  return (
    <span
      style={{ color: lockColor }}
      className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 bg-opacity-10 rounded"
      title={`Requires ${requiredTier} plan`}
    >
      🔒 {text || `${requiredTier} only`}
    </span>
  );
}

/**
 * Utility hook to check if feature is available
 */
export function useFeatureAvailability(feature: keyof typeof FEATURE_REQUIREMENTS): boolean {
  const { tier } = useAuthContext();
  return isFeatureAvailable(tier, feature as any);
}

export default FeatureLock;
