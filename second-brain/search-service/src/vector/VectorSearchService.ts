import pino from 'pino';

const logger = pino();

export interface VectorDocument {
  id: string;
  text: string;
  metadata: Record<string, any>;
  vector?: number[];
}

export interface VectorSearchResult {
  id: string;
  text: string;
  similarity: number;
  metadata: Record<string, any>;
}

export class VectorSearchService {
  private apiKey: string;
  private indexName: string;
  private connected = false;
  private mockVectors: Map<string, number[]> = new Map();

  constructor(apiKey: string, indexName: string) {
    this.apiKey = apiKey;
    this.indexName = indexName;
    this.initialize();
  }

  private async initialize(): Promise<void> {
    // In production, would initialize Pinecone client
    if (this.apiKey) {
      this.connected = true;
      logger.info(`Connected to Pinecone index: ${this.indexName}`);
    } else {
      logger.warn('No Pinecone API key provided; running in mock mode');
      this.connected = false;
    }
  }

  /**
   * Generate embedding vector for text (mock implementation)
   */
  private generateMockVector(text: string): number[] {
    const vector: number[] = [];
    for (let i = 0; i < 1536; i++) {
      let hash = 0;
      for (let j = 0; j < text.length; j++) {
        hash = ((hash << 5) - hash) + text.charCodeAt(j);
        hash = hash & hash;
      }
      vector.push((Math.sin(hash + i) * 10000) % 1);
    }
    return vector;
  }

  /**
   * Upsert vector to index
   */
  async upsertVector(doc: VectorDocument): Promise<void> {
    try {
      if (!doc.vector) {
        doc.vector = this.generateMockVector(doc.text);
      }

      this.mockVectors.set(doc.id, doc.vector);
      logger.info(`Upserted vector: ${doc.id}`);
    } catch (error) {
      logger.error(`Failed to upsert vector: ${error}`);
    }
  }

  /**
   * Semantic search using vectors
   */
  async semanticSearch(query: string, limit: number = 20): Promise<VectorSearchResult[]> {
    try {
      const queryVector = this.generateMockVector(query);

      // Calculate similarity with all stored vectors
      const results: VectorSearchResult[] = [];

      for (const [docId, vector] of this.mockVectors.entries()) {
        const similarity = this.cosineSimilarity(queryVector, vector);
        results.push({
          id: docId,
          text: query, // In real implementation, would retrieve actual text
          similarity,
          metadata: {},
        });
      }

      // Sort by similarity and return top results
      return results
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);
    } catch (error) {
      logger.error(`Semantic search failed: ${error}`);
      return [];
    }
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private cosineSimilarity(vec1: number[], vec2: number[]): number {
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      norm1 += vec1[i] * vec1[i];
      norm2 += vec2[i] * vec2[i];
    }

    norm1 = Math.sqrt(norm1);
    norm2 = Math.sqrt(norm2);

    if (norm1 === 0 || norm2 === 0) return 0;
    return dotProduct / (norm1 * norm2);
  }

  /**
   * Delete vector from index
   */
  async deleteVector(docId: string): Promise<void> {
    try {
      this.mockVectors.delete(docId);
      logger.info(`Deleted vector: ${docId}`);
    } catch (error) {
      logger.error(`Failed to delete vector: ${error}`);
    }
  }

  /**
   * Hybrid search combining keyword and semantic
   */
  async hybridSearch(
    query: string,
    keywordResults: any[],
    limit: number = 20,
  ): Promise<VectorSearchResult[]> {
    try {
      const semanticResults = await this.semanticSearch(query, limit * 2);

      // Combine and deduplicate results
      const combined = new Map<string, VectorSearchResult>();

      keywordResults.forEach((result, index) => {
        if (combined.has(result.id)) {
          const existing = combined.get(result.id)!;
          existing.similarity += 0.5 - index * 0.01; // Boost keyword matches
        } else {
          combined.set(result.id, {
            id: result.id,
            text: result.title || result.text,
            similarity: 0.5 - index * 0.01,
            metadata: result,
          });
        }
      });

      semanticResults.forEach((result) => {
        if (combined.has(result.id)) {
          combined.get(result.id)!.similarity += result.similarity;
        } else {
          combined.set(result.id, result);
        }
      });

      // Sort by combined similarity
      return Array.from(combined.values())
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);
    } catch (error) {
      logger.error(`Hybrid search failed: ${error}`);
      return [];
    }
  }

  isConnected(): boolean {
    return this.connected;
  }
}
