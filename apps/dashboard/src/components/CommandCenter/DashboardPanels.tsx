'use client';

import { useCommandCenter } from '@/hooks/useCommandCenter';
import { CardContainer, CardTitle, CardLoading, CardError } from './CardContainer';
import { formatTime } from '@/lib/date-utils';

/**
 * AI Recommendations Panel
 */
export function AIRecommendationsPanel() {
  const { aiRecommendations } = useCommandCenter();

  if (aiRecommendations.isLoading) return <CardLoading />;
  if (aiRecommendations.error) return <CardError error={aiRecommendations.error} />;

  const recs = aiRecommendations.data || [];

  return (
    <CardContainer>
      <CardTitle>AI Recommendations</CardTitle>
      <div className="space-y-3 mt-4">
        {recs.map((rec, i) => (
          <div key={i} className="bg-gray-900 p-3 rounded border border-gray-700 hover:border-neon-green transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-white font-semibold text-sm">{rec.title}</div>
                <div className="text-gray-400 text-xs mt-1">{rec.description}</div>
              </div>
              <div className="text-neon-green text-xs font-bold ml-2">P{rec.priority}</div>
            </div>
            <button
              onClick={() => handleRecommendationAction(rec.action)}
              className="mt-2 bg-neon-green text-black px-2 py-1 rounded text-xs font-bold hover:bg-neon-green/80 transition-colors"
            >
              {rec.action.replace(/_/g, ' ')}
            </button>
          </div>
        ))}
      </div>
    </CardContainer>
  );
}

/**
 * Today's Schedule Panel
 */
export function TodaySchedulePanel() {
  const { todaySchedule } = useCommandCenter();

  if (todaySchedule.isLoading) return <CardLoading />;
  if (todaySchedule.error) return <CardError error={todaySchedule.error} />;

  const jobs = todaySchedule.data || [];

  return (
    <CardContainer>
      <CardTitle>Today's Schedule</CardTitle>
      <div className="space-y-2 mt-4 max-h-96 overflow-y-auto">
        {jobs.length === 0 ? (
          <p className="text-gray-400 text-sm">No appointments today</p>
        ) : (
          jobs.map((job) => (
            <div
              key={job.id}
              className="border-l-2 border-neon-green pl-3 py-2 hover:bg-gray-900 transition-colors rounded px-2"
            >
              <div className="text-white font-semibold text-sm">{formatTime(new Date(job.time))}</div>
              <div className="text-white text-xs mt-1">{job.serviceType}</div>
              <div className="text-neon-green text-xs">{job.customer}</div>
              <div className="text-gray-500 text-xs mt-1">Tech: {job.tech}</div>
              <div className="text-gray-600 text-xs">{job.address}</div>
            </div>
          ))
        )}
      </div>
    </CardContainer>
  );
}

/**
 * Business Health Metrics Panel
 */
export function BusinessHealthPanel() {
  const { businessHealth } = useCommandCenter();

  if (businessHealth.isLoading) return <CardLoading />;
  if (businessHealth.error) return <CardError error={businessHealth.error} />;

  const data = businessHealth.data;

  return (
    <CardContainer>
      <CardTitle>Business Health</CardTitle>
      <div className="grid grid-cols-2 gap-3 mt-4">
        <MetricTile
          label={data.revenue.label}
          value={`$${(data.revenue.value / 1000).toFixed(1)}K`}
        />
        <MetricTile
          label={data.profitMargin.label}
          value={`${data.profitMargin.value}${data.profitMargin.unit}`}
        />
        <MetricTile
          label={data.satisfaction.label}
          value={`${data.satisfaction.value}/${data.satisfaction.max}`}
        />
        <MetricTile
          label={data.repeatRate.label}
          value={`${data.repeatRate.value}${data.repeatRate.unit}`}
        />
      </div>
    </CardContainer>
  );
}

/**
 * Recent Calls Panel
 */
export function RecentCallsPanel() {
  const { recentCalls } = useCommandCenter();

  if (recentCalls.isLoading) return <CardLoading />;
  if (recentCalls.error) return <CardError error={recentCalls.error} />;

  const calls = recentCalls.data || [];

  return (
    <CardContainer>
      <CardTitle>Recent Calls</CardTitle>
      <div className="space-y-2 mt-4 max-h-96 overflow-y-auto">
        {calls.length === 0 ? (
          <p className="text-gray-400 text-sm">No recent calls</p>
        ) : (
          calls.map((call) => (
            <div
              key={call.id}
              className="bg-gray-900 p-2 rounded border border-gray-700 hover:border-neon-green transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-white font-semibold text-sm">{call.name}</div>
                  <div className="text-gray-400 text-xs mt-1">
                    {formatTime(new Date(call.time))} • {call.duration}
                  </div>
                </div>
                <div className={`text-xs font-bold px-2 py-1 rounded ${
                  call.status === 'CONTACTING' ? 'bg-yellow-900 text-yellow-200' :
                  call.status === 'QUOTED' ? 'bg-blue-900 text-blue-200' :
                  'bg-gray-700 text-gray-200'
                }`}>
                  {call.status}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </CardContainer>
  );
}

/**
 * Permission Engine Panel
 */
export function PermissionEnginePanel() {
  const { permissionEngine } = useCommandCenter();

  if (permissionEngine.isLoading) return <CardLoading />;
  if (permissionEngine.error) return <CardError error={permissionEngine.error} />;

  const permissions = permissionEngine.data;

  return (
    <CardContainer className="border-red-500/30">
      <CardTitle className="text-red-400">Permission Engine</CardTitle>
      <div className="space-y-2 mt-4">
        {Object.entries(permissions).map(([key, perm]) => (
          <div key={key} className="flex items-center justify-between py-1">
            <span className="text-white text-xs">{perm.label}</span>
            <div className={`w-2 h-2 rounded-full ${
              perm.enabled ? 'bg-neon-green' : 'bg-gray-600'
            }`} />
          </div>
        ))}
      </div>
      <div className="text-xs text-gray-400 mt-4 pt-4 border-t border-gray-700">
        AI automation limited to level 3. Enable higher levels with caution.
      </div>
    </CardContainer>
  );
}

/**
 * Helper Components
 */

interface MetricTileProps {
  label: string;
  value: string;
}

function MetricTile({ label, value }: MetricTileProps) {
  return (
    <div className="bg-gray-900 p-3 rounded border border-gray-700">
      <div className="text-gray-400 text-xs">{label}</div>
      <div className="text-white font-bold text-lg mt-1">{value}</div>
    </div>
  );
}

function handleRecommendationAction(action: string) {
  console.log(`Action triggered: ${action}`);
  // TODO: Implement action handlers
  switch (action) {
    case 'FOLLOW_UP_ESTIMATES':
      // Navigate to estimates page
      break;
    case 'REVIEW_MARGINS':
      // Navigate to jobs page with low margin filter
      break;
    case 'SEND_SURVEY':
      // Open survey modal
      break;
  }
}
