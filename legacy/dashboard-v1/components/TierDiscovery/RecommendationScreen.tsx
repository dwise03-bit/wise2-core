'use client';

import React from 'react';
import { Tier, TierInfo } from '../../lib/tierRecommendation';

interface RecommendationScreenProps {
  tier: Tier;
  tierInfo: TierInfo;
  profilePoints: string[];
  explanation: string;
  onStart: (tier: Tier) => void;
  onViewAll: () => void;
  onClose: () => void;
}

export function RecommendationScreen({
  tier,
  tierInfo,
  profilePoints,
  explanation,
  onStart,
  onViewAll,
  onClose,
}: RecommendationScreenProps) {
  const tierColors: Record<Tier, string> = {
    starter: 'bg-blue-50 border-blue-200',
    pro: 'bg-yellow-50 border-yellow-300',
    vip: 'bg-red-50 border-red-300',
  };

  const tierTextColors: Record<Tier, string> = {
    starter: 'text-blue-900',
    pro: 'text-yellow-900',
    vip: 'text-red-900',
  };

  const tierButtonColors: Record<Tier, string> = {
    starter: 'bg-blue-600 hover:bg-blue-700',
    pro: 'bg-yellow-600 hover:bg-yellow-700',
    vip: 'bg-red-600 hover:bg-red-700',
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header with close */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="text-sm text-gray-600">Your Perfect Fit</div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Recommended tier card */}
        <div className={`p-6 ${tierColors[tier]} border-2 rounded-lg`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-2xl font-bold uppercase ${tierTextColors[tier]}`}>
              {tier} Tier
            </h2>
            <span className="text-2xl">✓</span>
          </div>
          <div className={`text-lg font-semibold ${tierTextColors[tier]}`}>
            ${tierInfo.price}/month
          </div>
          <p className={`text-sm mt-2 ${tierTextColors[tier]}`}>{tierInfo.description}</p>
        </div>

        {/* Profile points */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Based on your profile:</h3>
          <ul className="space-y-2">
            {profilePoints.map((point, idx) => (
              <li key={idx} className="flex items-start text-sm text-gray-700">
                <span className="text-red-500 mr-2">✓</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Why this tier */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Why {tier}?</h3>
          <ul className="space-y-2">
            {tierInfo.benefits.map((benefit, idx) => (
              <li key={idx} className="flex items-start text-sm text-gray-700">
                <span className="text-red-500 mr-2">•</span>
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
          <p className="text-sm text-gray-600 mt-4">{explanation}</p>
        </div>

        {/* Buttons */}
        <div className="p-6 flex gap-3">
          <button
            onClick={onViewAll}
            className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            View All
          </button>
          <button
            onClick={() => onStart(tier)}
            className={`flex-1 px-4 py-2 text-white rounded-lg transition ${tierButtonColors[tier]}`}
          >
            Start with {tier.charAt(0).toUpperCase() + tier.slice(1)}
          </button>
        </div>
      </div>
    </div>
  );
}
