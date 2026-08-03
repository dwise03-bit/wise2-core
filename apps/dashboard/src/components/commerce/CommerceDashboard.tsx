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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, TrendingUp, Package, Rocket, BarChart3, Settings } from 'lucide-react';
import QuestionnaireFlow from './QuestionnaireFlow';
import AgentWorkflow from './AgentWorkflow';
import BusinessSummary from './BusinessSummary';

interface CommerceDashboardProps {
  workspaceId?: string;
}

export default function CommerceDashboard({ workspaceId }: CommerceDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [activeBusinessId, setActiveBusinessId] = useState<string | null>(null);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);

  const businesses = [
    {
      id: '1',
      name: 'AI Coffee Co',
      model: 'subscription',
      status: 'validating',
      revenue: 0,
      customers: 0,
      createdAt: new Date(),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Zap className="h-8 w-8 text-yellow-500" />
              AI Commerce Accelerator
            </h1>
            <p className="text-muted-foreground mt-1">
              Build, launch, and scale AI-powered commerce businesses at lightning speed
            </p>
          </div>

          <Button
            onClick={() => setShowQuestionnaire(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600"
            size="lg"
          >
            <Rocket className="mr-2 h-4 w-4" />
            Launch New Business
          </Button>
        </div>
      </div>

      {/* Business List */}
      {!showQuestionnaire && (
        <>
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="agents">Agents</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {activeBusinessId ? (
                <BusinessSummary businessId={activeBusinessId} />
              ) : (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Your Businesses</h2>

                  {businesses.length === 0 ? (
                    <Card className="p-12 text-center">
                      <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-semibold text-foreground mb-2">No businesses yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Click "Launch New Business" to start building your first commerce business
                      </p>
                      <Button onClick={() => setShowQuestionnaire(true)}>
                        Create Business
                      </Button>
                    </Card>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      {businesses.map((business) => (
                        <Card
                          key={business.id}
                          className="cursor-pointer hover:shadow-lg transition-shadow"
                          onClick={() => setActiveBusinessId(business.id)}
                        >
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle>{business.name}</CardTitle>
                                <CardDescription className="capitalize">
                                  {business.model.replace('_', ' ')}
                                </CardDescription>
                              </div>
                              <Badge
                                variant={
                                  business.status === 'live' ? 'default' : 'secondary'
                                }
                              >
                                {business.status}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-muted-foreground">Revenue</p>
                                <p className="text-2xl font-bold">
                                  ${business.revenue.toLocaleString()}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Customers</p>
                                <p className="text-2xl font-bold">{business.customers}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            {/* Agents Tab */}
            <TabsContent value="agents" className="space-y-6">
              {activeBusinessId ? (
                <AgentWorkflow businessId={activeBusinessId} />
              ) : (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">Select a business to manage agents</p>
                </Card>
              )}
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Commerce Analytics
                  </CardTitle>
                  <CardDescription>
                    Real-time metrics for your AI-powered commerce businesses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4">
                    {[
                      { label: 'Total Revenue', value: '$0', icon: '📈' },
                      { label: 'Active Customers', value: '0', icon: '👥' },
                      { label: 'Avg Order Value', value: '$0', icon: '🛒' },
                      { label: 'ROI', value: '0%', icon: '💰' },
                    ].map((metric) => (
                      <div key={metric.label} className="space-y-2">
                        <p className="text-sm text-muted-foreground">{metric.label}</p>
                        <p className="text-2xl font-bold">{metric.value}</p>
                        <span className="text-2xl">{metric.icon}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Commerce Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Default Business Model</label>
                    <select className="w-full px-3 py-2 border rounded-lg">
                      <option value="subscription">Subscription</option>
                      <option value="dropshipping">Dropshipping</option>
                      <option value="pod">Print-on-Demand</option>
                      <option value="digital">Digital Products</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>
                  <Button>Save Settings</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}

      {/* Questionnaire Flow */}
      {showQuestionnaire && (
        <QuestionnaireFlow
          onComplete={(data) => {
            setShowQuestionnaire(false);
            setActiveBusinessId('new-business');
          }}
          onCancel={() => setShowQuestionnaire(false)}
        />
      )}
    </div>
  );
}
