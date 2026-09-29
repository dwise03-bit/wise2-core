/**
 * Frontend API client for cloud project persistence
 * Handles all communication with the backend for SoundLabs projects
 */

interface ApiError {
  message: string;
  statusCode: number;
}

interface ProjectResponse {
  id: string;
  name: string;
  description?: string;
  mixerState: any;
  recordings: RecordingResponse[];
  projectSize: number;
  createdAt: string;
  updatedAt: string;
}

interface RecordingResponse {
  id: string;
  name: string;
  description?: string;
  s3Url: string;
  fileSize: number;
  duration?: number;
  uploadStatus: 'PENDING' | 'UPLOADING' | 'COMPLETED' | 'FAILED';
  uploadProgress: number;
  createdAt: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw {
      message: error.message || `HTTP ${response.status}`,
      statusCode: response.status,
    } as ApiError;
  }
  return response.json();
}

export class ProjectAPI {
  /**
   * Create a new SoundLabs project
   */
  static async createProject(
    name: string,
    description?: string,
    mixerState?: any
  ): Promise<ProjectResponse> {
    const response = await fetch(`${API_BASE_URL}/v1/projects/soundlabs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.getAuthToken()}`,
      },
      body: JSON.stringify({
        name,
        description,
        mixerState,
      }),
    });

    return handleResponse<ProjectResponse>(response);
  }

  /**
   * Get a specific project
   */
  static async getProject(projectId: string): Promise<ProjectResponse> {
    const response = await fetch(`${API_BASE_URL}/v1/projects/soundlabs/${projectId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.getAuthToken()}`,
      },
    });

    return handleResponse<ProjectResponse>(response);
  }

  /**
   * List all projects for the current user
   */
  static async listProjects(): Promise<ProjectResponse[]> {
    const response = await fetch(`${API_BASE_URL}/v1/projects/soundlabs`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.getAuthToken()}`,
      },
    });

    return handleResponse<ProjectResponse[]>(response);
  }

  /**
   * Update a project (e.g., save mixer state)
   */
  static async updateProject(
    projectId: string,
    data: {
      name?: string;
      description?: string;
      mixerState?: any;
    }
  ): Promise<ProjectResponse> {
    const response = await fetch(`${API_BASE_URL}/v1/projects/soundlabs/${projectId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.getAuthToken()}`,
      },
      body: JSON.stringify(data),
    });

    return handleResponse<ProjectResponse>(response);
  }

  /**
   * Delete a project
   */
  static async deleteProject(projectId: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/v1/projects/soundlabs/${projectId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${this.getAuthToken()}`,
      },
    });

    return handleResponse<{ success: boolean; message: string }>(response);
  }

  /**
   * Upload an audio recording to a project
   */
  static async uploadRecording(
    projectId: string,
    fileBuffer: ArrayBuffer,
    name: string,
    description?: string,
    onProgress?: (progress: number) => void
  ): Promise<RecordingResponse> {
    const formData = new FormData();
    formData.append('file', new Blob([fileBuffer], { type: 'audio/wav' }), `${name}.wav`);
    formData.append('name', name);
    if (description) {
      formData.append('description', description);
    }

    const xhr = new XMLHttpRequest();

    return new Promise((resolve, reject) => {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          const progress = Math.round((e.loaded / e.total) * 100);
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            reject(new Error('Failed to parse response'));
          }
        } else {
          try {
            const error = JSON.parse(xhr.responseText);
            reject({
              message: error.message || `HTTP ${xhr.status}`,
              statusCode: xhr.status,
            } as ApiError);
          } catch {
            reject({
              message: `HTTP ${xhr.status}`,
              statusCode: xhr.status,
            } as ApiError);
          }
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload cancelled'));
      });

      xhr.open('POST', `${API_BASE_URL}/v1/projects/soundlabs/${projectId}/recordings`);
      xhr.setRequestHeader('Authorization', `Bearer ${this.getAuthToken()}`);
      xhr.send(formData);
    });
  }

  /**
   * List recordings for a project
   */
  static async listRecordings(projectId: string): Promise<RecordingResponse[]> {
    const response = await fetch(
      `${API_BASE_URL}/v1/projects/soundlabs/${projectId}/recordings`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.getAuthToken()}`,
        },
      }
    );

    return handleResponse<RecordingResponse[]>(response);
  }

  /**
   * Delete a recording
   */
  static async deleteRecording(
    projectId: string,
    recordingId: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await fetch(
      `${API_BASE_URL}/v1/projects/soundlabs/${projectId}/recordings/${recordingId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${this.getAuthToken()}`,
        },
      }
    );

    return handleResponse<{ success: boolean; message: string }>(response);
  }

  /**
   * Get auth token from localStorage or session
   */
  private static getAuthToken(): string {
    if (typeof window === 'undefined') return '';

    // Try to get from localStorage first
    const token = localStorage.getItem('authToken');
    if (token) return token;

    // Fallback to empty string (API should handle unauthenticated requests)
    return '';
  }
}
