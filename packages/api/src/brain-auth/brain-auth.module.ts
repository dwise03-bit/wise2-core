import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { BrainAuthService } from './brain-auth.service';
import { BrainAuthController } from './brain-auth.controller';
import { GoogleOAuthService } from './services/google-oauth.service';
import { GmailService } from './services/gmail.service';
import { GoogleDriveService } from './services/google-drive.service';
import { DocumentService } from './services/document.service';
import { KnowledgeGraphService } from './services/knowledge-graph.service';
import { GoogleOAuthController } from './controllers/google-oauth.controller';
import { GmailController } from './controllers/gmail.controller';
import { GoogleDriveController } from './controllers/google-drive.controller';
import { DocumentController } from './controllers/document.controller';
import { KnowledgeGraphController } from './controllers/knowledge-graph.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { User, UserSchema } from './schemas/user.schema';
import { Workspace, WorkspaceSchema } from './schemas/workspace.schema';
import { RefreshToken, RefreshTokenSchema } from './schemas/refresh-token.schema';
import { DocumentRecord, DocumentSchema } from './schemas/document.schema';
import { KnowledgeGraphEdge, KnowledgeGraphEdgeSchema } from './schemas/knowledge-graph-edge.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Workspace.name, schema: WorkspaceSchema },
      { name: RefreshToken.name, schema: RefreshTokenSchema },
      { name: DocumentRecord.name, schema: DocumentSchema },
      { name: KnowledgeGraphEdge.name, schema: KnowledgeGraphEdgeSchema },
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET') || 'your-secret-key-change-in-production',
        signOptions: { algorithm: 'HS256' },
      }),
    }),
  ],
  controllers: [
    BrainAuthController,
    GoogleOAuthController,
    GmailController,
    GoogleDriveController,
    DocumentController,
    KnowledgeGraphController,
  ],
  providers: [
    BrainAuthService,
    GoogleOAuthService,
    GmailService,
    GoogleDriveService,
    DocumentService,
    KnowledgeGraphService,
    JwtStrategy,
  ],
  exports: [
    BrainAuthService,
    GoogleOAuthService,
    GmailService,
    GoogleDriveService,
    DocumentService,
    KnowledgeGraphService,
    JwtModule,
    PassportModule,
  ],
})
export class BrainAuthModule {}
