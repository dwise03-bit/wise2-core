'use client';

import { useState } from 'react';

interface Task {
  id: string;
  title: string;
  status: 'open' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
}

interface Project {
  id: string;
  name: string;
  customer: string;
  status: 'active' | 'on-hold' | 'completed';
  progress: number;
  budget: number;
  spent: number;
  startDate: string;
  endDate: string;
  tasks: Task[];
}

const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Website Redesign',
    customer: 'Acme HVAC',
    status: 'active',
    progress: 75,
    budget: 50000,
    spent: 38000,
    startDate: '2026-06-01',
    endDate: '2026-08-15',
    tasks: [
      { id: 't1', title: 'Design mockups', status: 'done', priority: 'high', dueDate: '2026-07-01' },
      { id: 't2', title: 'Frontend development', status: 'in-progress', priority: 'high', dueDate: '2026-07-20' },
      { id: 't3', title: 'Backend integration', status: 'open', priority: 'high', dueDate: '2026-08-05' },
      { id: 't4', title: 'Testing & QA', status: 'open', priority: 'medium', dueDate: '2026-08-10' },
    ],
  },
  {
    id: '2',
    name: 'CRM Implementation',
    customer: 'Sterling Law',
    status: 'active',
    progress: 45,
    budget: 85000,
    spent: 38000,
    startDate: '2026-06-15',
    endDate: '2026-10-01',
    tasks: [
      { id: 't5', title: 'Requirements gathering', status: 'done', priority: 'high', dueDate: '2026-07-01' },
      { id: 't6', title: 'System design', status: 'in-progress', priority: 'high', dueDate: '2026-07-25' },
      { id: 't7', title: 'Development', status: 'open', priority: 'high', dueDate: '2026-09-01' },
    ],
  },
  {
    id: '3',
    name: 'Mobile App Development',
    customer: 'Golden Fork',
    status: 'active',
    progress: 30,
    budget: 120000,
    spent: 36000,
    startDate: '2026-07-01',
    endDate: '2026-11-30',
    tasks: [
      { id: 't8', title: 'App architecture', status: 'in-progress', priority: 'high', dueDate: '2026-07-25' },
      { id: 't9', title: 'UI/UX design', status: 'in-progress', priority: 'high', dueDate: '2026-08-10' },
      { id: 't10', title: 'Native development', status: 'open', priority: 'high', dueDate: '2026-10-01' },
    ],
  },
];

const statusColors = {
  open: 'bg-blue-500/20 text-blue-400',
  'in-progress': 'bg-purple-500/20 text-purple-400',
  review: 'bg-yellow-500/20 text-yellow-400',
  done: 'bg-green-500/20 text-green-400',
};

const priorityColors = {
  low: 'text-gray-400',
  medium: 'text-yellow-400',
  high: 'text-red-400',
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState(mockProjects);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
  const totalSpent = projects.reduce((sum, p) => sum + p.spent, 0);
  const avgProgress = Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length);

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-[#2cd588]">🎯 Projects</h1>
          <p className="text-gray-400 mt-1">Manage projects and track progress</p>
        </div>
        <button className="px-6 py-3 bg-[#2cd588] text-black font-bold rounded-lg hover:bg-green-600">
          + New Project
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-[#0f0f1e] border border-[#2cd588]/30 rounded-lg p-6">
          <p className="text-gray-400 text-sm">Active Projects</p>
          <p className="text-3xl font-bold text-[#2cd588] mt-2">{projects.filter((p) => p.status === 'active').length}</p>
        </div>
        <div className="bg-[#0f0f1e] border border-[#2cd588]/30 rounded-lg p-6">
          <p className="text-gray-400 text-sm">Budget Allocated</p>
          <p className="text-3xl font-bold text-[#2cd588] mt-2">${(totalBudget / 1000).toFixed(0)}K</p>
        </div>
        <div className="bg-[#0f0f1e] border border-[#2cd588]/30 rounded-lg p-6">
          <p className="text-gray-400 text-sm">Spent</p>
          <p className="text-3xl font-bold text-[#2cd588] mt-2">${(totalSpent / 1000).toFixed(0)}K</p>
        </div>
        <div className="bg-[#0f0f1e] border border-[#2cd588]/30 rounded-lg p-6">
          <p className="text-gray-400 text-sm">Avg Progress</p>
          <p className="text-3xl font-bold text-[#2cd588] mt-2">{avgProgress}%</p>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-3 gap-6">
        {projects.map((project) => (
          <div
            key={project.id}
            onClick={() => setSelectedProject(project)}
            className="bg-[#0f0f1e] border border-[#2cd588]/30 rounded-lg p-6 cursor-pointer hover:border-[#2cd588] transition-colors"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-white">{project.name}</h3>
                <p className="text-gray-400 text-sm">{project.customer}</p>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded ${
                  project.status === 'active'
                    ? 'bg-green-500/20 text-green-400'
                    : project.status === 'on-hold'
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-gray-500/20 text-gray-400'
                }`}
              >
                {project.status}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs mb-2">
                <span className="text-gray-400">Progress</span>
                <span className="text-[#2cd588]">{project.progress}%</span>
              </div>
              <div className="w-full bg-[#050505] rounded-full h-2 overflow-hidden border border-[#2cd588]/20">
                <div
                  className="bg-[#2cd588] h-full transition-all"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>

            {/* Budget */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Budget</span>
                <span className="text-white font-mono">${(project.budget / 1000).toFixed(0)}K</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Spent</span>
                <span className="text-[#2cd588] font-mono">${(project.spent / 1000).toFixed(0)}K</span>
              </div>
            </div>

            {/* Tasks */}
            <div className="mt-4 pt-4 border-t border-[#2cd588]/20">
              <p className="text-xs text-gray-400 mb-2">Tasks: {project.tasks.filter((t) => t.status !== 'done').length} remaining</p>
              <div className="space-y-1">
                {project.tasks.slice(0, 2).map((task) => (
                  <div key={task.id} className="text-xs text-gray-500">{task.title}</div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Project Detail */}
      {selectedProject && (
        <div className="bg-[#0f0f1e] border border-[#2cd588]/30 rounded-lg p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-[#2cd588]">{selectedProject.name}</h2>
            <p className="text-gray-400">{selectedProject.customer}</p>
          </div>

          <div className="grid grid-cols-2 gap-8">
            {/* Tasks */}
            <div>
              <h3 className="font-bold text-white mb-4">Tasks</h3>
              <div className="space-y-2">
                {selectedProject.tasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between bg-[#050505] p-3 rounded border border-[#2cd588]/20">
                    <div className="flex-1">
                      <p className="text-white text-sm">{task.title}</p>
                      <p className="text-gray-500 text-xs">{task.dueDate}</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <span className={`text-xs px-2 py-1 rounded ${statusColors[task.status]}`}>{task.status}</span>
                      <span className={`text-xs ${priorityColors[task.priority]}`}>{task.priority}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="space-y-4">
              <div className="bg-[#050505] p-4 rounded border border-[#2cd588]/20">
                <p className="text-gray-500 text-sm">Progress</p>
                <p className="text-3xl font-bold text-[#2cd588] mt-2">{selectedProject.progress}%</p>
                <div className="w-full bg-[#0f0f1e] rounded-full h-2 overflow-hidden mt-3 border border-[#2cd588]/20">
                  <div
                    className="bg-[#2cd588] h-full"
                    style={{ width: `${selectedProject.progress}%` }}
                  />
                </div>
              </div>

              <div className="bg-[#050505] p-4 rounded border border-[#2cd588]/20">
                <p className="text-gray-500 text-sm">Budget Remaining</p>
                <p className="text-2xl font-bold text-[#2cd588] mt-2">
                  ${((selectedProject.budget - selectedProject.spent) / 1000).toFixed(0)}K
                </p>
                <p className="text-gray-500 text-xs mt-2">
                  of ${(selectedProject.budget / 1000).toFixed(0)}K total
                </p>
              </div>

              <div className="bg-[#050505] p-4 rounded border border-[#2cd588]/20">
                <p className="text-gray-500 text-sm">Timeline</p>
                <p className="text-white mt-2">Start: {selectedProject.startDate}</p>
                <p className="text-white">End: {selectedProject.endDate}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
