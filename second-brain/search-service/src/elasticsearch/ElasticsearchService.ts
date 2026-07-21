import { Client } from '@elastic/elasticsearch';
import pino from 'pino';

const logger = pino();

export interface Document {
  id: string;
  title: string;
  content: string;
  folder: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export interface SearchResult {
  id: string;
  title: string;
  content: string;
  folder: string;
  score: number;
  highlight?: Record<string, string[]>;
}

export class ElasticsearchService {
  private client: Client;
  private indexName = 'wise2-documents';
  private connected = false;

  constructor(url: string) {
    this.client = new Client({ node: url });
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      const ping = await this.client.ping();
      if (ping.statusCode === 200) {
        this.connected = true;
        logger.info('Connected to Elasticsearch');
        await this.ensureIndex();
      }
    } catch (error) {
      logger.error(`Failed to connect to Elasticsearch: ${error}`);
    }
  }

  /**
   * Ensure index exists with proper mappings
   */
  private async ensureIndex(): Promise<void> {
    try {
      const exists = await this.client.indices.exists({ index: this.indexName });
      if (!exists) {
        await this.client.indices.create({
          index: this.indexName,
          mappings: {
            properties: {
              title: { type: 'text', analyzer: 'standard' },
              content: { type: 'text', analyzer: 'standard' },
              folder: { type: 'keyword' },
              tags: { type: 'keyword' },
              createdAt: { type: 'date' },
              updatedAt: { type: 'date' },
            },
          },
        });
        logger.info(`Created Elasticsearch index: ${this.indexName}`);
      }
    } catch (error) {
      logger.error(`Failed to ensure index: ${error}`);
    }
  }

  /**
   * Index a document
   */
  async indexDocument(doc: Document): Promise<void> {
    if (!this.connected) {
      logger.warn('Elasticsearch not connected');
      return;
    }

    try {
      await this.client.index({
        index: this.indexName,
        id: doc.id,
        document: doc,
      });
      logger.info(`Indexed document: ${doc.id}`);
    } catch (error) {
      logger.error(`Failed to index document: ${error}`);
    }
  }

  /**
   * Delete document from index
   */
  async deleteDocument(docId: string): Promise<void> {
    if (!this.connected) {
      logger.warn('Elasticsearch not connected');
      return;
    }

    try {
      await this.client.delete({
        index: this.indexName,
        id: docId,
      });
      logger.info(`Deleted document: ${docId}`);
    } catch (error) {
      logger.error(`Failed to delete document: ${error}`);
    }
  }

  /**
   * Full-text search
   */
  async search(query: string, limit: number = 20): Promise<SearchResult[]> {
    if (!this.connected) {
      logger.warn('Elasticsearch not connected');
      return [];
    }

    try {
      const response = await this.client.search({
        index: this.indexName,
        query: {
          multi_match: {
            query,
            fields: ['title^2', 'content', 'tags'],
            fuzziness: 'AUTO',
          },
        },
        highlight: {
          fields: {
            content: { pre_tags: ['<em>'], post_tags: ['</em>'] },
          },
        },
        size: limit,
      });

      return response.hits.hits.map((hit) => ({
        id: hit._id,
        title: (hit._source as any).title,
        content: (hit._source as any).content,
        folder: (hit._source as any).folder,
        score: hit._score || 0,
        highlight: hit.highlight,
      }));
    } catch (error) {
      logger.error(`Search failed: ${error}`);
      return [];
    }
  }

  /**
   * Search by folder
   */
  async searchByFolder(
    folder: string,
    query?: string,
    limit: number = 50,
  ): Promise<SearchResult[]> {
    if (!this.connected) {
      logger.warn('Elasticsearch not connected');
      return [];
    }

    try {
      const esQuery: any = {
        bool: {
          must: [{ term: { folder } }],
        },
      };

      if (query) {
        esQuery.bool.must.push({
          multi_match: {
            query,
            fields: ['title', 'content'],
          },
        });
      }

      const response = await this.client.search({
        index: this.indexName,
        query: esQuery,
        size: limit,
      });

      return response.hits.hits.map((hit) => ({
        id: hit._id,
        title: (hit._source as any).title,
        content: (hit._source as any).content,
        folder: (hit._source as any).folder,
        score: hit._score || 0,
      }));
    } catch (error) {
      logger.error(`Folder search failed: ${error}`);
      return [];
    }
  }

  /**
   * Search by tags
   */
  async searchByTags(tags: string[], limit: number = 50): Promise<SearchResult[]> {
    if (!this.connected) {
      logger.warn('Elasticsearch not connected');
      return [];
    }

    try {
      const response = await this.client.search({
        index: this.indexName,
        query: {
          terms: { tags },
        },
        size: limit,
      });

      return response.hits.hits.map((hit) => ({
        id: hit._id,
        title: (hit._source as any).title,
        content: (hit._source as any).content,
        folder: (hit._source as any).folder,
        score: hit._score || 0,
      }));
    } catch (error) {
      logger.error(`Tag search failed: ${error}`);
      return [];
    }
  }

  /**
   * Get suggestions for autocomplete
   */
  async getSuggestions(query: string, limit: number = 10): Promise<string[]> {
    if (!this.connected) {
      logger.warn('Elasticsearch not connected');
      return [];
    }

    try {
      const response = await this.client.search({
        index: this.indexName,
        query: {
          match_phrase_prefix: {
            title: query,
          },
        },
        size: limit,
        _source: ['title'],
      });

      return response.hits.hits.map((hit) => (hit._source as any).title);
    } catch (error) {
      logger.error(`Suggestions failed: ${error}`);
      return [];
    }
  }

  isConnected(): boolean {
    return this.connected;
  }
}
