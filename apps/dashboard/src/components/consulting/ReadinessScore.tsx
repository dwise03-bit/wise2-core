'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle2, Clock, Loader2, AlertTriangle } from 'lucide-react';

interface ReadinessScoreProps {
  auditData: any;
  onScoreCalculated?: (score: any) => void;
}

export default function ReadinessScore({
  auditData,
  onScoreCalculated,
}: ReadinessScoreProps) {
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState<any>(null);
  const [error, setError] = useState('');

  const calculateScore = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/v1/consulting/readiness-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(auditData),
      });

      if (!response.ok) {
        throw new Error('Failed to calculate readiness score');
      }

      const data = await response.json();
      setScore(data);
      onScoreCalculated?.(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateScore();
  }, [auditData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
        <Button onClick={calculateScore} variant="outline" className="w-full">
          Retry
        </Button>
      </div>
    );
  }

  if (!score) {
    return (
      <Button onClick={calculateScore} className="w-full">
        Calculate Readiness Score
      </Button>
    );
  }

  const scorePercentage = (score.score / 10) * 100;
  const getScoreColor = (s: number) => {
    if (s < 4) return 'text-red-600';
    if (s < 6) return 'text-amber-600';
    if (s < 8) return 'text-blue-600';
    return 'text-green-600';
  };

  const getScoreIcon = (s: number) => {
    if (s < 4) return <AlertTriangle className="h-8 w-8 text-red-600" />;
    if (s < 6) return <Clock className="h-8 w-8 text-amber-600" />;
    return <CheckCircle2 className="h-8 w-8 text-green-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Score Card */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-foreground">AI Readiness Score</h3>
            <p className="text-sm text-muted-foreground mt-1">{score.assessment}</p>
          </div>
          {getScoreIcon(score.score)}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className={`text-4xl font-bold ${getScoreColor(score.score)}`}>
              {score.score}
            </span>
            <span className="text-sm text-muted-foreground">/10</span>
          </div>
          <Progress value={scorePercentage} className="h-2" />
        </div>

        <div className="rounded-lg bg-muted p-3">
          <p className="text-sm text-foreground">{score.recommendation}</p>
        </div>
      </Card>

      {/* Assessment Details */}
      <div className="space-y-3">
        <h3 className="font-semibold text-foreground">Assessment Breakdown</h3>

        <div className="grid gap-3 md:grid-cols-3">
          <Card className="p-4 space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Technical Readiness
            </p>
            <div className="text-2xl font-bold text-primary">
              {score.score >= 6 ? '✓' : '~'}
            </div>
            <p className="text-xs text-muted-foreground">
              Data quality, systems integration, technical infrastructure
            </p>
          </Card>

          <Card className="p-4 space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Organizational Readiness
            </p>
            <div className="text-2xl font-bold text-primary">
              {score.score >= 6 ? '✓' : '→'}
            </div>
            <p className="text-xs text-muted-foreground">
              Change management, training resources, leadership alignment
            </p>
          </Card>

          <Card className="p-4 space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Data Maturity
            </p>
            <div className="text-2xl font-bold text-primary">
              {score.score >= 7 ? '✓' : '→'}
            </div>
            <p className="text-xs text-muted-foreground">
              Data collection, quality, security, compliance
            </p>
          </Card>
        </div>
      </div>

      {/* Next Steps */}
      <div className="space-y-3">
        <h3 className="font-semibold text-foreground">Next Steps</h3>

        {score.score < 4 && (
          <div className="space-y-2">
            <div className="flex gap-3 rounded-lg bg-red-50 p-3">
              <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-900">Foundation Phase Required</p>
                <p className="text-sm text-red-700">
                  Focus on data quality, systems integration, and organizational alignment
                  before AI implementation.
                </p>
              </div>
            </div>
          </div>
        )}

        {score.score >= 4 && score.score < 6 && (
          <div className="space-y-2">
            <div className="flex gap-3 rounded-lg bg-amber-50 p-3">
              <Clock className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-900">Pilot Phase Recommended</p>
                <p className="text-sm text-amber-700">
                  Begin with limited pilot projects to build organizational readiness and
                  validate assumptions.
                </p>
              </div>
            </div>
          </div>
        )}

        {score.score >= 6 && (
          <div className="space-y-2">
            <div className="flex gap-3 rounded-lg bg-green-50 p-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-green-900">Ready for Implementation</p>
                <p className="text-sm text-green-700">
                  You're positioned well for strategic AI implementation. Move forward with
                  ROI analysis and solution selection.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
