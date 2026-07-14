import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() dto: { email: string; password: string; name?: string }) {
    return await this.authService.signup(dto.email, dto.password, dto.name);
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() dto: { email: string; password: string }) {
    return await this.authService.login(dto.email, dto.password);
  }

  @Post('logout')
  @HttpCode(200)
  async logout() {
    return { message: 'Logged out successfully' };
  }
}
