import { Entity, EntityType } from '../entities/Entity';
import { GraphDB } from '../GraphDB';
import { RelationType } from '../relationships/Relationship';
import { logger } from '../logger';

export interface QueryFilter {
  type?: EntityType;
  attribute?: string;
  operator?: 'eq' | 'ne' | 'lt' | 'lte' | 'gt' | 'gte' | 'contains' | 'in';
  value?: unknown;
}

export interface QueryOptions {
  limit?: number;
  offset?: number;
  sort?: { field: string; direction: 'asc' | 'desc' }[];
}

export interface QueryResult {
  entities: Entity[];
  total: number;
  took: number;
}

/**
 * Graph query engine for semantic queries
 */
export class GraphQuery {
  constructor(private graph: GraphDB) {}

  /**
   * Find all projects owned by a person
   */
  async findProjectsOwnedBy(personId: string): Promise<Entity[]> {
    const start = Date.now();
    const relationships = this.graph.findRelationshipsByType(RelationType.Owns);
    const projectIds = relationships
      .filter((r) => r.sourceId === personId && r.targetId)
      .map((r) => r.targetId);

    const projects = projectIds
      .map((id) => this.graph.getEntity(id))
      .filter(Boolean) as Entity[];

    logger.info(`Found ${projects.length} projects owned by ${personId} (${Date.now() - start}ms)`);
    return projects;
  }

  /**
   * Find all services that depend on a specific service
   */
  async findDependentServices(serviceId: string): Promise<Entity[]> {
    const start = Date.now();
    const relationships = this.graph.findRelationshipsByType(RelationType.DependsOn);
    const dependentIds = relationships
      .filter((r) => r.targetId === serviceId)
      .map((r) => r.sourceId);

    const services = dependentIds
      .map((id) => this.graph.getEntity(id))
      .filter(Boolean) as Entity[];

    logger.info(`Found ${services.length} services dependent on ${serviceId} (${Date.now() - start}ms)`);
    return services;
  }

  /**
   * Find all entities that mention a specific entity
   */
  async findMentions(targetId: string): Promise<Entity[]> {
    const start = Date.now();
    const relationships = this.graph.findRelationshipsByType(RelationType.Mentions);
    const mentionerIds = relationships.filter((r) => r.targetId === targetId).map((r) => r.sourceId);

    const entities = mentionerIds
      .map((id) => this.graph.getEntity(id))
      .filter(Boolean) as Entity[];

    logger.info(`Found ${entities.length} entities mentioning ${targetId} (${Date.now() - start}ms)`);
    return entities;
  }

  /**
   * Find tasks assigned to a person
   */
  async findTasksAssignedTo(personId: string): Promise<Entity[]> {
    const start = Date.now();
    const relationships = this.graph.findRelationshipsByType(RelationType.AssignedTo);
    const taskIds = relationships
      .filter((r) => r.targetId === personId)
      .map((r) => r.sourceId);

    const tasks = taskIds
      .map((id) => this.graph.getEntity(id))
      .filter(Boolean) as Entity[];

    logger.info(`Found ${tasks.length} tasks assigned to ${personId} (${Date.now() - start}ms)`);
    return tasks;
  }

  /**
   * Find all entities related to a given entity
   */
  async findRelated(entityId: string, maxDepth: number = 2): Promise<Entity[]> {
    const start = Date.now();
    const visited = new Set<string>();
    const toVisit = [entityId];
    const related: Entity[] = [];
    let depth = 0;

    while (toVisit.length > 0 && depth < maxDepth) {
      const current = toVisit.shift()!;
      if (visited.has(current)) continue;
      visited.add(current);

      const relationships = [
        ...this.graph.findRelationshipsForEntity(current, false),
        ...this.graph.findRelationshipsForEntity(current, true)
      ];

      for (const rel of relationships) {
        const targetId = rel.sourceId === current ? rel.targetId : rel.sourceId;
        if (!visited.has(targetId)) {
          const entity = this.graph.getEntity(targetId);
          if (entity) {
            related.push(entity);
            toVisit.push(targetId);
          }
        }
      }

      depth++;
    }

    logger.info(`Found ${related.length} related entities for ${entityId} (${Date.now() - start}ms)`);
    return related;
  }

  /**
   * Generic filter query
   */
  async query(filters: QueryFilter[], options?: QueryOptions): Promise<QueryResult> {
    const start = Date.now();

    let results: Entity[] = [];

    if (filters.length === 0) {
      // Return all entities if no filters
      results = Array.from(this.graph['entities'].values());
    } else {
      // Apply type filter first
      const typeFilter = filters.find((f) => f.type);
      if (typeFilter && typeFilter.type) {
        results = this.graph.findByType(typeFilter.type);
      } else {
        results = Array.from(this.graph['entities'].values());
      }

      // Apply attribute filters
      for (const filter of filters) {
        if (filter.type || !filter.attribute) continue;

        results = results.filter((entity) => {
          const value = entity.attributes[filter.attribute!];
          if (value === undefined) return false;

          switch (filter.operator || 'eq') {
            case 'eq':
              return value === filter.value;
            case 'ne':
              return value !== filter.value;
            case 'lt':
              return (value as number) < (filter.value as number);
            case 'lte':
              return (value as number) <= (filter.value as number);
            case 'gt':
              return (value as number) > (filter.value as number);
            case 'gte':
              return (value as number) >= (filter.value as number);
            case 'contains':
              return String(value).includes(String(filter.value));
            case 'in':
              return Array.isArray(filter.value) && filter.value.includes(value);
            default:
              return false;
          }
        });
      }
    }

    // Apply sorting
    if (options?.sort && options.sort.length > 0) {
      for (const { field, direction } of options.sort) {
        results.sort((a, b) => {
          const aVal = a.attributes[field];
          const bVal = b.attributes[field];
          const cmp = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
          return direction === 'asc' ? cmp : -cmp;
        });
      }
    }

    // Apply pagination
    const offset = options?.offset || 0;
    const limit = options?.limit || results.length;
    const paginated = results.slice(offset, offset + limit);

    const took = Date.now() - start;
    logger.info(`Query completed: ${results.length} total, ${paginated.length} returned (${took}ms)`);

    return {
      entities: paginated,
      total: results.length,
      took
    };
  }

  /**
   * Advanced path-finding query
   */
  async findConnections(sourceId: string, targetId: string, maxDepth?: number): Promise<Entity[]> {
    const start = Date.now();
    const paths = this.graph.findPaths(sourceId, targetId, maxDepth);

    const allConnections = new Map<string, Entity>();
    for (const path of paths) {
      for (const entity of path.entities) {
        if (entity.id !== sourceId && entity.id !== targetId) {
          allConnections.set(entity.id, entity);
        }
      }
    }

    const connections = Array.from(allConnections.values());
    logger.info(`Found ${connections.length} connection nodes (${Date.now() - start}ms)`);
    return connections;
  }
}

/**
 * Create a query builder for fluent API
 */
export class QueryBuilder {
  private filters: QueryFilter[] = [];
  private options: QueryOptions = {};

  constructor(private query: GraphQuery) {}

  ofType(type: EntityType): this {
    this.filters.push({ type });
    return this;
  }

  where(attribute: string, operator: string, value: unknown): this {
    this.filters.push({
      attribute,
      operator: operator as QueryFilter['operator'],
      value
    });
    return this;
  }

  limit(limit: number): this {
    this.options.limit = limit;
    return this;
  }

  offset(offset: number): this {
    this.options.offset = offset;
    return this;
  }

  sort(field: string, direction: 'asc' | 'desc' = 'asc'): this {
    if (!this.options.sort) {
      this.options.sort = [];
    }
    this.options.sort.push({ field, direction });
    return this;
  }

  async execute(): Promise<QueryResult> {
    return this.query.query(this.filters, this.options);
  }
}
