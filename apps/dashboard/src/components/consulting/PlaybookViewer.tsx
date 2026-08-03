'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertCircle, Loader2, BookOpen } from 'lucide-react';

interface PlaybookViewerProps {
  industry: string;
  onIndustrySelect?: (industry: string) => void;
}

export default function PlaybookViewer({ industry, onIndustrySelect }: PlaybookViewerProps) {
  const [playbook, setPlaybook] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadPlaybook = async () => {
    if (!industry) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/v1/consulting/playbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ industry }),
      });

      if (!response.ok) {
        throw new Error('Failed to load playbook');
      }

      const data = await response.json();
      setPlaybook(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlaybook();
  }, [industry]);

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
        <Button onClick={loadPlaybook} variant="outline" className="w-full">
          Retry
        </Button>
      </div>
    );
  }

  if (!playbook) {
    return (
      <Button onClick={loadPlaybook} className="w-full">
        Load {industry} Playbook
      </Button>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4 rounded-lg bg-blue-50 p-4">
        <BookOpen className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
        <div>
          <h3 className="font-semibold text-blue-900">{industry} Playbook</h3>
          <p className="text-sm text-blue-700 mt-1">
            This playbook contains proven frameworks, typical timelines, and expected ROI for
            {industry.toLowerCase()} businesses.
          </p>
        </div>
      </div>

      {/* Playbook Content */}
      <Card className="p-6 prose prose-sm max-w-none">
        <div
          className="text-sm text-foreground space-y-4"
          dangerouslySetInnerHTML={{
            __html: playbook.playbook
              .split('\n')
              .map((line: string) => `<p>${line}</p>`)
              .join(''),
          }}
        />
      </Card>

      <div className="flex gap-2">
        <Button onClick={loadPlaybook} variant="outline" className="flex-1">
          Refresh
        </Button>
        <Button className="flex-1">
          Use This Playbook
        </Button>
      </div>
    </div>
  );
}
