import { Injectable } from '@nestjs/common';
import { GoogleOAuthService } from './google-oauth.service';

export interface DriveFile {
  id?: string | null;
  name?: string | null;
  mimeType?: string | null;
  parents?: string[] | null;
  webViewLink?: string;
  modifiedTime?: string;
  size?: string;
  ownedByMe?: boolean;
  description?: string | null;
}

@Injectable()
export class GoogleDriveService {
  constructor(private readonly googleOAuthService: GoogleOAuthService) {}

  /**
   * List files in user's Google Drive
   */
  async listFiles(userId: string, pageSize: number = 10): Promise<DriveFile[]> {
    const drive = await this.googleOAuthService.getDriveClient(userId);

    try {
      const response = await drive.files.list({
        spaces: 'drive',
        pageSize,
        fields: 'files(id, name, mimeType, parents, webViewLink, modifiedTime, size, ownedByMe)',
        q: "trashed=false", // Exclude deleted files
      });

      return (response.data.files || []) as DriveFile[];
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to list files: ${message}`);
    }
  }

  /**
   * Search files by name or type
   */
  async searchFiles(
    userId: string,
    query: string,
    pageSize: number = 10,
  ): Promise<DriveFile[]> {
    const drive = await this.googleOAuthService.getDriveClient(userId);

    try {
      const response = await drive.files.list({
        spaces: 'drive',
        pageSize,
        fields: 'files(id, name, mimeType, parents, webViewLink, modifiedTime, size, ownedByMe)',
        q: `name contains '${query}' and trashed=false`,
      });

      return (response.data.files || []) as DriveFile[];
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to search files: ${message}`);
    }
  }

  /**
   * Get file metadata and content
   */
  async getFile(userId: string, fileId: string): Promise<DriveFile> {
    const drive = await this.googleOAuthService.getDriveClient(userId);

    try {
      const response = await drive.files.get({
        fileId,
        fields: 'id, name, mimeType, parents, webViewLink, modifiedTime, size, ownedByMe',
      });

      return response.data as DriveFile;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to get file: ${message}`);
    }
  }

  /**
   * Export Google Docs as PDF/DOCX
   */
  async exportFile(
    userId: string,
    fileId: string,
    mimeType: string = 'application/pdf',
  ): Promise<Buffer> {
    const drive = await this.googleOAuthService.getDriveClient(userId);

    try {
      const response = await drive.files.export(
        {
          fileId,
          mimeType,
        },
        { responseType: 'arraybuffer' },
      );

      return Buffer.from(response.data as ArrayBuffer);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to export file: ${message}`);
    }
  }

  /**
   * Get file content (for text files)
   */
  async getFileContent(userId: string, fileId: string): Promise<string> {
    const drive = await this.googleOAuthService.getDriveClient(userId);

    try {
      const response = await drive.files.get(
        {
          fileId,
          alt: 'media',
        },
        { responseType: 'stream' },
      );

      return new Promise((resolve, reject) => {
        let data = '';
        response.data.on('data', (chunk: Buffer) => {
          data += chunk.toString();
        });
        response.data.on('end', () => resolve(data));
        response.data.on('error', reject);
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to get file content: ${message}`);
    }
  }

  /**
   * Get files by type (documents, spreadsheets, presentations)
   */
  async getFilesByType(
    userId: string,
    type: 'document' | 'spreadsheet' | 'presentation' | 'folder',
    pageSize: number = 10,
  ): Promise<DriveFile[]> {
    const mimeTypes = {
      document: "mimeType = 'application/vnd.google-apps.document'",
      spreadsheet: "mimeType = 'application/vnd.google-apps.spreadsheet'",
      presentation: "mimeType = 'application/vnd.google-apps.presentation'",
      folder: "mimeType = 'application/vnd.google-apps.folder'",
    };

    const drive = await this.googleOAuthService.getDriveClient(userId);

    try {
      const response = await drive.files.list({
        spaces: 'drive',
        pageSize,
        fields: 'files(id, name, mimeType, parents, webViewLink, modifiedTime, size, ownedByMe)',
        q: `${mimeTypes[type]} and trashed=false`,
      });

      return (response.data.files || []) as DriveFile[];
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to get files by type: ${message}`);
    }
  }

  /**
   * Get recently modified files
   */
  async getRecentFiles(userId: string, pageSize: number = 10): Promise<DriveFile[]> {
    const drive = await this.googleOAuthService.getDriveClient(userId);

    try {
      const response = await drive.files.list({
        spaces: 'drive',
        pageSize,
        orderBy: 'modifiedTime desc',
        fields: 'files(id, name, mimeType, parents, webViewLink, modifiedTime, size, ownedByMe)',
        q: 'trashed=false',
      });

      return (response.data.files || []) as DriveFile[];
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to get recent files: ${message}`);
    }
  }

  /**
   * Get files in a specific folder
   */
  async getFilesInFolder(
    userId: string,
    folderId: string,
    pageSize: number = 10,
  ): Promise<DriveFile[]> {
    const drive = await this.googleOAuthService.getDriveClient(userId);

    try {
      const response = await drive.files.list({
        spaces: 'drive',
        pageSize,
        fields: 'files(id, name, mimeType, parents, webViewLink, modifiedTime, size, ownedByMe)',
        q: `'${folderId}' in parents and trashed=false`,
      });

      return (response.data.files || []) as DriveFile[];
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to get files in folder: ${message}`);
    }
  }

  /**
   * Create a folder
   */
  async createFolder(userId: string, folderName: string, parentId?: string) {
    const drive = await this.googleOAuthService.getDriveClient(userId);

    try {
      const response = await drive.files.create({
        requestBody: {
          name: folderName,
          mimeType: 'application/vnd.google-apps.folder',
          parents: parentId ? [parentId] : [],
        },
        fields: 'id, name, mimeType, webViewLink',
      });

      return response.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to create folder: ${message}`);
    }
  }

  /**
   * Get user's storage quota
   */
  async getStorageQuota(userId: string) {
    const drive = await this.googleOAuthService.getDriveClient(userId);

    try {
      const response = await drive.about.get({
        fields: 'storageQuota, user',
      });

      const quota = response.data.storageQuota;
      const user = response.data.user;

      const limit = quota?.limit ? parseInt(quota.limit as string, 10) : 0;
      const usage = quota?.usage ? parseInt(quota.usage as string, 10) : 0;
      const usageInDrive = quota?.usageInDrive ? parseInt(quota.usageInDrive as string, 10) : 0;

      return {
        user: {
          displayName: user?.displayName,
          emailAddress: user?.emailAddress,
        },
        storage: {
          limit,
          usage,
          usageInDrive,
          percentUsed: limit > 0 ? (usage / limit) * 100 : 0,
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to get storage quota: ${message}`);
    }
  }

  /**
   * Sync files from Drive to system (return metadata for indexing)
   */
  async syncDriveFiles(userId: string, limit: number = 100) {
    const drive = await this.googleOAuthService.getDriveClient(userId);

    try {
      const response = await drive.files.list({
        spaces: 'drive',
        pageSize: limit,
        orderBy: 'modifiedTime desc',
        fields: 'files(id, name, mimeType, parents, webViewLink, modifiedTime, size, ownedByMe, description)',
        q: 'trashed=false and (mimeType contains "google-apps" or mimeType = "text/plain" or mimeType = "application/pdf")',
      });

      return {
        synced: response.data.files?.length || 0,
        files: response.data.files || [],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to sync Drive files: ${message}`);
    }
  }
}
