import React, { useEffect, useState } from 'react';

interface CreditWallet {
  totalFreeCredits: number;
  totalPaidCredits: number;
  monthlyCost: number;
  estimatedRetailValue: number;
  generationCount: number;
  successCount: number;
  successRate: number;
}

export function CreditWalletWidget() {
  const [wallet, setWallet] = useState<CreditWallet>({
    totalFreeCredits: 42,
    totalPaidCredits: 12.50,
    monthlyCost: 12.50,
    estimatedRetailValue: 156.75,
    generationCount: 24,
    successCount: 23,
    successRate: 96,
  });

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const response = await fetch('/api/v1/creative/credits');
        if (response.ok) {
          const data = await response.json();
          setWallet(data);
        }
      } catch (error) {
        console.error('Failed to fetch wallet:', error);
      }
    };

    fetchWallet();
    const interval = setInterval(fetchWallet, 60000);
    return () => clearInterval(interval);
  }, []);

  const savings = wallet.estimatedRetailValue - wallet.monthlyCost;
  const savingPercent =
    wallet.estimatedRetailValue > 0
      ? Math.round((savings / wallet.estimatedRetailValue) * 100)
      : 0;

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition-colors">
      <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
        <span className="text-2xl">💳</span>
        Credit Wallet
      </h2>

      <div className="space-y-4">
        {/* Monthly Cost */}
        <div className="bg-slate-800/50 rounded p-4 border border-slate-700">
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm text-slate-400">Monthly Cost</span>
            <span className="text-2xl font-bold text-blue-400">${wallet.monthlyCost.toFixed(2)}</span>
          </div>
          <p className="text-xs text-slate-500">Free tier: ${(wallet.monthlyCost * 0.2).toFixed(2)}</p>
        </div>

        {/* Savings */}
        <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-700/50 rounded p-4">
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm text-slate-400">Estimated Savings</span>
            <span className="text-2xl font-bold text-green-400">${savings.toFixed(2)}</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-green-500 to-emerald-500 h-full"
              style={{ width: `${Math.min(savingPercent, 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-green-400 mt-2">{savingPercent}% below retail value</p>
        </div>

        {/* Retail Value */}
        <div className="bg-slate-800/50 rounded p-4 border border-slate-700">
          <div className="flex justify-between items-start">
            <span className="text-sm text-slate-400">Estimated Retail Value</span>
            <span className="text-xl font-bold text-orange-400">${wallet.estimatedRetailValue.toFixed(2)}</span>
          </div>
        </div>

        {/* Success Rate */}
        <div className="bg-slate-800/50 rounded p-4 border border-slate-700">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-slate-400">Success Rate</span>
            <span className="text-lg font-bold text-blue-400">{wallet.successRate}%</span>
          </div>
          <p className="text-xs text-slate-500">
            {wallet.successCount} of {wallet.generationCount} generations successful
          </p>
        </div>

        {/* Generations */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-800/50 rounded p-3 border border-slate-700 text-center">
            <p className="text-sm text-slate-400">Total</p>
            <p className="text-xl font-bold text-slate-100">{wallet.generationCount}</p>
          </div>
          <div className="bg-slate-800/50 rounded p-3 border border-slate-700 text-center">
            <p className="text-sm text-slate-400">Successful</p>
            <p className="text-xl font-bold text-green-400">{wallet.successCount}</p>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-6 pt-4 border-t border-slate-700">
        <p className="text-xs text-slate-500 text-center">
          Credits reset monthly on the 1st
        </p>
      </div>
    </div>
  );
}
