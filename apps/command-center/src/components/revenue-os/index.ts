// Revenue OS — component barrel.

export { RevenueHeader, REVENUE_TABS } from './RevenueHeader';
export { KpiGrid } from './KpiGrid';
export { PipelineBoard } from './PipelineBoard';
export { HotLeadsTable } from './HotLeadsTable';
export { WorkforcePanel } from './WorkforcePanel';
export { MarketingRoiPanel } from './MarketingRoiPanel';
export { ActivityFeed } from './ActivityFeed';
export { SectionScaffold } from './SectionScaffold';
export { EmptyState, ErrorState, Panel, Skeleton, SkeletonCard, SkeletonText } from './States';

export { useRevenueData, REVENUE_API_BASE } from './useRevenueData';
export type { RevenueQuery, FetchState } from './useRevenueData';

export {
  normalizeLeads,
  normalizePipeline,
  normalizeAgents,
  normalizeAttribution,
} from './normalize';

export {
  formatCurrency,
  formatCount,
  formatPercent,
  formatRoas,
  formatRelativeTime,
  humanize,
  NO_VALUE,
} from './format';

export { PIPELINE_STAGES } from './types';
export type {
  ActivityItem,
  AgentStatus,
  AttributionResponse,
  Kpis,
  Lead,
  MarketingRoiRow,
  PipelineColumn,
  PipelineStage,
  WorkforceAgent,
} from './types';
