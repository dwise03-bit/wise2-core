'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, Badge } from '../ui';

interface AlertsData {
  unsoldEstimates: number;
  customersWaiting: number;
  maintenanceDue: number;
  overdueFollowUps: number;
}

export function AlertsPanel({ tenantId }: { tenantId: string }) {
  const [alerts, setAlerts] = useState<AlertsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await fetch(`/api/v1/revenue-os/dashboard/alerts`, {
          headers: {
            'X-Tenant-ID': tenantId,
          },
        });

        if (!response.ok) throw new Error('Failed to fetch alerts');
        const data = await response.json();
        setAlerts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, [tenantId]);

  if (loading) {
    return <Card className="h-40 bg-wise-black/50 animate-pulse" />;
  }

  if (error || !alerts) {
    return <div className="text-red-500 text-sm">Error loading alerts</div>;
  }

  interface AlertItem {
    id: string;
    icon: string;
    label: string;
    count: number;
    severity: 'critical' | 'warning' | 'info';
    href: string;
    action: string;
  }

  const alertItems: AlertItem[] = [
    {
      id: 'unsold',
      icon: '📄',
      label: 'Unsold Estimates',
      count: alerts.unsoldEstimates,
      severity: 'critical',
      href: '/hvac/estimates?status=SENT',
      action: 'Follow up to close',
    },
    {
      id: 'waiting',
      icon: '📞',
      label: 'Customers Waiting',
      count: alerts.customersWaiting,
      severity: 'warning',
      href: '/hvac/leads?status=CONTACTING',
      action: 'Return calls & follow up',
    },
    {
      id: 'maintenance',
      icon: '🔧',
      label: 'Maintenance Due',
      count: alerts.maintenanceDue,
      severity: 'info',
      href: '/hvac/customers?filter=maintenance',
      action: 'Schedule maintenance',
    },
    {
      id: 'overdue',
      icon: '⏰',
      label: 'Overdue Follow-ups',
      count: alerts.overdueFollowUps,
      severity: 'critical',
      href: '/hvac/follow-ups?status=OVERDUE',
      action: 'Complete follow-ups',
    },
  ];

  const severityColors: Record<string, string> = {
    critical: 'border-l-4 border-l-wise-danger',
    warning: 'border-l-4 border-l-wise-orange',
    info: 'border-l-4 border-l-wise-blue',
  };

  const severityBadges: Record<string, 'danger' | 'warning' | 'default'> = {
    critical: 'danger',
    warning: 'warning',
    info: 'default',
  };

  return (
    <Card className="p-6 border border-wise-danger/20">
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-text-primary">ALERTS / NEEDS ATTENTION</h3>

        {alertItems.filter((a) => a.count > 0).length === 0 ? (
          <p className="text-text-secondary text-sm py-4">All clear! No alerts.</p>
        ) : (
          <div className="space-y-2">
            {alertItems
              .filter((a) => a.count > 0)
              .map((alert) => (
                <Link key={alert.id} href={alert.href}>
                  <div className={`p-3 rounded-lg bg-wise-black/50 hover:bg-wise-black/70 transition-colors cursor-pointer ${severityColors[alert.severity]}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{alert.icon}</span>
                          <span className="text-sm font-semibold text-text-primary">
                            {alert.label}
                          </span>
                          <Badge variant={severityBadges[alert.severity]}>
                            {alert.count}
                          </Badge>
                        </div>
                        <p className="text-xs text-text-secondary">{alert.action}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        )}
      </div>
    </Card>
  );
}
