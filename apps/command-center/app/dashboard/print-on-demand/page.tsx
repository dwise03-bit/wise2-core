'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, KPICard, Badge, Button } from '../../../src/components/ui';

type OrderStatus = 'DRAFT' | 'PENDING_REVIEW' | 'QUOTED' | 'AWAITING_PAYMENT' | 'PAID' | 'IN_PRODUCTION' | 'QUALITY_CHECK' | 'READY_FOR_PICKUP' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

interface RecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  orderType: string;
  status: OrderStatus;
  totalPrice: number;
  createdAt: string;
}

const STATUS_BADGE: Record<string, 'success' | 'warning' | 'info' | 'danger' | 'neutral'> = {
  DRAFT: 'neutral',
  PENDING_REVIEW: 'warning',
  QUOTED: 'info',
  AWAITING_PAYMENT: 'warning',
  PAID: 'success',
  IN_PRODUCTION: 'info',
  QUALITY_CHECK: 'warning',
  READY_FOR_PICKUP: 'success',
  SHIPPED: 'success',
  DELIVERED: 'success',
  CANCELLED: 'danger',
};

const DEMO_ORDERS: RecentOrder[] = [
  { id: '1', orderNumber: 'PS-20260801-A3F2K', customerName: 'Martinez LLC', orderType: 'THREE_D_PRINT', status: 'IN_PRODUCTION', totalPrice: 145.50, createdAt: '2026-08-01T10:30:00Z' },
  { id: '2', orderNumber: 'PS-20260731-B7X9P', customerName: 'Sarah Kim', orderType: 'DTF_TRANSFER', status: 'AWAITING_PAYMENT', totalPrice: 48.00, createdAt: '2026-07-31T14:15:00Z' },
  { id: '3', orderNumber: 'PS-20260730-C1D4M', customerName: 'PIFF CITY', orderType: 'DTF_GANG_SHEET', status: 'PAID', totalPrice: 96.00, createdAt: '2026-07-30T09:00:00Z' },
  { id: '4', orderNumber: 'PS-20260729-D8E2N', customerName: 'Tech Forge Inc', orderType: 'THREE_D_PRINT', status: 'DELIVERED', totalPrice: 320.00, createdAt: '2026-07-29T16:45:00Z' },
];

function fmtType(t: string): string {
  const m: Record<string, string> = { THREE_D_PRINT: '3D Print', DTF_TRANSFER: 'DTF Transfer', DTF_GANG_SHEET: 'Gang Sheet', APPAREL: 'Apparel', BUNDLE: 'Bundle', DESIGN_SERVICE: 'Design' };
  return m[t] || t;
}

function fmtStatus(s: string): string {
  return s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

export default function PrintShopDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | '3d' | 'dtf'>('overview');

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            <span className="text-wise-neon">WISE²</span> Print Shop
          </h1>
          <p className="text-sm text-text-muted mt-0.5">3D Printing + DTF Production — Design. Print. Build.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/print-on-demand/orders"><Button variant="secondary">All Orders</Button></Link>
          <Link href="/dashboard/print-on-demand/products"><Button variant="primary">+ New Product</Button></Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard label="Active Orders" value="7" trend="+3 this week" />
        <KPICard label="Revenue (MTD)" value="$2,340" trend="+18% vs last month" />
        <KPICard label="In Production" value="4" trend="2 3D / 2 DTF" />
        <KPICard label="Avg Turnaround" value="3.2d" trend="-0.5d improvement" />
      </div>

      <div className="flex gap-1 border-b border-border-subtle">
        {(['overview', '3d', 'dtf'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium transition-colors relative ${activeTab === tab ? 'text-wise-neon' : 'text-text-muted hover:text-text-secondary'}`}
          >
            {tab === 'overview' ? 'Overview' : tab === '3d' ? '3D Printing' : 'DTF Transfers'}
            {activeTab === tab && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-wise-neon rounded-full" />}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Card className="p-4 hover:border-border-electric transition-colors group cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-wise-electric/10 flex items-center justify-center text-wise-electric">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0022 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text-primary group-hover:text-wise-electric transition-colors">3D Print Order</h3>
                  <p className="text-xs text-text-muted">Upload STL/3MF/STEP files</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 hover:border-border-neon transition-colors group cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-wise-neon/10 flex items-center justify-center text-wise-neon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text-primary group-hover:text-wise-neon transition-colors">DTF Transfer</h3>
                  <p className="text-xs text-text-muted">Upload artwork for transfers</p>
                </div>
              </div>
            </Card>
            <Link href="/dashboard/print-on-demand/gang-sheets">
              <Card className="p-4 hover:border-purple-500/30 transition-colors group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary group-hover:text-purple-400 transition-colors">Gang Sheet Builder</h3>
                    <p className="text-xs text-text-muted">Pack multiple designs</p>
                  </div>
                </div>
              </Card>
            </Link>
          </div>

          <Card className="p-0 overflow-hidden">
            <div className="px-4 py-3 border-b border-border-subtle flex items-center justify-between">
              <h2 className="text-sm font-semibold text-text-primary">Recent Orders</h2>
              <Link href="/dashboard/print-on-demand/orders" className="text-xs text-wise-electric hover:underline">View All</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-subtle text-text-muted text-xs">
                    <th className="text-left px-4 py-2 font-medium">Order</th>
                    <th className="text-left px-4 py-2 font-medium">Customer</th>
                    <th className="text-left px-4 py-2 font-medium">Type</th>
                    <th className="text-left px-4 py-2 font-medium">Status</th>
                    <th className="text-right px-4 py-2 font-medium">Total</th>
                    <th className="text-right px-4 py-2 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {DEMO_ORDERS.map(order => (
                    <tr key={order.id} className="border-b border-border-subtle/50 hover:bg-wise-surface-elevated/50 transition-colors">
                      <td className="px-4 py-2.5"><span className="font-mono text-xs text-wise-electric">{order.orderNumber}</span></td>
                      <td className="px-4 py-2.5 text-text-primary">{order.customerName}</td>
                      <td className="px-4 py-2.5"><Badge variant="neutral">{fmtType(order.orderType)}</Badge></td>
                      <td className="px-4 py-2.5"><Badge variant={STATUS_BADGE[order.status] || 'neutral'}>{fmtStatus(order.status)}</Badge></td>
                      <td className="px-4 py-2.5 text-right font-mono text-text-primary">${order.totalPrice.toFixed(2)}</td>
                      <td className="px-4 py-2.5 text-right text-text-muted text-xs">{new Date(order.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Card className="p-4">
              <h3 className="text-sm font-semibold text-text-primary mb-3">3D Printing Capabilities</h3>
              <div className="space-y-2 text-xs text-text-muted">
                <div className="flex justify-between"><span>Printer</span><span className="text-text-primary">Anycubic Kobra X</span></div>
                <div className="flex justify-between"><span>Build Volume</span><span className="text-text-primary">260 × 260 × 260mm</span></div>
                <div className="flex justify-between"><span>Materials</span><span className="text-text-primary">PLA, PETG, ABS, TPU</span></div>
                <div className="flex justify-between"><span>Layer Heights</span><span className="text-text-primary">0.12 – 0.28mm</span></div>
                <div className="flex justify-between"><span>Nozzle</span><span className="text-text-primary">0.4mm</span></div>
                <div className="flex justify-between"><span>File Types</span><span className="text-text-primary">STL, 3MF, OBJ, STEP, SCAD</span></div>
              </div>
            </Card>
            <Card className="p-4">
              <h3 className="text-sm font-semibold text-text-primary mb-3">DTF Production</h3>
              <div className="space-y-2 text-xs text-text-muted">
                <div className="flex justify-between"><span>Transfer Types</span><span className="text-text-primary">Individual, Gang Sheet</span></div>
                <div className="flex justify-between"><span>Gang Sizes</span><span className="text-text-primary">12×16&quot; to 22×48&quot;</span></div>
                <div className="flex justify-between"><span>Min DPI</span><span className="text-text-primary">150 (300 recommended)</span></div>
                <div className="flex justify-between"><span>Color Mode</span><span className="text-text-primary">CMYK + White</span></div>
                <div className="flex justify-between"><span>Artwork Types</span><span className="text-text-primary">PNG, SVG, PDF</span></div>
                <div className="flex justify-between"><span>Turnaround</span><span className="text-text-primary">2–5 business days</span></div>
              </div>
            </Card>
          </div>
        </>
      )}

      {activeTab === '3d' && (
        <div className="space-y-4">
          <Card className="p-5 text-center py-12">
            <div className="w-16 h-16 mx-auto mb-3 rounded-xl bg-wise-electric/10 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-wise-electric"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0022 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
            </div>
            <h2 className="text-lg font-semibold text-text-primary mb-2">3D Print Production Queue</h2>
            <p className="text-sm text-text-muted">Production queue populates when orders are placed.</p>
            <p className="text-xs text-text-muted mt-1">Files are validated through automated preflight before entering production.</p>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {['Packout Accessories', 'Monitor Stands', 'Custom Parts'].map(cat => (
              <Card key={cat} className="p-4 hover:border-border-electric transition-colors">
                <h3 className="text-sm font-semibold text-text-primary mb-1">{cat}</h3>
                <p className="text-xs text-text-muted">0 products</p>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'dtf' && (
        <div className="space-y-4">
          <Card className="p-5 text-center py-12">
            <div className="w-16 h-16 mx-auto mb-3 rounded-xl bg-wise-neon/10 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-wise-neon"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            </div>
            <h2 className="text-lg font-semibold text-text-primary mb-2">DTF Production Queue</h2>
            <p className="text-sm text-text-muted">DTF production queue populates when transfers are ordered.</p>
            <p className="text-xs text-text-muted mt-1">Artwork is validated for DPI, transparency, and color mode before production.</p>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {['Individual Transfers', 'Gang Sheets', 'Apparel Orders'].map(cat => (
              <Card key={cat} className="p-4 hover:border-border-neon transition-colors">
                <h3 className="text-sm font-semibold text-text-primary mb-1">{cat}</h3>
                <p className="text-xs text-text-muted">0 in queue</p>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="text-center pt-2">
        <p className="text-2xs text-text-muted">Powered by <span className="text-wise-neon font-semibold">WISE²</span> Business OS</p>
      </div>
    </div>
  );
}
