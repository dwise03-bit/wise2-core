import {
  Body,
  Controller,
  Get,
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

interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
}

@Controller('v1/hermes')
@UseGuards(JwtAuthGuard)
export class HermesController {
  constructor(private readonly hermes: HermesService) {}

  @Get('brief/daily')
  getDailyBrief(@CurrentUser() user: AuthenticatedUser) {
    return this.hermes.getDailyBrief(user.id);
  }

  @Post('chat')
  chat(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: HermesChatDto,
  ) {
    return this.hermes.chat(user.id, dto);
  }

  @Post('actions')
  createAction(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateHermesActionDto,
  ) {
    return this.hermes.createAction(user.id, dto);
  }

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

  @Get('actions/:id')
  getAction(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.hermes.getAction(user.id, id);
  }

  @Post('actions/:id/approve')
  approveAction(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: DecideHermesActionDto,
  ) {
    return this.hermes.approveAction(user.id, id, dto);
  }

  @Post('actions/:id/reject')
  rejectAction(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: DecideHermesActionDto,
  ) {
    return this.hermes.rejectAction(user.id, id, dto);
  }
}
