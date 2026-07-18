import {
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
  Query,
  Body,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { GoogleDriveService } from '../services/google-drive.service';
import { JwtGuard } from '../guards/jwt.guard';
import { RequirePermission } from '../decorators/require-permission.decorator';
import { PermissionGuard } from '../guards/permission.guard';

@Controller('api/brain/drive')
@UseGuards(JwtGuard, PermissionGuard)
export class GoogleDriveController {
  constructor(private readonly driveService: GoogleDriveService) {}

  /**
   * List files in Google Drive
   */
  @Get('files')
  @RequirePermission('read_documents')
  async listFiles(
    @Request() req,
    @Query('limit') limit?: string,
  ) {
    const userId = req.user.sub;
    const pageSize = limit ? Math.min(parseInt(limit, 10), 100) : 10;

    const files = await this.driveService.listFiles(userId, pageSize);

    return {
      total: files.length,
      files,
    };
  }

  /**
   * Search files by name
   */
  @Get('search')
  @RequirePermission('read_documents')
  async searchFiles(
    @Request() req,
    @Query('q') query?: string,
    @Query('limit') limit?: string,
  ) {
    if (!query) {
      throw new BadRequestException('query parameter required');
    }

    const userId = req.user.sub;
    const pageSize = limit ? Math.min(parseInt(limit, 10), 100) : 10;

    const files = await this.driveService.searchFiles(userId, query, pageSize);

    return {
      query,
      results: files.length,
      files,
    };
  }

  /**
   * Get file details
   */
  @Get('files/:fileId')
  @RequirePermission('read_documents')
  async getFile(
    @Request() req,
    @Query('fileId') fileId?: string,
  ) {
    if (!fileId) {
      throw new BadRequestException('fileId query parameter required');
    }

    const userId = req.user.sub;
    const file = await this.driveService.getFile(userId, fileId);

    return file;
  }

  /**
   * Get file content (for text files)
   */
  @Get('files/:fileId/content')
  @RequirePermission('read_documents')
  async getFileContent(
    @Request() req,
    @Query('fileId') fileId?: string,
  ) {
    if (!fileId) {
      throw new BadRequestException('fileId query parameter required');
    }

    const userId = req.user.sub;
    const content = await this.driveService.getFileContent(userId, fileId);

    return {
      fileId,
      content,
    };
  }

  /**
   * Export Google Doc as PDF or DOCX
   */
  @Get('files/:fileId/export')
  @RequirePermission('read_documents')
  async exportFile(
    @Request() req,
    @Query('fileId') fileId?: string,
    @Query('format') format?: string,
  ) {
    if (!fileId) {
      throw new BadRequestException('fileId query parameter required');
    }

    const userId = req.user.sub;
    const mimeType = format === 'docx'
      ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      : 'application/pdf';

    const buffer = await this.driveService.exportFile(userId, fileId, mimeType);

    return {
      fileId,
      format: format || 'pdf',
      size: buffer.length,
      data: buffer.toString('base64'),
    };
  }

  /**
   * Get files by type (documents, spreadsheets, presentations, folders)
   */
  @Get('files/type/:type')
  @RequirePermission('read_documents')
  async getFilesByType(
    @Request() req,
    @Query('type') type?: string,
    @Query('limit') limit?: string,
  ) {
    const validTypes = ['document', 'spreadsheet', 'presentation', 'folder'];
    if (!type || !validTypes.includes(type)) {
      throw new BadRequestException(
        `type must be one of: ${validTypes.join(', ')}`,
      );
    }

    const userId = req.user.sub;
    const pageSize = limit ? Math.min(parseInt(limit, 10), 100) : 10;

    const files = await this.driveService.getFilesByType(
      userId,
      type as any,
      pageSize,
    );

    return {
      type,
      total: files.length,
      files,
    };
  }

  /**
   * Get recently modified files
   */
  @Get('files/recent')
  @RequirePermission('read_documents')
  async getRecentFiles(
    @Request() req,
    @Query('limit') limit?: string,
  ) {
    const userId = req.user.sub;
    const pageSize = limit ? Math.min(parseInt(limit, 10), 100) : 10;

    const files = await this.driveService.getRecentFiles(userId, pageSize);

    return {
      total: files.length,
      files,
    };
  }

  /**
   * Get files in a specific folder
   */
  @Get('folders/:folderId/files')
  @RequirePermission('read_documents')
  async getFilesInFolder(
    @Request() req,
    @Query('folderId') folderId?: string,
    @Query('limit') limit?: string,
  ) {
    if (!folderId) {
      throw new BadRequestException('folderId query parameter required');
    }

    const userId = req.user.sub;
    const pageSize = limit ? Math.min(parseInt(limit, 10), 100) : 10;

    const files = await this.driveService.getFilesInFolder(userId, folderId, pageSize);

    return {
      folderId,
      total: files.length,
      files,
    };
  }

  /**
   * Create a folder
   */
  @Post('folders')
  @RequirePermission('write_documents')
  @HttpCode(HttpStatus.CREATED)
  async createFolder(
    @Request() req,
    @Body() body: { name: string; parentId?: string },
  ) {
    if (!body.name) {
      throw new BadRequestException('name is required');
    }

    const userId = req.user.sub;
    const folder = await this.driveService.createFolder(
      userId,
      body.name,
      body.parentId,
    );

    return {
      success: true,
      folder,
    };
  }

  /**
   * Get storage quota
   */
  @Get('storage')
  @RequirePermission('read_documents')
  async getStorageQuota(@Request() req) {
    const userId = req.user.sub;
    const quota = await this.driveService.getStorageQuota(userId);

    return quota;
  }

  /**
   * Sync Drive files (for Knowledge Graph indexing)
   */
  @Post('sync')
  @RequirePermission('write_documents')
  @HttpCode(HttpStatus.OK)
  async syncDriveFiles(
    @Request() req,
    @Query('limit') limit?: string,
  ) {
    const userId = req.user.sub;
    const pageSize = limit ? Math.min(parseInt(limit, 10), 500) : 100;

    const result = await this.driveService.syncDriveFiles(userId, pageSize);

    return {
      success: true,
      synced: result.synced,
      files: result.files,
    };
  }
}
