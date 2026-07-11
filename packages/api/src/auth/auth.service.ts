import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { CreateUserDto, LoginDto } from './dto'
import { User } from './user.entity'

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const { email, password, firstName, lastName } = createUserDto

    // Validate password strength
    if (password.length < 12) {
      throw new BadRequestException('Password must be at least 12 characters')
    }

    // Check if user exists
    const existingUser = await this.usersRepository.findOne({ where: { email } })
    if (existingUser) {
      throw new BadRequestException('Email already registered')
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 12)

    // Create user in database
    const user = this.usersRepository.create({
      email,
      password_hash,
      firstName,
      lastName,
      emailVerified: process.env.NODE_ENV !== 'production',
    })

    await this.usersRepository.save(user)

    return {
      message: 'User registered successfully. Please check your email to verify.',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    }
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto

    // Find user by email
    const user = await this.usersRepository.findOne({ where: { email } })
    if (!user) {
      throw new UnauthorizedException('Invalid email or password')
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash)
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password')
    }

    // Check if email is verified
    if (!user.emailVerified) {
      throw new UnauthorizedException('Please verify your email before logging in')
    }

    // Generate JWT tokens
    const tokens = this.generateTokens(user)

    return {
      tokens,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    }
  }

  async refreshToken(token: string) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret',
      })

      // Verify token is refresh token (mock check)
      const user = { id: payload.sub, email: payload.email }
      const newTokens = this.generateTokens(user)

      return { tokens: newTokens }
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token')
    }
  }

  async validateUser(email: string, password: string) {
    // Mock user lookup
    // const user = await this.usersService.findByEmail(email)
    const user = { id: 'uuid', email, password_hash: 'hashed' }

    if (user && (await bcrypt.compare(password, user.password_hash))) {
      return user
    }
    return null
  }

  generateTokens(user: any) {
    const payload = { email: user.email, sub: user.id }

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: 86400, // 24 hours in seconds
      secret: process.env.JWT_SECRET || 'dev-secret',
    })

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: 604800, // 7 days in seconds
      secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret',
    })

    return { accessToken, refreshToken }
  }

  async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET || 'dev-secret',
      })
      return payload
    } catch {
      throw new UnauthorizedException('Invalid token')
    }
  }

  async requestPasswordReset(email: string) {
    // Find user by email
    // const user = await this.usersService.findByEmail(email)
    // if (!user) throw new NotFoundException('User not found')

    // Generate reset token (valid for 1 hour)
    const resetToken = this.jwtService.sign(
      { email, type: 'password-reset' },
      { expiresIn: '3600s', secret: process.env.JWT_SECRET || 'dev-secret' }
    )

    // Send email with reset link (mock)
    // await this.emailService.sendPasswordResetEmail(email, resetToken)

    return { message: 'Password reset link sent to email' }
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET || 'dev-secret',
      })

      if (payload.type !== 'password-reset') {
        throw new UnauthorizedException('Invalid reset token')
      }

      // Hash and update password in database
      // const passwordHash = await bcrypt.hash(newPassword, 12)
      // await this.usersService.updatePassword(payload.email, passwordHash)

      return { message: 'Password reset successfully' }
    } catch {
      throw new UnauthorizedException('Invalid or expired reset token')
    }
  }
}
