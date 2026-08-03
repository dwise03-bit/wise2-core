import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Body,
  UnauthorizedException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { JwtAuthGuard } from '../../auth/jwt.guard';
import { GalleryService, UploadedFileData } from './gallery.service';

@Controller('v1/gallery')
export class GalleryController {
  constructor(private readonly galleryService: GalleryService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 500 * 1024 * 1024 },
    }),
  )
  upload(
    @UploadedFile() file: UploadedFileData,
    @Req() req: Request & { user: any },
    @Body('sourceModule') sourceModule?: string,
    @Body('sourceId') sourceId?: string,
    @Body('metadata') metadataStr?: string,
  ) {
    if (!file) throw new BadRequestException('No file provided');
    if (!req.user || !req.user.id) {
      throw new UnauthorizedException('User not authenticated');
    }

    let metadata: Record<string, unknown> | undefined;
    if (metadataStr) {
      try {
        metadata = JSON.parse(metadataStr);
      } catch {
        throw new BadRequestException('Invalid metadata JSON');
      }
    }

    return this.galleryService.upload(
      file,
      req.user.id,
      sourceModule,
      sourceId,
      metadata,
    );
  }

  @Get()
  findAll(
    @Query('userId') userId?: string,
    @Query('assetType') assetType?: string,
    @Query('sourceModule') sourceModule?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.galleryService.findAll({
      userId,
      assetType,
      sourceModule,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.galleryService.findOne(id);
  }

  @Get('file/:filename')
  async serveFile(@Param('filename') filename: string, @Res() res: Response) {
    const { buffer, mimeType } = await this.galleryService.getFileBuffer(filename);
    res.set('Content-Type', mimeType);
    res.set('Cache-Control', 'public, max-age=86400');
    res.send(buffer);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Req() req: Request & { user: any }) {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedException('User not authenticated');
    }
    return this.galleryService.remove(id, req.user.id);
  }
}
