import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { DocumentRecord, DocumentDocument } from '../schemas/document.schema';
import { GoogleDriveService } from './google-drive.service';
import { GmailService } from './gmail.service';

@Injectable()
export class DocumentService {
  constructor(
    @InjectModel(DocumentRecord.name) private readonly documentModel: Model<DocumentDocument>,
    private readonly driveService: GoogleDriveService,
    private readonly gmailService: GmailService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Create a new document
   */
  async createDocument(
    userId: string,
    workspaceId: string,
    data: {
      title: string;
      type?: string;
      content?: string;
      tags?: string[];
      readableBy?: string[];
      editableBy?: string[];
    },
  ): Promise<DocumentDocument> {
    const document = await this.documentModel.create({
      workspaceId: new Types.ObjectId(workspaceId),
      title: data.title,
      type: data.type || 'doc',
      content: data.content,
      tags: data.tags || [],
      owner: new Types.ObjectId(userId),
      readableBy: data.readableBy || ['admin'],
      editableBy: data.editableBy || ['admin'],
      status: 'active',
    });

    return document;
  }

  /**
   * Get document by ID (check permissions)
   */
  async getDocument(userId: string, documentId: string, userRole: string): Promise<DocumentDocument> {
    const document = await this.documentModel.findById(documentId);

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    if (!this.canRead(document, userRole)) {
      throw new ForbiddenException('No permission to read this document');
    }

    return document;
  }

  /**
   * List documents in workspace (filtered by permission)
   */
  async listDocuments(
    workspaceId: string,
    userRole: string,
    filters?: {
      type?: string;
      tags?: string[];
      status?: string;
      limit?: number;
      offset?: number;
    },
  ): Promise<{ total: number; documents: DocumentDocument[] }> {
    const query: any = {
      workspaceId: new Types.ObjectId(workspaceId),
      readableBy: userRole,
    };

    if (filters?.type) {
      query.type = filters.type;
    }

    if (filters?.status) {
      query.status = filters.status;
    }

    if (filters?.tags && filters.tags.length > 0) {
      query.tags = { $in: filters.tags };
    }

    const total = await this.documentModel.countDocuments(query);
    const documents = await this.documentModel
      .find(query)
      .limit(filters?.limit || 10)
      .skip(filters?.offset || 0)
      .sort({ createdAt: -1 })
      .exec();

    return { total, documents };
  }

  /**
   * Update document (check edit permission)
   */
  async updateDocument(
    userId: string,
    documentId: string,
    userRole: string,
    data: Partial<DocumentRecord>,
  ): Promise<DocumentDocument> {
    const document = await this.documentModel.findById(documentId);

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    if (!this.canEdit(document, userRole)) {
      throw new ForbiddenException('No permission to edit this document');
    }

    Object.assign(document, data);
    return document.save();
  }

  /**
   * Delete document (owner only)
   */
  async deleteDocument(userId: string, documentId: string, userRole: string): Promise<void> {
    const document = await this.documentModel.findById(documentId);

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    if (!this.isOwner(document, userId)) {
      throw new ForbiddenException('Only owner can delete this document');
    }

    await this.documentModel.findByIdAndDelete(documentId);
  }

  /**
   * Search documents by title/content
   */
  async searchDocuments(
    workspaceId: string,
    query: string,
    userRole: string,
    limit: number = 10,
  ): Promise<DocumentDocument[]> {
    const documents = await this.documentModel
      .find({
        workspaceId: new Types.ObjectId(workspaceId),
        readableBy: userRole,
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { content: { $regex: query, $options: 'i' } },
          { summary: { $regex: query, $options: 'i' } },
        ],
      })
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();

    return documents;
  }

  /**
   * Sync Google Drive files to documents
   */
  async syncGoogleDriveFiles(
    userId: string,
    workspaceId: string,
    limit: number = 50,
  ): Promise<{ synced: number; documents: DocumentDocument[] }> {
    // Get files from Google Drive
    const driveResult = await this.driveService.syncDriveFiles(userId, limit);

    const syncedDocs: DocumentDocument[] = [];

    for (const file of driveResult.files) {
      if (!file.id || !file.name) continue;

      // Check if document already exists
      let document = await this.documentModel.findOne({
        googleDriveId: file.id,
        workspaceId: new Types.ObjectId(workspaceId),
      });

      if (!document) {
        // Determine document type from MIME type
        const type = this.getMimeTypeCategory(file.mimeType || undefined);

        document = await this.documentModel.create({
          workspaceId: new Types.ObjectId(workspaceId),
          title: file.name,
          type,
          googleDriveId: file.id,
          sourceUrl: file.webViewLink || undefined,
          mimeType: file.mimeType || undefined,
          size: file.size ? parseInt(file.size, 10) : 0,
          owner: new Types.ObjectId(userId),
          readableBy: ['admin', 'manager', 'team_member'],
          editableBy: ['admin', 'manager'],
          lastSyncedAt: new Date(),
          status: 'active',
        });
      } else {
        // Update existing document
        document.lastSyncedAt = new Date();
        document.title = file.name;
        document.sourceUrl = file.webViewLink || undefined;
        await document.save();
      }

      syncedDocs.push(document);
    }

    return {
      synced: syncedDocs.length,
      documents: syncedDocs,
    };
  }

  /**
   * Sync recent Gmail messages as documents
   */
  async syncGmailMessages(
    userId: string,
    workspaceId: string,
    limit: number = 10,
  ): Promise<{ synced: number; documents: DocumentDocument[] }> {
    const messages = await this.gmailService.getRecentUnreadSummaries(userId, limit);

    const syncedDocs: DocumentDocument[] = [];

    for (const msg of messages) {
      // Check if document already exists
      let document = await this.documentModel.findOne({
        gmailMessageId: msg.id,
        workspaceId: new Types.ObjectId(workspaceId),
      });

      if (!document) {
        document = await this.documentModel.create({
          workspaceId: new Types.ObjectId(workspaceId),
          title: msg.subject,
          type: 'email',
          gmailMessageId: msg.id,
          content: msg.snippet,
          summary: msg.snippet,
          sourceUrl: `https://mail.google.com/mail/u/0/#inbox/${msg.id}`,
          owner: new Types.ObjectId(userId),
          readableBy: ['admin', 'manager', 'team_member'],
          editableBy: ['admin'],
          lastSyncedAt: new Date(),
          status: 'active',
          tags: ['inbox'],
        });
      }

      syncedDocs.push(document);
    }

    return {
      synced: syncedDocs.length,
      documents: syncedDocs,
    };
  }

  /**
   * Generate AI summary for document content
   */
  async generateSummary(
    documentId: string,
    userRole: string,
  ): Promise<string> {
    const document = await this.documentModel.findById(documentId);

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    if (!this.canRead(document, userRole)) {
      throw new ForbiddenException('No permission to read this document');
    }

    if (!document.content) {
      throw new BadRequestException('Document has no content to summarize');
    }

    // For MVP, return placeholder. In production, call Claude API
    const claudeApiKey = this.configService.get('CLAUDE_API_KEY');
    if (!claudeApiKey) {
      // Fallback: use first 200 chars as summary
      return document.content.substring(0, 200) + '...';
    }

    // TODO: Call Claude API to generate summary
    // For now, use snippet
    const summary = document.content.substring(0, 300) + '...';

    // Update document with generated summary
    document.summary = summary;
    document.aiSummaryGeneratedAt = new Date();
    await document.save();

    return summary;
  }

  /**
   * Link document to customer
   */
  async linkToCustomer(
    documentId: string,
    customerId: string,
    userRole: string,
  ): Promise<DocumentDocument> {
    const document = await this.documentModel.findById(documentId);

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    if (!this.canEdit(document, userRole)) {
      throw new ForbiddenException('No permission to edit this document');
    }

    document.linkedCustomerId = new Types.ObjectId(customerId);
    return document.save();
  }

  /**
   * Link document to workflow
   */
  async linkToWorkflow(
    documentId: string,
    workflowId: string,
    userRole: string,
  ): Promise<DocumentDocument> {
    const document = await this.documentModel.findById(documentId);

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    if (!this.canEdit(document, userRole)) {
      throw new ForbiddenException('No permission to edit this document');
    }

    document.linkedWorkflowId = new Types.ObjectId(workflowId);
    return document.save();
  }

  /**
   * Link document to decision
   */
  async linkToDecision(
    documentId: string,
    decisionId: string,
    userRole: string,
  ): Promise<DocumentDocument> {
    const document = await this.documentModel.findById(documentId);

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    if (!this.canEdit(document, userRole)) {
      throw new ForbiddenException('No permission to edit this document');
    }

    document.linkedDecisionId = new Types.ObjectId(decisionId);
    return document.save();
  }

  /**
   * Get documents linked to a customer
   */
  async getDocumentsForCustomer(
    customerId: string,
    userRole: string,
  ): Promise<DocumentDocument[]> {
    return this.documentModel
      .find({
        linkedCustomerId: new Types.ObjectId(customerId),
        readableBy: userRole,
        status: 'active',
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Add tag to document
   */
  async addTag(documentId: string, tag: string, userRole: string): Promise<DocumentDocument> {
    const document = await this.documentModel.findById(documentId);

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    if (!this.canEdit(document, userRole)) {
      throw new ForbiddenException('No permission to edit this document');
    }

    if (!document.tags.includes(tag)) {
      document.tags.push(tag);
      await document.save();
    }

    return document;
  }

  /**
   * Remove tag from document
   */
  async removeTag(documentId: string, tag: string, userRole: string): Promise<DocumentDocument> {
    const document = await this.documentModel.findById(documentId);

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    if (!this.canEdit(document, userRole)) {
      throw new ForbiddenException('No permission to edit this document');
    }

    document.tags = document.tags.filter((t: string) => t !== tag);
    await document.save();

    return document;
  }

  // Private helper methods

  private canRead(document: DocumentRecord, userRole: string): boolean {
    return document.readableBy.includes(userRole) || document.readableBy.includes('*');
  }

  private canEdit(document: DocumentRecord, userRole: string): boolean {
    return document.editableBy.includes(userRole) || document.editableBy.includes('*');
  }

  private isOwner(document: DocumentRecord, userId: string): boolean {
    return document.owner.toString() === new Types.ObjectId(userId).toString();
  }

  private getMimeTypeCategory(
    mimeType?: string,
  ): 'doc' | 'sheet' | 'sop' | 'proposal' | 'contract' | 'research' | 'meeting_notes' {
    if (!mimeType) return 'doc';

    if (mimeType.includes('spreadsheet')) return 'sheet';
    if (mimeType.includes('document')) return 'doc';
    if (mimeType.includes('presentation')) return 'sop';

    return 'doc';
  }
}
