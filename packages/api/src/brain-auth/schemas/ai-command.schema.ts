import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AICommandDocument = Document & AICommand;

@Schema({ timestamps: true })
export class AICommand {
  @Prop({ required: true, type: Types.ObjectId })
  workspaceId!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId })
  userId!: Types.ObjectId;

  @Prop({
    enum: [
      'document_summarize',
      'email_draft',
      'content_generate',
      'analysis',
      'workflow_optimize',
      'customer_insight',
      'decision_support',
      'podcast_generate',
    ],
  })
  operationType!:
    | 'document_summarize'
    | 'email_draft'
    | 'content_generate'
    | 'analysis'
    | 'workflow_optimize'
    | 'customer_insight'
    | 'decision_support'
    | 'podcast_generate';

  @Prop()
  description?: string;

  @Prop()
  prompt?: string;

  @Prop({ enum: ['pending', 'running', 'success', 'failed', 'cancelled'], default: 'pending' })
  status!: 'pending' | 'running' | 'success' | 'failed' | 'cancelled';

  @Prop()
  result?: string;

  @Prop()
  error?: string;

  @Prop()
  model?: string; // claude-3-sonnet, claude-3-opus, etc.

  @Prop()
  inputTokens?: number;

  @Prop()
  outputTokens?: number;

  @Prop()
  costUSD?: number;

  @Prop()
  durationMs?: number;

  @Prop({ type: Object, default: {} })
  metadata?: Record<string, any>;

  @Prop({ type: Types.ObjectId, default: null })
  relatedDocumentId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, default: null })
  relatedCustomerId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, default: null })
  relatedWorkflowId?: Types.ObjectId;

  @Prop()
  startedAt?: Date;

  @Prop()
  completedAt?: Date;

  @Prop({ default: 'active' })
  visibility!: 'active' | 'hidden' | 'archived';
}

export const AICommandSchema = SchemaFactory.createForClass(AICommand);

// Indexes for command center queries
AICommandSchema.index({ workspaceId: 1, status: 1, createdAt: -1 });
AICommandSchema.index({ workspaceId: 1, operationType: 1 });
AICommandSchema.index({ userId: 1, createdAt: -1 });
AICommandSchema.index({ workspaceId: 1, createdAt: -1 });
AICommandSchema.index({ status: 1, createdAt: -1 });
