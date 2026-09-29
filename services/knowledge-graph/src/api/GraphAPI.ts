import { Router, Request, Response, NextFunction } from 'express';
import { GraphDB } from '../GraphDB';
import { GraphQuery, QueryBuilder } from '../queries/GraphQuery';
import { SemanticSearch } from '../search/SemanticSearch';
import { GraphReasoning } from '../reasoning/GraphReasoning';
import { Entity, EntityType, EntityFactory } from '../entities/Entity';
import { Relationship, RelationType } from '../relationships/Relationship';
import { logger } from '../logger';

export interface ApiRequest extends Request {
  graphDb?: GraphDB;
  graphQuery?: GraphQuery;
  semanticSearch?: SemanticSearch;
  graphReasoning?: GraphReasoning;
}

export const createGraphApiRouter = (
  graphDb: GraphDB,
  graphQuery: GraphQuery,
  semanticSearch: SemanticSearch,
  graphReasoning: GraphReasoning
): Router => {
  const router = Router();

  // Middleware to attach services
  router.use((req: ApiRequest, _res, next) => {
    req.graphDb = graphDb;
    req.graphQuery = graphQuery;
    req.semanticSearch = semanticSearch;
    req.graphReasoning = graphReasoning;
    next();
  });

  // Health check
  router.get('/health', (_req: ApiRequest, res: Response) => {
    res.json({
      status: 'healthy',
      service: 'knowledge-graph',
      timestamp: new Date()
    });
  });

  // Get graph statistics
  router.get('/stats', (req: ApiRequest, res: Response) => {
    try {
      const stats = req.graphDb!.getStats();
      res.json(stats);
    } catch (error) {
      logger.error('Error getting stats', { error });
      res.status(500).json({ error: 'Failed to get statistics' });
    }
  });

  // Create entity
  router.post('/entities', (req: ApiRequest, res: Response) => {
    try {
      const { name, type, description, attributes } = req.body;

      if (!name || !type) {
        return res.status(400).json({ error: 'Missing required fields: name, type' });
      }

      const entity = EntityFactory.create(name, type as EntityType, description, attributes);
      req.graphDb!.addEntity(entity);

      res.status(201).json(entity.toJSON());
    } catch (error) {
      logger.error('Error creating entity', { error });
      res.status(500).json({ error: 'Failed to create entity' });
    }
  });

  // Get entity
  router.get('/entities/:id', (req: ApiRequest, res: Response) => {
    try {
      const entity = req.graphDb!.getEntity(req.params.id);
      if (!entity) {
        return res.status(404).json({ error: 'Entity not found' });
      }
      res.json(entity.toJSON());
    } catch (error) {
      logger.error('Error getting entity', { error });
      res.status(500).json({ error: 'Failed to get entity' });
    }
  });

  // Update entity
  router.patch('/entities/:id', (req: ApiRequest, res: Response) => {
    try {
      const entity = req.graphDb!.getEntity(req.params.id);
      if (!entity) {
        return res.status(404).json({ error: 'Entity not found' });
      }

      if (req.body.attributes) {
        entity.update(req.body.attributes);
      }

      res.json(entity.toJSON());
    } catch (error) {
      logger.error('Error updating entity', { error });
      res.status(500).json({ error: 'Failed to update entity' });
    }
  });

  // Delete entity
  router.delete('/entities/:id', (req: ApiRequest, res: Response) => {
    try {
      req.graphDb!.deleteEntity(req.params.id);
      res.json({ success: true });
    } catch (error) {
      logger.error('Error deleting entity', { error });
      res.status(500).json({ error: 'Failed to delete entity' });
    }
  });

  // Get entities by type
  router.get('/entities-by-type/:type', (req: ApiRequest, res: Response) => {
    try {
      const entities = req.graphDb!.findByType(req.params.type as EntityType);
      res.json(entities.map((e) => e.toJSON()));
    } catch (error) {
      logger.error('Error getting entities by type', { error });
      res.status(500).json({ error: 'Failed to get entities' });
    }
  });

  // Create relationship
  router.post('/relationships', (req: ApiRequest, res: Response) => {
    try {
      const { sourceId, targetId, type, bidirectional, metadata } = req.body;

      if (!sourceId || !targetId || !type) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const relationship = new Relationship(sourceId, targetId, type as RelationType, bidirectional, metadata);
      req.graphDb!.addRelationship(relationship);

      res.status(201).json(relationship.toJSON());
    } catch (error) {
      logger.error('Error creating relationship', { error });
      res.status(500).json({ error: 'Failed to create relationship' });
    }
  });

  // Get relationship
  router.get('/relationships/:id', (req: ApiRequest, res: Response) => {
    try {
      const rel = req.graphDb!.getRelationship(req.params.id);
      if (!rel) {
        return res.status(404).json({ error: 'Relationship not found' });
      }
      res.json(rel.toJSON());
    } catch (error) {
      logger.error('Error getting relationship', { error });
      res.status(500).json({ error: 'Failed to get relationship' });
    }
  });

  // Delete relationship
  router.delete('/relationships/:id', (req: ApiRequest, res: Response) => {
    try {
      req.graphDb!.deleteRelationship(req.params.id);
      res.json({ success: true });
    } catch (error) {
      logger.error('Error deleting relationship', { error });
      res.status(500).json({ error: 'Failed to delete relationship' });
    }
  });

  // Find connected entities
  router.get('/entities/:id/connected', (req: ApiRequest, res: Response) => {
    try {
      const outgoing = req.query.direction !== 'incoming';
      const entities = req.graphDb!.getConnectedEntities(req.params.id, outgoing);
      res.json(entities.map((e) => e.toJSON()));
    } catch (error) {
      logger.error('Error getting connected entities', { error });
      res.status(500).json({ error: 'Failed to get connected entities' });
    }
  });

  // Find paths between entities
  router.get('/paths/:sourceId/:targetId', (req: ApiRequest, res: Response) => {
    try {
      const maxDepth = req.query.maxDepth ? parseInt(req.query.maxDepth as string) : 5;
      const paths = req.graphDb!.findPaths(req.params.sourceId, req.params.targetId, maxDepth);

      res.json(
        paths.map((p) => ({
          entities: p.entities.map((e) => e.toJSON()),
          relationships: p.relationships.map((r) => r.toJSON())
        }))
      );
    } catch (error) {
      logger.error('Error finding paths', { error });
      res.status(500).json({ error: 'Failed to find paths' });
    }
  });

  // Query entities
  router.get('/query', (req: ApiRequest, res: Response) => {
    try {
      const query = req.graphQuery!.query([], {
        limit: req.query.limit ? parseInt(req.query.limit as string) : 100,
        offset: req.query.offset ? parseInt(req.query.offset as string) : 0
      });

      res.json(query);
    } catch (error) {
      logger.error('Error querying graph', { error });
      res.status(500).json({ error: 'Failed to query graph' });
    }
  });

  // Semantic search
  router.get('/search', async (req: ApiRequest, res: Response) => {
    try {
      const q = req.query.q as string;
      if (!q) {
        return res.status(400).json({ error: 'Missing query parameter: q' });
      }

      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const results = await req.semanticSearch!.search(q, limit);

      res.json(
        results.map((r) => ({
          entity: r.entity.toJSON(),
          score: r.score,
          reason: r.reason
        }))
      );
    } catch (error) {
      logger.error('Error searching', { error });
      res.status(500).json({ error: 'Failed to search' });
    }
  });

  // Infer relationships
  router.get('/infer/:entityId', async (req: ApiRequest, res: Response) => {
    try {
      const recommendations = await req.graphReasoning!.inferRelationships(req.params.entityId);

      res.json(
        recommendations.map((r) => ({
          entity: r.entity.toJSON(),
          relationship: r.relationship,
          confidence: r.confidence,
          reasoning: r.reasoning
        }))
      );
    } catch (error) {
      logger.error('Error inferring relationships', { error });
      res.status(500).json({ error: 'Failed to infer relationships' });
    }
  });

  // Find bottlenecks
  router.get('/analyze/bottlenecks', async (req: ApiRequest, res: Response) => {
    try {
      const bottlenecks = await req.graphReasoning!.findBottlenecks();

      res.json(
        bottlenecks.map((b) => ({
          type: b.type,
          entities: b.entities.map((e) => e.toJSON()),
          confidence: b.confidence,
          rule: b.rule
        }))
      );
    } catch (error) {
      logger.error('Error finding bottlenecks', { error });
      res.status(500).json({ error: 'Failed to find bottlenecks' });
    }
  });

  // Rank entities by importance
  router.get('/rank', async (req: ApiRequest, res: Response) => {
    try {
      const iterations = req.query.iterations ? parseInt(req.query.iterations as string) : 10;
      const ranked = await req.graphReasoning!.rankEntitiesByImportance(iterations);

      res.json(
        ranked.map((r) => ({
          entity: r.entity.toJSON(),
          score: r.score
        }))
      );
    } catch (error) {
      logger.error('Error ranking entities', { error });
      res.status(500).json({ error: 'Failed to rank entities' });
    }
  });

  return router;
};
