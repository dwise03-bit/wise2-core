'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AuditForm from './AuditForm';
import ReadinessScore from './ReadinessScore';
import ROICalculator from './ROICalculator';
import PlaybookViewer from './PlaybookViewer';
import RoadmapViewer from './RoadmapViewer';
import ImplementationPlanner from './ImplementationPlanner';

interface ConsultingDashboardProps {
  workspaceId?: string;
  clientId?: string;
}

export default function ConsultingDashboard({
  workspaceId,
  clientId,
}: ConsultingDashboardProps) {
  const [activeTab, setActiveTab] = useState('discovery');
  const [auditData, setAuditData] = useState(null);
  const [readinessScore, setReadinessScore] = useState(null);
  const [selectedIndustry, setSelectedIndustry] = useState('');

  const handleAuditComplete = (data: any) => {
    setAuditData(data);
    setReadinessScore(null);
  };

  const handleReadinessScoreCalculated = (score: any) => {
    setReadinessScore(score);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          AI Consulting System
        </h1>
        <p className="text-muted-foreground">
          Discover, analyze, design, and implement AI solutions tailored to your business.
        </p>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="discovery" className="text-xs sm:text-sm">
            Discovery
          </TabsTrigger>
          <TabsTrigger value="readiness" className="text-xs sm:text-sm">
            Readiness
          </TabsTrigger>
          <TabsTrigger value="roi" className="text-xs sm:text-sm">
            ROI Analysis
          </TabsTrigger>
          <TabsTrigger value="playbook" className="text-xs sm:text-sm">
            Playbook
          </TabsTrigger>
          <TabsTrigger value="roadmap" className="text-xs sm:text-sm">
            Roadmap
          </TabsTrigger>
          <TabsTrigger value="implementation" className="text-xs sm:text-sm">
            Planning
          </TabsTrigger>
        </TabsList>

        {/* Phase 1: Discovery */}
        <TabsContent value="discovery" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Business Audit</CardTitle>
              <CardDescription>
                Begin with a deep understanding of your business. This 90-minute assessment
                identifies automation opportunities and calculates potential impact.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AuditForm
                onComplete={handleAuditComplete}
                defaultData={auditData}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Phase 2: Readiness Assessment */}
        <TabsContent value="readiness" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Readiness Assessment</CardTitle>
              <CardDescription>
                Evaluate your technical, organizational, and data maturity for AI implementation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {auditData ? (
                <ReadinessScore
                  auditData={auditData}
                  onScoreCalculated={handleReadinessScoreCalculated}
                />
              ) : (
                <div className="rounded-lg bg-muted p-8 text-center">
                  <p className="text-muted-foreground">
                    Complete the Business Audit first to assess readiness.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Phase 3: ROI Analysis */}
        <TabsContent value="roi" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ROI Projection</CardTitle>
              <CardDescription>
                Calculate expected returns, payback period, and first-year ROI for specific
                solutions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {auditData ? (
                <ROICalculator auditData={auditData} />
              ) : (
                <div className="rounded-lg bg-muted p-8 text-center">
                  <p className="text-muted-foreground">
                    Complete the Business Audit first to calculate ROI.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Phase 4: Playbook */}
        <TabsContent value="playbook" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Industry Playbook</CardTitle>
              <CardDescription>
                View proven frameworks and solutions for your industry. Includes typical
                pain points, timeline, and expected ROI.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {auditData ? (
                <PlaybookViewer
                  industry={auditData.industry}
                  onIndustrySelect={setSelectedIndustry}
                />
              ) : (
                <div className="rounded-lg bg-muted p-8 text-center">
                  <p className="text-muted-foreground">
                    Complete the Business Audit first to view playbooks.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Phase 5: Roadmap */}
        <TabsContent value="roadmap" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>12-Month Roadmap</CardTitle>
              <CardDescription>
                Strategic implementation timeline tailored to your business goals and
                constraints.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {auditData ? (
                <RoadmapViewer auditData={auditData} />
              ) : (
                <div className="rounded-lg bg-muted p-8 text-center">
                  <p className="text-muted-foreground">
                    Complete the Business Audit first to generate roadmap.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Phase 6: Implementation Planning */}
        <TabsContent value="implementation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Implementation Planning</CardTitle>
              <CardDescription>
                Detailed week-by-week plan with deliverables, resource requirements, and
                success metrics.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {auditData ? (
                <ImplementationPlanner auditData={auditData} />
              ) : (
                <div className="rounded-lg bg-muted p-8 text-center">
                  <p className="text-muted-foreground">
                    Complete the Business Audit first to create implementation plan.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Stats */}
      {readinessScore && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Readiness Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{readinessScore.score}/10</div>
              <p className="text-xs text-muted-foreground mt-1">
                {readinessScore.assessment}
              </p>
            </CardContent>
          </Card>

          {/* Additional stats can be added here */}
        </div>
      )}
    </div>
  );
}
