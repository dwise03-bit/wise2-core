/**
 * FeatureGate Component
 *
 * Gates features based on subscription plan and usage limits.
 * Shows upgrade prompts when limits are reached.
 *
 * Usage:
 * ```tsx
 * <FeatureGate featureName="music_generation">
 *   <MusicGenerator />
 * </FeatureGate>
 * ```
 */

import React, { useEffect, useState } from 'react';

export interface FeatureGateProps {
  featureName: string;
  children: React.ReactNode;
  onUpgrade?: () => void;
  showLimitWarning?: boolean;
  warningThreshold?: number; // Show warning at X% of limit
  className?: string;
}

export interface GenerationLimit {
  allowed: boolean;
  remaining: number;
  resetDate: Date;
  reason?: string;
}

/**
 * Hook to check generation limits
 */
export const useGenerationLimit = () => {
  const [limit, setLimit] = useState<GenerationLimit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkLimit = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/billing/can-generate');

      if (!response.ok) {
        throw new Error('Failed to check generation limit');
      }

      const data = await response.json();
      setLimit({
        allowed: data.allowed,
        remaining: data.remaining,
        resetDate: new Date(data.resetDate),
        reason: data.reason,
      });
      setError(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error.message);
      setLimit(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkLimit();
    // Recheck every minute
    const interval = setInterval(checkLimit, 60000);
    return () => clearInterval(interval);
  }, []);

  return { limit, loading, error, checkLimit };
};

/**
 * FeatureGate Component
 */
export const FeatureGate: React.FC<FeatureGateProps> = ({
  featureName,
  children,
  onUpgrade,
  showLimitWarning = true,
  warningThreshold = 0.2, // Show warning at 20% of limit
  className = '',
}) => {
  const { limit, loading, error, checkLimit } = useGenerationLimit();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  if (loading) {
    return (
      <div className={`feature-gate-loading ${className}`}>
        <div className="p-4 text-center text-gray-600">
          Checking usage limits...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`feature-gate-error ${className}`}>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{error}</p>
          <button
            onClick={checkLimit}
            className="mt-2 text-red-600 hover:text-red-700 font-semibold text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!limit) {
    return null;
  }

  // Check if feature is blocked
  if (!limit.allowed) {
    return (
      <div className={`feature-gate-blocked ${className}`}>
        <div className="p-6 bg-yellow-50 border-2 border-yellow-200 rounded-lg text-center">
          <h3 className="font-semibold text-lg text-yellow-900 mb-2">
            Generation Limit Reached
          </h3>
          <p className="text-yellow-800 mb-4">{limit.reason}</p>
          <button
            onClick={() => {
              if (onUpgrade) onUpgrade();
              setShowUpgradeModal(true);
            }}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Upgrade to Unlimited
          </button>
          <p className="text-sm text-yellow-700 mt-4">
            Resets on {limit.resetDate.toLocaleDateString()}
          </p>
        </div>

        {showUpgradeModal && (
          <UpgradeModal
            onClose={() => setShowUpgradeModal(false)}
            currentLimit={limit}
          />
        )}
      </div>
    );
  }

  // Show warning if approaching limit
  const isApproachingLimit = limit.remaining < limit.remaining;
  const percentUsed = 1 - limit.remaining / 100; // Rough estimate

  return (
    <div className={`feature-gate-allowed ${className}`}>
      {showLimitWarning && percentUsed > 1 - warningThreshold && (
        <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-orange-800 text-sm">
            You have{' '}
            <strong>{limit.remaining} generations remaining</strong> this month.
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="ml-2 text-orange-600 hover:text-orange-700 font-semibold underline"
            >
              Upgrade for unlimited access
            </button>
          </p>
        </div>
      )}

      {children}

      {showUpgradeModal && (
        <UpgradeModal
          onClose={() => setShowUpgradeModal(false)}
          currentLimit={limit}
        />
      )}
    </div>
  );
};

/**
 * UpgradeModal Component
 */
interface UpgradeModalProps {
  onClose: () => void;
  currentLimit: GenerationLimit;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ onClose, currentLimit }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold mb-4">Upgrade Your Plan</h2>

        <p className="text-gray-600 mb-6">
          You've used your monthly generation limit. Upgrade to get unlimited
          access to all features.
        </p>

        <div className="space-y-4 mb-6">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-lg">Starter Plan</h3>
            <p className="text-2xl font-bold text-blue-600 mt-1">$49/month</p>
            <p className="text-gray-600 text-sm mt-2">
              100 generations per month + email support
            </p>
          </div>

          <div className="border-2 border-blue-600 rounded-lg p-4 bg-blue-50">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-lg">Pro Plan</h3>
              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
                Popular
              </span>
            </div>
            <p className="text-2xl font-bold text-blue-600 mt-1">$99/month</p>
            <p className="text-gray-600 text-sm mt-2">
              Unlimited generations + priority support + API access
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            window.location.href = '/upgrade?plan=PRO';
          }}
          className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors mb-2"
        >
          Upgrade Now
        </button>

        <button
          onClick={onClose}
          className="w-full py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default FeatureGate;
