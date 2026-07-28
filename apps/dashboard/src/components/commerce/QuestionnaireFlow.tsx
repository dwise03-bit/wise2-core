'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { AlertCircle, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';

const BUSINESS_MODELS = [
  {
    id: 'subscription',
    name: 'Subscription',
    description: 'Recurring revenue, high customer LTV',
  },
  {
    id: 'dropshipping',
    name: 'Dropshipping',
    description: 'Low startup cost, supplier fulfills',
  },
  {
    id: 'pod',
    name: 'Print-on-Demand',
    description: 'Zero inventory, unlimited SKUs',
  },
  {
    id: 'digital',
    name: 'Digital Products',
    description: '80%+ margins, instant delivery',
  },
  {
    id: 'hybrid',
    name: 'Hybrid',
    description: 'Physical + digital revenue streams',
  },
  {
    id: 'wholesale',
    name: 'Wholesale',
    description: 'B2B focused, bulk orders',
  },
  {
    id: 'private_label',
    name: 'Private Label',
    description: 'Custom manufacturing, full control',
  },
  {
    id: 'service',
    name: 'Service Commerce',
    description: 'Local or online services',
  },
  {
    id: 'ai_generated',
    name: 'AI-Generated Brands',
    description: 'Zero capital, rapid testing',
  },
];

interface QuestionnaireFlowProps {
  onComplete?: (data: any) => void;
  onCancel?: () => void;
}

export default function QuestionnaireFlow({ onComplete, onCancel }: QuestionnaireFlowProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    businessModel: '',
    targetAudience: '',
    problemSolution: '',
    budget: '',
    timeline: '',
    existingBrand: false,
    revenueGoal: '',
    profitGoal: '',
    lookingFor: '',
    competitiveAdvantage: '',
  });

  const handleNext = async () => {
    if (step === 4) {
      setLoading(true);
      try {
        const response = await fetch('/api/v1/commerce/questionnaire', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          throw new Error('Failed to process questionnaire');
        }

        const result = await response.json();
        onComplete?.(result);
      } catch (error) {
        console.error('Error processing questionnaire:', error);
      } finally {
        setLoading(false);
      }
    } else {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(Math.max(1, step - 1));
  };

  const isStepComplete = () => {
    switch (step) {
      case 1:
        return formData.businessModel !== '';
      case 2:
        return formData.targetAudience !== '' && formData.problemSolution !== '';
      case 3:
        return formData.budget !== '' && formData.timeline !== '';
      case 4:
        return formData.revenueGoal !== '' && formData.profitGoal !== '';
      default:
        return false;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Progress */}
        <div className="px-6 pt-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    s < step
                      ? 'bg-green-600 text-white'
                      : s === step
                        ? 'bg-blue-600 text-white'
                        : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {s < step ? <CheckCircle2 className="h-5 w-5" /> : s}
                </div>
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              Step {step} of 4
            </span>
          </div>
        </div>

        <CardHeader>
          {step === 1 && (
            <>
              <CardTitle>Choose Your Business Model</CardTitle>
              <CardDescription>
                Select the business model that best fits your vision
              </CardDescription>
            </>
          )}
          {step === 2 && (
            <>
              <CardTitle>Define Your Market</CardTitle>
              <CardDescription>
                Who are you serving and what problem are you solving?
              </CardDescription>
            </>
          )}
          {step === 3 && (
            <>
              <CardTitle>Set Your Budget & Timeline</CardTitle>
              <CardDescription>
                How much can you invest and when do you want to launch?
              </CardDescription>
            </>
          )}
          {step === 4 && (
            <>
              <CardTitle>Revenue & Success Goals</CardTitle>
              <CardDescription>
                What are your financial targets and growth aspirations?
              </CardDescription>
            </>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 1: Business Model */}
          {step === 1 && (
            <div className="grid gap-3">
              {BUSINESS_MODELS.map((model) => (
                <div
                  key={model.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    formData.businessModel === model.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-border hover:border-blue-300'
                  }`}
                  onClick={() => setFormData({ ...formData, businessModel: model.id })}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{model.name}</p>
                      <p className="text-sm text-muted-foreground">{model.description}</p>
                    </div>
                    {formData.businessModel === model.id && (
                      <CheckCircle2 className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Step 2: Market Definition */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="audience">Who is your ideal customer?</Label>
                <Input
                  id="audience"
                  placeholder="e.g., Busy professionals aged 25-45 who value convenience"
                  value={formData.targetAudience}
                  onChange={(e) =>
                    setFormData({ ...formData, targetAudience: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="problem">What problem do you solve?</Label>
                <Textarea
                  id="problem"
                  placeholder="e.g., Help busy professionals save time on their morning routine by delivering premium coffee to their door"
                  className="resize-none"
                  rows={4}
                  value={formData.problemSolution}
                  onChange={(e) =>
                    setFormData({ ...formData, problemSolution: e.target.value })
                  }
                />
              </div>
            </div>
          )}

          {/* Step 3: Budget & Timeline */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="budget">What's your startup budget?</Label>
                <Select
                  value={formData.budget}
                  onValueChange={(value) => setFormData({ ...formData, budget: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select budget range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-500">$0 - $500 (Minimal)</SelectItem>
                    <SelectItem value="500-2000">$500 - $2,000 (Bootstrap)</SelectItem>
                    <SelectItem value="2000-5000">$2,000 - $5,000 (Funded)</SelectItem>
                    <SelectItem value="5000-10000">$5,000 - $10,000 (Well-funded)</SelectItem>
                    <SelectItem value="10000+">$10,000+ (Serious Investment)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeline">When do you want to launch?</Label>
                <Select
                  value={formData.timeline}
                  onValueChange={(value) => setFormData({ ...formData, timeline: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select timeline" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asap">ASAP (1-2 weeks)</SelectItem>
                    <SelectItem value="1-month">1 Month</SelectItem>
                    <SelectItem value="2-3-months">2-3 Months</SelectItem>
                    <SelectItem value="3-6-months">3-6 Months</SelectItem>
                    <SelectItem value="6-12-months">6-12 Months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 4: Goals */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="revenueGoal">Monthly revenue goal (first year)</Label>
                <Input
                  id="revenueGoal"
                  placeholder="e.g., $5000"
                  type="number"
                  value={formData.revenueGoal}
                  onChange={(e) =>
                    setFormData({ ...formData, revenueGoal: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="profitGoal">Target profit margin %</Label>
                <Input
                  id="profitGoal"
                  placeholder="e.g., 40"
                  type="number"
                  value={formData.profitGoal}
                  onChange={(e) =>
                    setFormData({ ...formData, profitGoal: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>What are you looking for?</Label>
                <div className="flex gap-2">
                  {['Passive Income', 'Active Management'].map((opt) => (
                    <Badge
                      key={opt}
                      variant={
                        formData.lookingFor === opt.toLowerCase().replace(' ', '_')
                          ? 'default'
                          : 'outline'
                      }
                      className="cursor-pointer"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          lookingFor: opt.toLowerCase().replace(' ', '_'),
                        })
                      }
                    >
                      {opt}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-3 justify-between">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            Cancel
          </Button>

          <div className="flex gap-2 flex-1">
            {step > 1 && (
              <Button variant="outline" onClick={handleBack} className="flex-1">
                Back
              </Button>
            )}

            <Button
              onClick={handleNext}
              disabled={!isStepComplete() || loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : step === 4 ? (
                <>
                  Create Business
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
