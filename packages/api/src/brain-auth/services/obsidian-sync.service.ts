import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { KnowledgeEntry, KnowledgeEntryDocument } from '../schemas/knowledge-entry.schema';
import { ObsidianVault, ObsidianVaultDocument } from '../schemas/obsidian-vault.schema';

@Injectable()
export class ObsidianSyncService {
  constructor(
    @InjectModel(KnowledgeEntry.name) private readonly entryModel: Model<KnowledgeEntryDocument>,
    @InjectModel(ObsidianVault.name) private readonly vaultModel: Model<ObsidianVaultDocument>,
  ) {}

  /**
   * Register/configure an Obsidian vault for syncing
   */
  async registerVault(
    workspaceId: string,
    userId: string,
    data: {
      name: string;
      description?: string;
      syncDirection?: string;
      syncInterval?: number;
      config?: Record<string, any>;
    },
  ): Promise<ObsidianVaultDocument> {
    const vault = await this.vaultModel.create({
      workspaceId: new Types.ObjectId(workspaceId),
      name: data.name,
      description: data.description,
      owner: new Types.ObjectId(userId),
      syncStatus: 'active',
      syncDirection: data.syncDirection || 'bidirectional',
      syncInterval: data.syncInterval || 60,
      config: data.config || {
        autoBacklink: true,
        autoTag: true,
        conflictResolution: 'newest',
      },
      status: 'active',
    });

    return vault;
  }

  /**
   * Get vault by ID with workspace validation
   */
  async getVault(vaultId: string, workspaceId: string): Promise<ObsidianVaultDocument | null> {
    const vault = await this.vaultModel.findOne({
      _id: new Types.ObjectId(vaultId),
      workspaceId: new Types.ObjectId(workspaceId),
    });
    return vault;
  }

  /**
   * List vaults for workspace
   */
  async listVaults(workspaceId: string): Promise<ObsidianVaultDocument[]> {
    return this.vaultModel
      .find({
        workspaceId: new Types.ObjectId(workspaceId),
        status: 'active',
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Create or update knowledge entry from Obsidian note
   */
  async syncNoteToEntry(
    workspaceId: string,
    vaultId: string,
    userId: string,
    noteData: {
      notePath: string;
      title: string;
      content: string;
      tags?: string[];
      lastModified?: Date;
    },
  ): Promise<KnowledgeEntryDocument> {
    const slug = this.generateSlug(noteData.title);

    // Check for existing entry
    let entry = await this.entryModel.findOne({
      workspaceId: new Types.ObjectId(workspaceId),
      obsidianVaultId: vaultId,
      obsidianNoteId: noteData.notePath,
    });

    if (entry) {
      // Update existing entry
      return await this.updateEntry(entry._id.toString(), userId, workspaceId, {
        title: noteData.title,
        content: noteData.content,
        tags: noteData.tags || [],
      });
    }

    // Create new entry
    entry = await this.entryModel.create({
      workspaceId: new Types.ObjectId(workspaceId),
      title: noteData.title,
      slug,
      content: noteData.content,
      type: 'note',
      tags: noteData.tags || [],
      author: new Types.ObjectId(userId),
      obsidianVaultId: vaultId,
      obsidianNoteId: noteData.notePath,
      lastSyncedAt: new Date(),
      status: 'active',
      version: 1,
    });

    return entry;
  }

  /**
   * Sync entry back to Obsidian note
   */
  async syncEntryToNote(
    entryId: string,
  ): Promise<{
    notePath: string;
    title: string;
    content: string;
    tags: string[];
  }> {
    const entry = await this.entryModel.findById(entryId);
    if (!entry) {
      throw new NotFoundException('Entry not found');
    }

    if (!entry.obsidianVaultId || !entry.obsidianNoteId) {
      throw new BadRequestException('Entry not synced to Obsidian');
    }

    return {
      notePath: entry.obsidianNoteId,
      title: entry.title,
      content: entry.content,
      tags: entry.tags,
    };
  }

  /**
   * Handle conflict resolution
   */
  async resolveConflict(
    entryId: string,
    brainVersion: string,
    obsidianVersion: string,
    conflictResolution: string = 'newest',
  ): Promise<KnowledgeEntryDocument> {
    const entry = await this.entryModel.findById(entryId);
    if (!entry) {
      throw new NotFoundException('Entry not found');
    }

    let resolvedContent: string;

    switch (conflictResolution) {
      case 'brain':
        resolvedContent = brainVersion;
        break;
      case 'obsidian':
        resolvedContent = obsidianVersion;
        break;
      case 'manual':
        // Return conflict info for user to resolve manually
        throw new BadRequestException('Manual conflict resolution required');
      case 'newest':
      default:
        // Use the most recent version (would need timestamps to compare)
        resolvedContent = brainVersion; // Default to brain for now
    }

    // Store previous version
    if (!entry.previousVersions) {
      entry.previousVersions = [];
    }

    entry.previousVersions.push({
      version: entry.version,
      content: entry.content,
      author: entry.author,
      reason: 'Conflict resolution',
      timestamp: new Date(),
    });

    // Update to resolved version
    entry.version += 1;
    entry.content = resolvedContent;
    entry.lastSyncedAt = new Date();

    return entry.save();
  }

  /**
   * Update entry with version history
   */
  async updateEntry(
    entryId: string,
    userId: string,
    workspaceId: string,
    data: {
      title?: string;
      content?: string;
      tags?: string[];
      type?: string;
    },
  ): Promise<KnowledgeEntryDocument> {
    const entry = await this.entryModel.findById(entryId);
    if (!entry) {
      throw new NotFoundException('Entry not found');
    }

    // Store previous version
    if (!entry.previousVersions) {
      entry.previousVersions = [];
    }

    if (entry.content !== data.content || entry.title !== data.title) {
      entry.previousVersions.push({
        version: entry.version,
        content: entry.content,
        author: entry.author,
        reason: 'Update',
        timestamp: new Date(),
      });

      entry.version += 1;
    }

    if (data.title) entry.title = data.title;
    if (data.content) entry.content = data.content;
    if (data.tags) entry.tags = data.tags;
    if (data.type) entry.type = data.type as any;

    entry.lastSyncedAt = new Date();
    return entry.save();
  }

  /**
   * Extract backlinks and forward links (optimized with bulk operations)
   */
  async updateLinks(entryId: string, workspaceId: string): Promise<void> {
    const entry = await this.entryModel.findById(entryId);
    if (!entry) {
      throw new NotFoundException('Entry not found');
    }

    // Extract wikilinks from content: [[slug]] or [[slug|display text]]
    const wikiLinkRegex = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;
    const matches = entry.content.matchAll(wikiLinkRegex);
    const backlinks: string[] = [];

    for (const match of matches) {
      const linkedSlug = match[1].trim().toLowerCase().replace(/\s+/g, '-');
      backlinks.push(linkedSlug);
    }

    entry.backlinks = backlinks;
    await entry.save();

    // Bulk update all referenced entries at once (O(1) query instead of O(n))
    if (backlinks.length > 0) {
      await this.entryModel.updateMany(
        {
          workspaceId: new Types.ObjectId(workspaceId),
          slug: { $in: backlinks },
        },
        {
          $addToSet: { forwardlinks: entry.slug },
        },
      );
    }

    // Clean up: remove from entries no longer referenced
    // Note: Previous backlinks would need to be stored separately since previousVersions only stores content/version/author
    // For now, we only add new forward links, not remove old ones (can be enhanced later)
  }

  /**
   * Search entries
   */
  async searchEntries(
    workspaceId: string,
    query: string,
    limit: number = 20,
  ): Promise<KnowledgeEntryDocument[]> {
    return this.entryModel
      .find({
        workspaceId: new Types.ObjectId(workspaceId),
        status: 'active',
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { content: { $regex: query, $options: 'i' } },
          { tags: query },
        ],
      })
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Get entry by slug
   */
  async getEntryBySlug(workspaceId: string, slug: string): Promise<KnowledgeEntryDocument | null> {
    return this.entryModel.findOne({
      workspaceId: new Types.ObjectId(workspaceId),
      slug,
      status: 'active',
    });
  }

  /**
   * Get entry version history
   */
  async getEntryHistory(entryId: string): Promise<any> {
    const entry = await this.entryModel.findById(entryId);
    if (!entry) {
      throw new NotFoundException('Entry not found');
    }

    return {
      entryId,
      title: entry.title,
      currentVersion: entry.version,
      history: entry.previousVersions || [],
      totalVersions: (entry.previousVersions?.length || 0) + 1,
    };
  }

  /**
   * Revert to previous version
   */
  async revertVersion(entryId: string, targetVersion: number): Promise<KnowledgeEntryDocument> {
    const entry = await this.entryModel.findById(entryId);
    if (!entry) {
      throw new NotFoundException('Entry not found');
    }

    const previousVersion = entry.previousVersions?.find((v) => v.version === targetVersion);
    if (!previousVersion) {
      throw new BadRequestException(`Version ${targetVersion} not found`);
    }

    // Store current as previous
    if (!entry.previousVersions) {
      entry.previousVersions = [];
    }

    entry.previousVersions.push({
      version: entry.version,
      content: entry.content,
      author: entry.author,
      reason: `Reverted to version ${targetVersion}`,
      timestamp: new Date(),
    });

    // Apply reverted version
    entry.version += 1;
    entry.content = previousVersion.content;
    entry.lastSyncedAt = new Date();

    return entry.save();
  }

  /**
   * Update vault sync status
   */
  async updateVaultStatus(
    vaultId: string,
    status: string,
    data?: {
      lastSyncError?: string;
      totalNotes?: number;
      syncedNotes?: number;
    },
  ): Promise<ObsidianVaultDocument | null> {
    return this.vaultModel.findByIdAndUpdate(
      vaultId,
      {
        syncStatus: status,
        lastSyncAt: new Date(),
        lastSyncError: data?.lastSyncError,
        totalNotes: data?.totalNotes,
        syncedNotes: data?.syncedNotes,
      },
      { new: true },
    );
  }

  // Private helper

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
}
