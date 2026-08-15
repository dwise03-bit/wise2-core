import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email!: string;

  @Prop({ required: true })
  passwordHash!: string;

  @Prop()
  firstName?: string;

  @Prop()
  lastName?: string;

  @Prop({ required: true, type: Types.ObjectId })
  workspaceId!: Types.ObjectId;

  @Prop({ enum: ['admin', 'manager', 'team_member', 'viewer'], default: 'team_member' })
  role!: 'admin' | 'manager' | 'team_member' | 'viewer';

  @Prop({ type: [String], default: [] })
  customPermissions!: string[];

  @Prop({
    type: {
      accessToken: String,
      refreshToken: String,
      expiresAt: Date,
      scopes: [String],
    },
    default: null,
  })
  googleOAuth?: {
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
    scopes: string[];
  };

  @Prop()
  lastLogin?: Date;

  @Prop({ default: 'active' })
  status!: 'active' | 'inactive' | 'suspended';
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ email: 1, workspaceId: 1 }, { unique: true });
UserSchema.index({ workspaceId: 1, role: 1 });
