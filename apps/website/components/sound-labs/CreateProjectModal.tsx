'use client';

import React, { useState } from 'react';
import { X, Loader } from 'lucide-react';
import { getBrowserAuthToken } from '@/lib/auth-session';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateProjectModal({ isOpen, onClose, onSuccess }: CreateProjectModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const token = getBrowserAuthToken();
      if (!token) {
        setError('Not authenticated');
        return;
      }

      const res = await fetch('/api/v1/sound-labs/me/projects', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, description }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create project');
      }

      setName('');
      setDescription('');
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-wise-bg-card border border-wise-primary-border rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-wise-primary-border">
          <h2 className="text-xl font-bold text-wise-primary">Create New Project</h2>
          <button
            onClick={onClose}
            className="text-wise-text-muted hover:text-wise-text-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-wise-text-primary mb-2">
              Project Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., My First Track"
              className="w-full px-3 py-2 bg-wise-bg-secondary border border-wise-primary-border rounded text-wise-text-primary placeholder-wise-text-muted focus:outline-none focus:border-wise-primary transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-wise-text-primary mb-2">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your project..."
              rows={3}
              className="w-full px-3 py-2 bg-wise-bg-secondary border border-wise-primary-border rounded text-wise-text-primary placeholder-wise-text-muted focus:outline-none focus:border-wise-primary transition-colors resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-wise-bg-secondary border border-wise-primary-border text-wise-text-primary rounded hover:bg-wise-bg-secondary/80 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name || isLoading}
              className="flex-1 px-4 py-2 bg-wise-primary hover:bg-wise-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white rounded font-medium transition-colors flex items-center justify-center gap-2"
            >
              {isLoading && <Loader className="w-4 h-4 animate-spin" />}
              {isLoading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
