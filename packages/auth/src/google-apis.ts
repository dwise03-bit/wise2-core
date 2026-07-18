import { google } from 'googleapis';

/**
 * Create an authenticated Google Drive client
 */
export function createDriveClient(accessToken: string) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  );

  oauth2Client.setCredentials({ access_token: accessToken });

  return google.drive({ version: 'v3', auth: oauth2Client });
}

/**
 * Create an authenticated Google Sheets client
 */
export function createSheetsClient(accessToken: string) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  );

  oauth2Client.setCredentials({ access_token: accessToken });

  return google.sheets({ version: 'v4', auth: oauth2Client });
}

/**
 * Create an authenticated Google Analytics client
 */
export function createAnalyticsClient(accessToken: string) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  );

  oauth2Client.setCredentials({ access_token: accessToken });

  return google.analytics({ version: 'v3', auth: oauth2Client });
}

/**
 * Drive API utilities
 */
export const DriveAPI = {
  /**
   * List files from user's Google Drive
   */
  async listFiles(accessToken: string, options?: any) {
    const drive = createDriveClient(accessToken);

    const result = await drive.files.list({
      spaces: 'drive',
      fields: 'files(id, name, mimeType, webViewLink, createdTime)',
      pageSize: 10,
      ...options,
    });

    return result.data.files || [];
  },

  /**
   * Upload a file to Google Drive
   */
  async uploadFile(
    accessToken: string,
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
  ) {
    const drive = createDriveClient(accessToken);

    const result = await drive.files.create({
      requestBody: {
        name: fileName,
        mimeType,
      },
      media: {
        mimeType,
        body: fileBuffer,
      },
      fields: 'id, webViewLink',
    });

    return result.data;
  },

  /**
   * Delete a file from Google Drive
   */
  async deleteFile(accessToken: string, fileId: string) {
    const drive = createDriveClient(accessToken);
    await drive.files.delete({ fileId });
  },

  /**
   * Get file metadata
   */
  async getFileMetadata(accessToken: string, fileId: string) {
    const drive = createDriveClient(accessToken);
    const result = await drive.files.get({
      fileId,
      fields: '*',
    });
    return result.data;
  },
};

/**
 * Google Sheets API utilities
 */
export const SheetsAPI = {
  /**
   * Read data from a Google Sheet
   */
  async readSheet(accessToken: string, spreadsheetId: string, range: string) {
    const sheets = createSheetsClient(accessToken);

    const result = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    return result.data.values || [];
  },

  /**
   * Write data to a Google Sheet
   */
  async writeSheet(
    accessToken: string,
    spreadsheetId: string,
    range: string,
    values: any[][],
  ) {
    const sheets = createSheetsClient(accessToken);

    const result = await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: 'RAW',
      requestBody: {
        values,
      },
    });

    return result.data;
  },

  /**
   * Append data to a Google Sheet
   */
  async appendSheet(
    accessToken: string,
    spreadsheetId: string,
    range: string,
    values: any[][],
  ) {
    const sheets = createSheetsClient(accessToken);

    const result = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'RAW',
      requestBody: {
        values,
      },
    });

    return result.data;
  },

  /**
   * Clear data from a Google Sheet
   */
  async clearSheet(accessToken: string, spreadsheetId: string, range: string) {
    const sheets = createSheetsClient(accessToken);

    const result = await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range,
    });

    return result.data;
  },
};

/**
 * Google Analytics API utilities
 */
export const AnalyticsAPI = {
  /**
   * Get analytics data
   */
  async getAnalytics(
    accessToken: string,
    viewId: string,
    startDate: string,
    endDate: string,
    metrics: string[],
  ) {
    const analytics = createAnalyticsClient(accessToken);

    const result = await analytics.data.ga.get({
      ids: `ga:${viewId}`,
      'start-date': startDate,
      'end-date': endDate,
      metrics: metrics.join(','),
    });

    return result.data;
  },

  /**
   * Get page views
   */
  async getPageViews(
    accessToken: string,
    viewId: string,
    startDate: string,
    endDate: string,
  ) {
    return this.getAnalytics(
      accessToken,
      viewId,
      startDate,
      endDate,
      ['ga:pageviews', 'ga:sessions', 'ga:users'],
    );
  },
};
