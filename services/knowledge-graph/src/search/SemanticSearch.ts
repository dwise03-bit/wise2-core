import { Entity } from '../entities/Entity';
import { GraphDB } from '../GraphDB';
import { logger } from '../logger';

export interface SearchResult {
  entity: Entity;
  score: number;
  reason?: string;
}

/**
 * Simple semantic search implementation
 * In production, this would use actual vector embeddings (e.g., OpenAI embeddings)
 */
export class SemanticSearch {
  private embeddingCache: Map<string, number[]>;

  constructor(
    private graph: GraphDB,
    private embeddingDimension: number = 1536
  ) {
    this.embeddingCache = new Map();
  }

  /**
   * Generate simple text embedding using TF-IDF-like approach
   * In production, use actual embedding models
   */
  private generateEmbedding(text: string): number[] {
    const cacheKey = `embed:${text}`;
    if (this.embeddingCache.has(cacheKey)) {
      return this.embeddingCache.get(cacheKey)!;
    }

    // Simple hash-based embedding for demonstration
    const embedding = new Array(this.embeddingDimension).fill(0);
    const words = text.toLowerCase().split(/\s+/);

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      for (let j = 0; j < word.length; j++) {
        const charCode = word.charCodeAt(j);
        const index = (charCode + i * j) % this.embeddingDimension;
        embedding[index] += 1 / (j + 1);
      }
    }

    // Normalize
    const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    if (norm > 0) {
      for (let i = 0; i < embedding.length; i++) {
        embedding[i] /= norm;
      }
    }

    this.embeddingCache.set(cacheKey, embedding);
    return embedding;
  }

  /**
   * Calculate cosine similarity between two embeddings
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);

    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (normA * normB);
  }

  /**
   * Search for entities similar to query
   */
  async search(query: string, limit: number = 10): Promise<SearchResult[]> {
    const start = Date.now();
    const queryEmbedding = this.generateEmbedding(query);
    const results: SearchResult[] = [];

    // Get all entities
    const allEntities = this.graph['entities'] as Map<string, Entity>;

    for (const [, entity] of allEntities) {
      const entityText = `${entity.name} ${entity.description || ''} ${entity.type}`;
      const entityEmbedding = this.generateEmbedding(entityText);
      const score = this.cosineSimilarity(queryEmbedding, entityEmbedding);

      if (score > 0.1) {
        // Threshold
        results.push({
          entity,
          score,
          reason: `Semantic similarity: ${(score * 100).toFixed(1)}%`
        });
      }
    }

    // Sort by score descending
    results.sort((a, b) => b.score - a.score);

    const topResults = results.slice(0, limit);
    logger.info(`Semantic search for "${query}": ${topResults.length} results (${Date.now() - start}ms)`);

    return topResults;
  }

  /**
   * Find similar entities to a given entity
   */
  async findSimilar(entityId: string, limit: number = 10): Promise<SearchResult[]> {
    const start = Date.now();
    const entity = this.graph.getEntity(entityId);

    if (!entity) {
      return [];
    }

    const queryText = `${entity.name} ${entity.description || ''} ${entity.type}`;
    const results = await this.search(queryText, limit + 1); // +1 to account for the entity itself

    // Remove the entity itself from results
    const filtered = results.filter((r) => r.entity.id !== entityId).slice(0, limit);

    logger.info(`Found ${filtered.length} similar entities to ${entityId} (${Date.now() - start}ms)`);
    return filtered;
  }

  /**
   * Full-text search on entity names and descriptions
   */
  async fullTextSearch(query: string, limit: number = 10): Promise<SearchResult[]> {
    const start = Date.now();
    const queryTerms = query.toLowerCase().split(/\s+/);
    const results: SearchResult[] = [];

    const allEntities = this.graph['entities'] as Map<string, Entity>;

    for (const [, entity] of allEntities) {
      const name = entity.name.toLowerCase();
      const description = (entity.description || '').toLowerCase();
      let matchCount = 0;
      let hasExactMatch = false;

      for (const term of queryTerms) {
        if (name.includes(term)) {
          matchCount += 2; // Higher weight for name match
          if (name === term) {
            hasExactMatch = true;
          }
        }
        if (description.includes(term)) {
          matchCount += 1;
        }
      }

      if (matchCount > 0) {
        const score = hasExactMatch ? 1.0 : matchCount / (queryTerms.length * 2);
        results.push({
          entity,
          score,
          reason: hasExactMatch ? 'Exact match' : `Text match (${matchCount} points)`
        });
      }
    }

    results.sort((a, b) => b.score - a.score);
    const topResults = results.slice(0, limit);

    logger.info(`Full-text search for "${query}": ${topResults.length} results (${Date.now() - start}ms)`);
    return topResults;
  }

  /**
   * Clear embedding cache
   */
  clearCache(): void {
    this.embeddingCache.clear();
    logger.info('Embedding cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; dimension: number } {
    return {
      size: this.embeddingCache.size,
      dimension: this.embeddingDimension
    };
  }
}

export const createSemanticSearch = (graph: GraphDB, dimension?: number): SemanticSearch => {
  return new SemanticSearch(graph, dimension);
};
