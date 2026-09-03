'use client';

import { useCommandCenter } from '@/hooks/useCommandCenter';
import { CardContainer, CardTitle, CardValue, CardMeta, CardLoading, CardError } from './CardContainer';
import { TrendIcon } from './TrendIcon';
import { CircularProgress } from '../ui/CircularProgress';

/**
 * Revenue Card - Today's revenue with YoY comparison
 */
export function RevenueCard() {
  const { todayRevenue } = useCommandCenter();

  if (todayRevenue.isLoading) return <CardLoading />;
  if (todayRevenue.error) return <CardError error={todayRevenue.error} />;

  const data = todayRevenue.data;
  const isPositive = data.change >= 0;

  return (
    <CardContainer>
      <CardTitle>Today's Revenue</CardTitle>
      <CardValue>${data.amount.toLocaleString()}</CardValue>
      <CardMeta positive={isPositive}>
        <TrendIcon positive={isPositive} />
        {Math.abs(data.change)}% vs yesterday
      </CardMeta>
    </CardContainer>
  );
}

/**
 * Jobs Card - Today's job count and status
 */
export function JobsCard() {
  const { todayJobs } = useCommandCenter();

  if (todayJobs.isLoading) return <CardLoading />;
  if (todayJobs.error) return <CardError error={todayJobs.error} />;

  const data = todayJobs.data;

  return (
    <CardContainer>
      <CardTitle>Jobs Today</CardTitle>
      <CardValue>{data.total}</CardValue>
      <div className="text-sm text-white mt-3 space-y-1">
        <p>{data.completed} completed • {data.inProgress} in progress</p>
        <p className="text-neon-green">{data.scheduled} scheduled</p>
      </div>
    </CardContainer>
  );
}

/**
 * Tech Utilization Card - Active technicians and utilization percentage
 */
export function TechUtilizationCard() {
  const { techUtilization } = useCommandCenter();

  if (techUtilization.isLoading) return <CardLoading />;
  if (techUtilization.error) return <CardError error={techUtilization.error} />;

  const data = techUtilization.data;

  return (
    <CardContainer>
      <CardTitle>Techs Active</CardTitle>
      <div className="flex items-center justify-between mt-4">
        <CardValue className="text-3xl">{data.active}</CardValue>
        <div className="w-20 h-20">
          <CircularProgress value={data.utilization} max={100} size="lg" />
        </div>
      </div>
      <div className="text-sm text-gray-400 mt-3">
        {data.utilization}% utilization • {data.total} total
      </div>
    </CardContainer>
  );
}

/**
 * Open Estimates Card - Sales pipeline overview
 */
export function OpenEstimatesCard() {
  const { openEstimates } = useCommandCenter();

  if (openEstimates.isLoading) return <CardLoading />;
  if (openEstimates.error) return <CardError error={openEstimates.error} />;

  const data = openEstimates.data;

  return (
    <CardContainer>
      <CardTitle>Open Estimates</CardTitle>
      <CardValue>{data.count}</CardValue>
      <CardMeta positive className="text-neon-green">
        ${data.totalValue.toLocaleString()} potential
      </CardMeta>
    </CardContainer>
  );
}

/**
 * Outstanding AR Card - Accounts receivable
 */
export function OutstandingARCard() {
  const { outstandingAR } = useCommandCenter();

  if (outstandingAR.isLoading) return <CardLoading />;
  if (outstandingAR.error) return <CardError error={outstandingAR.error} />;

  const data = outstandingAR.data;

  return (
    <CardContainer>
      <CardTitle>Outstanding AR</CardTitle>
      <CardValue>${data.totalAmount.toLocaleString()}</CardValue>
      <CardMeta positive={false}>
        {data.invoiceCount} invoices overdue
      </CardMeta>
    </CardContainer>
  );
}

/**
 * Margin Alerts Card - Low margin warning
 */
export function MarginAlertsCard() {
  const { marginAlerts } = useCommandCenter();

  if (marginAlerts.isLoading) return <CardLoading />;
  if (marginAlerts.error) return <CardError error={marginAlerts.error} />;

  const data = marginAlerts.data;

  return (
    <CardContainer className={data.count > 0 ? 'border-red-500' : ''}>
      <CardTitle className={data.count > 0 ? 'text-red-500' : ''}>
        Margin Alerts
      </CardTitle>
      <CardValue className={data.count > 0 ? 'text-red-500' : ''}>{data.count}</CardValue>
      {data.count > 0 && (
        <div className="text-sm text-red-500 mt-3">
          Jobs at risk
        </div>
      )}
    </CardContainer>
  );
}
