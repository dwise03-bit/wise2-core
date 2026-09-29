import { Entity } from '../entities/Entity';
import { Relationship, RelationType } from '../relationships/Relationship';
import { GraphDB } from '../GraphDB';
import { logger } from '../logger';

export interface Recommendation {
  entity: Entity;
  relationship: RelationType;
  confidence: number;
  reasoning: string;
}

export interface InferenceResult {
  type: string;
  entities: Entity[];
  confidence: number;
  rule: string;
}

/**
 * Graph reasoning engine for inference and recommendations
 */
export class GraphReasoning {
  constructor(private graph: GraphDB) {}

  /**
   * Infer relationships based on transitive properties
   * Example: If A manages B and B works on C, then A might be involved in C
   */
  async inferRelationships(entityId: string): Promise<Recommendation[]> {
    const start = Date.now();
    const recommendations: Map<string, Recommendation> = new Map();

    const entity = this.graph.getEntity(entityId);
    if (!entity) return [];

    // Rule 1: Transitive management
    // If X manages Y and Y works on Z, recommend X for Z
    const managedEntities = this.graph.findRelationshipsForEntity(entityId, false)
      .filter((r) => r.type === RelationType.Manages)
      .map((r) => r.targetId);

    for (const managedId of managedEntities) {
      const worksOnRelationships = this.graph.findRelationshipsForEntity(managedId, false)
        .filter((r) => r.type === RelationType.WorksOn);

      for (const rel of worksOnRelationships) {
        const projectEntity = this.graph.getEntity(rel.targetId);
        if (projectEntity) {
          const key = `${entityId}-${RelationType.WorksOn}-${rel.targetId}`;
          recommendations.set(key, {
            entity: projectEntity,
            relationship: RelationType.WorksOn,
            confidence: 0.7,
            reasoning: `Manages ${this.graph.getEntity(managedId)?.name} who works on this`
          });
        }
      }
    }

    // Rule 2: Dependency inference
    // If A depends on B and B depends on C, infer A might depend on C
    const dependencies = this.graph.findRelationshipsForEntity(entityId, false)
      .filter((r) => r.type === RelationType.DependsOn)
      .map((r) => r.targetId);

    for (const depId of dependencies) {
      const transitiveDeps = this.graph.findRelationshipsForEntity(depId, false)
        .filter((r) => r.type === RelationType.DependsOn);

      for (const rel of transitiveDeps) {
        const depEntity = this.graph.getEntity(rel.targetId);
        if (depEntity) {
          const key = `${entityId}-${RelationType.DependsOn}-${rel.targetId}`;
          if (!recommendations.has(key)) {
            recommendations.set(key, {
              entity: depEntity,
              relationship: RelationType.DependsOn,
              confidence: 0.5,
              reasoning: `Transitive dependency through ${this.graph.getEntity(depId)?.name}`
            });
          }
        }
      }
    }

    // Rule 3: Collaboration inference
    // If X and Y work on the same project, recommend collaboration
    const myProjects = this.graph.findRelationshipsForEntity(entityId, false)
      .filter((r) => r.type === RelationType.WorksOn)
      .map((r) => r.targetId);

    for (const projectId of myProjects) {
      const collaborators = this.graph.findRelationshipsForEntity(projectId, true)
        .filter((r) => r.type === RelationType.WorksOn && r.sourceId !== entityId)
        .map((r) => r.sourceId);

      for (const collaboratorId of collaborators) {
        const collaborator = this.graph.getEntity(collaboratorId);
        if (collaborator) {
          const key = `${entityId}-collaboration-${collaboratorId}`;
          recommendations.set(key, {
            entity: collaborator,
            relationship: RelationType.RelatedTo,
            confidence: 0.8,
            reasoning: `Collaborates on same project: ${this.graph.getEntity(projectId)?.name}`
          });
        }
      }
    }

    const results = Array.from(recommendations.values());
    results.sort((a, b) => b.confidence - a.confidence);

    logger.info(`Inferred ${results.length} relationships for ${entityId} (${Date.now() - start}ms)`);
    return results;
  }

  /**
   * Find potential issues or bottlenecks in the graph
   */
  async findBottlenecks(): Promise<InferenceResult[]> {
    const start = Date.now();
    const issues: InferenceResult[] = [];

    // Find highly connected entities that could be bottlenecks
    const allEntities = this.graph['entities'] as Map<string, Entity>;
    const connectionCounts = new Map<string, number>();

    for (const [id] of allEntities) {
      const connections = this.graph.getConnectedEntities(id, true).length +
        this.graph.getConnectedEntities(id, false).length;
      connectionCounts.set(id, connections);
    }

    const avgConnections = Array.from(connectionCounts.values()).reduce((a, b) => a + b, 0) / connectionCounts.size;

    for (const [id, count] of connectionCounts) {
      if (count > avgConnections * 2) {
        const entity = this.graph.getEntity(id);
        if (entity) {
          const connectedEntities = [
            ...this.graph.getConnectedEntities(id, true),
            ...this.graph.getConnectedEntities(id, false)
          ];

          issues.push({
            type: 'bottleneck',
            entities: connectedEntities.slice(0, 5),
            confidence: Math.min(0.95, count / (avgConnections * 3)),
            rule: `Highly connected entity: ${count} connections (avg: ${avgConnections.toFixed(1)})`
          });
        }
      }
    }

    logger.info(`Found ${issues.length} potential bottlenecks (${Date.now() - start}ms)`);
    return issues;
  }

  /**
   * Recommend entities to add to a group
   */
  async recommendForGroup(groupMembers: string[]): Promise<Recommendation[]> {
    const start = Date.now();
    const recommendations: Map<string, Recommendation> = new Map();

    // Find common connections
    const connectionSets = groupMembers.map((id) => {
      const connections = new Set(this.graph.getConnectedEntities(id, true)
        .map((e) => e.id)
        .concat(this.graph.getConnectedEntities(id, false).map((e) => e.id)));
      return { memberId: id, connections };
    });

    // Find entities connected to multiple group members
    const candidateCounts = new Map<string, { count: number; members: string[] }>();

    for (const { memberId, connections } of connectionSets) {
      for (const connectedId of connections) {
        if (!groupMembers.includes(connectedId)) {
          const current = candidateCounts.get(connectedId) || { count: 0, members: [] };
          current.count++;
          current.members.push(memberId);
          candidateCounts.set(connectedId, current);
        }
      }
    }

    // Create recommendations for high-overlap candidates
    for (const [candidateId, { count, members }] of candidateCounts) {
      if (count >= groupMembers.length * 0.5) {
        const entity = this.graph.getEntity(candidateId);
        if (entity) {
          recommendations.set(candidateId, {
            entity,
            relationship: RelationType.RelatedTo,
            confidence: count / groupMembers.length,
            reasoning: `Connected to ${count} of ${groupMembers.length} group members`
          });
        }
      }
    }

    const results = Array.from(recommendations.values());
    results.sort((a, b) => b.confidence - a.confidence);

    logger.info(`Recommended ${results.length} entities for group (${Date.now() - start}ms)`);
    return results;
  }

  /**
   * Check for orphaned entities (isolated nodes)
   */
  async findOrphanedEntities(): Promise<Entity[]> {
    const start = Date.now();
    const orphaned: Entity[] = [];

    const allEntities = this.graph['entities'] as Map<string, Entity>;

    for (const [id, entity] of allEntities) {
      const connections = this.graph.getConnectedEntities(id, true).length +
        this.graph.getConnectedEntities(id, false).length;

      if (connections === 0) {
        orphaned.push(entity);
      }
    }

    logger.info(`Found ${orphaned.length} orphaned entities (${Date.now() - start}ms)`);
    return orphaned;
  }

  /**
   * Rank entities by importance (PageRank-like algorithm)
   */
  async rankEntitiesByImportance(iterations: number = 10): Promise<Array<{ entity: Entity; score: number }>> {
    const start = Date.now();
    const allEntities = this.graph['entities'] as Map<string, Entity>;
    const scores = new Map<string, number>();

    // Initialize scores
    for (const id of allEntities.keys()) {
      scores.set(id, 1 / allEntities.size);
    }

    const dampingFactor = 0.85;
    const epsilon = 0.0001 / allEntities.size;

    // Iterate
    for (let iter = 0; iter < iterations; iter++) {
      const newScores = new Map<string, number>();

      for (const [id] of allEntities) {
        const incomingConnections = this.graph.findRelationshipsForEntity(id, true);
        let score = (1 - dampingFactor) / allEntities.size;

        for (const rel of incomingConnections) {
          const sourceEntity = this.graph.getEntity(rel.sourceId);
          if (sourceEntity) {
            const outgoingCount = this.graph.findRelationshipsForEntity(rel.sourceId, false).length ||1;
            score += (dampingFactor * (scores.get(rel.sourceId) || 0)) / outgoingCount;
          }
        }

        newScores.set(id, score);
      }

      // Check convergence
      let converged = true;
      for (const [id, newScore] of newScores) {
        if (Math.abs(newScore - (scores.get(id) || 0)) > epsilon) {
          converged = false;
          break;
        }
      }

      for (const [id, score] of newScores) {
        scores.set(id, score);
      }

      if (converged) break;
    }

    const ranked = Array.from(scores.entries())
      .map(([id, score]) => ({
        entity: this.graph.getEntity(id)!,
        score
      }))
      .filter((r) => r.entity)
      .sort((a, b) => b.score - a.score);

    logger.info(`Ranked ${ranked.length} entities by importance (${Date.now() - start}ms)`);
    return ranked;
  }
}

export const createGraphReasoning = (graph: GraphDB): GraphReasoning => {
  return new GraphReasoning(graph);
};
