import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaClient } from '@wise2/db';

@Injectable()
export class ProjectsService {
  private prisma = new PrismaClient();

  async create(userId: string, data: { title: string; description: string; budget?: number; timeline?: string }) {
    return this.prisma.project.create({
      data: {
        userId,
        title: data.title,
        description: data.description,
        budget: data.budget,
        timeline: data.timeline,
        status: 'IDEA',
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.project.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(projectId: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { updates: true },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.userId !== userId) {
      throw new ForbiddenException('Cannot access this project');
    }

    return project;
  }

  async update(projectId: string, userId: string, data: any) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project || project.userId !== userId) {
      throw new ForbiddenException('Cannot update this project');
    }

    return this.prisma.project.update({
      where: { id: projectId },
      data,
    });
  }

  async updateStatus(projectId: string, status: string) {
    return this.prisma.project.update({
      where: { id: projectId },
      data: { status: status as any },
    });
  }

  async delete(projectId: string, userId: string) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project || project.userId !== userId) {
      throw new ForbiddenException('Cannot delete this project');
    }

    return this.prisma.project.delete({ where: { id: projectId } });
  }
}
