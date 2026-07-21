import { v4 as uuidv4 } from 'uuid';
import { Entity } from '../entities/Entity';

export enum RelationType {
  Owns = 'owns',
  Manages = 'manages',
  WorksOn = 'works_on',
  DependsOn = 'depends_on',
  DeploysTo = 'deploys_to',
  RunsOn = 'runs_on',
  RelatedTo = 'related_to',
  Mentions = 'mentions',
  AssignedTo = 'assigned_to',
  ScheduledFor = 'scheduled_for',
  Triggers = 'triggers',
  CreatedBy = 'created_by',
  UpdatedBy = 'updated_by',
  ParentOf = 'parent_of',
  ChildOf = 'child_of'
}

export interface RelationshipMetadata {
  weight?: number;
  confidence?: number;
  createdAt: Date;
  updatedAt: Date;
  properties?: Record<string, unknown>;
}

export class Relationship {
  id: string;
  sourceId: string;
  targetId: string;
  type: RelationType;
  metadata: RelationshipMetadata;
  bidirectional: boolean;

  constructor(
    sourceId: string,
    targetId: string,
    type: RelationType,
    bidirectional: boolean = false,
    metadata?: Partial<RelationshipMetadata>
  ) {
    this.id = uuidv4();
    this.sourceId = sourceId;
    this.targetId = targetId;
    this.type = type;
    this.bidirectional = bidirectional;
    this.metadata = {
      weight: metadata?.weight || 1,
      confidence: metadata?.confidence || 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      properties: metadata?.properties || {}
    };
  }

  /**
   * Update relationship metadata
   */
  updateMetadata(data: Partial<RelationshipMetadata>): void {
    this.metadata = {
      ...this.metadata,
      ...data,
      updatedAt: new Date()
    };
  }

  /**
   * Get relationship strength (0-1)
   */
  getStrength(): number {
    return (this.metadata.weight || 1) * (this.metadata.confidence || 1);
  }

  /**
   * Set relationship weight
   */
  setWeight(weight: number): void {
    this.updateMetadata({ weight: Math.max(0, Math.min(1, weight)) });
  }

  /**
   * Set relationship confidence
   */
  setConfidence(confidence: number): void {
    this.updateMetadata({ confidence: Math.max(0, Math.min(1, confidence)) });
  }

  /**
   * Serialize relationship to JSON
   */
  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      sourceId: this.sourceId,
      targetId: this.targetId,
      type: this.type,
      bidirectional: this.bidirectional,
      strength: this.getStrength(),
      metadata: this.metadata
    };
  }

  /**
   * Get reverse type for bidirectional relationships
   */
  getReverseType(): RelationType {
    const reverseMap: Record<RelationType, RelationType> = {
      [RelationType.Owns]: RelationType.OwnedBy,
      [RelationType.OwnedBy]: RelationType.Owns,
      [RelationType.Manages]: RelationType.ManagedBy,
      [RelationType.ManagedBy]: RelationType.Manages,
      [RelationType.WorksOn]: RelationType.WorkedOnBy,
      [RelationType.WorkedOnBy]: RelationType.WorksOn,
      [RelationType.DependsOn]: RelationType.DependedOnBy,
      [RelationType.DependedOnBy]: RelationType.DependsOn,
      [RelationType.DeploysTo]: RelationType.DeployedFrom,
      [RelationType.DeployedFrom]: RelationType.DeploysTo,
      [RelationType.RunsOn]: RelationType.Runs,
      [RelationType.Runs]: RelationType.RunsOn,
      [RelationType.RelatedTo]: RelationType.RelatedTo,
      [RelationType.Mentions]: RelationType.MentionedBy,
      [RelationType.MentionedBy]: RelationType.Mentions,
      [RelationType.AssignedTo]: RelationType.HasAssigned,
      [RelationType.HasAssigned]: RelationType.AssignedTo,
      [RelationType.ScheduledFor]: RelationType.Schedules,
      [RelationType.Schedules]: RelationType.ScheduledFor,
      [RelationType.Triggers]: RelationType.TriggeredBy,
      [RelationType.TriggeredBy]: RelationType.Triggers,
      [RelationType.CreatedBy]: RelationType.Created,
      [RelationType.Created]: RelationType.CreatedBy,
      [RelationType.UpdatedBy]: RelationType.Updated,
      [RelationType.Updated]: RelationType.UpdatedBy,
      [RelationType.ParentOf]: RelationType.ChildOf,
      [RelationType.ChildOf]: RelationType.ParentOf
    };
    return reverseMap[this.type] || this.type;
  }
}

/**
 * Extend RelationType enum with reverse types
 */
export const RelationTypeExtended = {
  ...RelationType,
  OwnedBy: 'owned_by' as const,
  ManagedBy: 'managed_by' as const,
  WorkedOnBy: 'worked_on_by' as const,
  DependedOnBy: 'depended_on_by' as const,
  DeployedFrom: 'deployed_from' as const,
  Runs: 'runs' as const,
  MentionedBy: 'mentioned_by' as const,
  HasAssigned: 'has_assigned' as const,
  Schedules: 'schedules' as const,
  TriggeredBy: 'triggered_by' as const,
  Created: 'created' as const,
  Updated: 'updated' as const
};
