import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { KnowledgeGraphEdge, KnowledgeGraphEdgeDocument } from '../schemas/knowledge-graph-edge.schema';

@Injectable()
export class KnowledgeGraphService {
  constructor(
    @InjectModel(KnowledgeGraphEdge.name)
    private readonly edgeModel: Model<KnowledgeGraphEdgeDocument>,
  ) {}

  /**
   * Create or update an edge between two entities
   */
  async createEdge(
    workspaceId: string,
    from: { type: string; id: string },
    to: { type: string; id: string },
    relationship: string,
    data?: {
      weight?: number;
      reason?: string;
      createdBy?: string;
    },
  ): Promise<KnowledgeGraphEdgeDocument> {
    if (!this.isValidType(from.type) || !this.isValidType(to.type)) {
      throw new BadRequestException('Invalid entity type');
    }

    if (!this.isValidRelationship(relationship)) {
      throw new BadRequestException('Invalid relationship type');
    }

    // Check if edge already exists
    let edge = await this.edgeModel.findOne({
      workspaceId: new Types.ObjectId(workspaceId),
      'from.type': from.type,
      'from.id': new Types.ObjectId(from.id),
      'to.type': to.type,
      'to.id': new Types.ObjectId(to.id),
    });

    if (edge) {
      // Update existing edge
      edge.relationship = relationship as any;
      if (data?.weight !== undefined) edge.weight = data.weight;
      if (data?.reason) edge.reason = data.reason;
      return edge.save();
    }

    // Create new edge
    edge = await this.edgeModel.create({
      workspaceId: new Types.ObjectId(workspaceId),
      from: {
        type: from.type,
        id: new Types.ObjectId(from.id),
      },
      to: {
        type: to.type,
        id: new Types.ObjectId(to.id),
      },
      relationship: relationship as any,
      weight: data?.weight || 0.5,
      reason: data?.reason,
      createdBy: data?.createdBy ? new Types.ObjectId(data.createdBy) : undefined,
      status: 'active',
    });

    return edge;
  }

  /**
   * Get all edges from an entity (outgoing)
   */
  async getOutgoingEdges(
    workspaceId: string,
    entityType: string,
    entityId: string,
  ): Promise<KnowledgeGraphEdgeDocument[]> {
    if (!this.isValidType(entityType)) {
      throw new BadRequestException('Invalid entity type');
    }

    return this.edgeModel
      .find({
        workspaceId: new Types.ObjectId(workspaceId),
        'from.type': entityType,
        'from.id': new Types.ObjectId(entityId),
        status: 'active',
      })
      .sort({ weight: -1 })
      .exec();
  }

  /**
   * Get all edges to an entity (incoming)
   */
  async getIncomingEdges(
    workspaceId: string,
    entityType: string,
    entityId: string,
  ): Promise<KnowledgeGraphEdgeDocument[]> {
    if (!this.isValidType(entityType)) {
      throw new BadRequestException('Invalid entity type');
    }

    return this.edgeModel
      .find({
        workspaceId: new Types.ObjectId(workspaceId),
        'to.type': entityType,
        'to.id': new Types.ObjectId(entityId),
        status: 'active',
      })
      .sort({ weight: -1 })
      .exec();
  }

  /**
   * Get all related entities (both incoming and outgoing)
   */
  async getRelatedEntities(
    workspaceId: string,
    entityType: string,
    entityId: string,
  ): Promise<KnowledgeGraphEdgeDocument[]> {
    if (!this.isValidType(entityType)) {
      throw new BadRequestException('Invalid entity type');
    }

    const id = new Types.ObjectId(entityId);

    return this.edgeModel
      .find({
        workspaceId: new Types.ObjectId(workspaceId),
        $or: [
          { 'from.type': entityType, 'from.id': id },
          { 'to.type': entityType, 'to.id': id },
        ],
        status: 'active',
      })
      .sort({ weight: -1 })
      .exec();
  }

  /**
   * Get edges of a specific relationship type
   */
  async getEdgesByRelationship(
    workspaceId: string,
    relationship: string,
    limit: number = 100,
  ): Promise<KnowledgeGraphEdgeDocument[]> {
    if (!this.isValidRelationship(relationship)) {
      throw new BadRequestException('Invalid relationship type');
    }

    return this.edgeModel
      .find({
        workspaceId: new Types.ObjectId(workspaceId),
        relationship: relationship as any,
        status: 'active',
      })
      .limit(limit)
      .sort({ weight: -1 })
      .exec();
  }

  /**
   * Get the shortest path between two entities (BFS)
   */
  async findShortestPath(
    workspaceId: string,
    from: { type: string; id: string },
    to: { type: string; id: string },
  ): Promise<any[]> {
    const queue = [[from]];
    const visited = new Set();
    visited.add(`${from.type}:${from.id}`);

    const workspaceObjectId = new Types.ObjectId(workspaceId);

    while (queue.length > 0) {
      const path = queue.shift()!;
      const current = path[path.length - 1];

      if (current.type === to.type && current.id === to.id) {
        return path;
      }

      // Get all connected entities
      const edges = await this.edgeModel
        .find({
          workspaceId: workspaceObjectId,
          'from.type': current.type,
          'from.id': new Types.ObjectId(current.id),
          status: 'active',
        })
        .exec();

      for (const edge of edges) {
        const key = `${edge.to.type}:${edge.to.id.toString()}`;
        if (!visited.has(key)) {
          visited.add(key);
          queue.push([
            ...path,
            {
              type: edge.to.type,
              id: edge.to.id.toString(),
            },
          ]);
        }
      }
    }

    return []; // No path found
  }

  /**
   * Delete an edge
   */
  async deleteEdge(
    workspaceId: string,
    from: { type: string; id: string },
    to: { type: string; id: string },
  ): Promise<void> {
    await this.edgeModel.findOneAndDelete({
      workspaceId: new Types.ObjectId(workspaceId),
      'from.type': from.type,
      'from.id': new Types.ObjectId(from.id),
      'to.type': to.type,
      'to.id': new Types.ObjectId(to.id),
    });
  }

  /**
   * Archive an edge (soft delete)
   */
  async archiveEdge(
    workspaceId: string,
    from: { type: string; id: string },
    to: { type: string; id: string },
  ): Promise<KnowledgeGraphEdgeDocument | null> {
    return this.edgeModel.findOneAndUpdate(
      {
        workspaceId: new Types.ObjectId(workspaceId),
        'from.type': from.type,
        'from.id': new Types.ObjectId(from.id),
        'to.type': to.type,
        'to.id': new Types.ObjectId(to.id),
      },
      { status: 'archived' },
      { new: true },
    );
  }

  /**
   * Get graph statistics
   */
  async getGraphStats(workspaceId: string) {
    const workspaceObjectId = new Types.ObjectId(workspaceId);

    const [totalEdges, edgesByRelationship, edgesByType] = await Promise.all([
      this.edgeModel.countDocuments({
        workspaceId: workspaceObjectId,
        status: 'active',
      }),
      this.edgeModel.aggregate([
        { $match: { workspaceId: workspaceObjectId, status: 'active' } },
        { $group: { _id: '$relationship', count: { $sum: 1 } } },
      ]),
      this.edgeModel.aggregate([
        { $match: { workspaceId: workspaceObjectId, status: 'active' } },
        { $group: { _id: '$from.type', count: { $sum: 1 } } },
      ]),
    ]);

    return {
      totalEdges,
      byRelationship: edgesByRelationship.reduce(
        (acc: any, curr: any) => {
          acc[curr._id] = curr.count;
          return acc;
        },
        {},
      ),
      byType: edgesByType.reduce(
        (acc: any, curr: any) => {
          acc[curr._id] = curr.count;
          return acc;
        },
        {},
      ),
    };
  }

  /**
   * Auto-create edges based on linked IDs in documents
   */
  async autoLinkDocument(
    workspaceId: string,
    documentId: string,
    linkedCustomerId?: string,
    linkedWorkflowId?: string,
    linkedDecisionId?: string,
    userId?: string,
  ): Promise<void> {
    const docId = new Types.ObjectId(documentId);

    if (linkedCustomerId) {
      await this.createEdge(
        workspaceId,
        { type: 'document', id: documentId },
        { type: 'customer', id: linkedCustomerId },
        'applies_to',
        { reason: 'Document linked to customer', createdBy: userId },
      );
    }

    if (linkedWorkflowId) {
      await this.createEdge(
        workspaceId,
        { type: 'document', id: documentId },
        { type: 'workflow', id: linkedWorkflowId },
        'triggers',
        { reason: 'Document linked to workflow', createdBy: userId },
      );
    }

    if (linkedDecisionId) {
      await this.createEdge(
        workspaceId,
        { type: 'document', id: documentId },
        { type: 'decision', id: linkedDecisionId },
        'informs',
        { reason: 'Document linked to decision', createdBy: userId },
      );
    }
  }

  // Private helper methods

  private isValidType(type: string): boolean {
    return ['document', 'customer', 'workflow', 'decision', 'email'].includes(type);
  }

  private isValidRelationship(relationship: string): boolean {
    return [
      'applies_to',
      'triggers',
      'informs',
      'affects',
      'references',
      'related_to',
      'depends_on',
      'blocks',
    ].includes(relationship);
  }
}
