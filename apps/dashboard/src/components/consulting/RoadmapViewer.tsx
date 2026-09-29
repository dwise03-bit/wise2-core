'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertCircle, Loader2, MapPin } from 'lucide-react';

interface RoadmapViewerProps {
  auditData: any;
}

export default function RoadmapViewer({ auditData }: RoadmapViewerProps) {
  const [roadmap, setRoadmap] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadRoadmap = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/v1/consulting/roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(auditData),
      });

      if (!response.ok) {
        throw new Error('Failed to load roadmap');
      }

      const data = await response.json();
      setRoadmap(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoadmap();
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
        <Button onClick={loadRoadmap} variant="outline" className="w-full">
          Retry
        </Button>
      </div>
    );
  }

  if (!roadmap) {
    return (
      <Button onClick={loadRoadmap} className="w-full">
        Generate Roadmap
      </Button>
    );
  }

  // Parse roadmap into phases
  const phases = roadmap.roadmap.split('##').filter((p: string) => p.trim());

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4 rounded-lg bg-purple-50 p-4">
        <MapPin className="h-6 w-6 text-purple-600 flex-shrink-0 mt-1" />
        <div>
          <h3 className="font-semibold text-purple-900">12-Month Implementation Roadmap</h3>
          <p className="text-sm text-purple-700 mt-1">
            Strategic timeline tailored to {auditData.clientName}'s business goals and
            constraints. This roadmap phases implementation to ensure success at each stage.
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {phases.map((phase: string, idx: number) => {
          const lines = phase.trim().split('\n');
          const title = lines[0]?.replace(/^#+\s*/, '') || `Phase ${idx + 1}`;

          return (
            <Card key={idx} className="p-4 border-l-4 border-l-purple-500">
              <div className="flex gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 flex-shrink-0">
                  <span className="text-sm font-bold text-purple-700">{idx + 1}</span>
                </div>
                <div className="flex-1 space-y-2">
                  <h4 className="font-semibold text-foreground">{title}</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    {lines.slice(1).map((line: string, i: number) => (
                      <p key={i} className={line.trim() === '' ? 'h-2' : ''}>
                        {line.trim()}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="flex gap-2">
        <Button onClick={loadRoadmap} variant="outline" className="flex-1">
          Regenerate
        </Button>
        <Button className="flex-1">
          Download Roadmap
        </Button>
      </div>
    </div>
  );
}
