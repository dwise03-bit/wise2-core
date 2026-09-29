import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  UseGuards,
  Request,
  Query,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ObsidianSyncService } from '../services/obsidian-sync.service';
import { JwtGuard } from '../guards/jwt.guard';
import { RequirePermission } from '../decorators/require-permission.decorator';
import { PermissionGuard } from '../guards/permission.guard';

@Controller('api/brain/knowledge')
@UseGuards(JwtGuard, PermissionGuard)
export class KnowledgeController {
  constructor(private readonly syncService: ObsidianSyncService) {}

  /**
   * Register Obsidian vault
   */
  @Post('vaults')
  @RequirePermission('write_documents')
  @HttpCode(HttpStatus.CREATED)
  async registerVault(
    @Request() req,
    @Body()
    body: {
      name: string;
      description?: string;
      syncDirection?: string;
      syncInterval?: number;
      config?: Record<string, any>;
    },
  ) {
    const workspaceId = req.user.workspaceId;
    const userId = req.user.sub;

    if (!body.name) {
      throw new BadRequestException('name is required');
    }

    const vault = await this.syncService.registerVault(workspaceId, userId, body);

    return {
      success: true,
      vault,
    };
  }

  /**
   * List vaults
   */
  @Get('vaults')
  @RequirePermission('read_documents')
  async listVaults(@Request() req) {
    const workspaceId = req.user.workspaceId;

    const vaults = await this.syncService.listVaults(workspaceId);

    return {
      total: vaults.length,
      vaults,
    };
  }

  /**
   * Get vault details
   */
  @Get('vaults/:vaultId')
  @RequirePermission('read_documents')
  async getVault(
    @Request() req,
    @Param('vaultId') vaultId: string,
  ) {
    const workspaceId = req.user.workspaceId;
    const vault = await this.syncService.getVault(vaultId, workspaceId);

    if (!vault) {
      throw new BadRequestException('Vault not found');
    }

    return vault;
  }

  /**
   * Sync note to Brain
   */
  @Post('sync/note')
  @RequirePermission('write_documents')
  @HttpCode(HttpStatus.CREATED)
  async syncNote(
    @Request() req,
    @Body()
    body: {
      vaultId: string;
      notePath: string;
      title: string;
      content: string;
      tags?: string[];
    },
  ) {
    const workspaceId = req.user.workspaceId;
    const userId = req.user.sub;

    if (!body.vaultId || !body.notePath || !body.title || !body.content) {
      throw new BadRequestException('vaultId, notePath, title, and content are required');
    }

    const entry = await this.syncService.syncNoteToEntry(
      workspaceId,
      body.vaultId,
      userId,
      {
        notePath: body.notePath,
        title: body.title,
        content: body.content,
        tags: body.tags,
      },
    );

    // Update backlinks
    await this.syncService.updateLinks(entry._id.toString(), workspaceId);

    return {
      success: true,
      entry,
    };
  }

  /**
   * Search knowledge entries
   */
  @Get('search')
  @RequirePermission('read_documents')
  async search(
    @Request() req,
    @Query('q') query?: string,
    @Query('limit') limit?: string,
  ) {
    const workspaceId = req.user.workspaceId;

    if (!query) {
      throw new BadRequestException('q query parameter required');
    }

    const results = await this.syncService.searchEntries(
      workspaceId,
      query,
      limit ? parseInt(limit, 10) : 20,
    );

    return {
      query,
      results: results.length,
      entries: results,
    };
  }

  /**
   * Get entry by slug
   */
  @Get('entries/:slug')
  @RequirePermission('read_documents')
  async getEntryBySlug(
    @Request() req,
    @Param('slug') slug: string,
  ) {
    const workspaceId = req.user.workspaceId;

    const entry = await this.syncService.getEntryBySlug(workspaceId, slug);

    if (!entry) {
      throw new BadRequestException('Entry not found');
    }

    return entry;
  }

  /**
   * Get entry version history
   */
  @Get('entries/:entryId/history')
  @RequirePermission('read_documents')
  async getHistory(
    @Request() req,
    @Param('entryId') entryId: string,
  ) {
    const history = await this.syncService.getEntryHistory(entryId);

    return history;
  }

  /**
   * Revert to previous version
   */
  @Post('entries/:entryId/revert')
  @RequirePermission('write_documents')
  @HttpCode(HttpStatus.OK)
  async revertVersion(
    @Request() req,
    @Param('entryId') entryId: string,
    @Body() body: { targetVersion: number },
  ) {
    if (!body.targetVersion) {
      throw new BadRequestException('targetVersion is required');
    }

    const entry = await this.syncService.revertVersion(entryId, body.targetVersion);

    return {
      success: true,
      entry,
    };
  }

  /**
   * Resolve sync conflict
   */
  @Post('conflicts/resolve')
  @RequirePermission('write_documents')
  @HttpCode(HttpStatus.OK)
  async resolveConflict(
    @Request() req,
    @Body()
    body: {
      entryId: string;
      brainVersion: string;
      obsidianVersion: string;
      conflictResolution?: string;
    },
  ) {
    if (!body.entryId || !body.brainVersion || !body.obsidianVersion) {
      throw new BadRequestException('entryId, brainVersion, and obsidianVersion are required');
    }

    const entry = await this.syncService.resolveConflict(
      body.entryId,
      body.brainVersion,
      body.obsidianVersion,
      body.conflictResolution,
    );

    return {
      success: true,
      entry,
    };
  }

  /**
   * Update vault sync status
   */
  @Put('vaults/:vaultId/status')
  @RequirePermission('write_documents')
  @HttpCode(HttpStatus.OK)
  async updateVaultStatus(
    @Request() req,
    @Param('vaultId') vaultId: string,
    @Body()
    body: {
      status: string;
      lastSyncError?: string;
      totalNotes?: number;
      syncedNotes?: number;
    },
  ) {
    if (!body.status) {
      throw new BadRequestException('status is required');
    }

    const vault = await this.syncService.updateVaultStatus(vaultId, body.status, {
      lastSyncError: body.lastSyncError,
      totalNotes: body.totalNotes,
      syncedNotes: body.syncedNotes,
    });

    return {
      success: true,
      vault,
    };
  }
}
