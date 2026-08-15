import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WorkspaceDocument = Workspace & Document;

@Schema({ timestamps: true })
export class Workspace {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true, unique: true })
  slug!: string;

  @Prop({ required: true, type: Types.ObjectId })
  owner!: Types.ObjectId;

  @Prop({
    enum: ['real_estate', 'legal', 'consulting', 'default'],
    default: 'default',
  })
  industry!: 'real_estate' | 'legal' | 'consulting' | 'default';

  @Prop({
    type: {
      aiProvider: { type: String, enum: ['claude', 'chatgpt', 'gemini'], default: 'claude' },
      emailCategorization: { type: Boolean, default: true },
      automationEnabled: { type: Boolean, default: true },
    },
    default: {},
  })
  settings?: {
    aiProvider: 'claude' | 'chatgpt' | 'gemini';
    emailCategorization: boolean;
    automationEnabled: boolean;
  };

  @Prop({ default: 'active' })
  status!: 'active' | 'archived' | 'suspended';
}

export const WorkspaceSchema = SchemaFactory.createForClass(Workspace);
WorkspaceSchema.index({ slug: 1 }, { unique: true });
WorkspaceSchema.index({ owner: 1 });
