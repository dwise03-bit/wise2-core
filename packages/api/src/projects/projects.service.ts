import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { S3Service } from '../storage/s3.service';

interface MixerState {
  tracks?: any[];
  masterVolume?: number;
  bpm?: number;
  playbackPosition?: number;
  [key: string]: any;
}

interface CreateSoundLabsProjectDto {
  name: string;
  description?: string;
  mixerState?: MixerState;
}

interface UpdateSoundLabsProjectDto {
  name?: string;
  description?: string;
  mixerState?: MixerState;
}

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);
  private prisma: PrismaClient;

  constructor(private readonly s3Service?: S3Service) {
    this.prisma = new PrismaClient();
  }

  // Legacy project methods
  async create(userId: string, data: { title: string; description: string; budget?: number; timeline?: string }) {
    const project = {
      id: Math.random().toString(36).substr(2, 9),
      userId,
      ...data,
      status: 'IDEA',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return project;
  }

  async findAll(userId: string) {
    return [];
  }

  async findOne(projectId: string, userId: string) {
    throw new NotFoundException('Project not found');
  }

  async updateStatus(projectId: string, status: string) {
    throw new NotFoundException('Project not found');
  }

  async delete(projectId: string, userId: string) {
    throw new ForbiddenException('Cannot delete this project');
  }

  // SoundLabs Project Methods
  async createSoundLabsProject(
    userId: string,
    data: CreateSoundLabsProjectDto
  ): Promise<any> {
    try {
      const project = await this.prisma.soundLabsProject.create({
        data: {
          userId,
          name: data.name,
          description: data.description,
          mixerState: data.mixerState || {},
        },
      });

      this.logger.log(`SoundLabs project created: ${project.id}`);
      return project;
    } catch (error) {
      this.logger.error(`Failed to create SoundLabs project: ${error}`);
      throw error;
    }
  }

  async getSoundLabsProject(projectId: string, userId: string): Promise<any> {
    try {
      const project = await this.prisma.soundLabsProject.findUnique({
        where: { id: projectId },
        include: {
          recordings: true,
        },
      });

      if (!project) {
        throw new NotFoundException('Project not found');
      }

      if (project.userId !== userId) {
        throw new ForbiddenException('Cannot access this project');
      }

      return project;
    } catch (error) {
      this.logger.error(`Failed to get SoundLabs project: ${error}`);
      throw error;
    }
  }

  async listSoundLabsProjects(userId: string): Promise<any[]> {
    try {
      const projects = await this.prisma.soundLabsProject.findMany({
        where: { userId },
        include: {
          recordings: {
            select: {
              id: true,
              name: true,
              s3Url: true,
              fileSize: true,
              duration: true,
              uploadStatus: true,
              createdAt: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
      });

      return projects;
    } catch (error) {
      this.logger.error(`Failed to list SoundLabs projects: ${error}`);
      throw error;
    }
  }

  async updateSoundLabsProject(
    projectId: string,
    userId: string,
    data: UpdateSoundLabsProjectDto
  ): Promise<any> {
    try {
      // Verify user owns the project
      const project = await this.prisma.soundLabsProject.findUnique({
        where: { id: projectId },
      });

      if (!project) {
        throw new NotFoundException('Project not found');
      }

      if (project.userId !== userId) {
        throw new ForbiddenException('Cannot update this project');
      }

      // Calculate new project size if mixer state is provided
      let projectSize = project.projectSize;
      if (data.mixerState) {
        projectSize = new Blob([JSON.stringify(data.mixerState)]).size;
      }

      const updated = await this.prisma.soundLabsProject.update({
        where: { id: projectId },
        data: {
          name: data.name || project.name,
          description: data.description ?? project.description,
          mixerState: data.mixerState || project.mixerState,
          projectSize,
        },
        include: {
          recordings: true,
        },
      });

      this.logger.log(`SoundLabs project updated: ${projectId}`);
      return updated;
    } catch (error) {
      this.logger.error(`Failed to update SoundLabs project: ${error}`);
      throw error;
    }
  }

  async deleteSoundLabsProject(projectId: string, userId: string): Promise<void> {
    try {
      const project = await this.prisma.soundLabsProject.findUnique({
        where: { id: projectId },
        include: { recordings: true },
      });

      if (!project) {
        throw new NotFoundException('Project not found');
      }

      if (project.userId !== userId) {
        throw new ForbiddenException('Cannot delete this project');
      }

      // Delete associated S3 files
      if (this.s3Service) {
        for (const recording of project.recordings) {
          try {
            await this.s3Service.deleteFile(recording.s3Key);
          } catch (error) {
            this.logger.warn(`Failed to delete S3 file: ${recording.s3Key}`);
          }
        }
      }

      // Delete project from database
      await this.prisma.soundLabsProject.delete({
        where: { id: projectId },
      });

      this.logger.log(`SoundLabs project deleted: ${projectId}`);
    } catch (error) {
      this.logger.error(`Failed to delete SoundLabs project: ${error}`);
      throw error;
    }
  }

  async createRecording(
    projectId: string,
    userId: string,
    data: { name: string; description?: string; fileBuffer: Buffer; fileSize: number; duration?: number }
  ): Promise<any> {
    try {
      const project = await this.prisma.soundLabsProject.findUnique({
        where: { id: projectId },
      });

      if (!project) {
        throw new NotFoundException('Project not found');
      }

      if (project.userId !== userId) {
        throw new ForbiddenException('Cannot add recording to this project');
      }

      // Upload to S3
      const s3Key = `projects/${userId}/${projectId}/recordings/${Date.now()}-${data.name}.wav`;
      let s3Url = '';

      if (this.s3Service) {
        try {
          const uploadResult = await this.s3Service.uploadFile(s3Key, data.fileBuffer, {
            contentType: 'audio/wav',
            metadata: {
              'project-id': projectId,
              'user-id': userId,
            },
          });
          s3Url = uploadResult.url;
        } catch (error) {
          this.logger.error(`Failed to upload recording to S3: ${error}`);
          throw new BadRequestException('Failed to upload recording to S3');
        }
      }

      // Create recording in database
      const recording = await this.prisma.soundLabsRecording.create({
        data: {
          projectId,
          name: data.name,
          description: data.description,
          s3Url,
          s3Key,
          fileSize: data.fileSize,
          duration: data.duration,
          uploadStatus: 'COMPLETED',
          uploadProgress: 100,
        },
      });

      this.logger.log(`Recording created: ${recording.id}`);
      return recording;
    } catch (error) {
      this.logger.error(`Failed to create recording: ${error}`);
      throw error;
    }
  }

  async listRecordings(projectId: string, userId: string): Promise<any[]> {
    try {
      const project = await this.prisma.soundLabsProject.findUnique({
        where: { id: projectId },
      });

      if (!project) {
        throw new NotFoundException('Project not found');
      }

      if (project.userId !== userId) {
        throw new ForbiddenException('Cannot access recordings for this project');
      }

      const recordings = await this.prisma.soundLabsRecording.findMany({
        where: { projectId },
        orderBy: { createdAt: 'desc' },
      });

      return recordings;
    } catch (error) {
      this.logger.error(`Failed to list recordings: ${error}`);
      throw error;
    }
  }

  async deleteRecording(projectId: string, recordingId: string, userId: string): Promise<void> {
    try {
      const project = await this.prisma.soundLabsProject.findUnique({
        where: { id: projectId },
      });

      if (!project || project.userId !== userId) {
        throw new ForbiddenException('Cannot delete this recording');
      }

      const recording = await this.prisma.soundLabsRecording.findUnique({
        where: { id: recordingId },
      });

      if (!recording || recording.projectId !== projectId) {
        throw new NotFoundException('Recording not found');
      }

      // Delete from S3
      if (this.s3Service) {
        try {
          await this.s3Service.deleteFile(recording.s3Key);
        } catch (error) {
          this.logger.warn(`Failed to delete S3 file: ${recording.s3Key}`);
        }
      }

      // Delete from database
      await this.prisma.soundLabsRecording.delete({
        where: { id: recordingId },
      });

      this.logger.log(`Recording deleted: ${recordingId}`);
    } catch (error) {
      this.logger.error(`Failed to delete recording: ${error}`);
      throw error;
    }
  }
}
