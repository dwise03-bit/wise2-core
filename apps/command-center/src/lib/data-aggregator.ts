import pino from 'pino';

const logger = pino();

export class DataAggregator {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheExpiry = 5000; // 5 seconds

  aggregate(data: any[], groupBy: string, aggregation: 'sum' | 'avg' | 'max' | 'min' = 'avg'): Record<string, number> {
    const result: Record<string, number[]> = {};

    for (const item of data) {
      const key = item[groupBy];
      if (!result[key]) {
        result[key] = [];
      }
      result[key].push(item.value || item);
    }

    const aggregated: Record<string, number> = {};
    for (const [key, values] of Object.entries(result)) {
      aggregated[key] = this.performAggregation(values, aggregation);
    }

    return aggregated;
  }

  private performAggregation(values: number[], type: string): number {
    switch (type) {
      case 'sum':
        return values.reduce((a, b) => a + b, 0);
      case 'avg':
        return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
      case 'max':
        return Math.max(...values);
      case 'min':
        return Math.min(...values);
      default:
        return 0;
    }
  }

  calculatePercentiles(data: number[], percentiles: number[] = [50, 95, 99]): Record<number, number> {
    const sorted = [...data].sort((a, b) => a - b);
    const result: Record<number, number> = {};

    for (const p of percentiles) {
      const index = Math.ceil((p / 100) * sorted.length) - 1;
      result[p] = sorted[Math.max(0, index)];
    }

    return result;
  }

  compressTimeSeries(
    data: Array<{ timestamp: number; value: number }>,
    targetPoints: number = 100,
  ): Array<{ timestamp: number; value: number }> {
    if (data.length <= targetPoints) return data;

    const compressed: Array<{ timestamp: number; value: number }> = [];
    const bucketSize = Math.ceil(data.length / targetPoints);

    for (let i = 0; i < data.length; i += bucketSize) {
      const bucket = data.slice(i, i + bucketSize);
      const avgValue = bucket.reduce((sum, d) => sum + d.value, 0) / bucket.length;
      const avgTimestamp = bucket.reduce((sum, d) => sum + d.timestamp, 0) / bucket.length;

      compressed.push({
        timestamp: Math.round(avgTimestamp),
        value: Math.round(avgValue * 100) / 100,
      });
    }

    return compressed;
  }

  getCachedOrCompute<T>(
    key: string,
    computeFn: () => T,
    expiry: number = this.cacheExpiry,
  ): T {
    const cached = this.cache.get(key);
    const now = Date.now();

    if (cached && now - cached.timestamp < expiry) {
      return cached.data;
    }

    const result = computeFn();
    this.cache.set(key, { data: result, timestamp: now });
    return result;
  }

  clearCache(): void {
    this.cache.clear();
  }

  clearCacheKey(key: string): void {
    this.cache.delete(key);
  }
}

export const dataAggregator = new DataAggregator();
