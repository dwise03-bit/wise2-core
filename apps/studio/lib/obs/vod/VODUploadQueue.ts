/**
 * VOD Upload Queue Manager
 *
 * Manages the queue of VOD uploads with:
 * - Priority-based processing
 * - Persistence to local storage
 * - Retry scheduling
 * - Progress tracking
 */

import { VODUploadJob, UploadQueueItem, VODMetadata, VODPlatform } from './VODTypes';

export interface QueueStats {
  totalItems: number;
  pendingItems: number;
  uploadingItems: number;
  failedItems: number;
  completedItems: number;
}

export class VODUploadQueue {
  private items: UploadQueueItem[] = [];
  private jobMap: Map<string, VODUploadJob> = new Map();
  private failedRetries: Map<string, number> = new Map();
  private readonly maxQueueSize = 100;
  private readonly storageKey = 'vod_upload_queue';
  private isDirty = false;

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Add item to queue with priority
   */
  enqueue(
    jobId: string,
    recordingPath: string,
    platforms: VODPlatform[],
    metadata: VODMetadata,
    priority: number = 5
  ): UploadQueueItem {
    if (this.items.length >= this.maxQueueSize) {
      throw new Error(`Queue is full (max ${this.maxQueueSize} items)`);
    }

    const item: UploadQueueItem = {
      jobId,
      recordingPath,
      platforms,
      metadata,
      priority: Math.max(0, Math.min(10, priority)), // 0-10 range
      addedAt: new Date(),
    };

    this.items.push(item);
    this.sortByPriority();
    this.isDirty = true;
    this.saveToStorage();

    return item;
  }

  /**
   * Get next item from queue
   */
  dequeue(): UploadQueueItem | undefined {
    const item = this.items.shift();
    if (item) {
      this.isDirty = true;
      this.saveToStorage();
    }
    return item;
  }

  /**
   * Peek at next item without removing
   */
  peek(): UploadQueueItem | undefined {
    return this.items[0];
  }

  /**
   * Get item by job ID
   */
  getItem(jobId: string): UploadQueueItem | undefined {
    return this.items.find((item) => item.jobId === jobId);
  }

  /**
   * Update priority of queued item
   */
  updatePriority(jobId: string, priority: number): boolean {
    const item = this.items.find((i) => i.jobId === jobId);
    if (item) {
      item.priority = Math.max(0, Math.min(10, priority));
      this.sortByPriority();
      this.isDirty = true;
      this.saveToStorage();
      return true;
    }
    return false;
  }

  /**
   * Move item to front of queue
   */
  prioritize(jobId: string): boolean {
    const index = this.items.findIndex((i) => i.jobId === jobId);
    if (index > -1) {
      const [item] = this.items.splice(index, 1);
      item.priority = 10;
      this.items.unshift(item);
      this.isDirty = true;
      this.saveToStorage();
      return true;
    }
    return false;
  }

  /**
   * Remove item from queue
   */
  remove(jobId: string): boolean {
    const index = this.items.findIndex((i) => i.jobId === jobId);
    if (index > -1) {
      this.items.splice(index, 1);
      this.isDirty = true;
      this.saveToStorage();
      return true;
    }
    return false;
  }

  /**
   * Check if item is in queue
   */
  contains(jobId: string): boolean {
    return this.items.some((i) => i.jobId === jobId);
  }

  /**
   * Sort items by priority (descending)
   */
  private sortByPriority(): void {
    this.items.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Get queue size
   */
  size(): number {
    return this.items.length;
  }

  /**
   * Get all items
   */
  getAll(): UploadQueueItem[] {
    return [...this.items];
  }

  /**
   * Clear entire queue
   */
  clear(): void {
    this.items = [];
    this.failedRetries.clear();
    this.isDirty = true;
    this.saveToStorage();
  }

  /**
   * Track retry attempt
   */
  trackRetry(jobId: string): number {
    const count = (this.failedRetries.get(jobId) || 0) + 1;
    this.failedRetries.set(jobId, count);
    return count;
  }

  /**
   * Get retry count
   */
  getRetryCount(jobId: string): number {
    return this.failedRetries.get(jobId) || 0;
  }

  /**
   * Clear retry count
   */
  clearRetryCount(jobId: string): void {
    this.failedRetries.delete(jobId);
  }

  /**
   * Get queue statistics
   */
  getStats(): QueueStats {
    return {
      totalItems: this.items.length,
      pendingItems: this.items.length,
      uploadingItems: 0, // Tracked elsewhere
      failedItems: this.failedRetries.size,
      completedItems: 0, // Tracked elsewhere
    };
  }

  /**
   * Save queue to local storage
   */
  private saveToStorage(): void {
    if (typeof window === 'undefined') return; // SSR check

    try {
      const data = JSON.stringify(
        this.items.map((item) => ({
          ...item,
          addedAt: item.addedAt.toISOString(),
        }))
      );
      localStorage.setItem(this.storageKey, data);
    } catch (error) {
      console.error('Failed to save upload queue to storage:', error);
    }
  }

  /**
   * Load queue from local storage
   */
  private loadFromStorage(): void {
    if (typeof window === 'undefined') return; // SSR check

    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) {
        const items = JSON.parse(data) as any[];
        this.items = items
          .map((item) => ({
            ...item,
            addedAt: new Date(item.addedAt),
          }))
          .filter((item) => {
            // Filter out stale items (older than 24 hours)
            const ageMs = Date.now() - item.addedAt.getTime();
            return ageMs < 24 * 60 * 60 * 1000;
          });

        this.sortByPriority();
      }
    } catch (error) {
      console.error('Failed to load upload queue from storage:', error);
      this.items = [];
    }
  }

  /**
   * Export queue for backup
   */
  export(): string {
    return JSON.stringify(this.items, null, 2);
  }

  /**
   * Import queue from backup
   */
  import(data: string): void {
    try {
      const items = JSON.parse(data) as any[];
      this.items = items.map((item) => ({
        ...item,
        addedAt: new Date(item.addedAt),
      }));
      this.sortByPriority();
      this.isDirty = true;
      this.saveToStorage();
    } catch (error) {
      console.error('Failed to import upload queue:', error);
      throw new Error('Invalid queue backup format');
    }
  }

  /**
   * Get items by platform
   */
  getItemsByPlatform(platform: VODPlatform): UploadQueueItem[] {
    return this.items.filter((item) => item.platforms.includes(platform));
  }

  /**
   * Check if dirty
   */
  isDirtyQueue(): boolean {
    return this.isDirty;
  }

  /**
   * Mark as clean
   */
  markClean(): void {
    this.isDirty = false;
  }

  /**
   * Get queue health status
   */
  getHealth(): {
    queueDepth: number;
    avgItemAge: number; // seconds
    oldestItem?: Date;
  } {
    if (this.items.length === 0) {
      return { queueDepth: 0, avgItemAge: 0 };
    }

    const now = Date.now();
    const ages = this.items.map((item) => (now - item.addedAt.getTime()) / 1000);
    const avgAge = ages.reduce((a, b) => a + b, 0) / ages.length;
    const oldestItem = this.items[this.items.length - 1]?.addedAt;

    return {
      queueDepth: this.items.length,
      avgItemAge: Math.round(avgAge),
      oldestItem,
    };
  }
}

/**
 * Singleton instance
 */
let queueInstance: VODUploadQueue | null = null;

export function getVODQueue(): VODUploadQueue {
  if (!queueInstance) {
    queueInstance = new VODUploadQueue();
  }
  return queueInstance;
}

export function resetVODQueue(): void {
  if (queueInstance) {
    queueInstance = null;
  }
}
