import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DashboardMetricDocument = Document & DashboardMetric;

@Schema({ timestamps: true })
export class DashboardMetric {
  @Prop({ required: true, type: Types.ObjectId })
  workspaceId!: Types.ObjectId;

  @Prop({
    enum: ['revenue', 'ai_usage', 'automation_health', 'document_count', 'user_activity', 'storage'],
    required: true,
  })
  metricType!: 'revenue' | 'ai_usage' | 'automation_health' | 'document_count' | 'user_activity' | 'storage';

  @Prop({ required: true })
  value!: number;

  @Prop()
  previousValue?: number;

  @Prop()
  unit?: string; // $, tokens, %, count, GB, etc.

  @Prop()
  trend?: 'up' | 'down' | 'stable';

  @Prop()
  trendPercentage?: number;

  @Prop({
    type: {
      current: { type: Number },
      target: { type: Number },
      limit: { type: Number },
    },
  })
  breakdown?: {
    current?: number;
    target?: number;
    limit?: number;
  };

  @Prop({ type: Object, default: {} })
  metadata?: Record<string, any>;

  @Prop({ default: new Date() })
  recordedAt!: Date;

  @Prop({ enum: ['daily', 'weekly', 'monthly', 'hourly'], default: 'daily' })
  period!: 'daily' | 'weekly' | 'monthly' | 'hourly';

  @Prop({ type: Types.ObjectId, default: null })
  relatedEntityId?: Types.ObjectId;

  @Prop({ default: 'active' })
  status!: 'active' | 'archived';
}

export const DashboardMetricSchema = SchemaFactory.createForClass(DashboardMetric);

// Indexes for efficient querying
DashboardMetricSchema.index({ workspaceId: 1, metricType: 1, recordedAt: -1 });
DashboardMetricSchema.index({ workspaceId: 1, period: 1, recordedAt: -1 });
DashboardMetricSchema.index({ recordedAt: -1 });
DashboardMetricSchema.index({ workspaceId: 1, metricType: 1, period: 1 });
