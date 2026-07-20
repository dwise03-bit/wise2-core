/**
 * File Storage Routes
 * Handles file uploads, downloads, and client showcase management
 */

import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middlewares/auth';
import { storageService } from '../services/storage.service';

const router = Router();

// All file routes require authentication
router.use(authenticate);

/**
 * POST /api/v1/files/upload-url
 * Get a signed URL for uploading a file to S3
 */
router.post('/upload-url', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { filename, fileType } = req.body;

    if (!filename || !fileType) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Filename and file type are required',
        },
      });
    }

    // Generate S3 key (in production, would use AWS SDK)
    const s3Key = `uploads/${Date.now()}_${filename}`;
    const uploadUrl = storageService.generateSignedUploadUrl(s3Key, fileType);

    res.status(200).json({
      success: true,
      data: {
        uploadUrl,
        s3Key,
        expiresIn: 3600,
      },
    });
  } catch (error) {
    return next(error);
  }
});

/**
 * POST /api/v1/files/confirm
 * Confirm file upload and create metadata record
 */
router.post('/confirm', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const { filename, fileSize, fileType, mimeType, s3Key, checksum, metadata } = req.body;

    if (!filename || !fileSize || !s3Key) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Filename, file size, and S3 key are required',
        },
      });
    }

    const file = await storageService.createFileMetadata(
      userId,
      filename,
      fileSize,
      s3Key,
      {
        fileType,
        mimeType,
        checksum,
        metadata,
      }
    );

    res.status(201).json({
      success: true,
      data: { file },
    });
  } catch (error) {
    return next(error);
  }
});

/**
 * GET /api/v1/files/:fileId
 * Get file metadata
 */
router.get('/:fileId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const { fileId } = req.params;

    const file = await storageService.getFile(fileId);

    if (!file) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'File not found',
        },
      });
    }

    // Verify user owns file or file is public
    if (file.user_id !== userId && !file.is_public) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have access to this file',
        },
      });
    }

    res.status(200).json({
      success: true,
      data: { file },
    });
  } catch (error) {
    return next(error);
  }
});

/**
 * GET /api/v1/files
 * List user files
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;

    const files = await storageService.listUserFiles(userId, limit);

    res.status(200).json({
      success: true,
      data: { files },
    });
  } catch (error) {
    return next(error);
  }
});

/**
 * DELETE /api/v1/files/:fileId
 * Delete a file
 */
router.delete('/:fileId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const { fileId } = req.params;

    const file = await storageService.deleteFile(fileId, userId);

    if (!file) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'File not found',
        },
      });
    }

    res.status(200).json({
      success: true,
      message: 'File deleted successfully',
      data: { file },
    });
  } catch (error) {
    if ((error as Error).message.includes('Unauthorized')) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have access to this file',
        },
      });
    }
    return next(error);
  }
});

/**
 * POST /api/v1/files/showcase
 * Create a showcase asset
 */
router.post('/showcase', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const { assetType, title, fileUrl, description, thumbnailUrl, durationMs, metadata } = req.body;

    if (!assetType || !title || !fileUrl) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Asset type, title, and file URL are required',
        },
      });
    }

    const asset = await storageService.createShowcaseAsset(userId, assetType, title, fileUrl, {
      description,
      thumbnailUrl,
      durationMs,
      metadata,
    });

    res.status(201).json({
      success: true,
      data: { asset },
    });
  } catch (error) {
    return next(error);
  }
});

/**
 * GET /api/v1/files/showcase/:assetId
 * Get showcase asset
 */
router.get('/showcase/:assetId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { assetId } = req.params;

    const asset = await storageService.getShowcaseAsset(assetId);

    if (!asset) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Asset not found',
        },
      });
    }

    res.status(200).json({
      success: true,
      data: { asset },
    });
  } catch (error) {
    return next(error);
  }
});

/**
 * GET /api/v1/files/showcase
 * List user showcase assets
 */
router.get('/showcase', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

    const assets = await storageService.listUserShowcaseAssets(userId, limit);

    res.status(200).json({
      success: true,
      data: { assets },
    });
  } catch (error) {
    return next(error);
  }
});

/**
 * GET /api/v1/files/showcase/featured
 * List featured showcase assets (public)
 */
router.get('/showcase/featured', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

    const assets = await storageService.listFeaturedShowcaseAssets(limit);

    res.status(200).json({
      success: true,
      data: { assets },
    });
  } catch (error) {
    return next(error);
  }
});

/**
 * PUT /api/v1/files/showcase/:assetId
 * Update showcase asset
 */
router.put('/showcase/:assetId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const { assetId } = req.params;
    const updates = req.body;

    const asset = await storageService.updateShowcaseAsset(assetId, userId, updates);

    res.status(200).json({
      success: true,
      data: { asset },
    });
  } catch (error) {
    if ((error as Error).message.includes('Unauthorized')) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have access to this asset',
        },
      });
    }
    return next(error);
  }
});

/**
 * DELETE /api/v1/files/showcase/:assetId
 * Delete showcase asset
 */
router.delete('/showcase/:assetId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const { assetId } = req.params;

    const asset = await storageService.deleteShowcaseAsset(assetId, userId);

    if (!asset) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Asset not found',
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Asset deleted successfully',
      data: { asset },
    });
  } catch (error) {
    if ((error as Error).message.includes('Unauthorized')) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have access to this asset',
        },
      });
    }
    return next(error);
  }
});

export default router;
