import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { HermesActionStatus } from './hermes-action.entity';
import {
  CreateHermesActionDto,
  DecideHermesActionDto,
  HermesChatDto,
} from './hermes.dto';
import { HermesService } from './hermes.service';
import { HermesGenerationResolver } from './hermes-generation.config';

interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
}

@Controller('v1/hermes')
export class HermesController {
  constructor(private readonly hermes: HermesService) {}

  @Get('health')
  @HttpCode(200)
  async getHealth() {
    const config = HermesGenerationResolver.resolve('fast');
    const configuredEndpoint =
      process.env.HERMES_ENDPOINT ||
      process.env.OLLAMA_BASE_URL ||
      'http://127.0.0.1:11434';

    let ollamaStatus = 'unknown';
    let ollamaError: string | undefined;

    try {
      const tagsUrl = configuredEndpoint.includes('/v1/chat/completions')
        ? configuredEndpoint.replace('/v1/chat/completions', '/v1/models')
        : `${configuredEndpoint.replace(/\/+$/, '')}/api/tags`;

      const response = await fetch(tagsUrl, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        ollamaStatus = 'online';
      } else {
        ollamaStatus = 'error';
        ollamaError = `HTTP ${response.status}`;
      }
    } catch (error) {
      ollamaStatus = 'offline';
      ollamaError = error instanceof Error ? error.message : 'unknown error';
    }

    return {
      status: ollamaStatus === 'online' ? 'online' : 'degraded',
      provider: config.provider,
      model: config.model,
      ollama: {
        status: ollamaStatus,
        error: ollamaError,
        endpoint: configuredEndpoint,
      },
      profile: 'fast',
      context: config.fast.numCtx,
      predictTokens: config.fast.numPredict,
      think: config.fast.think,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('brief/daily')
  getDailyBrief(@CurrentUser() user: AuthenticatedUser) {
    return this.hermes.getDailyBrief(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('chat')
  chat(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: HermesChatDto,
  ) {
    return this.hermes.chat(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('actions')
  createAction(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateHermesActionDto,
  ) {
    return this.hermes.createAction(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('actions')
  listActions(
    @CurrentUser() user: AuthenticatedUser,
    @Query('status') status?: HermesActionStatus,
    @Query('limit') limit?: string,
  ) {
    return this.hermes.listActions(
      user.id,
      status,
      limit ? Number.parseInt(limit, 10) : undefined,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('actions/:id')
  getAction(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.hermes.getAction(user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('actions/:id/approve')
  approveAction(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: DecideHermesActionDto,
  ) {
    return this.hermes.approveAction(user.id, id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('actions/:id/reject')
  rejectAction(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: DecideHermesActionDto,
  ) {
    return this.hermes.rejectAction(user.id, id, dto);
  }
}
