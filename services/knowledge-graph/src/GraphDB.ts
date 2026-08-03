import { Entity, EntityType } from './entities/Entity';
import { Relationship, RelationType } from './relationships/Relationship';
import { logger } from './logger';
import { v4 as uuidv4 } from 'uuid';

export interface GraphQueryResult {
  entities: Entity[];
  relationships: Relationship[];
  paths: Array<{ entities: Entity[]; relationships: Relationship[] }>;
}

/**
 * In-memory graph database for knowledge graph
 * Note: In production, this would use PostgreSQL with graph extensions
 */
export class GraphDB {
  private entities: Map<string, Entity>;
  private relationships: Map<string, Relationship>;
  private entityIndex: Map<string, Set<string>>; // Type -> Entity IDs
  private relationshipIndex: Map<string, Set<string>>; // Type -> Relationship IDs
  private adjacencyList: Map<string, Set<string>>; // Entity ID -> Connected Entity IDs
  private reverseAdjacencyList: Map<string, Set<string>>; // For bidirectional traversal
  private cache: Map<string, unknown>;
  private cacheTtl: number;

  constructor(cacheTtlSeconds: number = 3600) {
    this.entities = new Map();
    this.relationships = new Map();
    this.entityIndex = new Map();
    this.relationshipIndex = new Map();
    this.adjacencyList = new Map();
    this.reverseAdjacencyList = new Map();
    this.cache = new Map();
    this.cacheTtl = cacheTtlSeconds * 1000;
  }

  /**
   * Add entity to graph
   */
  addEntity(entity: Entity): void {
    this.entities.set(entity.id, entity);

    // Index by type
    if (!this.entityIndex.has(entity.type)) {
      this.entityIndex.set(entity.type, new Set());
    }
    this.entityIndex.get(entity.type)!.add(entity.id);

    // Initialize adjacency lists
    if (!this.adjacencyList.has(entity.id)) {
      this.adjacencyList.set(entity.id, new Set());
    }
    if (!this.reverseAdjacencyList.has(entity.id)) {
      this.reverseAdjacencyList.set(entity.id, new Set());
    }

    this.invalidateCache();
    logger.info(`Entity added: ${entity.id} (${entity.type})`);
  }

  /**
   * Get entity by ID
   */
  getEntity(id: string): Entity | undefined {
    return this.entities.get(id);
  }

  /**
   * Delete entity and its relationships
   */
  deleteEntity(id: string): void {
    const entity = this.entities.get(id);
    if (!entity) return;

    // Delete all relationships involving this entity
    const relationshipsToDelete: string[] = [];
    this.relationships.forEach((rel, relId) => {
      if (rel.sourceId === id || rel.targetId === id) {
        relationshipsToDelete.push(relId);
      }
    });

    relationshipsToDelete.forEach((relId) => {
      this.deleteRelationship(relId);
    });

    // Remove entity
    this.entities.delete(id);
    this.entityIndex.get(entity.type)?.delete(id);
    this.adjacencyList.delete(id);
    this.reverseAdjacencyList.delete(id);

    this.invalidateCache();
    logger.info(`Entity deleted: ${id}`);
  }

  /**
   * Add relationship between entities
   */
  addRelationship(relationship: Relationship): void {
    // Validate entities exist
    if (!this.entities.has(relationship.sourceId) || !this.entities.has(relationship.targetId)) {
      throw new Error('One or both entities do not exist in the graph');
    }

    this.relationships.set(relationship.id, relationship);

    // Index by type
    if (!this.relationshipIndex.has(relationship.type)) {
      this.relationshipIndex.set(relationship.type, new Set());
    }
    this.relationshipIndex.get(relationship.type)!.add(relationship.id);

    // Update adjacency lists
    this.adjacencyList.get(relationship.sourceId)!.add(relationship.targetId);
    this.reverseAdjacencyList.get(relationship.targetId)!.add(relationship.sourceId);

    // If bidirectional, add reverse
    if (relationship.bidirectional) {
      this.adjacencyList.get(relationship.targetId)!.add(relationship.sourceId);
      this.reverseAdjacencyList.get(relationship.sourceId)!.add(relationship.targetId);
    }

    this.invalidateCache();
    logger.info(`Relationship added: ${relationship.sourceId} -[${relationship.type}]-> ${relationship.targetId}`);
  }

  /**
   * Get relationship by ID
   */
  getRelationship(id: string): Relationship | undefined {
    return this.relationships.get(id);
  }

  /**
   * Delete relationship
   */
  deleteRelationship(id: string): void {
    const relationship = this.relationships.get(id);
    if (!relationship) return;

    this.relationships.delete(id);
    this.relationshipIndex.get(relationship.type)?.delete(id);

    // Update adjacency lists
    this.adjacencyList.get(relationship.sourceId)?.delete(relationship.targetId);
    this.reverseAdjacencyList.get(relationship.targetId)?.delete(relationship.sourceId);

    if (relationship.bidirectional) {
      this.adjacencyList.get(relationship.targetId)?.delete(relationship.sourceId);
      this.reverseAdjacencyList.get(relationship.sourceId)?.delete(relationship.targetId);
    }

    this.invalidateCache();
    logger.info(`Relationship deleted: ${id}`);
  }

  /**
   * Find all entities of a specific type
   */
  findByType(type: EntityType): Entity[] {
    const entityIds = this.entityIndex.get(type) || new Set();
    return Array.from(entityIds)
      .map((id) => this.entities.get(id)!)
      .filter(Boolean);
  }

  /**
   * Find relationships of a specific type
   */
  findRelationshipsByType(type: RelationType): Relationship[] {
    const relationshipIds = this.relationshipIndex.get(type) || new Set();
    return Array.from(relationshipIds)
      .map((id) => this.relationships.get(id)!)
      .filter(Boolean);
  }

  /**
   * Find all relationships for an entity
   */
  findRelationshipsForEntity(entityId: string, incoming: boolean = false): Relationship[] {
    return Array.from(this.relationships.values()).filter((rel) => {
      return incoming ? rel.targetId === entityId : rel.sourceId === entityId;
    });
  }

  /**
   * BFS traversal to find paths between entities
   */
  findPaths(
    sourceId: string,
    targetId: string,
    maxDepth: number = 5
  ): Array<{ entities: Entity[]; relationships: Relationship[] }> {
    const paths: Array<{ entities: Entity[]; relationships: Relationship[] }> = [];
    const visited = new Set<string>();
    const queue: Array<{
      current: string;
      path: Entity[];
      relationships: Relationship[];
      depth: number;
    }> = [];

    const startEntity = this.entities.get(sourceId);
    if (!startEntity) return paths;

    queue.push({
      current: sourceId,
      path: [startEntity],
      relationships: [],
      depth: 0
    });

    while (queue.length > 0) {
      const { current, path, relationships: rels, depth } = queue.shift()!;

      if (current === targetId && rels.length > 0) {
        paths.push({ entities: path, relationships: rels });
        continue;
      }

      if (depth >= maxDepth) continue;

      const neighbors = this.adjacencyList.get(current) || new Set();
      for (const neighbor of neighbors) {
        if (visited.has(`${current}-${neighbor}`)) continue;
        visited.add(`${current}-${neighbor}`);

        const nextEntity = this.entities.get(neighbor);
        if (nextEntity) {
          const nextRel = Array.from(this.relationships.values()).find(
            (r) => r.sourceId === current && r.targetId === neighbor
          );

          if (nextRel) {
            queue.push({
              current: neighbor,
              path: [...path, nextEntity],
              relationships: [...rels, nextRel],
              depth: depth + 1
            });
          }
        }
      }
    }

    return paths;
  }

  /**
   * Get connected entities (1 hop)
   */
  getConnectedEntities(entityId: string, outgoing: boolean = true): Entity[] {
    const neighbors = outgoing
      ? this.adjacencyList.get(entityId)
      : this.reverseAdjacencyList.get(entityId);

    if (!neighbors) return [];

    return Array.from(neighbors)
      .map((id) => this.entities.get(id)!)
      .filter(Boolean);
  }

  /**
   * Invalidate cache
   */
  private invalidateCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache
   */
  getCache(key: string): unknown | undefined {
    return this.cache.get(key);
  }

  /**
   * Set cache
   */
  setCache(key: string, value: unknown): void {
    this.cache.set(key, value);
    setTimeout(() => {
      this.cache.delete(key);
    }, this.cacheTtl);
  }

  /**
   * Get graph statistics
   */
  getStats(): Record<string, unknown> {
    return {
      entityCount: this.entities.size,
      relationshipCount: this.relationships.size,
      entityTypes: Object.fromEntries(
        Array.from(this.entityIndex.entries()).map(([type, ids]) => [type, ids.size])
      ),
      relationshipTypes: Object.fromEntries(
        Array.from(this.relationshipIndex.entries()).map(([type, ids]) => [type, ids.size])
      )
    };
  }

  /**
   * Export graph as JSON
   */
  toJSON(): Record<string, unknown> {
    return {
      entities: Array.from(this.entities.values()).map((e) => e.toJSON()),
      relationships: Array.from(this.relationships.values()).map((r) => r.toJSON())
    };
  }

  /**
   * Clear the entire graph
   */
  clear(): void {
    this.entities.clear();
    this.relationships.clear();
    this.entityIndex.clear();
    this.relationshipIndex.clear();
    this.adjacencyList.clear();
    this.reverseAdjacencyList.clear();
    this.invalidateCache();
    logger.info('Graph cleared');
  }
}

export const createGraphDB = (cacheTtlSeconds: number = 3600): GraphDB => {
  return new GraphDB(cacheTtlSeconds);
};
