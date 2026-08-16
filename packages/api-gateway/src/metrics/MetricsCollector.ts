/**
 * Metrics Collector
 * Prometheus-compatible metrics for monitoring
 */

interface Metric {
  name: string;
  type: 'counter' | 'gauge' | 'histogram' | 'summary';
  help: string;
  value: number;
  labels?: Record<string, string>;
}

interface RequestMetric {
  method: string;
  path: string;
  count: number;
}

interface ResponseMetric {
  method: string;
  path: string;
  statusCode: number;
  count: number;
  totalDuration: number;
}

export class MetricsCollector {
  private metrics: Map<string, Metric> = new Map();
  private requestMetrics: Map<string, RequestMetric> = new Map();
  private responseMetrics: Map<string, ResponseMetric> = new Map();
  private startTime: number = Date.now();

  constructor() {
    this.initializeMetrics();
  }

  private initializeMetrics(): void {
    this.registerMetric({
      name: 'gateway_requests_total',
      type: 'counter',
      help: 'Total number of requests',
      value: 0,
    });

    this.registerMetric({
      name: 'gateway_responses_total',
      type: 'counter',
      help: 'Total number of responses',
      value: 0,
    });

    this.registerMetric({
      name: 'gateway_errors_total',
      type: 'counter',
      help: 'Total number of errors',
      value: 0,
    });

    this.registerMetric({
      name: 'gateway_response_time_seconds',
      type: 'histogram',
      help: 'Response time in seconds',
      value: 0,
    });

    this.registerMetric({
      name: 'gateway_active_requests',
      type: 'gauge',
      help: 'Number of active requests',
      value: 0,
    });

    this.registerMetric({
      name: 'gateway_cache_hits_total',
      type: 'counter',
      help: 'Total cache hits',
      value: 0,
    });

    this.registerMetric({
      name: 'gateway_cache_misses_total',
      type: 'counter',
      help: 'Total cache misses',
      value: 0,
    });

    this.registerMetric({
      name: 'gateway_ratelimit_hits_total',
      type: 'counter',
      help: 'Total rate limit hits',
      value: 0,
    });
  }

  /**
   * Register a new metric
   */
  registerMetric(metric: Metric): void {
    this.metrics.set(metric.name, metric);
  }

  /**
   * Increment a counter metric
   */
  incrementCounter(name: string, value: number = 1): void {
    const metric = this.metrics.get(name);
    if (metric && metric.type === 'counter') {
      metric.value += value;
    }
  }

  /**
   * Set a gauge metric
   */
  setGauge(name: string, value: number): void {
    const metric = this.metrics.get(name);
    if (metric && metric.type === 'gauge') {
      metric.value = value;
    }
  }

  /**
   * Record a request
   */
  recordRequest(method: string, path: string): void {
    const key = `${method}:${path}`;
    const existing = this.requestMetrics.get(key) || {
      method,
      path,
      count: 0,
    };

    existing.count += 1;
    this.requestMetrics.set(key, existing);

    this.incrementCounter('gateway_requests_total');
    this.incrementCounter('gateway_active_requests');
  }

  /**
   * Record a response
   */
  recordResponse(
    method: string,
    path: string,
    statusCode: number,
    duration: number
  ): void {
    const key = `${method}:${path}:${statusCode}`;
    const existing = this.responseMetrics.get(key) || {
      method,
      path,
      statusCode,
      count: 0,
      totalDuration: 0,
    };

    existing.count += 1;
    existing.totalDuration += duration;
    this.responseMetrics.set(key, existing);

    this.incrementCounter('gateway_responses_total');
    this.setGauge('gateway_active_requests', Math.max(0, this.getMetric('gateway_active_requests').value - 1));

    if (statusCode >= 400) {
      this.incrementCounter('gateway_errors_total');
    }
  }

  /**
   * Record cache hit
   */
  recordCacheHit(): void {
    this.incrementCounter('gateway_cache_hits_total');
  }

  /**
   * Record cache miss
   */
  recordCacheMiss(): void {
    this.incrementCounter('gateway_cache_misses_total');
  }

  /**
   * Record rate limit hit
   */
  recordRateLimitHit(): void {
    this.incrementCounter('gateway_ratelimit_hits_total');
  }

  /**
   * Get a specific metric
   */
  getMetric(name: string): Metric {
    return this.metrics.get(name) || {
      name,
      type: 'counter',
      help: 'Unknown metric',
      value: 0,
    };
  }

  /**
   * Get all metrics in Prometheus format
   */
  getMetrics(): string {
    const lines: string[] = [];

    // Add HELP lines
    this.metrics.forEach((metric) => {
      lines.push(`# HELP ${metric.name} ${metric.help}`);
    });

    lines.push('');

    // Add TYPE lines
    this.metrics.forEach((metric) => {
      lines.push(`# TYPE ${metric.name} ${metric.type}`);
    });

    lines.push('');

    // Add metric values
    this.metrics.forEach((metric) => {
      if (metric.labels) {
        const labels = Object.entries(metric.labels)
          .map(([key, value]) => `${key}="${value}"`)
          .join(',');
        lines.push(`${metric.name}{${labels}} ${metric.value}`);
      } else {
        lines.push(`${metric.name} ${metric.value}`);
      }
    });

    // Add request metrics
    this.requestMetrics.forEach((metric) => {
      lines.push(
        `gateway_requests_by_method_path{method="${metric.method}",path="${metric.path}"} ${metric.count}`
      );
    });

    // Add response metrics
    this.responseMetrics.forEach((metric) => {
      lines.push(
        `gateway_responses_by_status{method="${metric.method}",path="${metric.path}",status="${metric.statusCode}"} ${metric.count}`
      );

      const avgDuration = metric.totalDuration / metric.count / 1000; // Convert to seconds
      lines.push(
        `gateway_avg_response_time{method="${metric.method}",path="${metric.path}",status="${metric.statusCode}"} ${avgDuration.toFixed(4)}`
      );
    });

    lines.push('');

    // Add uptime
    const uptime = (Date.now() - this.startTime) / 1000;
    lines.push(`gateway_uptime_seconds ${uptime.toFixed(2)}`);

    return lines.join('\n') + '\n';
  }

  /**
   * Get summary statistics
   */
  getSummary(): {
    totalRequests: number;
    totalResponses: number;
    totalErrors: number;
    averageResponseTime: number;
    cacheHitRate: number;
    uptime: number;
  } {
    const totalRequests = this.getMetric('gateway_requests_total').value;
    const totalResponses = this.getMetric('gateway_responses_total').value;
    const totalErrors = this.getMetric('gateway_errors_total').value;
    const cacheHits = this.getMetric('gateway_cache_hits_total').value;
    const cacheMisses = this.getMetric('gateway_cache_misses_total').value;

    let averageResponseTime = 0;
    let totalDuration = 0;
    let count = 0;

    this.responseMetrics.forEach((metric) => {
      totalDuration += metric.totalDuration;
      count += metric.count;
    });

    if (count > 0) {
      averageResponseTime = totalDuration / count;
    }

    const totalCache = cacheHits + cacheMisses;
    const cacheHitRate = totalCache > 0 ? (cacheHits / totalCache) * 100 : 0;

    const uptime = (Date.now() - this.startTime) / 1000;

    return {
      totalRequests,
      totalResponses,
      totalErrors,
      averageResponseTime,
      cacheHitRate,
      uptime,
    };
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.metrics.forEach((metric) => {
      metric.value = 0;
    });

    this.requestMetrics.clear();
    this.responseMetrics.clear();
    this.startTime = Date.now();
  }
}

export default MetricsCollector;
