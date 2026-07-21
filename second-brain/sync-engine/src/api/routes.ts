import { Express, Request, Response } from 'express';
import { SyncManager } from '../sync/SyncManager.js';
import { VaultStateManager, VaultDocument } from '../vault/VaultStateManager.js';
import type { Logger } from 'pino';

export function setupAPIRoutes(
  app: Express,
  vaultManager: VaultStateManager,
  syncManager: SyncManager,
  logger: Logger,
): void {
  // Document endpoints
  app.post('/api/documents', (req: Request, res: Response) => {
    const { folder, title, content, clientId, tags } = req.body;

    if (!folder || !title || !content || !clientId) {
      res.status(400).json({
        error: 'Missing required fields: folder, title, content, clientId',
      });
      return;
    }

    try {
      const doc = vaultManager.createDocument(folder, title, content, clientId, tags);
      syncManager.initializeDocument(doc.id);

      res.status(201).json(doc);
    } catch (error) {
      logger.error(`Error creating document: ${error}`);
      res.status(500).json({ error: 'Failed to create document' });
    }
  });

  app.get('/api/documents/:docId', (req: Request, res: Response) => {
    const { docId } = req.params;

    try {
      const doc = vaultManager.getDocument(docId);
      if (!doc) {
        res.status(404).json({ error: 'Document not found' });
        return;
      }

      res.json(doc);
    } catch (error) {
      logger.error(`Error fetching document: ${error}`);
      res.status(500).json({ error: 'Failed to fetch document' });
    }
  });

  app.patch('/api/documents/:docId', (req: Request, res: Response) => {
    const { docId } = req.params;
    const { content, clientId, tags } = req.body;

    if (!content || !clientId) {
      res.status(400).json({ error: 'Missing required fields: content, clientId' });
      return;
    }

    try {
      const doc = vaultManager.updateDocument(docId, content, clientId, tags);
      if (!doc) {
        res.status(404).json({ error: 'Document not found' });
        return;
      }

      res.json(doc);
    } catch (error) {
      logger.error(`Error updating document: ${error}`);
      res.status(500).json({ error: 'Failed to update document' });
    }
  });

  app.delete('/api/documents/:docId', (req: Request, res: Response) => {
    const { docId } = req.params;

    try {
      const deleted = vaultManager.deleteDocument(docId);
      if (!deleted) {
        res.status(404).json({ error: 'Document not found' });
        return;
      }

      res.json({ success: true, docId });
    } catch (error) {
      logger.error(`Error deleting document: ${error}`);
      res.status(500).json({ error: 'Failed to delete document' });
    }
  });

  // Folder endpoints
  app.get('/api/folders', (req: Request, res: Response) => {
    try {
      const folders = vaultManager.getFolders();
      res.json(folders);
    } catch (error) {
      logger.error(`Error fetching folders: ${error}`);
      res.status(500).json({ error: 'Failed to fetch folders' });
    }
  });

  app.get('/api/folders/:folderName', (req: Request, res: Response) => {
    const { folderName } = req.params;

    try {
      const docs = vaultManager.getDocumentsByFolder(folderName);
      res.json(docs);
    } catch (error) {
      logger.error(`Error fetching folder documents: ${error}`);
      res.status(500).json({ error: 'Failed to fetch documents' });
    }
  });

  // Search endpoints
  app.get('/api/search', (req: Request, res: Response) => {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      res.status(400).json({ error: 'Query parameter "q" required' });
      return;
    }

    try {
      const results = vaultManager.search(q);
      res.json({ query: q, results, count: results.length });
    } catch (error) {
      logger.error(`Error searching: ${error}`);
      res.status(500).json({ error: 'Failed to search' });
    }
  });

  app.get('/api/tags/:tag', (req: Request, res: Response) => {
    const { tag } = req.params;

    try {
      const docs = vaultManager.searchByTag(tag);
      res.json({ tag, results: docs, count: docs.length });
    } catch (error) {
      logger.error(`Error searching by tag: ${error}`);
      res.status(500).json({ error: 'Failed to search by tag' });
    }
  });

  // Backlinks
  app.get('/api/documents/:docId/backlinks', (req: Request, res: Response) => {
    const { docId } = req.params;

    try {
      const backlinks = vaultManager.getBacklinks(docId);
      res.json({ docId, backlinks, count: backlinks.length });
    } catch (error) {
      logger.error(`Error fetching backlinks: ${error}`);
      res.status(500).json({ error: 'Failed to fetch backlinks' });
    }
  });

  // Sync endpoints
  app.get('/api/sync/checkpoint/:docId', (req: Request, res: Response) => {
    const { docId } = req.params;

    try {
      const checkpoint = syncManager.getSyncCheckpoint(docId);
      res.json(checkpoint);
    } catch (error) {
      logger.error(`Error getting checkpoint: ${error}`);
      res.status(500).json({ error: 'Failed to get checkpoint' });
    }
  });

  app.get('/api/sync/history/:docId', (req: Request, res: Response) => {
    const { docId } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

    try {
      const history = syncManager.getHistory(docId, limit);
      res.json({ docId, history, count: history.length });
    } catch (error) {
      logger.error(`Error fetching history: ${error}`);
      res.status(500).json({ error: 'Failed to fetch history' });
    }
  });

  // Conflict resolution
  app.post('/api/sync/resolve-conflict', (req: Request, res: Response) => {
    const { docId, localData, remoteData, clientId } = req.body;

    if (!docId || !localData || !remoteData || !clientId) {
      res.status(400).json({
        error: 'Missing required fields: docId, localData, remoteData, clientId',
      });
      return;
    }

    try {
      const result = syncManager.resolveConflict(docId, localData, remoteData, clientId);
      res.json(result);
    } catch (error) {
      logger.error(`Error resolving conflict: ${error}`);
      res.status(500).json({ error: 'Failed to resolve conflict' });
    }
  });

  // Statistics
  app.get('/api/stats', (req: Request, res: Response) => {
    try {
      res.json({
        documentCount: vaultManager.getDocumentCount(),
        folderCount: vaultManager.getFolders().length,
        allDocuments: vaultManager.getAllDocuments(),
      });
    } catch (error) {
      logger.error(`Error fetching stats: ${error}`);
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  });
}
