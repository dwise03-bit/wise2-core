import {
  Controller,
  Get,
  Post,
  Delete,
  UseGuards,
  Request,
  Query,
  Body,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { KnowledgeGraphService } from '../services/knowledge-graph.service';
import { JwtGuard } from '../guards/jwt.guard';
import { RequirePermission } from '../decorators/require-permission.decorator';
import { PermissionGuard } from '../guards/permission.guard';

@Controller('api/brain/graph')
@UseGuards(JwtGuard, PermissionGuard)
export class KnowledgeGraphController {
  constructor(private readonly graphService: KnowledgeGraphService) {}

  /**
   * Create or update an edge in the knowledge graph
   */
  @Post('edges')
  @RequirePermission('write_documents')
  @HttpCode(HttpStatus.CREATED)
  async createEdge(
    @Request() req,
    @Body()
    body: {
      from: { type: string; id: string };
      to: { type: string; id: string };
      relationship: string;
      weight?: number;
      reason?: string;
    },
  ) {
    const workspaceId = req.user.workspaceId;
    const userId = req.user.sub;

    if (!body.from || !body.to || !body.relationship) {
      throw new BadRequestException('from, to, and relationship are required');
    }

    const edge = await this.graphService.createEdge(
      workspaceId,
      body.from,
      body.to,
      body.relationship,
      {
        weight: body.weight,
        reason: body.reason,
        createdBy: userId,
      },
    );

    return {
      success: true,
      edge,
    };
  }

  /**
   * Get all edges from an entity (outgoing connections)
   */
  @Get('edges/from')
  @RequirePermission('read_documents')
  async getOutgoingEdges(
    @Request() req,
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
  ) {
    const workspaceId = req.user.workspaceId;

    if (!entityType || !entityId) {
      throw new BadRequestException('entityType and entityId are required');
    }

    const edges = await this.graphService.getOutgoingEdges(workspaceId, entityType, entityId);

    return {
      entityType,
      entityId,
      outgoingConnections: edges.length,
      edges,
    };
  }

  /**
   * Get all edges to an entity (incoming connections)
   */
  @Get('edges/to')
  @RequirePermission('read_documents')
  async getIncomingEdges(
    @Request() req,
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
  ) {
    const workspaceId = req.user.workspaceId;

    if (!entityType || !entityId) {
      throw new BadRequestException('entityType and entityId are required');
    }

    const edges = await this.graphService.getIncomingEdges(workspaceId, entityType, entityId);

    return {
      entityType,
      entityId,
      incomingConnections: edges.length,
      edges,
    };
  }

  /**
   * Get all related entities (both incoming and outgoing)
   */
  @Get('related')
  @RequirePermission('read_documents')
  async getRelatedEntities(
    @Request() req,
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
  ) {
    const workspaceId = req.user.workspaceId;

    if (!entityType || !entityId) {
      throw new BadRequestException('entityType and entityId are required');
    }

    const edges = await this.graphService.getRelatedEntities(workspaceId, entityType, entityId);

    return {
      entityType,
      entityId,
      relatedCount: edges.length,
      edges,
    };
  }

  /**
   * Get edges by relationship type
   */
  @Get('relationships/:relationship')
  @RequirePermission('read_documents')
  async getEdgesByRelationship(
    @Request() req,
    @Query('relationship') relationship?: string,
    @Query('limit') limit?: string,
  ) {
    const workspaceId = req.user.workspaceId;

    if (!relationship) {
      throw new BadRequestException('relationship is required');
    }

    const edges = await this.graphService.getEdgesByRelationship(
      workspaceId,
      relationship,
      limit ? parseInt(limit, 10) : 100,
    );

    return {
      relationship,
      edgeCount: edges.length,
      edges,
    };
  }

  /**
   * Find shortest path between two entities
   */
  @Post('paths/shortest')
  @RequirePermission('read_documents')
  @HttpCode(HttpStatus.OK)
  async findShortestPath(
    @Request() req,
    @Body()
    body: {
      from: { type: string; id: string };
      to: { type: string; id: string };
    },
  ) {
    const workspaceId = req.user.workspaceId;

    if (!body.from || !body.to) {
      throw new BadRequestException('from and to are required');
    }

    const path = await this.graphService.findShortestPath(workspaceId, body.from, body.to);

    return {
      from: body.from,
      to: body.to,
      pathFound: path.length > 0,
      pathLength: path.length,
      path,
    };
  }

  /**
   * Delete an edge
   */
  @Delete('edges')
  @RequirePermission('write_documents')
  @HttpCode(HttpStatus.OK)
  async deleteEdge(
    @Request() req,
    @Body()
    body: {
      from: { type: string; id: string };
      to: { type: string; id: string };
    },
  ) {
    const workspaceId = req.user.workspaceId;

    if (!body.from || !body.to) {
      throw new BadRequestException('from and to are required');
    }

    await this.graphService.deleteEdge(workspaceId, body.from, body.to);

    return {
      success: true,
      message: 'Edge deleted',
    };
  }

  /**
   * Archive an edge (soft delete)
   */
  @Post('edges/archive')
  @RequirePermission('write_documents')
  @HttpCode(HttpStatus.OK)
  async archiveEdge(
    @Request() req,
    @Body()
    body: {
      from: { type: string; id: string };
      to: { type: string; id: string };
    },
  ) {
    const workspaceId = req.user.workspaceId;

    if (!body.from || !body.to) {
      throw new BadRequestException('from and to are required');
    }

    const edge = await this.graphService.archiveEdge(workspaceId, body.from, body.to);

    return {
      success: true,
      edge,
    };
  }

  /**
   * Get graph statistics
   */
  @Get('stats')
  @RequirePermission('read_documents')
  async getStats(@Request() req) {
    const workspaceId = req.user.workspaceId;

    const stats = await this.graphService.getGraphStats(workspaceId);

    return {
      workspace: workspaceId,
      ...stats,
    };
  }
}
