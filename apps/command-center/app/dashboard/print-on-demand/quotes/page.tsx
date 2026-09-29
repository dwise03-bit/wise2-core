'use client';

import React from 'react';
import Link from 'next/link';
import { Card, Badge } from '../../../../src/components/ui';

const DEMO_QUOTES = [
  { id: '1', quoteNumber: 'QT-20260801-X1Y2Z', customerName: 'Martinez LLC', type: '3D Print', totalPrice: 165.00, status: 'SENT', validUntil: '2026-08-15', createdAt: '2026-08-01' },
  { id: '2', quoteNumber: 'QT-20260730-A3B4C', customerName: 'PIFF CITY', type: 'DTF Gang Sheet', totalPrice: 96.00, status: 'ACCEPTED', validUntil: '2026-08-13', createdAt: '2026-07-30' },
  { id: '3', quoteNumber: 'QT-20260728-D5E6F', customerName: 'Local Boutique', type: 'Apparel', totalPrice: 280.00, status: 'DRAFT', validUntil: '2026-08-11', createdAt: '2026-07-28' },
];

const STATUS_BADGE: Record<string, 'success' | 'warning' | 'info' | 'danger' | 'neutral'> = {
  DRAFT: 'neutral', SENT: 'info', ACCEPTED: 'success', DECLINED: 'danger', EXPIRED: 'warning',
};

export default function QuotesPage() {
  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <Link href="/dashboard/print-on-demand" className="text-text-muted hover:text-text-secondary text-sm">&larr; Print Shop</Link>
        <h1 className="text-xl font-bold text-white mt-1">Quotes</h1>
        <p className="text-sm text-text-muted">{DEMO_QUOTES.length} quotes</p>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle text-text-muted text-xs bg-wise-surface-elevated/50">
                <th className="text-left px-4 py-2.5 font-medium">Quote #</th>
                <th className="text-left px-4 py-2.5 font-medium">Customer</th>
                <th className="text-left px-4 py-2.5 font-medium">Type</th>
                <th className="text-left px-4 py-2.5 font-medium">Status</th>
                <th className="text-right px-4 py-2.5 font-medium">Total</th>
                <th className="text-right px-4 py-2.5 font-medium">Valid Until</th>
              </tr>
            </thead>
            <tbody>
              {DEMO_QUOTES.map(q => (
                <tr key={q.id} className="border-b border-border-subtle/50 hover:bg-wise-surface-elevated/50 transition-colors cursor-pointer">
                  <td className="px-4 py-3"><span className="font-mono text-xs text-wise-electric">{q.quoteNumber}</span></td>
                  <td className="px-4 py-3 text-text-primary">{q.customerName}</td>
                  <td className="px-4 py-3"><Badge variant="neutral">{q.type}</Badge></td>
                  <td className="px-4 py-3"><Badge variant={STATUS_BADGE[q.status] || 'neutral'}>{q.status}</Badge></td>
                  <td className="px-4 py-3 text-right font-mono text-text-primary">${q.totalPrice.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right text-text-muted text-xs">{q.validUntil}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
