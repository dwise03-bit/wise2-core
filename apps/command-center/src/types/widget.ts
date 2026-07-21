export interface GridPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WidgetConfig {
  metric?: string;
  timeRange?: '1h' | '6h' | '24h' | '7d';
  aggregation?: 'sum' | 'avg' | 'max' | 'min';
  threshold?: {
    warning: number;
    critical: number;
  };
  customSettings?: Record<string, any>;
}

export interface DataSource {
  endpoint: string;
  method: 'GET' | 'POST';
  interval: number;
  params?: Record<string, any>;
}

export interface Visualization {
  type: 'pie' | 'bar' | 'line' | 'area' | 'gauge' | 'sparkline' | 'timeline' | 'heatmap';
  options?: Record<string, any>;
}

export interface Widget {
  id: string;
  type: string;
  title: string;
  description: string;
  gridPosition: GridPosition;
  refreshInterval: number;
  config: WidgetConfig;
  dataSource: DataSource;
  visualization: Visualization;
  isVisible: boolean;
}

export interface WidgetProps {
  widget: Widget;
  data?: any;
  loading?: boolean;
  error?: Error | null;
  onRefresh?: () => void;
  onConfigure?: () => void;
  onRemove?: () => void;
}

export type WidgetType =
  | 'status-summary'
  | 'key-metrics'
  | 'quick-actions'
  | 'intent-distribution'
  | 'model-performance'
  | 'cache-hit-rate'
  | 'response-time'
  | 'memory-usage'
  | 'cpu-usage'
  | 'recent-activity'
  | 'error-rate'
  | 'integration-status';
