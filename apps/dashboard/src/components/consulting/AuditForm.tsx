'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Loader2 } from 'lucide-react';

const INDUSTRIES = [
  'Restaurant & Food Service',
  'Retail & E-commerce',
  'Medical & Healthcare',
  'Real Estate & Property Management',
  'Law Firms & Professional Services',
  'Construction & Manufacturing',
  'Insurance & Financial Services',
  'Automotive & Transportation',
  'Nonprofits & Government',
  'Startups & Tech',
];

const PAIN_POINTS = [
  'Manual data entry',
  'Slow response times',
  'High operational costs',
  'Limited customer insights',
  'Inefficient scheduling',
  'Document processing delays',
  'Poor customer retention',
  'Difficulty scaling',
  'Staff turnover',
  'Inventory management',
];

const DESIRED_OUTCOMES = [
  'Reduce operational costs',
  'Improve customer satisfaction',
  'Increase revenue',
  'Save employee time',
  'Better decision making',
  'Faster response times',
  'Scale without hiring',
  'Improve data accuracy',
  'Enhance customer experience',
  'Better team collaboration',
];

interface AuditFormProps {
  onComplete?: (data: any) => void;
  defaultData?: any;
}

export default function AuditForm({ onComplete, defaultData }: AuditFormProps) {
  const [formData, setFormData] = useState(
    defaultData || {
      clientName: '',
      industry: '',
      revenue: '',
      employees: '',
      painPoints: [],
      currentAIUsage: [],
      desiredOutcomes: [],
      automationOpportunities: [],
    }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.clientName || !formData.industry) {
      setError('Client name and industry are required');
      return;
    }

    setLoading(true);
    onComplete?.(formData);
    setLoading(false);
  };

  const togglePainPoint = (point: string) => {
    setFormData((prev: any) => ({
      ...prev,
      painPoints: prev.painPoints.includes(point)
        ? prev.painPoints.filter((p: string) => p !== point)
        : [...prev.painPoints, point],
    }));
  };

  const toggleOutcome = (outcome: string) => {
    setFormData((prev: any) => ({
      ...prev,
      desiredOutcomes: prev.desiredOutcomes.includes(outcome)
        ? prev.desiredOutcomes.filter((o: string) => o !== outcome)
        : [...prev.desiredOutcomes, outcome],
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Client Information */}
      <div className="space-y-4">
        <h3 className="font-semibold text-foreground">Client Information</h3>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="clientName">Client Name *</Label>
            <Input
              id="clientName"
              placeholder="Your business name"
              value={formData.clientName}
              onChange={(e) =>
                setFormData({ ...formData, clientName: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="industry">Industry *</Label>
            <Select
              value={formData.industry}
              onValueChange={(value) =>
                setFormData({ ...formData, industry: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                {INDUSTRIES.map((ind) => (
                  <SelectItem key={ind} value={ind}>
                    {ind}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="revenue">Annual Revenue ($)</Label>
            <Input
              id="revenue"
              placeholder="e.g., 500000"
              type="number"
              value={formData.revenue}
              onChange={(e) =>
                setFormData({ ...formData, revenue: parseInt(e.target.value) })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="employees">Number of Employees</Label>
            <Input
              id="employees"
              placeholder="e.g., 25"
              type="number"
              value={formData.employees}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  employees: parseInt(e.target.value),
                })
              }
            />
          </div>
        </div>
      </div>

      {/* Pain Points */}
      <div className="space-y-4">
        <h3 className="font-semibold text-foreground">Top Pain Points</h3>
        <p className="text-sm text-muted-foreground">
          Select the challenges causing the most operational friction.
        </p>
        <div className="flex flex-wrap gap-2">
          {PAIN_POINTS.map((point) => (
            <Badge
              key={point}
              variant={
                formData.painPoints.includes(point) ? 'default' : 'outline'
              }
              className="cursor-pointer"
              onClick={() => togglePainPoint(point)}
            >
              {point}
            </Badge>
          ))}
        </div>
      </div>

      {/* Desired Outcomes */}
      <div className="space-y-4">
        <h3 className="font-semibold text-foreground">Desired Outcomes</h3>
        <p className="text-sm text-muted-foreground">
          What are your top 3 business goals for the next 12 months?
        </p>
        <div className="flex flex-wrap gap-2">
          {DESIRED_OUTCOMES.map((outcome) => (
            <Badge
              key={outcome}
              variant={
                formData.desiredOutcomes.includes(outcome) ? 'default' : 'outline'
              }
              className="cursor-pointer"
              onClick={() => toggleOutcome(outcome)}
            >
              {outcome}
            </Badge>
          ))}
        </div>
      </div>

      {/* Current AI Usage */}
      <div className="space-y-2">
        <Label htmlFor="aiUsage">
          Current AI Usage (ChatGPT, Claude, etc.)
        </Label>
        <Textarea
          id="aiUsage"
          placeholder="Describe any current AI tools or usage..."
          className="resize-none"
          rows={3}
          value={formData.currentAIUsage.join(', ')}
          onChange={(e) =>
            setFormData({
              ...formData,
              currentAIUsage: e.target.value
                .split(',')
                .map((s) => s.trim())
                .filter((s) => s),
            })
          }
        />
      </div>

      {/* Automation Opportunities */}
      <div className="space-y-2">
        <Label htmlFor="opportunities">
          Automation Opportunities (optional)
        </Label>
        <Textarea
          id="opportunities"
          placeholder="Describe processes that could be automated or improved..."
          className="resize-none"
          rows={3}
          value={formData.automationOpportunities.join(', ')}
          onChange={(e) =>
            setFormData({
              ...formData,
              automationOpportunities: e.target.value
                .split(',')
                .map((s) => s.trim())
                .filter((s) => s),
            })
          }
        />
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={loading || !formData.clientName || !formData.industry}
        className="w-full"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing Audit...
          </>
        ) : (
          'Complete Business Audit'
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        This assessment typically takes 5-10 minutes and identifies key automation opportunities.
      </p>
    </form>
  );
}
