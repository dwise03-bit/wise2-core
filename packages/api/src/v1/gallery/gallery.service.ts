import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { randomBytes } from 'crypto';

type AssetType = 'IMAGE' | 'AUDIO' | 'VIDEO' | 'DOCUMENT';
const ASSET_TYPES: AssetType[] = ['IMAGE', 'AUDIO', 'VIDEO', 'DOCUMENT'];

export interface UploadedFileData {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'gallery');

const MIME_TO_ASSET_TYPE: Partial<Record<string, AssetType>> = {
  'image/jpeg': 'IMAGE',
  'image/png': 'IMAGE',
  'image/gif': 'IMAGE',
  'image/webp': 'IMAGE',
  'image/svg+xml': 'IMAGE',
  'audio/mpeg': 'AUDIO',
  'audio/wav': 'AUDIO',
  'audio/ogg': 'AUDIO',
  'audio/webm': 'AUDIO',
  'audio/flac': 'AUDIO',
  'video/mp4': 'VIDEO',
  'video/webm': 'VIDEO',
  'video/quicktime': 'VIDEO',
  'application/pdf': 'DOCUMENT',
  'application/json': 'DOCUMENT',
  'text/plain': 'DOCUMENT',
};

@Injectable()
export class GalleryService {
  private readonly logger = new Logger(GalleryService.name);

  constructor(private prisma: PrismaService) {
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
      this.logger.log(`Created upload directory: ${UPLOAD_DIR}`);
    }
  }

  async upload(
    file: UploadedFileData,
    userId: string,
    sourceModule?: string,
    sourceId?: string,
    metadata?: Record<string, unknown>,
  ) {
    const ext = path.extname(file.originalname);
    const uniqueName = `${randomBytes(16).toString('hex')}${ext}`;
    const storagePath = path.join(UPLOAD_DIR, uniqueName);

    fs.writeFileSync(storagePath, file.buffer);

    const assetType = MIME_TO_ASSET_TYPE[file.mimetype] || 'DOCUMENT';

    return this.prisma.galleryAsset.create({
      data: {
        filename: uniqueName,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        assetType,
        storagePath,
        url: `/api/v1/gallery/file/${uniqueName}`,
        userId,
        sourceModule,
        sourceId,
        metadata: metadata ? (metadata as Prisma.InputJsonValue) : undefined,
      },
    });
  }

  async findAll(filters?: {
    userId?: string;
    assetType?: string;
    sourceModule?: string;
    limit?: number;
    offset?: number;
  }) {
    const { userId, assetType, sourceModule, limit = 50, offset = 0 } = filters || {};
    const where: Record<string, unknown> = {};

    if (userId) where.userId = userId;
    if (assetType && ASSET_TYPES.includes(assetType as AssetType)) {
      where.assetType = assetType;
    }
    if (sourceModule) where.sourceModule = sourceModule;

    const [assets, total] = await Promise.all([
      this.prisma.galleryAsset.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.galleryAsset.count({ where }),
    ]);

    return { assets, total, limit, offset };
  }

  async findOne(id: string) {
    const asset = await this.prisma.galleryAsset.findUnique({ where: { id } });
    if (!asset) throw new NotFoundException(`Asset ${id} not found`);
    return asset;
  }

  async getFileBuffer(filename: string): Promise<{ buffer: Buffer; mimeType: string }> {
    const asset = await this.prisma.galleryAsset.findFirst({
      where: { filename },
    });
    if (!asset) throw new NotFoundException(`File ${filename} not found`);

    const filePath = asset.storagePath;
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException(`File not found on disk: ${filename}`);
    }

    return {
      buffer: fs.readFileSync(filePath),
      mimeType: asset.mimeType,
    };
  }

  async remove(id: string, userId: string) {
    const asset = await this.prisma.galleryAsset.findUnique({ where: { id } });
    if (!asset) throw new NotFoundException(`Asset ${id} not found`);
    if (asset.userId !== userId) {
      throw new NotFoundException(`Asset ${id} not found`);
    }

    if (fs.existsSync(asset.storagePath)) {
      fs.unlinkSync(asset.storagePath);
    }

    return this.prisma.galleryAsset.delete({ where: { id } });
  }
}
