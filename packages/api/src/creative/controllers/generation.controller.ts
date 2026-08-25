import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { CreativeGenerationService } from '../services/generation.service';
import { CreateGenerationDto, GenerationStatusDto, CreditWalletStatusDto } from '../dto/create-generation.dto';

@Controller('api/v1/creative')
export class CreativeGenerationController {
  constructor(private readonly generationService: CreativeGenerationService) {}

  @Post('generate')
  @HttpCode(HttpStatus.ACCEPTED)
  async createGeneration(
    @Body(ValidationPipe) dto: CreateGenerationDto,
    @Req() req: any
  ): Promise<GenerationStatusDto> {
    const userId = req.user?.id || req.user?.sub;
    return this.generationService.createGeneration(dto, userId);
  }

  @Get('generations/:id')
  async getGenerationStatus(
    @Param('id') jobId: string,
    @Req() req: any
  ): Promise<GenerationStatusDto> {
    const userId = req.user?.id || req.user?.sub;
    return this.generationService.getGenerationStatus(jobId, userId);
  }

  @Get('credits')
  async getCreditStatus(@Req() req: any): Promise<CreditWalletStatusDto> {
    const userId = req.user?.id || req.user?.sub;
    return this.generationService.getCreditStatus(userId);
  }

  @Get('providers/status')
  async getProvidersStatus(): Promise<any> {
    return this.generationService.getProvidersStatus();
  }

  @Get('quality/threshold')
  async getQualityThreshold(): Promise<{ threshold: number }> {
    return { threshold: this.generationService.getQualityThreshold() };
  }
}
