import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';

// Mock project storage (will be replaced with Prisma after launch)
const mockProjects: any[] = [];

@Injectable()
export class ProjectsService {
  async create(userId: string, data: { title: string; description: string; budget?: number; timeline?: string }) {
    const project = {
      id: Math.random().toString(36).substr(2, 9),
      userId,
      ...data,
      status: 'IDEA',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockProjects.push(project);
    return project;
  }

  async findAll(userId: string) {
    return mockProjects.filter(p => p.userId === userId).sort((a, b) => b.createdAt - a.createdAt);
  }

  async findOne(projectId: string, userId: string) {
    const project = mockProjects.find(p => p.id === projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    if (project.userId !== userId) {
      throw new ForbiddenException('Cannot access this project');
    }
    return project;
  }

  async update(projectId: string, userId: string, data: any) {
    const project = mockProjects.find(p => p.id === projectId);
    if (!project || project.userId !== userId) {
      throw new ForbiddenException('Cannot update this project');
    }
    Object.assign(project, data, { updatedAt: new Date() });
    return project;
  }

  async updateStatus(projectId: string, status: string) {
    const project = mockProjects.find(p => p.id === projectId);
    if (!project) throw new NotFoundException('Project not found');
    project.status = status;
    project.updatedAt = new Date();
    return project;
  }

  async delete(projectId: string, userId: string) {
    const idx = mockProjects.findIndex(p => p.id === projectId && p.userId === userId);
    if (idx === -1) throw new ForbiddenException('Cannot delete this project');
    return mockProjects.splice(idx, 1)[0];
  }
}
