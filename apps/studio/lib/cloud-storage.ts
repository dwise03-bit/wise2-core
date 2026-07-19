/**
 * Cloud storage integration for projects and recordings
 * Handles Postgres persistence and S3 audio uploads
 */

import { apiClient } from './api-client';

export interface CloudProject {
  id: string;
  userId: string;
  name: string;
  description?: string;
  state: {
    bpm: number;
    masterVolume: number;
    tracks: Array<{
      id: string;
      name: string;
      volume: number;
      pan: number;
      muted: boolean;
      solo: boolean;
      color: string;
    }>;
  };
  recordingUrl?: string;
  createdAt: string;
  updatedAt: string;
  sizeBytes: number;
}

class CloudStorageService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

  /**
   * Create a new project in cloud storage
   */
  async createProject(name: string, description?: string): Promise<CloudProject> {
    const response = await apiClient.post('/projects', {
      name,
      description,
      state: {
        bpm: 120,
        masterVolume: 0.8,
        tracks: [],
      },
    });
    return response.data;
  }

  /**
   * Get all projects for current user
   */
  async listProjects(): Promise<CloudProject[]> {
    const response = await apiClient.get('/projects');
    return response.data;
  }

  /**
   * Get a specific project
   */
  async getProject(projectId: string): Promise<CloudProject> {
    const response = await apiClient.get(`/projects/${projectId}`);
    return response.data;
  }

  /**
   * Update project state
   */
  async updateProject(
    projectId: string,
    updates: Partial<CloudProject>
  ): Promise<CloudProject> {
    const response = await apiClient.put(`/projects/${projectId}`, updates);
    return response.data;
  }

  /**
   * Delete a project
   */
  async deleteProject(projectId: string): Promise<void> {
    await apiClient.delete(`/projects/${projectId}`);
  }

  /**
   * Upload recording to S3
   */
  async uploadRecording(
    projectId: string,
    audioBlob: Blob,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.wav');

    try {
      const response = await fetch(`${this.baseUrl}/projects/${projectId}/recordings`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Recording upload failed:', error);
      throw error;
    }
  }

  /**
   * Download recording from S3
   */
  async downloadRecording(recordingUrl: string): Promise<Blob> {
    const response = await fetch(recordingUrl);
    if (!response.ok) throw new Error('Failed to download recording');
    return response.blob();
  }

  /**
   * Get upload signature for direct S3 upload (optional for advanced use)
   */
  async getUploadSignature(
    projectId: string,
    filename: string
  ): Promise<{ url: string; fields: Record<string, string> }> {
    const response = await apiClient.post(`/projects/${projectId}/upload-signature`, {
      filename,
    });
    return response.data;
  }
}

export const cloudStorage = new CloudStorageService();
