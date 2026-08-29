import { Body, Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common';
import { IsString, MinLength } from 'class-validator';
import { JwtAuthGuard } from '../../auth/jwt.guard';
import { BusinessOsService } from './business-os.service';

class SubmitCommandDto {
  @IsString()
  @MinLength(1)
  text!: string;
}

@Controller('v1/business-os')
@UseGuards(JwtAuthGuard)
export class BusinessOsController {
  constructor(private readonly businessOsService: BusinessOsService) {}

  @Get('dashboard')
  @HttpCode(200)
  getDashboard() {
    return this.businessOsService.getDashboard();
  }

  @Post('command')
  @HttpCode(200)
  submitCommand(@Body() body: SubmitCommandDto) {
    return this.businessOsService.submitCommand(body.text ?? '');
  }
}
