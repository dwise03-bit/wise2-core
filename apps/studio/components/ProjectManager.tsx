'use client';

/**
 * Project Manager UI Component
 * Handles project list display, loading, creating, and deleting projects
 */

import React, { useEffect, useState } from 'react';
import type { ProjectMetadata } from '../hooks/useProjectPersistence';
import { useProjectPersistence } from '../hooks/useProjectPersistence';
import { formatFileSize } from '../utils/projectSerializer';

interface ProjectManagerProps {
  onProjectSelect: (projectId: string, projectName: string) => void;
  onClose?: () => void;
  currentProjectId?: string;
}

export function ProjectManager({
  onProjectSelect,
  onClose,
  currentProjectId,
}: ProjectManagerProps) {
  const persistence = useProjectPersistence();
  const [projects, setProjects] = useState<ProjectMetadata[]>([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Load project list on mount
  useEffect(() => {
    const projectList = persistence.getProjectList();
    setProjects(projectList.sort((a, b) => b.updatedAt - a.updatedAt));
  }, [persistence]);

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;

    setIsCreating(true);
    const projectId = `project-${Date.now()}`;
    const now = Date.now();

    const newProject = {
      id: projectId,
      name: newProjectName.trim(),
      bpm: 120,
      masterVolume: 1,
      tracks: [
        {
          id: `track-${now}`,
          name: 'Track 1',
          volume: 1,
          pan: 0,
          muted: false,
          solo: false,
          color: '#0094FF',
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    const saved = await persistence.saveProject(newProject);
    if (saved) {
      setProjects([newProject, ...projects]);
      onProjectSelect(projectId, newProjectName.trim());
      setNewProjectName('');
    }
    setIsCreating(false);
  };

  const handleLoadProject = (projectId: string, projectName: string) => {
    onProjectSelect(projectId, projectName);
    onClose?.();
  };

  const handleDeleteProject = (projectId: string) => {
    persistence.deleteProject(projectId);
    setProjects(projects.filter((p) => p.id !== projectId));
    setDeleteConfirm(null);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-wise-surface-secondary border border-wise-medium rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="border-b border-wise-medium p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Project Manager</h2>
          <button
            onClick={onClose}
            className="text-wise-text-secondary hover:text-wise-text-primary transition"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6">
          {/* Create New Project Section */}
          <div className="mb-8">
            <h3 className="text-sm font-bold uppercase tracking-wide mb-3 text-wise-text-secondary">
              New Project
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Project name..."
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateProject();
                }}
                className="flex-1 px-3 py-2 bg-wise-surface border border-wise-medium rounded text-sm text-wise-text-primary placeholder-wise-text-muted focus:outline-none focus:border-wise-primary transition"
                disabled={isCreating}
              />
              <button
                onClick={handleCreateProject}
                disabled={!newProjectName.trim() || isCreating}
                className="px-4 py-2 bg-wise-primary hover:bg-wise-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-wise-text-primary rounded font-semibold transition"
              >
                Create
              </button>
            </div>
          </div>

          {/* Storage Info */}
          <div className="mb-6 p-4 bg-wise-surface border border-wise-subtle rounded">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-wise-text-secondary">Storage Used</span>
              <span className="text-sm font-semibold text-wise-text-primary">
                {formatFileSize(persistence.getTotalStorageUsed())} / 50 MB
              </span>
            </div>
            <div className="w-full h-2 bg-wise-surface rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-wise-primary to-wise-primary-active transition-all"
                style={{
                  width: `${Math.min(
                    (persistence.getTotalStorageUsed() / (50 * 1024 * 1024)) *
                      100,
                    100
                  )}%`,
                }}
              />
            </div>
          </div>

          {/* Projects List */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide mb-3 text-wise-text-secondary">
              Saved Projects ({projects.length})
            </h3>

            {projects.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-wise-text-muted mb-2">No projects yet</p>
                <p className="text-xs text-wise-text-secondary">
                  Create a new project to get started
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className={`flex items-center justify-between p-4 bg-wise-surface border rounded transition ${
                      currentProjectId === project.id
                        ? 'border-wise-primary bg-wise-primary/5'
                        : 'border-wise-medium hover:border-wise-primary/50'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-wise-text-primary truncate">
                        {project.name}
                      </h4>
                      <div className="flex items-center gap-3 mt-1 text-xs text-wise-text-secondary">
                        <span>{formatDate(project.updatedAt)}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      {deleteConfirm === project.id ? (
                        <>
                          <button
                            onClick={() =>
                              handleDeleteProject(project.id)
                            }
                            className="px-3 py-1 bg-wise-accent-red hover:bg-wise-accent-red/80 text-white text-xs rounded font-semibold transition"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="px-3 py-1 bg-wise-surface border border-wise-medium hover:bg-wise-surface/80 text-wise-text-primary text-xs rounded font-semibold transition"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() =>
                              handleLoadProject(project.id, project.name)
                            }
                            className="px-4 py-2 bg-wise-primary hover:bg-wise-primary-hover text-wise-text-primary text-sm rounded font-semibold transition"
                          >
                            Load
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(project.id)}
                            className="px-3 py-2 text-wise-accent-red hover:bg-wise-accent-red/10 text-sm rounded transition"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        {persistence.saveError && (
          <div className="border-t border-wise-medium bg-wise-accent-red/10 border-wise-accent-red px-6 py-3">
            <p className="text-sm text-wise-accent-red">{persistence.saveError}</p>
          </div>
        )}
      </div>
    </div>
  );
}
