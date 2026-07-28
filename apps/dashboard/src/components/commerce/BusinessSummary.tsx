'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart3,
  Target,
  Users,
  ShoppingCart,
  TrendingUp,
  Calendar,
  DollarSign,
} from 'lucide-react';

interface BusinessSummaryProps {
  businessId: string;
}

export default function BusinessSummary({ businessId }: BusinessSummaryProps) {
  // Mock data
  const business = {
    id: businessId,
    name: 'AI Coffee Co',
    model: 'subscription',
    status: 'validating',
    createdAt: new Date('2026-07-15'),

    // Metrics
    revenue: 2450,
    customers: 7,
    churnRate: 14,
    ltv: 350,
    cac: 145,
    roi: 241,
    aov: 350,

    // Details
    targetAudience: 'Busy professionals aged 25-45',
    problemSolution: 'Save time with premium coffee delivery',
    budget: '$2000-5000',
    revenueGoal: 10000,
    profitMargin: 45,
  };

  const campaigns = [
    {
      id: '1',
      name: 'Facebook Cold Traffic',
      spend: 450,
      revenue: 1240,
      roas: 2.75,
      status: 'active',
    },
    {
      id: '2',
      name: 'Email Nurture',
      spend: 0,
      revenue: 890,
      roas: 'N/A',
      status: 'active',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">{business.name}</h2>
          <p className="text-muted-foreground mt-1">
            {business.model} • Created {business.createdAt.toLocaleDateString()}
          </p>
        </div>
        <Badge className="capitalize">
          {business.status === 'validating' ? 'yellow' : 'green'}
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${business.revenue.toLocaleString()}</div>
            <p className="text-xs text-green-600 mt-1">↑ 15% this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{business.customers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              LTV: ${business.ltv.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              ROAS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.75x</div>
            <p className="text-xs text-green-600 mt-1">Profitable</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              ROI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{business.roi}%</div>
            <p className="text-xs text-muted-foreground mt-1">Year 1</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="campaigns" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-4">
          {campaigns.map((campaign) => (
            <Card key={campaign.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{campaign.name}</CardTitle>
                    <CardDescription>Marketing channel</CardDescription>
                  </div>
                  <Badge variant={campaign.status === 'active' ? 'default' : 'outline'}>
                    {campaign.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Spend</p>
                    <p className="text-lg font-bold">${campaign.spend.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Revenue</p>
                    <p className="text-lg font-bold">${campaign.revenue.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">ROAS</p>
                    <p className="text-lg font-bold">{campaign.roas}</p>
                  </div>
                  <Button variant="outline" size="sm" className="h-fit">
                    Optimize
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          <Button className="w-full">Add Campaign</Button>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Portfolio</CardTitle>
              <CardDescription>Your current product offerings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold">Premium Coffee Subscription</p>
                    <p className="text-sm text-muted-foreground">$50/month, auto-ship</p>
                  </div>
                  <Badge>Active</Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm mt-3">
                  <div>
                    <p className="text-muted-foreground">Subscribers</p>
                    <p className="font-bold">{business.customers}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">MRR</p>
                    <p className="font-bold">${(business.customers * 50).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Retention</p>
                    <p className="font-bold">{100 - business.churnRate}%</p>
                  </div>
                </div>
              </div>
              <Button className="w-full">Add Product</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Performance Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Customer Acquisition Cost</p>
                  <p className="text-3xl font-bold">${business.cac}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Customer Lifetime Value</p>
                  <p className="text-3xl font-bold">${business.ltv}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Average Order Value</p>
                  <p className="text-3xl font-bold">${business.aov}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Monthly Churn Rate</p>
                  <p className="text-3xl font-bold">{business.churnRate}%</p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <h4 className="font-semibold mb-3">Recommendations</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>✓ LTV:CAC ratio is 2.4:1 (target 3:1) - increase pricing</li>
                  <li>✓ Churn rate is 14% - implement retention campaigns</li>
                  <li>✓ AOV is low for subscription - add upsells/add-ons</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <div className="flex gap-2">
        <Button variant="outline" className="flex-1">
          Edit Business
        </Button>
        <Button className="flex-1">Continue Building</Button>
      </div>
    </div>
  );
}
