import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WorkflowTemplateDocument = Document & WorkflowTemplate;

export interface WorkflowTrigger {
  id: string;
  type: string;
  name?: string;
  config: Record<string, any>;
}

export interface WorkflowAction {
  id: string;
  type: string;
  name?: string;
  config: Record<string, any>;
  onSuccess?: WorkflowAction[];
  onFailure?: WorkflowAction[];
}

@Schema({ timestamps: true })
export class WorkflowTemplate {
  @Prop({ required: true, type: Types.ObjectId })
  workspaceId!: Types.ObjectId;

  @Prop({ required: true })
  name!: string;

  @Prop()
  description?: string;

  @Prop({ default: 'draft' })
  status!: 'draft' | 'active' | 'paused' | 'archived';

  @Prop({ default: 0 })
  version!: number;

  @Prop({ type: Object, default: {} })
  metadata?: Record<string, any>;

  @Prop({ type: [Object], default: [] })
  triggers!: WorkflowTrigger[];

  @Prop({ type: [Object], default: [] })
  actions!: WorkflowAction[];

  @Prop({ type: Types.ObjectId })
  owner!: Types.ObjectId;

  @Prop({ default: false })
  isPublic!: boolean;

  @Prop({ type: [Types.ObjectId], default: [] })
  sharedWith!: Types.ObjectId[];

  @Prop({ default: 0 })
  executionCount!: number;

  @Prop({ type: Date })
  lastExecutedAt?: Date;

  @Prop({ default: 0 })
  successCount!: number;

  @Prop({ default: 0 })
  failureCount!: number;

  @Prop()
  errorRate?: number;

  @Prop({ type: Object })
  lastError?: {
    message: string;
    timestamp: Date;
    executionId: string;
  };

  @Prop({ default: true })
  enabled!: boolean;

  @Prop()
  retryPolicy?: {
    maxRetries: number;
    backoffMs: number;
    exponential: boolean;
  };

  @Prop()
  timeout?: number; // milliseconds
}

export const WorkflowTemplateSchema = SchemaFactory.createForClass(WorkflowTemplate);

// Indexes
WorkflowTemplateSchema.index({ workspaceId: 1, status: 1 });
WorkflowTemplateSchema.index({ owner: 1, status: 1 });
WorkflowTemplateSchema.index({ workspaceId: 1, enabled: 1 });
WorkflowTemplateSchema.index({ name: 1, workspaceId: 1 });
WorkflowTemplateSchema.index({ isPublic: 1 });
WorkflowTemplateSchema.index({ lastExecutedAt: -1 });
