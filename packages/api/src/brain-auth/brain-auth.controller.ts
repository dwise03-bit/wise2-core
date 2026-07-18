import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  UseGuards,
  Request,
  Get,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { BrainAuthService } from './brain-auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { JwtGuard } from './guards/jwt.guard';

@Controller('api/brain/auth')
export class BrainAuthController {
  constructor(
    private readonly authService: BrainAuthService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() refreshDto: RefreshDto) {
    try {
      this.jwtService.verify(refreshDto.refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
    return this.authService.refresh(refreshDto.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtGuard)
  async logout(@Body() refreshDto: RefreshDto) {
    await this.authService.logout(refreshDto.refreshToken);
    return { message: 'Logged out successfully' };
  }

  @Get('me')
  @UseGuards(JwtGuard)
  async getMe(@Request() req) {
    const user = await this.authService.getUserById(req.user.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const permissions = await this.authService.getUserPermissions(req.user.sub);
    return {
      ...user.toObject(),
      permissions,
      passwordHash: undefined,
    };
  }
}
