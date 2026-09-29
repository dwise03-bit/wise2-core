'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DollarSign, TrendingUp, Clock, AlertCircle, Loader2 } from 'lucide-react';

const SOLUTIONS = [
  'Starter Tier',
  'Growth Tier',
  'Enterprise Tier',
  'AI Receptionist',
  'Lead Capture',
  'Email Automation',
  'CRM Automation',
  'Proposal Generator',
  'Marketing Assistant',
  'Knowledge Base',
  'Document Automation',
  'Voice AI',
  'Business Intelligence',
];

interface ROICalculatorProps {
  auditData: any;
}

export default function ROICalculator({ auditData }: ROICalculatorProps) {
  const [selectedSolution, setSelectedSolution] = useState('');
  const [projection, setProjection] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const calculateROI = async () => {
    if (!selectedSolution) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/v1/consulting/roi-projection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audit: auditData, solution: selectedSolution }),
      });

      if (!response.ok) {
        throw new Error('Failed to calculate ROI');
      }

      const data = await response.json();
      setProjection(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Solution Selector */}
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Solution</label>
          <Select value={selectedSolution} onValueChange={setSelectedSolution}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a solution to analyze" />
            </SelectTrigger>
            <SelectContent>
              {SOLUTIONS.map((sol) => (
                <SelectItem key={sol} value={sol}>
                  {sol}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={calculateROI}
          disabled={!selectedSolution || loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Calculating...
            </>
          ) : (
            'Calculate ROI'
          )}
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* ROI Results */}
      {projection && (
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <Card className="p-4 space-y-2 bg-gradient-to-br from-green-50 to-green-100">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-900">
                  Annual Savings
                </span>
                <DollarSign className="h-4 w-4 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-green-700">
                ${projection.annualSavings.toLocaleString()}
              </div>
            </Card>

            <Card className="p-4 space-y-2 bg-gradient-to-br from-blue-50 to-blue-100">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-900">
                  Implementation Cost
                </span>
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-blue-700">
                ${projection.implementationCost.toLocaleString()}
              </div>
            </Card>

            <Card className="p-4 space-y-2 bg-gradient-to-br from-purple-50 to-purple-100">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-purple-900">
                  Payback Period
                </span>
                <Clock className="h-4 w-4 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-purple-700">
                {projection.paybackMonths} months
              </div>
            </Card>

            <Card className="p-4 space-y-2 bg-gradient-to-br from-amber-50 to-amber-100">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-amber-900">
                  Year 1 ROI
                </span>
                <TrendingUp className="h-4 w-4 text-amber-600" />
              </div>
              <div className="text-3xl font-bold text-amber-700">
                {projection.firstYearROI}%
              </div>
            </Card>
          </div>

          {/* Summary */}
          <Card className="p-4 bg-muted">
            <p className="text-sm text-foreground">{projection.summary}</p>
          </Card>

          {/* Recommendation */}
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">Analysis</h3>
            {projection.paybackMonths <= 6 && (
              <p className="text-sm text-green-700 bg-green-50 p-3 rounded">
                ✓ Excellent ROI: This solution pays for itself within 6 months, making it
                a strong investment with high confidence in value delivery.
              </p>
            )}
            {projection.paybackMonths > 6 && projection.paybackMonths <= 12 && (
              <p className="text-sm text-blue-700 bg-blue-50 p-3 rounded">
                → Good ROI: This solution delivers positive returns within 12 months. Consider
                combining with other solutions to accelerate payback.
              </p>
            )}
            {projection.paybackMonths > 12 && (
              <p className="text-sm text-amber-700 bg-amber-50 p-3 rounded">
                ⚠ Extended Payback: This solution has a longer ROI timeline. Focus on quick
                wins first, then layer in this solution as part of a larger transformation.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
