import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt.guard';
import { BusinessOsService } from './business-os.service';

class SubmitCommandDto {
  text!: string;
}

@Controller('v1/business-os')
@UseGuards(JwtAuthGuard)
export class BusinessOsController {
  constructor(private readonly businessOsService: BusinessOsService) {}

  @Get('dashboard')
  getDashboard() {
    return this.businessOsService.getDashboard();
  }

  @Post('command')
  submitCommand(@Body() body: SubmitCommandDto) {
    return this.businessOsService.submitCommand(body.text ?? '');
  }
}
