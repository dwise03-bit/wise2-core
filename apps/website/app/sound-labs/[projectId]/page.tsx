'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { getBrowserAuthToken } from '@/lib/auth-session';
import { ArrowLeft, Music, FileAudio, Clock, HardDrive, Loader, AlertCircle, Edit2, Save, Play } from 'lucide-react';
import { MeterGauge } from '@/components/sound-labs/MeterGauge';
import { LyricsEditor, SAMPLE_LYRICS } from '@/components/sound-labs/LyricsEditor';
import { SunoStatus } from '@/components/sound-labs/SunoStatus';

interface SoundLabsProject {
  id: string;
  userId: string;
  name: string;
  description?: string;
  lyrics?: string;
  lyricsTitle?: string;
  sunoJobId?: string;
  sunoStatus?: string;
  generatedAudioUrl?: string;
  createdAt: string;
  updatedAt: string;
  recordingCount: number;
  recordings: Array<{
    id: string;
    name: string;
    description?: string;
    duration?: number;
    fileSize: number;
    uploadStatus: string;
    createdAt: string;
  }>;
  projectSize: number;
}

export default function ProjectDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params?.projectId as string;

  const [project, setProject] = useState<SoundLabsProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const token = getBrowserAuthToken();
    if (!token) {
      router.push('/auth/signin');
      return;
    }

    if (!projectId) return;

    fetchProject(token);
  }, [projectId, router]);

  const fetchProject = async (token: string) => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/v1/sound-labs/me/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error('Failed to load project');
      }

      const data = await res.json();
      setProject(data.project);
      setEditName(data.project.name);
      setEditDescription(data.project.description || '');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load project';
      setError(message);
      console.error('Error loading project:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    const token = getBrowserAuthToken();
    if (!token || !project) return;

    try {
      setIsSaving(true);
      const res = await fetch(`/api/v1/sound-labs/me/projects/${projectId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editName,
          description: editDescription,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to update project');
      }

      const data = await res.json();
      setProject(data.project);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update project');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-wise-bg-primary flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-wise-primary mx-auto mb-4 animate-spin" />
          <p className="text-wise-text-secondary">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-wise-bg-primary p-6">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/sound-labs"
            className="inline-flex items-center gap-2 text-wise-primary hover:text-wise-primary-light mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sound Labs
          </Link>
          <div className="bg-wise-bg-card border border-wise-primary-border rounded-lg p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-wise-text-primary mb-2">Project not found</h1>
            <p className="text-wise-text-muted mb-6">The project you're looking for doesn't exist or you don't have access to it.</p>
            <Link
              href="/sound-labs"
              className="inline-block px-6 py-2 bg-wise-primary hover:bg-wise-primary-hover text-white font-semibold rounded-lg transition-colors"
            >
              Return to Sound Labs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const totalRecordingSize = project.recordings.reduce((sum, r) => sum + (r.fileSize || 0), 0);
  const avgRecordingSize = project.recordingCount > 0 ? totalRecordingSize / project.recordingCount : 0;

  return (
    <div className="min-h-screen bg-wise-bg-primary text-wise-text-primary">
      {/* Header */}
      <div className="border-b border-wise-primary-border bg-wise-bg-secondary/50">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <Link
            href="/sound-labs"
            className="inline-flex items-center gap-2 text-wise-primary hover:text-wise-primary-light mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sound Labs
          </Link>

          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="text-4xl font-bold bg-wise-bg-secondary border border-wise-primary-border text-wise-primary rounded px-3 py-2 w-full"
                  />
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={2}
                    className="w-full bg-wise-bg-secondary border border-wise-primary-border text-wise-text-secondary rounded px-3 py-2 resize-none"
                    placeholder="Add a description..."
                  />
                </div>
              ) : (
                <div>
                  <h1 className="text-4xl font-bold text-wise-primary mb-2">{project.name}</h1>
                  {project.description && (
                    <p className="text-wise-text-secondary">{project.description}</p>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={() => {
                      setEditName(project.name);
                      setEditDescription(project.description || '');
                      setIsEditing(false);
                    }}
                    className="px-4 py-2 bg-wise-bg-secondary border border-wise-primary-border text-wise-text-primary rounded hover:bg-wise-bg-secondary/80 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveChanges}
                    disabled={isSaving}
                    className="px-4 py-2 bg-wise-primary hover:bg-wise-primary-hover disabled:opacity-50 text-white rounded font-medium transition-colors inline-flex items-center gap-2"
                  >
                    {isSaving && <Loader className="w-4 h-4 animate-spin" />}
                    <Save className="w-4 h-4" />
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-wise-bg-secondary border border-wise-primary-border text-wise-text-primary rounded hover:bg-wise-bg-secondary/80 transition-colors inline-flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="p-3 bg-wise-bg-card border border-wise-primary-border rounded">
              <div className="text-2xl font-bold text-blue-400">{project.recordingCount}</div>
              <div className="text-sm text-wise-text-muted">Recording{project.recordingCount !== 1 ? 's' : ''}</div>
            </div>
            <div className="p-3 bg-wise-bg-card border border-wise-primary-border rounded">
              <div className="text-2xl font-bold text-green-400">
                {(project.projectSize / (1024 * 1024)).toFixed(1)} MB
              </div>
              <div className="text-sm text-wise-text-muted">Total Size</div>
            </div>
            <div className="p-3 bg-wise-bg-card border border-wise-primary-border rounded">
              <div className="text-2xl font-bold text-purple-400">
                {new Date(project.createdAt).toLocaleDateString()}
              </div>
              <div className="text-sm text-wise-text-muted">Created</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {/* Storage Analytics */}
        <div className="bg-wise-bg-card border border-wise-primary-border rounded-lg p-6">
          <h2 className="text-xl font-bold text-wise-text-primary mb-6 flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-wise-primary" />
            Storage Analytics
          </h2>
          <div className="space-y-6">
            <MeterGauge
              label="Project Size"
              value={project.projectSize / (1024 * 1024)}
              max={Math.max((project.projectSize / (1024 * 1024)) * 1.5, 100)}
              unit="MB"
              color="blue"
            />
            <MeterGauge
              label="Recordings"
              value={project.recordingCount}
              max={Math.max(project.recordingCount * 2, 10)}
              unit="items"
              color="purple"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-wise-primary-border">
            <div>
              <p className="text-sm text-wise-text-muted mb-1">Avg. Recording Size</p>
              <p className="text-lg font-bold text-wise-primary">
                {(avgRecordingSize / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
            <div>
              <p className="text-sm text-wise-text-muted mb-1">Last Modified</p>
              <p className="text-lg font-bold text-wise-primary">
                {new Date(project.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Recordings */}
        <div className="bg-wise-bg-card border border-wise-primary-border rounded-lg overflow-hidden">
          <div className="p-6 border-b border-wise-primary-border">
            <h2 className="text-xl font-bold text-wise-text-primary flex items-center gap-2">
              <FileAudio className="w-5 h-5 text-wise-primary" />
              Recordings ({project.recordingCount})
            </h2>
          </div>

          {project.recordings.length > 0 ? (
            <div className="divide-y divide-wise-primary-border">
              {project.recordings.map((recording) => (
                <div key={recording.id} className="p-4 hover:bg-white/5 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <Music className="w-4 h-4 text-wise-primary flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-wise-text-primary truncate">{recording.name}</h3>
                        {recording.description && (
                          <p className="text-sm text-wise-text-muted mt-1">{recording.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-wise-text-muted">
                          {recording.duration && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {Math.floor(recording.duration / 60)}:
                              {String(recording.duration % 60).padStart(2, '0')}
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <HardDrive className="w-3 h-3" />
                            {(recording.fileSize / (1024 * 1024)).toFixed(2)} MB
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          recording.uploadStatus === 'COMPLETED'
                            ? 'bg-green-500/20 text-green-400'
                            : recording.uploadStatus === 'PENDING'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-blue-500/20 text-blue-400'
                        }`}
                      >
                        {recording.uploadStatus}
                      </span>
                      <p className="text-xs text-wise-text-muted mt-2">
                        {new Date(recording.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <Music className="w-8 h-8 text-wise-primary/30 mx-auto mb-3" />
              <p className="text-wise-text-muted">No recordings yet. Upload your first recording to get started!</p>
            </div>
          )}
        </div>

        {/* Lyrics Editor */}
        <LyricsEditor
          projectId={projectId}
          initialLyrics={project.lyrics || ''}
          initialTitle={project.lyricsTitle || ''}
          onSave={async (lyrics, title) => {
            const token = getBrowserAuthToken();
            if (!token) throw new Error('Not authenticated');

            const res = await fetch(`/api/v1/sound-labs/me/projects/${projectId}`, {
              method: 'PATCH',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                lyrics,
                lyricsTitle: title,
              }),
            });

            if (!res.ok) {
              throw new Error('Failed to save lyrics');
            }

            const data = await res.json();
            setProject(data.project);
          }}
        />

        {/* Suno Generation Status */}
        <SunoStatus
          projectId={projectId}
          status={project.sunoStatus || 'draft'}
          audioUrl={project.generatedAudioUrl}
          onStatusChange={(status, audioUrl) => {
            setProject({
              ...project,
              sunoStatus: status,
              ...(audioUrl && { generatedAudioUrl: audioUrl }),
            });
          }}
        />

        {/* Generate Track Button */}
        {project.lyrics && project.sunoStatus !== 'processing' && project.sunoStatus !== 'queued' && (
          <button
            onClick={async () => {
              const token = getBrowserAuthToken();
              if (!token) return;

              try {
                setError(null);
                const res = await fetch(`/api/v1/sound-labs/me/projects/${projectId}/generate`, {
                  method: 'POST',
                  headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    lyrics: project.lyrics,
                    title: project.lyricsTitle || project.name,
                  }),
                });

                if (!res.ok) {
                  throw new Error('Failed to start generation');
                }

                const data = await res.json();
                setProject({
                  ...project,
                  sunoJobId: data.jobId,
                  sunoStatus: 'queued',
                });
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Generation failed');
              }
            }}
            className="w-full px-6 py-3 bg-gradient-to-r from-wise-primary to-purple-500 hover:from-wise-primary-hover hover:to-purple-600 text-white rounded-lg font-semibold transition-all inline-flex items-center justify-center gap-2"
          >
            <Music className="w-5 h-5" />
            Generate Track with Suno
          </button>
        )}
      </div>
    </div>
  );
}
