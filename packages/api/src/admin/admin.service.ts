import { Injectable } from '@nestjs/common';

const mockProjects: any[] = [];
const mockUsers: any[] = [];

@Injectable()
export class AdminService {
  async getProjectsForReview() {
    return mockProjects.filter(p => p.status === 'HUMAN_REVIEW').sort((a, b) => b.createdAt - a.createdAt);
  }

  async approveProject(projectId: string) {
    const project = mockProjects.find(p => p.id === projectId);
    if (project) project.status = 'APPROVED';
    return project;
  }

  async rejectProject(projectId: string, reason?: string) {
    const project = mockProjects.find(p => p.id === projectId);
    if (project) project.status = 'REJECTED';
    return project;
  }

  async getStats() {
    return {
      total: mockProjects.length,
      pending: mockProjects.filter(p => p.status === 'HUMAN_REVIEW').length,
      approved: mockProjects.filter(p => p.status === 'APPROVED').length,
      users: mockUsers.length,
    };
  }
}
