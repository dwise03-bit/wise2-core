import { v4 as uuid } from 'uuid';
import pino from 'pino';

const logger = pino();

export interface VaultDocument {
  id: string;
  path: string;
  title: string;
  content: string;
  folder: string;
  createdAt: number;
  updatedAt: number;
  tags: string[];
  links: string[];
  clientId: string;
  syncVersion: number;
}

export interface VaultFolder {
  name: string;
  path: string;
  description: string;
}

export class VaultStateManager {
  private documents: Map<string, VaultDocument> = new Map();
  private folders: Map<string, VaultFolder> = new Map();

  constructor() {
    this.initializeFolders();
  }

  /**
   * Initialize standard 12-folder structure
   */
  private initializeFolders(): void {
    const folderNames = [
      'INBOX',
      'COMPANY',
      'PROJECTS',
      'CLIENTS',
      'ARCHITECTURE',
      'DOCUMENTATION',
      'DECISIONS',
      'MARKETING',
      'OPERATIONS',
      'AI-CONVERSATIONS',
      'PROMPTS',
      'MEDIA',
      'ARCHIVE',
    ];

    const descriptions: Record<string, string> = {
      INBOX: 'New unprocessed information',
      COMPANY: 'Organizational context and policies',
      PROJECTS: 'Active work and deliverables',
      CLIENTS: 'Customer relationships and accounts',
      ARCHITECTURE: 'Technical design and infrastructure',
      DOCUMENTATION: 'Reference material and guides',
      DECISIONS: 'Architectural decision records',
      MARKETING: 'Go-to-market content and campaigns',
      OPERATIONS: 'Day-to-day operations',
      'AI-CONVERSATIONS': 'AI interaction history',
      PROMPTS: 'Prompt library and templates',
      MEDIA: 'Files and assets',
      ARCHIVE: 'Completed and historical items',
    };

    for (const name of folderNames) {
      this.folders.set(name, {
        name,
        path: `/${name}`,
        description: descriptions[name] || '',
      });
    }

    logger.info('Initialized 12-folder vault structure');
  }

  /**
   * Create or update a document
   */
  createDocument(
    folder: string,
    title: string,
    content: string,
    clientId: string,
    tags: string[] = [],
  ): VaultDocument {
    const docId = uuid();
    const now = Date.now();

    const doc: VaultDocument = {
      id: docId,
      path: `/${folder}/${title.toLowerCase().replace(/\s+/g, '-')}`,
      title,
      content,
      folder,
      createdAt: now,
      updatedAt: now,
      tags,
      links: [],
      clientId,
      syncVersion: 0,
    };

    this.documents.set(docId, doc);
    logger.info(`Created document: ${docId} in ${folder}`);
    return doc;
  }

  /**
   * Update document content
   */
  updateDocument(
    docId: string,
    content: string,
    clientId: string,
    tags?: string[],
  ): VaultDocument | null {
    const doc = this.documents.get(docId);
    if (!doc) return null;

    doc.content = content;
    doc.updatedAt = Date.now();
    doc.clientId = clientId;
    doc.syncVersion += 1;

    if (tags) {
      doc.tags = tags;
    }

    logger.info(`Updated document: ${docId}`);
    return doc;
  }

  /**
   * Get document by ID
   */
  getDocument(docId: string): VaultDocument | null {
    return this.documents.get(docId) || null;
  }

  /**
   * List documents in folder
   */
  getDocumentsByFolder(folder: string): VaultDocument[] {
    return Array.from(this.documents.values()).filter(doc => doc.folder === folder);
  }

  /**
   * Search documents by tag
   */
  searchByTag(tag: string): VaultDocument[] {
    return Array.from(this.documents.values()).filter(doc =>
      doc.tags.includes(tag),
    );
  }

  /**
   * Full-text search
   */
  search(query: string): VaultDocument[] {
    const q = query.toLowerCase();
    return Array.from(this.documents.values()).filter(
      doc =>
        doc.title.toLowerCase().includes(q) ||
        doc.content.toLowerCase().includes(q) ||
        doc.tags.some(tag => tag.toLowerCase().includes(q)),
    );
  }

  /**
   * Get all documents
   */
  getAllDocuments(): VaultDocument[] {
    return Array.from(this.documents.values());
  }

  /**
   * Get folder structure
   */
  getFolders(): VaultFolder[] {
    return Array.from(this.folders.values());
  }

  /**
   * Delete document
   */
  deleteDocument(docId: string): boolean {
    return this.documents.delete(docId);
  }

  /**
   * Get document count
   */
  getDocumentCount(): number {
    return this.documents.size;
  }

  /**
   * Extract links from content
   */
  extractLinks(content: string): string[] {
    const linkRegex = /\[\[(.+?)\]\]/g;
    const links: string[] = [];
    let match;

    while ((match = linkRegex.exec(content))) {
      links.push(match[1]);
    }

    return links;
  }

  /**
   * Get backlinks (documents that link to this document)
   */
  getBacklinks(docId: string): VaultDocument[] {
    const doc = this.getDocument(docId);
    if (!doc) return [];

    return Array.from(this.documents.values()).filter(d =>
      d.links.includes(doc.title),
    );
  }
}
