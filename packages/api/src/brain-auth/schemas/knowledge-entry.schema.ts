import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type KnowledgeEntryDocument = Document & KnowledgeEntry;

@Schema({ timestamps: true })
export class KnowledgeEntry {
  @Prop({ required: true, type: Types.ObjectId })
  workspaceId!: Types.ObjectId;

  @Prop({ required: true })
  title!: string;

  @Prop()
  slug?: string; // URL-safe identifier

  @Prop()
  content!: string;

  @Prop({ enum: ['note', 'decision', 'learning', 'template', 'sop', 'research'], default: 'note' })
  type!: 'note' | 'decision' | 'learning' | 'template' | 'sop' | 'research';

  @Prop({ type: [String], default: [] })
  tags!: string[];

  @Prop({ type: [String], default: [] })
  backlinks!: string[]; // References to other entries (slugs)

  @Prop({ type: [String], default: [] })
  forwardlinks!: string[]; // Entries that reference this one

  @Prop({ required: true, type: Types.ObjectId })
  author!: Types.ObjectId;

  @Prop()
  summary?: string; // AI-generated summary

  @Prop({ type: Object, default: {} })
  metadata?: Record<string, any>;

  @Prop()
  obsidianVaultId?: string; // ID of source vault

  @Prop()
  obsidianNoteId?: string; // Path in Obsidian vault

  @Prop()
  paperclipId?: string; // ID in Paperclip system

  @Prop()
  lastSyncedAt?: Date;

  @Prop({ default: 'active' })
  status!: 'active' | 'archived' | 'deleted';

  @Prop({ type: Types.ObjectId, default: null })
  linkedDecisionId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, default: null })
  linkedDocumentId?: Types.ObjectId;

  @Prop({ default: 1 })
  version!: number;

  @Prop()
  previousVersions?: Array<{
    version: number;
    content: string;
    author: Types.ObjectId;
    reason?: string;
    timestamp: Date;
  }>;
}

export const KnowledgeEntrySchema = SchemaFactory.createForClass(KnowledgeEntry);

// Indexes for efficient queries
KnowledgeEntrySchema.index({ workspaceId: 1, status: 1 });
KnowledgeEntrySchema.index({ workspaceId: 1, type: 1 });
KnowledgeEntrySchema.index({ workspaceId: 1, tags: 1 });
KnowledgeEntrySchema.index({ slug: 1, workspaceId: 1 }, { unique: true });
KnowledgeEntrySchema.index({ obsidianVaultId: 1, obsidianNoteId: 1 });
KnowledgeEntrySchema.index({ paperclipId: 1 });
KnowledgeEntrySchema.index({ author: 1, createdAt: -1 });
KnowledgeEntrySchema.index({ backlinks: 1 });
