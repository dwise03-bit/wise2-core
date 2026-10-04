'use client';

import { useState } from 'react';
import { FolderOpen, Plus, ArrowRight } from 'lucide-react';
import { useSoundLabsProduction } from '@/lib/hooks/useSoundLabsProduction';

interface ProjectsManagerProps {
  projects: Array<{ project_id: string; name: string; description: string; created_at: string }>;
  isLoading: boolean;
}

export function ProjectsManager({ projects, isLoading }: ProjectsManagerProps) {
  const { createProject } = useSoundLabsProduction();
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateProject = async () => {
    if (newProjectName.trim()) {
      setIsCreating(true);
      await createProject(newProjectName, newProjectDesc);
      setNewProjectName('');
      setNewProjectDesc('');
      setIsCreating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* New Project Form */}
      <div className="p-6 rounded-xl bg-gradient-to-br from-[#0a0a0c] to-[#0f0f12] border border-[#00D9FF]/10">
        <h3 className="text-lg font-semibold text-white mb-4">Create New Project</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#00D9FF] mb-2">Project Name</label>
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="My Amazing Track"
              className="w-full px-4 py-3 rounded-lg bg-[#050607] border border-[#00D9FF]/20 text-white placeholder-[#00D9FF]/40 focus:outline-none focus:border-[#00D9FF] transition-all"
              disabled={isCreating || isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#00D9FF] mb-2">Description</label>
            <textarea
              value={newProjectDesc}
              onChange={(e) => setNewProjectDesc(e.target.value)}
              placeholder="Optional description of your project"
              className="w-full px-4 py-3 rounded-lg bg-[#050607] border border-[#00D9FF]/20 text-white placeholder-[#00D9FF]/40 focus:outline-none focus:border-[#00D9FF] transition-all resize-none h-20"
              disabled={isCreating || isLoading}
            />
          </div>

          <button
            type="button"
            onClick={handleCreateProject}
            disabled={isCreating || isLoading || !newProjectName.trim()}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-[#00D9FF] to-[#00FF7F] text-[#050607] font-semibold hover:shadow-lg hover:shadow-[#00D9FF]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00D9FF]/60"
          >
            <Plus size={18} strokeWidth={2.25} aria-hidden="true" />
            {isCreating ? 'Creating...' : 'New Project'}
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">
          Your Projects ({projects.length})
        </h3>

        {projects.length === 0 ? (
          <div className="p-12 rounded-xl bg-gradient-to-br from-[#0a0a0c] to-[#0f0f12] border border-[#00D9FF]/10 text-center">
            <p className="text-[#00D9FF]/60">No projects yet. Create one to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <div
                key={project.project_id}
                className="p-6 rounded-xl bg-gradient-to-br from-[#0a0a0c] to-[#0f0f12] border border-[#00D9FF]/10 hover:border-[#00D9FF]/30 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-white group-hover:text-[#00D9FF] transition-colors">
                      {project.name}
                    </h4>
                    {project.description && (
                      <p className="text-[#00D9FF]/60 text-sm mt-1 line-clamp-2">{project.description}</p>
                    )}
                  </div>
                  <FolderOpen size={20} strokeWidth={1.75} className="text-[#00D9FF] shrink-0" aria-hidden="true" />
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#00D9FF]/10">
                  <span className="text-xs text-[#00D9FF]/60">{formatDate(project.created_at)}</span>
                  <span className="inline-flex items-center gap-1 text-[#00D9FF] group-hover:text-[#00FF7F] transition-colors text-sm font-semibold">
                    Open
                    <ArrowRight size={14} strokeWidth={2} aria-hidden="true" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
