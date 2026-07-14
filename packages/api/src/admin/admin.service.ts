import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@wise2/db';

@Injectable()
export class AdminService {
  private prisma = new PrismaClient();

  async getProjectsForReview() {
    return this.prisma.project.findMany({
      where: { status: 'HUMAN_REVIEW' },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { email: true, name: true } } },
    });
  }

  async approveProject(projectId: string) {
    return this.prisma.project.update({
      where: { id: projectId },
      data: { status: 'APPROVED' },
    });
  }

  async rejectProject(projectId: string, reason?: string) {
    return this.prisma.project.update({
      where: { id: projectId },
      data: { status: 'REJECTED' },
    });
  }

  async getStats() {
    const total = await this.prisma.project.count();
    const pending = await this.prisma.project.count({ where: { status: 'HUMAN_REVIEW' } });
    const approved = await this.prisma.project.count({ where: { status: 'APPROVED' } });
    const users = await this.prisma.user.count();

    return { total, pending, approved, users };
  }
}
