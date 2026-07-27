import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Res,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { GalleryService, UploadedFileData } from './gallery.service';

@Controller('v1/gallery')
export class GalleryController {
  constructor(private readonly galleryService: GalleryService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 50 * 1024 * 1024 },
    }),
  )
  upload(
    @UploadedFile() file: UploadedFileData,
    @Body('userId') userId: string,
    @Body('sourceModule') sourceModule?: string,
    @Body('sourceId') sourceId?: string,
  ) {
    if (!file) throw new BadRequestException('No file provided');
    if (!userId) throw new BadRequestException('userId is required');
    return this.galleryService.upload(file, userId, sourceModule, sourceId);
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
  remove(@Param('id') id: string, @Body('userId') userId: string) {
    if (!userId) throw new BadRequestException('userId is required');
    return this.galleryService.remove(id, userId);
  }
}
