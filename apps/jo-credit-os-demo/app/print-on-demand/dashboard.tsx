'use client';

import React from 'react';
import Link from 'next/link';
import { Printer, Palette, Zap, AlertCircle } from 'lucide-react';

export default function DTFPrintStudioDashboard() {
  return (
    <div className="min-h-screen bg-wise-bg-primary text-wise-text-primary">
      <div className="border-b border-wise-primary-border bg-wise-bg-secondary/50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-wise-primary/10 border border-wise-primary-border rounded-lg">
              <Printer className="w-6 h-6 text-wise-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-wise-primary">DTF Print Studio</h1>
              <p className="text-wise-text-secondary mt-1">Design, manage, and print on-demand products</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-wise-bg-card border border-wise-primary-border rounded-lg p-12 text-center">
          <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-wise-text-primary mb-2">Setup Required</h3>
          <p className="text-wise-text-muted mb-8 max-w-2xl mx-auto">
            The DTF Print Studio integrates with direct-to-film printing technology. Backend printer integration and configuration is required before this module becomes available.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[
              { title: 'Designer', status: 'COMING SOON', icon: Palette },
              { title: 'Gang Sheets', status: 'PLANNED', icon: Zap },
              { title: 'Print Queue', status: 'PLANNED', icon: Printer },
            ].map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="bg-wise-bg-secondary/50 border border-wise-primary-border/30 rounded-lg p-6">
                  <Icon className="w-8 h-8 text-wise-primary/50 mb-3" />
                  <h4 className="font-semibold text-wise-text-primary mb-2">{feature.title}</h4>
                  <span className="text-xs px-2 py-1 bg-gray-500/10 text-gray-400 rounded">{feature.status}</span>
                </div>
              );
            })}
          </div>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-wise-primary hover:bg-wise-primary-hover text-white font-semibold rounded-lg transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
