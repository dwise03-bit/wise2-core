import { Express, Request, Response } from 'express';
import { ElasticsearchService } from '../elasticsearch/ElasticsearchService.js';
import { VectorSearchService } from '../vector/VectorSearchService.js';
import type { Logger } from 'pino';

export function setupSearchRoutes(
  app: Express,
  elasticsearchService: ElasticsearchService,
  vectorService: VectorSearchService,
  logger: Logger,
): void {
  // Full-text search
  app.get('/search/full-text', async (req: Request, res: Response) => {
    const { q, limit } = req.query;

    if (!q || typeof q !== 'string') {
      res.status(400).json({ error: 'Query parameter "q" required' });
      return;
    }

    try {
      const searchLimit = limit ? parseInt(limit as string) : 20;
      const results = await elasticsearchService.search(q, searchLimit);
      res.json({ query: q, results, count: results.length });
    } catch (error) {
      logger.error(`Full-text search error: ${error}`);
      res.status(500).json({ error: 'Search failed' });
    }
  });

  // Semantic search
  app.get('/search/semantic', async (req: Request, res: Response) => {
    const { q, limit } = req.query;

    if (!q || typeof q !== 'string') {
      res.status(400).json({ error: 'Query parameter "q" required' });
      return;
    }

    try {
      const searchLimit = limit ? parseInt(limit as string) : 20;
      const results = await vectorService.semanticSearch(q, searchLimit);
      res.json({ query: q, results, count: results.length });
    } catch (error) {
      logger.error(`Semantic search error: ${error}`);
      res.status(500).json({ error: 'Search failed' });
    }
  });

  // Hybrid search
  app.get('/search/hybrid', async (req: Request, res: Response) => {
    const { q, limit } = req.query;

    if (!q || typeof q !== 'string') {
      res.status(400).json({ error: 'Query parameter "q" required' });
      return;
    }

    try {
      const searchLimit = limit ? parseInt(limit as string) : 20;
      const keywordResults = await elasticsearchService.search(q, searchLimit * 2);
      const results = await vectorService.hybridSearch(q, keywordResults, searchLimit);
      res.json({ query: q, results, count: results.length });
    } catch (error) {
      logger.error(`Hybrid search error: ${error}`);
      res.status(500).json({ error: 'Search failed' });
    }
  });

  // Search by folder
  app.get('/search/folder/:folder', async (req: Request, res: Response) => {
    const { folder } = req.params;
    const { q, limit } = req.query;

    try {
      const searchLimit = limit ? parseInt(limit as string) : 50;
      const results = await elasticsearchService.searchByFolder(
        folder,
        q as string,
        searchLimit,
      );
      res.json({ folder, query: q || '', results, count: results.length });
    } catch (error) {
      logger.error(`Folder search error: ${error}`);
      res.status(500).json({ error: 'Search failed' });
    }
  });

  // Search by tags
  app.post('/search/tags', async (req: Request, res: Response) => {
    const { tags, limit } = req.body;

    if (!tags || !Array.isArray(tags)) {
      res.status(400).json({ error: 'tags array required' });
      return;
    }

    try {
      const searchLimit = limit || 50;
      const results = await elasticsearchService.searchByTags(tags, searchLimit);
      res.json({ tags, results, count: results.length });
    } catch (error) {
      logger.error(`Tag search error: ${error}`);
      res.status(500).json({ error: 'Search failed' });
    }
  });

  // Autocomplete suggestions
  app.get('/search/suggest', async (req: Request, res: Response) => {
    const { q, limit } = req.query;

    if (!q || typeof q !== 'string') {
      res.status(400).json({ error: 'Query parameter "q" required' });
      return;
    }

    try {
      const suggestLimit = limit ? parseInt(limit as string) : 10;
      const suggestions = await elasticsearchService.getSuggestions(q, suggestLimit);
      res.json({ query: q, suggestions });
    } catch (error) {
      logger.error(`Suggestions error: ${error}`);
      res.status(500).json({ error: 'Failed to get suggestions' });
    }
  });

  // Index document
  app.post('/documents/index', async (req: Request, res: Response) => {
    const { id, title, content, folder, tags, createdAt, updatedAt } = req.body;

    if (!id || !title || !content || !folder) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    try {
      await elasticsearchService.indexDocument({
        id,
        title,
        content,
        folder,
        tags: tags || [],
        createdAt: createdAt || Date.now(),
        updatedAt: updatedAt || Date.now(),
      });

      res.json({ success: true, id });
    } catch (error) {
      logger.error(`Indexing error: ${error}`);
      res.status(500).json({ error: 'Failed to index document' });
    }
  });

  // Delete from index
  app.delete('/documents/index/:docId', async (req: Request, res: Response) => {
    const { docId } = req.params;

    try {
      await elasticsearchService.deleteDocument(docId);
      res.json({ success: true, docId });
    } catch (error) {
      logger.error(`Delete error: ${error}`);
      res.status(500).json({ error: 'Failed to delete document' });
    }
  });
}
