import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type KnowledgeGraphEdgeDocument = Document & KnowledgeGraphEdge;

@Schema({ timestamps: true })
export class KnowledgeGraphEdge {
  @Prop({ required: true, type: Types.ObjectId })
  workspaceId!: Types.ObjectId;

  @Prop({
    type: {
      type: { type: String, enum: ['document', 'customer', 'workflow', 'decision', 'email'] },
      id: { type: Types.ObjectId },
    },
    required: true,
  })
  from!: {
    type: 'document' | 'customer' | 'workflow' | 'decision' | 'email';
    id: Types.ObjectId;
  };

  @Prop({
    type: {
      type: { type: String, enum: ['document', 'customer', 'workflow', 'decision', 'email'] },
      id: { type: Types.ObjectId },
    },
    required: true,
  })
  to!: {
    type: 'document' | 'customer' | 'workflow' | 'decision' | 'email';
    id: Types.ObjectId;
  };

  @Prop({
    enum: [
      'applies_to',
      'triggers',
      'informs',
      'affects',
      'references',
      'related_to',
      'depends_on',
      'blocks',
    ],
    required: true,
  })
  relationship!:
    | 'applies_to'
    | 'triggers'
    | 'informs'
    | 'affects'
    | 'references'
    | 'related_to'
    | 'depends_on'
    | 'blocks';

  @Prop()
  weight?: number; // 0-1, for ranking relevance

  @Prop()
  reason?: string; // Why are these connected?

  @Prop({ type: Types.ObjectId, default: null })
  createdBy?: Types.ObjectId;

  @Prop({ default: 'active' })
  status!: 'active' | 'archived';
}

export const KnowledgeGraphEdgeSchema = SchemaFactory.createForClass(KnowledgeGraphEdge);

// Indexes for efficient graph traversal
KnowledgeGraphEdgeSchema.index({ workspaceId: 1, 'from.id': 1 });
KnowledgeGraphEdgeSchema.index({ workspaceId: 1, 'to.id': 1 });
KnowledgeGraphEdgeSchema.index({ workspaceId: 1, relationship: 1 });
KnowledgeGraphEdgeSchema.index(
  { 'from.id': 1, 'to.id': 1, workspaceId: 1 },
  { unique: true },
);
KnowledgeGraphEdgeSchema.index({ createdAt: -1 });
