import { Injectable, Logger } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy, VerifyCallback } from 'passport-github2'
import { ConfigService } from '@nestjs/config'

interface GitHubProfile {
  id: number
  username: string
  displayName: string
  emails?: Array<{ value: string }>
  photos?: Array<{ value: string }>
  profileUrl?: string
}

@Injectable()
export class GitHubStrategy extends PassportStrategy(Strategy, 'github') {
  private readonly logger = new Logger('GitHubStrategy')

  constructor(configService: ConfigService) {
    super({
      clientID: configService.get('GITHUB_CLIENT_ID'),
      clientSecret: configService.get('GITHUB_CLIENT_SECRET'),
      callbackURL: configService.get('GITHUB_CALLBACK_URL'),
      scope: ['user:email'],
    })
    this.logger.log('🔐 GitHub OAuth2 strategy initialized')
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: GitHubProfile,
    done: VerifyCallback
  ): Promise<void> {
    try {
      const email = profile.emails?.[0]?.value
      const [firstName, ...lastNameParts] = (profile.displayName || profile.username).split(' ')

      const user = {
        id: String(profile.id),
        email: email || `${profile.username}@github.com`,
        firstName,
        lastName: lastNameParts.join(' ') || profile.username,
        username: profile.username,
        picture: profile.photos?.[0]?.value,
        profileUrl: profile.profileUrl,
        provider: 'github',
        accessToken,
        refreshToken: refreshToken || null,
      }

      this.logger.log(`✅ GitHub OAuth validated: ${user.username}`)
      done(null, user)
    } catch (error) {
      this.logger.error(`❌ GitHub OAuth validation failed: ${error instanceof Error ? error.message : String(error)}`)
      done(error)
    }
  }
}
