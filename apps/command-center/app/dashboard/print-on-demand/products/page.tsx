'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, Badge, Button } from '../../../../src/components/ui';

const CATEGORIES = [
  { id: 'all', name: 'All Products' },
  { id: '3d', name: '3D Printed' },
  { id: 'dtf', name: 'DTF Transfers' },
  { id: 'apparel', name: 'Apparel' },
  { id: 'design', name: 'Design Services' },
];

const DEMO_PRODUCTS = [
  { id: '1', name: 'Packout Monitor Mount', slug: 'packout-monitor-mount', category: '3d', type: 'THREE_D_PRINT', basePrice: 45.00, isActive: true, isFeatured: true, image: null, materials: ['PLA', 'PETG'], estimatedDays: 3 },
  { id: '2', name: 'Router Wall Mount', slug: 'router-wall-mount', category: '3d', type: 'THREE_D_PRINT', basePrice: 22.00, isActive: true, isFeatured: false, image: null, materials: ['PLA'], estimatedDays: 2 },
  { id: '3', name: 'Custom Logo Transfer', slug: 'custom-logo-transfer', category: 'dtf', type: 'DTF_TRANSFER', basePrice: 5.00, isActive: true, isFeatured: true, image: null, materials: [], estimatedDays: 3 },
  { id: '4', name: 'Gang Sheet 22×32"', slug: 'gang-sheet-22x32', category: 'dtf', type: 'DTF_GANG_SHEET', basePrice: 48.00, isActive: true, isFeatured: false, image: null, materials: [], estimatedDays: 2 },
  { id: '5', name: 'Branded T-Shirt', slug: 'branded-tshirt', category: 'apparel', type: 'APPAREL', basePrice: 28.00, isActive: true, isFeatured: true, image: null, materials: [], estimatedDays: 5 },
  { id: '6', name: 'CAD Design Service', slug: 'cad-design-service', category: 'design', type: 'DESIGN_SERVICE', basePrice: 45.00, isActive: true, isFeatured: false, image: null, materials: [], estimatedDays: 3 },
  { id: '7', name: 'Raspberry Pi Mount', slug: 'raspberry-pi-mount', category: '3d', type: 'THREE_D_PRINT', basePrice: 18.00, isActive: true, isFeatured: false, image: null, materials: ['PLA', 'PETG'], estimatedDays: 2 },
  { id: '8', name: 'Cable Management Clip (10pk)', slug: 'cable-clip-10pk', category: '3d', type: 'THREE_D_PRINT', basePrice: 12.00, isActive: false, isFeatured: false, image: null, materials: ['PLA'], estimatedDays: 1 },
];

const TYPE_MAP: Record<string, string> = {
  THREE_D_PRINT: '3D Print', DTF_TRANSFER: 'DTF Transfer', DTF_GANG_SHEET: 'Gang Sheet',
  APPAREL: 'Apparel', DESIGN_SERVICE: 'Design',
};

export default function ProductsPage() {
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filtered = DEMO_PRODUCTS.filter(p => categoryFilter === 'all' || p.category === categoryFilter);

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <Link href="/dashboard/print-on-demand" className="text-text-muted hover:text-text-secondary text-sm">&larr; Print Shop</Link>
          <h1 className="text-xl font-bold text-white mt-1">Product Catalog</h1>
          <p className="text-sm text-text-muted">{filtered.length} products</p>
        </div>
        <Button variant="primary">+ Add Product</Button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setCategoryFilter(cat.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
              categoryFilter === cat.id
                ? 'bg-wise-neon/15 text-wise-neon border border-wise-neon/30'
                : 'bg-wise-gunmetal text-text-muted border border-border-subtle hover:text-text-secondary'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {filtered.map(product => (
          <Card key={product.id} className="p-0 overflow-hidden hover:border-border-electric transition-colors group">
            <div className="h-32 bg-wise-surface-elevated flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted/30">
                {product.category === '3d' ? (
                  <><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0022 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></>
                ) : (
                  <><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></>
                )}
              </svg>
            </div>
            <div className="p-3">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="text-sm font-semibold text-text-primary group-hover:text-wise-electric transition-colors line-clamp-1">{product.name}</h3>
                {product.isFeatured && <Badge variant="warning">Featured</Badge>}
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="neutral">{TYPE_MAP[product.type] || product.type}</Badge>
                {!product.isActive && <Badge variant="danger">Inactive</Badge>}
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-wise-neon font-semibold">${product.basePrice.toFixed(2)}</span>
                <span className="text-text-muted">{product.estimatedDays}d turnaround</span>
              </div>
              {product.materials.length > 0 && (
                <p className="text-2xs text-text-muted mt-1">{product.materials.join(' / ')}</p>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
