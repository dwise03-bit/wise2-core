import { Injectable, Logger } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy, VerifyCallback } from 'passport-google-oauth20'
import { ConfigService } from '@nestjs/config'

interface GoogleProfile {
  id: string
  displayName: string
  name?: { familyName?: string; givenName?: string }
  emails?: Array<{ value: string }>
  photos?: Array<{ value: string }>
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly logger = new Logger('GoogleStrategy')

  constructor(configService: ConfigService) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    })
    this.logger.log('🔐 Google OAuth2 strategy initialized')
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: GoogleProfile,
    done: VerifyCallback
  ): Promise<void> {
    try {
      const email = profile.emails?.[0]?.value
      const firstName = profile.name?.givenName || profile.displayName.split(' ')[0]
      const lastName = profile.name?.familyName || profile.displayName.split(' ').slice(1).join(' ')

      const user = {
        id: profile.id,
        email,
        firstName,
        lastName,
        picture: profile.photos?.[0]?.value,
        provider: 'google',
        accessToken,
        refreshToken,
      }

      this.logger.log(`✅ Google OAuth validated: ${email}`)
      done(null, user)
    } catch (error) {
      this.logger.error(`❌ Google OAuth validation failed: ${error instanceof Error ? error.message : String(error)}`)
      done(error)
    }
  }
}
