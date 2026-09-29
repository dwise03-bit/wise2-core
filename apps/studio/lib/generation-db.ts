/**
 * Generation Database Models and Utilities
 * In-memory storage with file-based persistence for MVP
 * For production, replace with proper database (PostgreSQL/MongoDB)
 */

import { GenerationMetadata } from '@/types/api';
import * as fs from 'fs';
import * as path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data', 'generations');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// ============================================================================
// IN-MEMORY STORAGE (with file persistence)
// ============================================================================

class GenerationDatabase {
  private generations: Map<string, GenerationMetadata> = new Map();
  private indexes: {
    userId: Map<string, Set<string>>;
    status: Map<string, Set<string>>;
    createdAt: Map<string, Set<string>>;
  } = {
    userId: new Map(),
    status: new Map(),
    createdAt: new Map(),
  };

  constructor() {
    this.loadFromDisk();
  }

  /**
   * Load all generations from disk
   */
  private loadFromDisk() {
    try {
      const files = fs.readdirSync(DATA_DIR);
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(DATA_DIR, file);
          const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
          this.generations.set(data.id, data);
          this.updateIndexes(data);
        }
      }
    } catch (error) {
      console.error('Error loading generations from disk:', error);
    }
  }

  /**
   * Save a generation to disk
   */
  private saveToDisk(generation: GenerationMetadata) {
    try {
      const filePath = path.join(DATA_DIR, `${generation.id}.json`);
      fs.writeFileSync(filePath, JSON.stringify(generation, null, 2));
    } catch (error) {
      console.error('Error saving generation to disk:', error);
    }
  }

  /**
   * Update in-memory indexes
   */
  private updateIndexes(generation: GenerationMetadata) {
    // User index
    if (!this.indexes.userId.has(generation.userId)) {
      this.indexes.userId.set(generation.userId, new Set());
    }
    this.indexes.userId.get(generation.userId)!.add(generation.id);

    // Status index
    if (!this.indexes.status.has(generation.status)) {
      this.indexes.status.set(generation.status, new Set());
    }
    this.indexes.status.get(generation.status)!.add(generation.id);

    // Date index (YYYY-MM-DD)
    const dateKey = new Date(generation.createdAt).toISOString().split('T')[0];
    if (!this.indexes.createdAt.has(dateKey)) {
      this.indexes.createdAt.set(dateKey, new Set());
    }
    this.indexes.createdAt.get(dateKey)!.add(generation.id);
  }

  /**
   * Create a new generation record
   */
  create(generation: GenerationMetadata): GenerationMetadata {
    this.generations.set(generation.id, generation);
    this.updateIndexes(generation);
    this.saveToDisk(generation);
    return generation;
  }

  /**
   * Get generation by ID
   */
  getById(id: string): GenerationMetadata | undefined {
    return this.generations.get(id);
  }

  /**
   * Get all generations for a user
   */
  getByUserId(userId: string): GenerationMetadata[] {
    const ids = this.indexes.userId.get(userId) || new Set();
    return Array.from(ids)
      .map(id => this.generations.get(id))
      .filter((g): g is GenerationMetadata => g !== undefined);
  }

  /**
   * Get generations by status
   */
  getByStatus(status: GenerationMetadata['status']): GenerationMetadata[] {
    const ids = this.indexes.status.get(status) || new Set();
    return Array.from(ids)
      .map(id => this.generations.get(id))
      .filter((g): g is GenerationMetadata => g !== undefined);
  }

  /**
   * Update generation status
   */
  updateStatus(
    id: string,
    status: GenerationMetadata['status'],
    updates?: Partial<GenerationMetadata>
  ): GenerationMetadata | undefined {
    const generation = this.generations.get(id);
    if (!generation) return undefined;

    const updated: GenerationMetadata = {
      ...generation,
      status,
      ...updates,
    };

    this.generations.set(id, updated);
    this.updateIndexes(updated);
    this.saveToDisk(updated);
    return updated;
  }

  /**
   * Update progress
   */
  updateProgress(id: string, progress: number): GenerationMetadata | undefined {
    const generation = this.generations.get(id);
    if (!generation) return undefined;

    const updated: GenerationMetadata = {
      ...generation,
      progress: Math.min(100, Math.max(0, progress)),
    };

    this.generations.set(id, updated);
    this.saveToDisk(updated);
    return updated;
  }

  /**
   * Mark as complete
   */
  markComplete(
    id: string,
    audioUrl: string,
    metadata: any
  ): GenerationMetadata | undefined {
    return this.updateStatus(id, 'completed', {
      audioUrl,
      progress: 100,
      completedAt: new Date().toISOString(),
      metadata: {
        ...metadata,
      },
    });
  }

  /**
   * Mark as failed
   */
  markFailed(id: string, error: string): GenerationMetadata | undefined {
    return this.updateStatus(id, 'failed', {
      error,
      progress: 0,
      completedAt: new Date().toISOString(),
    });
  }

  /**
   * Toggle favorite
   */
  toggleFavorite(id: string, favorite: boolean): GenerationMetadata | undefined {
    const generation = this.generations.get(id);
    if (!generation) return undefined;

    const updated: GenerationMetadata = {
      ...generation,
      favorite,
    };

    this.generations.set(id, updated);
    this.saveToDisk(updated);
    return updated;
  }

  /**
   * Query generations with filters and pagination
   */
  query(options: {
    userId: string;
    page?: number;
    pageSize?: number;
    sortBy?: 'createdAt' | 'completedAt' | 'qualityScore';
    sortOrder?: 'asc' | 'desc';
    filters?: {
      status?: GenerationMetadata['status'];
      dateRange?: { start: string; end: string };
      style?: string;
      mood?: string;
      favorite?: boolean;
    };
  }): {
    items: GenerationMetadata[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
  } {
    let items = this.getByUserId(options.userId);

    // Apply filters
    if (options.filters) {
      if (options.filters.status) {
        items = items.filter(g => g.status === options.filters?.status);
      }
      if (options.filters.dateRange) {
        const start = new Date(options.filters.dateRange.start);
        const end = new Date(options.filters.dateRange.end);
        items = items.filter(g => {
          const created = new Date(g.createdAt);
          return created >= start && created <= end;
        });
      }
      if (options.filters.style) {
        items = items.filter(g => g.genre === options.filters?.style);
      }
      if (options.filters.mood) {
        items = items.filter(g => g.mood === options.filters?.mood);
      }
      if (options.filters.favorite !== undefined) {
        items = items.filter(g => g.favorite === options.filters?.favorite);
      }
    }

    // Sort
    const sortBy = options.sortBy || 'createdAt';
    const sortOrder = options.sortOrder || 'desc';
    items.sort((a, b) => {
      let aVal, bVal;

      if (sortBy === 'createdAt') {
        aVal = new Date(a.createdAt).getTime();
        bVal = new Date(b.createdAt).getTime();
      } else if (sortBy === 'completedAt') {
        aVal = a.completedAt ? new Date(a.completedAt).getTime() : 0;
        bVal = b.completedAt ? new Date(b.completedAt).getTime() : 0;
      } else if (sortBy === 'qualityScore') {
        aVal = a.metadata?.qualityScore || 0;
        bVal = b.metadata?.qualityScore || 0;
      }

      return sortOrder === 'desc' ? (bVal || 0) - (aVal || 0) : (aVal || 0) - (bVal || 0);
    });

    // Paginate
    const page = Math.max(1, options.page || 1);
    const pageSize = Math.min(100, Math.max(1, options.pageSize || 20));
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedItems = items.slice(start, end);

    return {
      items: paginatedItems,
      total: items.length,
      page,
      pageSize,
      hasMore: end < items.length,
    };
  }

  /**
   * Get pending/generating jobs for queue processing
   */
  getPendingJobs(): GenerationMetadata[] {
    return [
      ...(this.indexes.status.get('queued') || new Set()),
      ...(this.indexes.status.get('generating') || new Set()),
    ]
      .map(id => this.generations.get(id))
      .filter((g): g is GenerationMetadata => g !== undefined);
  }

  /**
   * Delete a generation
   */
  delete(id: string): boolean {
    const generation = this.generations.get(id);
    if (!generation) return false;

    this.generations.delete(id);

    // Remove from indexes
    if (this.indexes.userId.has(generation.userId)) {
      this.indexes.userId.get(generation.userId)!.delete(id);
    }
    if (this.indexes.status.has(generation.status)) {
      this.indexes.status.get(generation.status)!.delete(id);
    }

    // Remove from disk
    try {
      const filePath = path.join(DATA_DIR, `${id}.json`);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Error deleting generation file:', error);
    }

    return true;
  }

  /**
   * Export all data (for backup)
   */
  exportAll(): GenerationMetadata[] {
    return Array.from(this.generations.values());
  }
}

// Export singleton instance
export const generationDb = new GenerationDatabase();
