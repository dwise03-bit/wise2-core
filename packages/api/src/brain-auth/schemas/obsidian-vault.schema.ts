import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ObsidianVaultDocument = Document & ObsidianVault;

@Schema({ timestamps: true })
export class ObsidianVault {
  @Prop({ required: true, type: Types.ObjectId })
  workspaceId!: Types.ObjectId;

  @Prop({ required: true })
  name!: string;

  @Prop()
  description?: string;

  @Prop({ required: true, type: Types.ObjectId })
  owner!: Types.ObjectId;

  @Prop({ enum: ['active', 'paused', 'error'], default: 'active' })
  syncStatus!: 'active' | 'paused' | 'error';

  @Prop()
  syncDirection?: 'bidirectional' | 'obsidian_to_brain' | 'brain_to_obsidian';

  @Prop()
  lastSyncAt?: Date;

  @Prop()
  nextSyncAt?: Date;

  @Prop()
  syncInterval?: number; // minutes

  @Prop()
  lastSyncError?: string;

  @Prop({ type: Object, default: {} })
  config?: {
    excludeFolders?: string[];
    includeFolders?: string[];
    autoBacklink?: boolean;
    autoTag?: boolean;
    conflictResolution?: 'newest' | 'brain' | 'obsidian' | 'manual';
  };

  @Prop({ type: Object, default: {} })
  metadata?: Record<string, any>;

  @Prop({ default: 0 })
  totalNotes!: number;

  @Prop({ default: 0 })
  syncedNotes!: number;

  @Prop({ default: 0 })
  unsyncedNotes!: number;

  @Prop({ type: [String], default: [] })
  vaultFolders!: string[]; // Folder structure from vault

  @Prop({ default: 'active' })
  status!: 'active' | 'archived' | 'error';
}

export const ObsidianVaultSchema = SchemaFactory.createForClass(ObsidianVault);

// Indexes
ObsidianVaultSchema.index({ workspaceId: 1, status: 1 });
ObsidianVaultSchema.index({ owner: 1 });
ObsidianVaultSchema.index({ lastSyncAt: -1 });
ObsidianVaultSchema.index({ syncStatus: 1 });
