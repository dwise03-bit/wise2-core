'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle2,
  AlertTriangle,
  Zap,
  DollarSign,
  Activity,
  BarChart3,
  Settings,
  Loader2,
} from 'lucide-react';

interface ModelInfo {
  model: string;
  provider: string;
  status: 'healthy' | 'degraded' | 'down';
  successRate: number;
  averageLatency: number;
  errorCount: number;
  rateLimitRemaining: number;
  isFree: boolean;
  quality: number;
}

interface UsageStats {
  model: string;
  requests: number;
  tokens: number;
  cost: number;
  costPerRequest: number;
}

export default function ModelControlDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [usage, setUsage] = useState<{
    models: UsageStats[];
    summary: {
      totalCost: number;
      totalRequests: number;
      totalTokens: number;
      averageCostPerRequest: number;
      costSavingsFromFreeModels: number;
    };
  } | null>(null);
  const [autoMode, setAutoMode] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [healthRes, usageRes] = await Promise.all([
        fetch('/api/v1/models/health'),
        fetch('/api/v1/models/usage'),
      ]);

      if (healthRes.ok) {
        const healthData = await healthRes.json();
        setModels(healthData.models || []);
      }

      if (usageRes.ok) {
        const usageData = await usageRes.json();
        setUsage(usageData);
      }
    } catch (error) {
      console.error('Failed to load model data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'degraded':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'down':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Activity className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-50';
      case 'degraded':
        return 'bg-yellow-50';
      case 'down':
        return 'bg-red-50';
      default:
        return 'bg-muted/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Zap className="h-8 w-8 text-yellow-500" />
              Model Control Center
            </h1>
            <p className="text-muted-foreground mt-1">
              Intelligent routing between premium and free AI models. Maximize capability,
              minimize costs.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={autoMode ? 'default' : 'outline'}
              onClick={() => setAutoMode(!autoMode)}
            >
              {autoMode ? 'Auto Mode' : 'Manual Mode'}
            </Button>
            <Button size="sm" variant="outline" onClick={loadData}>
              <Loader2 className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          {autoMode ? '🤖 Automatic routing' : '👤 Manual routing'} •{' '}
          {models.filter((m) => m.status === 'healthy').length}/{models.length} models healthy
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="health">Health</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Models</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{models.length}</div>
                <p className="text-xs text-muted-foreground">
                  {models.filter((m) => m.isFree).length} free, {models.filter((m) => !m.isFree).length} premium
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Healthy Models</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {models.filter((m) => m.status === 'healthy').length}
                </div>
                <p className="text-xs text-green-600">
                  {Math.round((models.filter((m) => m.status === 'healthy').length / models.length) * 100)}% uptime
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Total Cost
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  ${usage?.summary?.totalCost?.toFixed(2) || '0.00'}
                </div>
                <p className="text-xs text-muted-foreground">This period</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Free Model Savings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  ${usage?.summary?.costSavingsFromFreeModels?.toFixed(2) || '0.00'}
                </div>
                <p className="text-xs text-green-600">By using free models</p>
              </CardContent>
            </Card>
          </div>

          {/* Model Grid */}
          <div className="space-y-3">
            <h3 className="font-semibold">All Models</h3>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mx-auto" />
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {models.map((model) => (
                  <Card key={model.model} className={getStatusColor(model.status)}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">{model.model}</CardTitle>
                          <CardDescription className="text-xs">
                            {model.provider}
                            {model.isFree && ' • Free'}
                          </CardDescription>
                        </div>
                        {getStatusIcon(model.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Success Rate</span>
                        <span className="font-medium">{model.successRate}%</span>
                      </div>
                      <Progress value={model.successRate} className="h-2" />

                      <div className="grid grid-cols-2 gap-2 text-xs mt-3">
                        <div>
                          <p className="text-muted-foreground">Latency</p>
                          <p className="font-bold">{model.averageLatency}ms</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Errors</p>
                          <p className="font-bold">{model.errorCount}</p>
                        </div>
                      </div>

                      <Badge className="w-full justify-center mt-2" variant="outline">
                        {model.status.charAt(0).toUpperCase() + model.status.slice(1)}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Health Tab */}
        <TabsContent value="health" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Model Health Status</CardTitle>
              <CardDescription>
                Real-time status and performance metrics for all models
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {models.map((model) => (
                  <div key={model.model} className="flex items-center gap-4 p-3 rounded-lg border">
                    <div>{getStatusIcon(model.status)}</div>
                    <div className="flex-1 space-y-1">
                      <p className="font-medium">{model.model}</p>
                      <p className="text-xs text-muted-foreground">
                        Success: {model.successRate}% • Latency: {model.averageLatency}ms • Errors: {model.errorCount}
                      </p>
                    </div>
                    <Button size="sm" variant="outline">
                      {model.status === 'down' ? 'Re-enable' : 'Monitor'}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Usage Tab */}
        <TabsContent value="usage" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Total Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">
                  {usage?.summary?.totalRequests?.toLocaleString() || '0'}
                </p>
                <p className="text-sm text-muted-foreground">Across all models</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Total Tokens</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">
                  {usage?.summary?.totalTokens?.toLocaleString() || '0'}
                </p>
                <p className="text-sm text-muted-foreground">Processed</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Cost Breakdown by Model</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {usage?.models?.map((stat) => (
                  <div key={stat.model} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{stat.model}</span>
                      <span className="text-sm">
                        ${stat.cost.toFixed(3)} ({stat.requests} requests)
                      </span>
                    </div>
                    <Progress
                      value={(stat.cost / (usage?.summary?.totalCost || 1)) * 100}
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Routing Strategy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Mode</label>
                <div className="flex gap-2">
                  <Button
                    variant={autoMode ? 'default' : 'outline'}
                    onClick={() => setAutoMode(true)}
                  >
                    Automatic (AI decides)
                  </Button>
                  <Button
                    variant={!autoMode ? 'default' : 'outline'}
                    onClick={() => setAutoMode(false)}
                  >
                    Manual (You decide)
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {autoMode
                    ? 'WISE² automatically selects the best model based on task complexity, cost, and quality.'
                    : 'You manually select which model to use for each task.'}
                </p>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <label className="text-sm font-medium">Cost Optimization</label>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    Prefer Free Models
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Balanced
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Best Quality
                  </Button>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <label className="text-sm font-medium">Provider Preferences</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked />
                    <span className="text-sm">Allow Anthropic (Claude)</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked />
                    <span className="text-sm">Allow OpenAI (GPT)</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked />
                    <span className="text-sm">Allow Free Models</span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
