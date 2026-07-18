import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  UseGuards,
  Request,
  Query,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { DocumentService } from '../services/document.service';
import { KnowledgeGraphService } from '../services/knowledge-graph.service';
import { JwtGuard } from '../guards/jwt.guard';
import { RequirePermission } from '../decorators/require-permission.decorator';
import { PermissionGuard } from '../guards/permission.guard';

@Controller('api/brain/documents')
@UseGuards(JwtGuard, PermissionGuard)
export class DocumentController {
  constructor(
    private readonly documentService: DocumentService,
    private readonly graphService: KnowledgeGraphService,
  ) {}

  /**
   * Create a new document
   */
  @Post()
  @RequirePermission('write_documents')
  @HttpCode(HttpStatus.CREATED)
  async createDocument(
    @Request() req,
    @Body()
    body: {
      title: string;
      type?: string;
      content?: string;
      tags?: string[];
      readableBy?: string[];
      editableBy?: string[];
    },
  ) {
    const userId = req.user.sub;
    const workspaceId = req.user.workspaceId;

    const document = await this.documentService.createDocument(userId, workspaceId, body);

    return {
      success: true,
      document,
    };
  }

  /**
   * List documents
   */
  @Get()
  @RequirePermission('read_documents')
  async listDocuments(
    @Request() req,
    @Query('type') type?: string,
    @Query('tags') tags?: string,
    @Query('status') status?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const workspaceId = req.user.workspaceId;
    const userRole = req.user.role;

    const result = await this.documentService.listDocuments(workspaceId, userRole, {
      type,
      tags: tags ? tags.split(',') : undefined,
      status,
      limit: limit ? parseInt(limit, 10) : 10,
      offset: offset ? parseInt(offset, 10) : 0,
    });

    return result;
  }

  /**
   * Get single document
   */
  @Get(':documentId')
  @RequirePermission('read_documents')
  async getDocument(
    @Request() req,
    @Param('documentId') documentId: string,
  ) {
    const userId = req.user.sub;
    const userRole = req.user.role;

    const document = await this.documentService.getDocument(userId, documentId, userRole);

    return document;
  }

  /**
   * Update document
   */
  @Put(':documentId')
  @RequirePermission('write_documents')
  @HttpCode(HttpStatus.OK)
  async updateDocument(
    @Request() req,
    @Param('documentId') documentId: string,
    @Body()
    body: {
      title?: string;
      content?: string;
      tags?: string[];
      readableBy?: string[];
      editableBy?: string[];
    },
  ) {
    const userId = req.user.sub;
    const userRole = req.user.role;

    const document = await this.documentService.updateDocument(userId, documentId, userRole, body);

    return {
      success: true,
      document,
    };
  }

  /**
   * Delete document
   */
  @Delete(':documentId')
  @RequirePermission('write_documents')
  @HttpCode(HttpStatus.OK)
  async deleteDocument(
    @Request() req,
    @Param('documentId') documentId: string,
  ) {
    const userId = req.user.sub;
    const userRole = req.user.role;

    await this.documentService.deleteDocument(userId, documentId, userRole);

    return {
      success: true,
      message: 'Document deleted',
    };
  }

  /**
   * Search documents
   */
  @Get('search/query')
  @RequirePermission('read_documents')
  async searchDocuments(
    @Request() req,
    @Query('q') query?: string,
    @Query('limit') limit?: string,
  ) {
    if (!query) {
      throw new BadRequestException('q query parameter required');
    }

    const workspaceId = req.user.workspaceId;
    const userRole = req.user.role;

    const documents = await this.documentService.searchDocuments(
      workspaceId,
      query,
      userRole,
      limit ? parseInt(limit, 10) : 10,
    );

    return {
      query,
      results: documents.length,
      documents,
    };
  }

  /**
   * Sync Google Drive files
   */
  @Post('sync/drive')
  @RequirePermission('write_documents')
  @HttpCode(HttpStatus.OK)
  async syncGoogleDrive(
    @Request() req,
    @Query('limit') limit?: string,
  ) {
    const userId = req.user.sub;
    const workspaceId = req.user.workspaceId;

    const result = await this.documentService.syncGoogleDriveFiles(
      userId,
      workspaceId,
      limit ? parseInt(limit, 10) : 50,
    );

    return {
      success: true,
      synced: result.synced,
      documents: result.documents,
    };
  }

  /**
   * Sync Gmail messages
   */
  @Post('sync/gmail')
  @RequirePermission('write_documents')
  @HttpCode(HttpStatus.OK)
  async syncGmail(
    @Request() req,
    @Query('limit') limit?: string,
  ) {
    const userId = req.user.sub;
    const workspaceId = req.user.workspaceId;

    const result = await this.documentService.syncGmailMessages(
      userId,
      workspaceId,
      limit ? parseInt(limit, 10) : 10,
    );

    return {
      success: true,
      synced: result.synced,
      documents: result.documents,
    };
  }

  /**
   * Generate AI summary
   */
  @Post(':documentId/summarize')
  @RequirePermission('read_documents')
  @HttpCode(HttpStatus.OK)
  async generateSummary(
    @Request() req,
    @Param('documentId') documentId: string,
  ) {
    const userRole = req.user.role;

    const summary = await this.documentService.generateSummary(documentId, userRole);

    return {
      success: true,
      summary,
    };
  }

  /**
   * Link document to customer
   */
  @Post(':documentId/link/customer')
  @RequirePermission('write_documents')
  @HttpCode(HttpStatus.OK)
  async linkToCustomer(
    @Request() req,
    @Param('documentId') documentId: string,
    @Body() body: { customerId: string },
  ) {
    const userId = req.user.sub;
    const workspaceId = req.user.workspaceId;
    const userRole = req.user.role;

    if (!body.customerId) {
      throw new BadRequestException('customerId is required');
    }

    const document = await this.documentService.linkToCustomer(documentId, body.customerId, userRole);

    // Create knowledge graph edge
    await this.graphService.createEdge(
      workspaceId,
      { type: 'document', id: documentId },
      { type: 'customer', id: body.customerId },
      'applies_to',
      { reason: 'Document linked to customer', createdBy: userId },
    );

    return {
      success: true,
      document,
    };
  }

  /**
   * Link document to workflow
   */
  @Post(':documentId/link/workflow')
  @RequirePermission('write_documents')
  @HttpCode(HttpStatus.OK)
  async linkToWorkflow(
    @Request() req,
    @Param('documentId') documentId: string,
    @Body() body: { workflowId: string },
  ) {
    const userId = req.user.sub;
    const workspaceId = req.user.workspaceId;
    const userRole = req.user.role;

    if (!body.workflowId) {
      throw new BadRequestException('workflowId is required');
    }

    const document = await this.documentService.linkToWorkflow(documentId, body.workflowId, userRole);

    // Create knowledge graph edge
    await this.graphService.createEdge(
      workspaceId,
      { type: 'document', id: documentId },
      { type: 'workflow', id: body.workflowId },
      'triggers',
      { reason: 'Document linked to workflow', createdBy: userId },
    );

    return {
      success: true,
      document,
    };
  }

  /**
   * Link document to decision
   */
  @Post(':documentId/link/decision')
  @RequirePermission('write_documents')
  @HttpCode(HttpStatus.OK)
  async linkToDecision(
    @Request() req,
    @Param('documentId') documentId: string,
    @Body() body: { decisionId: string },
  ) {
    const userId = req.user.sub;
    const workspaceId = req.user.workspaceId;
    const userRole = req.user.role;

    if (!body.decisionId) {
      throw new BadRequestException('decisionId is required');
    }

    const document = await this.documentService.linkToDecision(documentId, body.decisionId, userRole);

    // Create knowledge graph edge
    await this.graphService.createEdge(
      workspaceId,
      { type: 'document', id: documentId },
      { type: 'decision', id: body.decisionId },
      'informs',
      { reason: 'Document linked to decision', createdBy: userId },
    );

    return {
      success: true,
      document,
    };
  }

  /**
   * Add tag to document
   */
  @Post(':documentId/tags')
  @RequirePermission('write_documents')
  @HttpCode(HttpStatus.OK)
  async addTag(
    @Request() req,
    @Param('documentId') documentId: string,
    @Body() body: { tag: string },
  ) {
    const userRole = req.user.role;

    if (!body.tag) {
      throw new BadRequestException('tag is required');
    }

    const document = await this.documentService.addTag(documentId, body.tag, userRole);

    return {
      success: true,
      document,
    };
  }

  /**
   * Remove tag from document
   */
  @Delete(':documentId/tags/:tag')
  @RequirePermission('write_documents')
  @HttpCode(HttpStatus.OK)
  async removeTag(
    @Request() req,
    @Param('documentId') documentId: string,
    @Param('tag') tag: string,
  ) {
    const userRole = req.user.role;

    const document = await this.documentService.removeTag(documentId, tag, userRole);

    return {
      success: true,
      document,
    };
  }
}
