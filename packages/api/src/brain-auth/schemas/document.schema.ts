import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DocumentDocument = Document & DocumentRecord;

@Schema({ timestamps: true })
export class DocumentRecord {
  @Prop({ required: true, type: Types.ObjectId })
  workspaceId!: Types.ObjectId;

  @Prop({ required: true })
  title!: string;

  @Prop({
    enum: ['sop', 'proposal', 'contract', 'research', 'meeting_notes', 'email', 'doc', 'sheet'],
    default: 'doc',
  })
  type!: 'sop' | 'proposal' | 'contract' | 'research' | 'meeting_notes' | 'email' | 'doc' | 'sheet';

  @Prop()
  googleDriveId?: string;

  @Prop()
  gmailMessageId?: string;

  @Prop()
  content?: string;

  @Prop()
  summary?: string;

  @Prop({ type: [String], default: [] })
  tags!: string[];

  @Prop({ required: true, type: Types.ObjectId })
  owner!: Types.ObjectId;

  @Prop({ type: [String], default: ['admin'] })
  readableBy!: string[];

  @Prop({ type: [String], default: ['admin'] })
  editableBy!: string[];

  @Prop()
  sourceUrl?: string;

  @Prop()
  mimeType?: string;

  @Prop()
  size?: number;

  @Prop({ default: 'active' })
  status!: 'active' | 'archived' | 'deleted';

  @Prop({ type: Types.ObjectId, default: null })
  linkedCustomerId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, default: null })
  linkedWorkflowId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, default: null })
  linkedDecisionId?: Types.ObjectId;

  @Prop()
  lastSyncedAt?: Date;

  @Prop()
  aiSummaryGeneratedAt?: Date;
}

export const DocumentSchema = SchemaFactory.createForClass(DocumentRecord);

// Indexes for common queries
DocumentSchema.index({ workspaceId: 1, type: 1 });
DocumentSchema.index({ workspaceId: 1, tags: 1 });
DocumentSchema.index({ googleDriveId: 1 }, { sparse: true });
DocumentSchema.index({ gmailMessageId: 1 }, { sparse: true });
DocumentSchema.index({ owner: 1, workspaceId: 1 });
DocumentSchema.index({ linkedCustomerId: 1 });
DocumentSchema.index({ linkedWorkflowId: 1 });
DocumentSchema.index({ linkedDecisionId: 1 });
DocumentSchema.index({ createdAt: -1 });
DocumentSchema.index({ status: 1, workspaceId: 1 });
