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
import { AlertCircle, Loader2, ClipboardList } from 'lucide-react';

const TIMELINES = [
  '4 weeks',
  '6 weeks',
  '8 weeks',
  '12 weeks',
  '6 months',
  '12 months',
];

const SOLUTIONS = [
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

interface ImplementationPlannerProps {
  auditData: any;
}

export default function ImplementationPlanner({ auditData }: ImplementationPlannerProps) {
  const [selectedSolution, setSelectedSolution] = useState('');
  const [selectedTimeline, setSelectedTimeline] = useState('');
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generatePlan = async () => {
    if (!selectedSolution || !selectedTimeline) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/v1/consulting/implementation-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: auditData.clientName,
          solution: selectedSolution,
          timeline: selectedTimeline,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate implementation plan');
      }

      const data = await response.json();
      setPlan(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Plan Configuration */}
      <Card className="p-4 space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Solution</label>
            <Select value={selectedSolution} onValueChange={setSelectedSolution}>
              <SelectTrigger>
                <SelectValue placeholder="Select solution" />
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

          <div className="space-y-2">
            <label className="text-sm font-medium">Timeline</label>
            <Select value={selectedTimeline} onValueChange={setSelectedTimeline}>
              <SelectTrigger>
                <SelectValue placeholder="Select timeline" />
              </SelectTrigger>
              <SelectContent>
                {TIMELINES.map((tl) => (
                  <SelectItem key={tl} value={tl}>
                    {tl}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          onClick={generatePlan}
          disabled={!selectedSolution || !selectedTimeline || loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Plan...
            </>
          ) : (
            'Generate Implementation Plan'
          )}
        </Button>
      </Card>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Plan Output */}
      {plan && (
        <div className="space-y-6">
          <div className="flex items-start gap-4 rounded-lg bg-green-50 p-4">
            <ClipboardList className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-green-900">Implementation Plan Ready</h3>
              <p className="text-sm text-green-700 mt-1">
                Detailed week-by-week plan for deploying {selectedSolution} over {selectedTimeline}.
              </p>
            </div>
          </div>

          <Card className="p-6 bg-muted">
            <div className="text-sm text-foreground space-y-4">
              {plan.plan.split('\n').map((line: string, idx: number) => (
                <p key={idx} className={line.trim() === '' ? 'h-2' : ''}>
                  {line}
                </p>
              ))}
            </div>
          </Card>

          {/* Success Metrics */}
          <Card className="p-6 space-y-4">
            <h3 className="font-semibold text-foreground">Success Metrics</h3>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-lg bg-blue-50 p-3">
                <p className="text-xs font-medium text-blue-900">Adoption Rate</p>
                <p className="text-sm text-blue-700 mt-1">60%+ team adoption in first month</p>
              </div>
              <div className="rounded-lg bg-green-50 p-3">
                <p className="text-xs font-medium text-green-900">Time Savings</p>
                <p className="text-sm text-green-700 mt-1">
                  {Math.floor(Math.random() * 10) + 8}+ hours/week saved
                </p>
              </div>
              <div className="rounded-lg bg-purple-50 p-3">
                <p className="text-xs font-medium text-purple-900">Quality Improvement</p>
                <p className="text-sm text-purple-700 mt-1">25%+ error reduction</p>
              </div>
            </div>
          </Card>

          <div className="flex gap-2">
            <Button
              onClick={() => setPlan(null)}
              variant="outline"
              className="flex-1"
            >
              Modify Plan
            </Button>
            <Button className="flex-1">
              Start Implementation
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
