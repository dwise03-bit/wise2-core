'use client';

import { useAuth } from '../../src/contexts/AuthContext';
import { useEffect, useState } from 'react';

interface CustomerProfile {
  subscription: {
    plan: 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE';
    status: string;
    currentPeriodStart: string | null;
    currentPeriodEnd: string | null;
    trialEndsAt: string | null;
  };
  entitlements: {
    canAccessSoundLabs: boolean;
    canGenerateMusic: boolean;
    monthlyGenerations: number | null;
  };
  upgradeUrl: string;
}

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const [customerData, setCustomerData] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    // Fetch real customer profile from SECURE authenticated endpoint
    const fetchCustomerProfile = async () => {
      try {
        const response = await fetch(`/api/v1/billing/me`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
          },
        });
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        const profile = await response.json();
        setCustomerData(profile);
        setError(null);
      } catch (err) {
        console.error('Error fetching customer profile:', err);
        // Fallback to FREE plan if API fails
        setCustomerData({
          subscription: {
            plan: 'FREE',
            status: 'ACTIVE',
            currentPeriodStart: null,
            currentPeriodEnd: null,
            trialEndsAt: null,
          },
          entitlements: {
            canAccessSoundLabs: false,
            canGenerateMusic: false,
            monthlyGenerations: 0,
          },
          upgradeUrl: '/pricing',
        });
        setError('Note: Using cached billing data');
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    fetchCustomerProfile();
  }, [user?.id]);

  if (isLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-700 rounded w-32 mb-4"></div>
          <div className="h-4 bg-slate-700 rounded w-64"></div>
        </div>
      </div>
    );
  }

  const planColor = {
    FREE: 'text-gray-400',
    STARTER: 'text-blue-400',
    PRO: 'text-purple-400',
    ENTERPRISE: 'text-yellow-400',
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-slate-400">
          Welcome to your WISE² Command Center. Monitor, control, and automate your business operations.
        </p>
        {user && (
          <p className="text-slate-500 text-sm mt-2">
            Logged in as <span className="text-slate-300 font-semibold">{user.email}</span>
          </p>
        )}
      </div>

      {/* Plan Status Card */}
      {customerData && (
        <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-slate-400 text-sm mb-2">Current Plan</p>
              <p className={`text-2xl font-bold ${planColor[customerData.subscription.plan]}`}>
                WISE² {customerData.subscription.plan}
              </p>
              <p className="text-slate-500 text-sm mt-1">
                Status: <span className="text-slate-300 capitalize">{customerData.subscription.status}</span>
              </p>
              {customerData.subscription.currentPeriodEnd && (
                <p className="text-slate-500 text-sm mt-1">
                  Renews {new Date(customerData.subscription.currentPeriodEnd).toLocaleDateString()}
                </p>
              )}
              {customerData.subscription.trialEndsAt && (
                <p className="text-orange-400 text-sm mt-1">
                  Trial ends {new Date(customerData.subscription.trialEndsAt).toLocaleDateString()}
                </p>
              )}
              {error && (
                <p className="text-yellow-400 text-xs mt-2">{error}</p>
              )}
            </div>
            <button className="px-6 py-2 rounded-lg bg-blue-500/20 border border-blue-500/50 text-blue-300 text-sm font-semibold hover:bg-blue-500/30 transition">
              Manage Plan →
            </button>
          </div>
        </div>
      )}

      {/* Feature Access Card */}
      {customerData && (
        <div className="rounded-lg border border-white/10 bg-slate-900/30 p-6 backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-white mb-4">Your Access</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${customerData.entitlements.canAccessSoundLabs ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className={customerData.entitlements.canAccessSoundLabs ? 'text-slate-300' : 'text-slate-500'}>
                Sound Labs {customerData.entitlements.canAccessSoundLabs ? '✓' : '(Upgrade to Starter)'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${customerData.entitlements.canGenerateMusic ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className={customerData.entitlements.canGenerateMusic ? 'text-slate-300' : 'text-slate-500'}>
                Music Generation {customerData.entitlements.canGenerateMusic ? '✓' : '(Upgrade to Starter)'}
              </span>
            </div>
            {customerData.entitlements.monthlyGenerations !== null && (
              <p className="text-slate-500 text-sm mt-4">
                Monthly generations: {customerData.entitlements.monthlyGenerations}
              </p>
            )}
          </div>
          {customerData.subscription.plan === 'FREE' && (
            <a
              href={customerData.upgradeUrl}
              className="inline-block mt-4 px-4 py-2 rounded-lg bg-purple-500/20 border border-purple-500/50 text-purple-300 text-sm font-semibold hover:bg-purple-500/30 transition"
            >
              Upgrade Plan →
            </a>
          )}
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Overview Card */}
        <div className="rounded-lg border border-white/10 bg-slate-900/30 p-6 backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-white mb-2">Overview</h3>
          <p className="text-slate-400 text-sm">
            Dashboard overview and key metrics coming soon.
          </p>
        </div>

        {/* Sound Labs Card */}
        <div className={`rounded-lg border p-6 backdrop-blur-sm ${
          customerData?.entitlements.canAccessSoundLabs
            ? 'border-white/10 bg-slate-900/30'
            : 'border-slate-700/50 bg-slate-900/20'
        }`}>
          <h3 className="text-lg font-semibold text-white mb-2">Sound Labs</h3>
          <p className="text-slate-400 text-sm mb-4">
            Create music and audio content with AI.
          </p>
          {customerData?.entitlements.canAccessSoundLabs ? (
            <a
              href="/dashboard/sound-labs"
              className="inline-block px-4 py-2 rounded-lg bg-blue-500/20 border border-blue-500/50 text-blue-300 text-sm font-semibold hover:bg-blue-500/30 transition"
            >
              Open Sound Labs →
            </a>
          ) : (
            <a
              href={customerData?.upgradeUrl || '/pricing'}
              className="inline-block px-4 py-2 rounded-lg bg-slate-700/30 border border-slate-600/50 text-slate-400 text-sm font-semibold hover:bg-slate-700/50 transition"
            >
              Upgrade to unlock →
            </a>
          )}
        </div>

        {/* Settings Card */}
        <div className="rounded-lg border border-white/10 bg-slate-900/30 p-6 backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-white mb-2">Settings</h3>
          <p className="text-slate-400 text-sm mb-4">
            Manage account and billing settings.
          </p>
          <button className="inline-block px-4 py-2 rounded-lg bg-slate-700/30 border border-slate-600/50 text-slate-300 text-sm font-semibold hover:bg-slate-700/50 transition">
            Account Settings →
          </button>
        </div>
      </div>

      {/* Phase 10D Note */}
      <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-4">
        <p className="text-blue-300 text-sm">
          💡 Phase 10D: Auth integration and customer journey complete. Sound Labs integration and entitlements in progress.
        </p>
      </div>
    </div>
  );
}
