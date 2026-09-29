'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, Badge, Button, Input } from '../../../../src/components/ui';

const STATUS_OPTIONS = [
  'ALL', 'DRAFT', 'PENDING_REVIEW', 'QUOTED', 'AWAITING_PAYMENT', 'PAID',
  'IN_PRODUCTION', 'QUALITY_CHECK', 'READY_FOR_PICKUP', 'SHIPPED', 'DELIVERED', 'CANCELLED',
];

const STATUS_BADGE: Record<string, 'success' | 'warning' | 'info' | 'danger' | 'neutral'> = {
  DRAFT: 'neutral', PENDING_REVIEW: 'warning', QUOTED: 'info', AWAITING_PAYMENT: 'warning',
  PAID: 'success', IN_PRODUCTION: 'info', QUALITY_CHECK: 'warning', READY_FOR_PICKUP: 'success',
  SHIPPED: 'success', DELIVERED: 'success', CANCELLED: 'danger',
};

const TYPE_MAP: Record<string, string> = {
  THREE_D_PRINT: '3D Print', DTF_TRANSFER: 'DTF Transfer', DTF_GANG_SHEET: 'Gang Sheet',
  APPAREL: 'Apparel', BUNDLE: 'Bundle', DESIGN_SERVICE: 'Design',
};

const DEMO_ORDERS = [
  { id: '1', orderNumber: 'PS-20260801-A3F2K', customerName: 'Martinez LLC', customerEmail: 'orders@martinez.com', orderType: 'THREE_D_PRINT', status: 'IN_PRODUCTION', totalPrice: 145.50, itemCount: 3, createdAt: '2026-08-01T10:30:00Z' },
  { id: '2', orderNumber: 'PS-20260731-B7X9P', customerName: 'Sarah Kim', customerEmail: 'sarah@example.com', orderType: 'DTF_TRANSFER', status: 'AWAITING_PAYMENT', totalPrice: 48.00, itemCount: 1, createdAt: '2026-07-31T14:15:00Z' },
  { id: '3', orderNumber: 'PS-20260730-C1D4M', customerName: 'PIFF CITY', customerEmail: 'print@piffcity.com', orderType: 'DTF_GANG_SHEET', status: 'PAID', totalPrice: 96.00, itemCount: 2, createdAt: '2026-07-30T09:00:00Z' },
  { id: '4', orderNumber: 'PS-20260729-D8E2N', customerName: 'Tech Forge Inc', customerEmail: 'ops@techforge.io', orderType: 'THREE_D_PRINT', status: 'DELIVERED', totalPrice: 320.00, itemCount: 5, createdAt: '2026-07-29T16:45:00Z' },
  { id: '5', orderNumber: 'PS-20260728-E5F1Q', customerName: 'Wise Defense LLC', customerEmail: 'wisedefensellc@gmail.com', orderType: 'THREE_D_PRINT', status: 'QUALITY_CHECK', totalPrice: 67.25, itemCount: 2, createdAt: '2026-07-28T11:20:00Z' },
  { id: '6', orderNumber: 'PS-20260727-F9G3R', customerName: 'Local Boutique', customerEmail: 'hello@localboutique.com', orderType: 'APPAREL', status: 'PENDING_REVIEW', totalPrice: 210.00, itemCount: 10, createdAt: '2026-07-27T08:00:00Z' },
];

function fmtStatus(s: string): string {
  return s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const filtered = DEMO_ORDERS.filter(o => {
    if (statusFilter !== 'ALL' && o.status !== statusFilter) return false;
    if (search && !o.orderNumber.toLowerCase().includes(search.toLowerCase()) && !o.customerName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/print-on-demand" className="text-text-muted hover:text-text-secondary text-sm">&larr; Print Shop</Link>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">Orders</h1>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-[200px] max-w-sm">
          <Input
            placeholder="Search orders or customers..."
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg bg-wise-gunmetal border border-border-subtle text-text-primary focus:outline-none focus:border-wise-electric"
        >
          {STATUS_OPTIONS.map(s => (
            <option key={s} value={s}>{s === 'ALL' ? 'All Statuses' : fmtStatus(s)}</option>
          ))}
        </select>
        <Badge variant="neutral">{filtered.length} order{filtered.length !== 1 ? 's' : ''}</Badge>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle text-text-muted text-xs bg-wise-surface-elevated/50">
                <th className="text-left px-4 py-2.5 font-medium">Order #</th>
                <th className="text-left px-4 py-2.5 font-medium">Customer</th>
                <th className="text-left px-4 py-2.5 font-medium">Type</th>
                <th className="text-left px-4 py-2.5 font-medium">Items</th>
                <th className="text-left px-4 py-2.5 font-medium">Status</th>
                <th className="text-right px-4 py-2.5 font-medium">Total</th>
                <th className="text-right px-4 py-2.5 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(order => (
                <tr key={order.id} className="border-b border-border-subtle/50 hover:bg-wise-surface-elevated/50 transition-colors cursor-pointer">
                  <td className="px-4 py-3"><span className="font-mono text-xs text-wise-electric">{order.orderNumber}</span></td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-text-primary text-sm">{order.customerName}</p>
                      <p className="text-text-muted text-xs">{order.customerEmail}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3"><Badge variant="neutral">{TYPE_MAP[order.orderType] || order.orderType}</Badge></td>
                  <td className="px-4 py-3 text-text-secondary">{order.itemCount}</td>
                  <td className="px-4 py-3"><Badge variant={STATUS_BADGE[order.status] || 'neutral'}>{fmtStatus(order.status)}</Badge></td>
                  <td className="px-4 py-3 text-right font-mono text-text-primary">${order.totalPrice.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right text-text-muted text-xs">{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-text-muted text-sm">No orders match the current filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
