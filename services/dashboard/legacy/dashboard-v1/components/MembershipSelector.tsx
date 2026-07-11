'use client';

import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import CheckoutButton from './CheckoutButton';

interface Tier {
  id: string;
  name: string;
  price: number;
  price_cents: number;
  sessions_per_month: number | null;
  features: string[];
}

interface MembershipSelectorProps {
  onSelect?: (tierId: string) => void;
}

export default function MembershipSelector({ onSelect }: MembershipSelectorProps) {
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTiers = async () => {
      try {
        const response = await fetch('/api/memberships/tiers');
        if (!response.ok) {
          throw new Error('Failed to fetch tiers');
        }
        const data: Tier[] = await response.json();
        setTiers(data);
      } catch (err) {
        console.error('Error fetching tiers:', err);
        setError('Failed to load membership tiers');
      } finally {
        setLoading(false);
      }
    };

    fetchTiers();
  }, []);

  const handleSelectTier = (tierId: string) => {
    if (onSelect) {
      onSelect(tierId);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <p className="text-gray">Loading membership tiers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-16">
        <p className="text-neon-red">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto px-4">
        {tiers.map((tier) => (
          <div key={tier.id} className="card">
            {/* Tier Name */}
            <h3 className="heading-silver text-2xl mb-2">
              {tier.name}
            </h3>

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-baseline">
                <span className="text-4xl font-bold text-silver">
                  ${tier.price}
                </span>
                <span className="text-gray ml-2">/month</span>
              </div>
            </div>

            {/* Features List */}
            <div className="mb-6 space-y-3">
              {tier.features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-neon-red flex-shrink-0 mt-0.5" />
                  <span className="text-gray">{feature}</span>
                </div>
              ))}
            </div>

            {/* Checkout Button */}
            <CheckoutButton tier={tier.id} price={tier.price} />
          </div>
        ))}
      </div>
    </div>
  );
}
