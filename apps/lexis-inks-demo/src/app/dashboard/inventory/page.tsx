'use client';

import Link from 'next/link';
import { useState } from 'react';

const inventoryItems = [
  { id: 1, type: 'Pens - Navy', quantity: 45, lowThreshold: 20, unitCost: 3.50 },
  { id: 2, type: 'Pens - Blue', quantity: 32, lowThreshold: 20, unitCost: 3.50 },
  { id: 3, type: 'Pens - Cyan', quantity: 18, lowThreshold: 20, unitCost: 3.50 },
  { id: 4, type: 'Pens - Silver', quantity: 15, lowThreshold: 20, unitCost: 3.50 },
  { id: 5, type: 'Crystal Toppers', quantity: 120, lowThreshold: 50, unitCost: 1.20 },
  { id: 6, type: 'Bead Chains', quantity: 85, lowThreshold: 50, unitCost: 0.80 },
  { id: 7, type: 'Charm Toppers', quantity: 200, lowThreshold: 100, unitCost: 0.50 },
  { id: 8, type: 'Gift Boxes', quantity: 8, lowThreshold: 50, unitCost: 0.75 },
  { id: 9, type: 'Tissue Paper', quantity: 250, lowThreshold: 100, unitCost: 0.10 },
  { id: 10, type: 'Business Cards', quantity: 500, lowThreshold: 200, unitCost: 0.05 },
];

export default function InventoryPage() {
  const lowStockItems = inventoryItems.filter(item => item.quantity <= item.lowThreshold);

  return (
    <main className="bg-navy min-h-screen text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link href="/dashboard" className="text-cyan hover:text-cyan-glow mb-6 inline-block">← Back</Link>
        <h1 className="text-4xl font-bold mb-8">Inventory Tracker</h1>

        {lowStockItems.length > 0 && (
          <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-4 mb-8">
            <p className="font-bold text-yellow-300">⚠️ {lowStockItems.length} items low in stock</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-8 mb-8">
          <div className="bg-navy-light rounded-lg p-6 border border-navy-light">
            <p className="text-silver-dark text-sm mb-2">Total Inventory Value</p>
            <p className="text-3xl font-bold text-cyan">
              ${inventoryItems.reduce((sum, i) => sum + (i.quantity * i.unitCost), 0).toFixed(2)}
            </p>
          </div>
          <div className="bg-navy-light rounded-lg p-6 border border-navy-light">
            <p className="text-silver-dark text-sm mb-2">Items in Stock</p>
            <p className="text-3xl font-bold text-cyan">
              {inventoryItems.reduce((sum, i) => sum + i.quantity, 0)}
            </p>
          </div>
        </div>

        <div className="bg-navy-light rounded-lg overflow-hidden border border-navy-light">
          <table className="w-full">
            <thead className="bg-navy-dark">
              <tr>
                <th className="text-left p-4 text-silver-dark">Item</th>
                <th className="text-left p-4 text-silver-dark">Quantity</th>
                <th className="text-left p-4 text-silver-dark">Low Threshold</th>
                <th className="text-left p-4 text-silver-dark">Unit Cost</th>
                <th className="text-left p-4 text-silver-dark">Total Value</th>
                <th className="text-left p-4 text-silver-dark">Status</th>
              </tr>
            </thead>
            <tbody>
              {inventoryItems.map((item) => (
                <tr key={item.id} className="border-t border-navy hover:bg-navy transition">
                  <td className="p-4 font-bold">{item.type}</td>
                  <td className="p-4 text-cyan">{item.quantity}</td>
                  <td className="p-4 text-silver-dark">{item.lowThreshold}</td>
                  <td className="p-4 text-silver-dark">${item.unitCost.toFixed(2)}</td>
                  <td className="p-4 text-cyan font-bold">${(item.quantity * item.unitCost).toFixed(2)}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded text-xs font-bold inline-block ${
                      item.quantity <= item.lowThreshold ? 'bg-red-900 text-red-300' :
                      item.quantity <= item.lowThreshold * 1.5 ? 'bg-yellow-900 text-yellow-300' :
                      'bg-green-900 text-green-300'
                    }`}>
                      {item.quantity <= item.lowThreshold ? 'LOW' : item.quantity <= item.lowThreshold * 1.5 ? 'WARNING' : 'OK'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
