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
import { GoogleOAuthController } from './controllers/google-oauth.controller';
import { GmailController } from './controllers/gmail.controller';
import { GoogleDriveController } from './controllers/google-drive.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { User, UserSchema } from './schemas/user.schema';
import { Workspace, WorkspaceSchema } from './schemas/workspace.schema';
import { RefreshToken, RefreshTokenSchema } from './schemas/refresh-token.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Workspace.name, schema: WorkspaceSchema },
      { name: RefreshToken.name, schema: RefreshTokenSchema },
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
  ],
  providers: [
    BrainAuthService,
    GoogleOAuthService,
    GmailService,
    GoogleDriveService,
    JwtStrategy,
  ],
  exports: [
    BrainAuthService,
    GoogleOAuthService,
    GmailService,
    GoogleDriveService,
    JwtModule,
    PassportModule,
  ],
})
export class BrainAuthModule {}
