'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, Badge } from '../ui';

interface ServiceJob {
  id: string;
  scheduledStart: string;
  serviceType: string;
  technician: string | null;
  status: string;
  customer: {
    firstName?: string;
    lastName?: string;
    addressLine1?: string;
  } | null;
}

interface DispatchData {
  todaysJobs: ServiceJob[];
  statusCounts: Record<string, number>;
  totalJobs: number;
}

const statusColors: Record<string, string> = {
  SCHEDULED: 'bg-wise-blue/10 border-wise-blue/50',
  DISPATCHED: 'bg-wise-electric/10 border-wise-electric/50',
  ON_SITE: 'bg-wise-orange/10 border-wise-orange/50',
  COMPLETED: 'bg-wise-success/10 border-wise-success/50',
  CANCELED: 'bg-wise-danger/10 border-wise-danger/50',
};

const statusBadges: Record<string, 'default' | 'warning' | 'success' | 'danger'> = {
  SCHEDULED: 'default',
  DISPATCHED: 'warning',
  ON_SITE: 'warning',
  COMPLETED: 'success',
  CANCELED: 'danger',
};

export function TodaysDispatchBoard({ tenantId }: { tenantId: string }) {
  const [dispatch, setDispatch] = useState<DispatchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDispatch = async () => {
      try {
        const response = await fetch(`/api/v1/revenue-os/dashboard/dispatch`, {
          headers: {
            'X-Tenant-ID': tenantId,
          },
        });

        if (!response.ok) throw new Error('Failed to fetch dispatch data');
        const data = await response.json();
        setDispatch(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchDispatch();
    const interval = setInterval(fetchDispatch, 30000);
    return () => clearInterval(interval);
  }, [tenantId]);

  if (loading) {
    return <Card className="h-40 bg-wise-black/50 animate-pulse" />;
  }

  if (error || !dispatch) {
    return <div className="text-red-500 text-sm">Error loading dispatch data</div>;
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className="p-6 border border-wise-orange/30">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-text-primary">DISPATCH / TODAY'S JOBS</h3>
          <Link href="/hvac/dispatch" className="text-xs text-wise-electric hover:underline">
            View all jobs →
          </Link>
        </div>

        {dispatch.totalJobs === 0 ? (
          <p className="text-text-secondary text-sm py-4">No jobs scheduled for today</p>
        ) : (
          <div className="space-y-2">
            {dispatch.todaysJobs.map((job) => (
              <Link key={job.id} href={`/hvac/jobs/${job.id}`}>
                <div className={`p-3 rounded-lg border cursor-pointer hover:opacity-80 transition-opacity ${statusColors[job.status] || 'bg-wise-black/50'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-wise-electric">
                          {formatTime(job.scheduledStart)}
                        </span>
                        <Badge variant={statusBadges[job.status] || 'default'}>
                          {job.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium text-text-primary truncate">
                        {job.customer?.firstName} {job.customer?.lastName}
                      </p>
                      <p className="text-xs text-text-secondary truncate">
                        {job.customer?.addressLine1 || 'Address TBD'}
                      </p>
                      {job.serviceType && (
                        <p className="text-xs text-text-muted mt-1">{job.serviceType}</p>
                      )}
                    </div>
                    {job.technician && (
                      <div className="flex-shrink-0 text-right">
                        <p className="text-xs font-semibold text-text-muted">Tech</p>
                        <p className="text-sm text-wise-electric">{job.technician}</p>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {dispatch.totalJobs > 0 && (
          <div className="pt-3 border-t border-border-subtle text-xs text-text-muted">
            {dispatch.totalJobs} total • {dispatch.statusCounts.COMPLETED || 0} completed
          </div>
        )}
      </div>
    </Card>
  );
}
