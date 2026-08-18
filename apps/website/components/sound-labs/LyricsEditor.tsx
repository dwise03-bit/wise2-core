'use client';

import React, { useState } from 'react';
import { Save, Edit2, Music, Loader } from 'lucide-react';

interface LyricsEditorProps {
  projectId: string;
  initialLyrics?: string;
  initialTitle?: string;
  onSave: (lyrics: string, title: string) => Promise<void>;
}

export function LyricsEditor({
  projectId,
  initialLyrics = '',
  initialTitle = '',
  onSave,
}: LyricsEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [lyrics, setLyrics] = useState(initialLyrics);
  const [title, setTitle] = useState(initialTitle);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const wordCount = lyrics.trim().split(/\s+/).length;
  const lineCount = lyrics.trim().split('\n').length;

  const handleSave = async () => {
    try {
      setError(null);
      setIsSaving(true);
      await onSave(lyrics, title);
      setSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save lyrics');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isEditing) {
    return (
      <div className="bg-wise-bg-card border border-wise-primary-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-wise-text-primary flex items-center gap-2">
            <Music className="w-5 h-5 text-wise-primary" />
            Lyrics
          </h3>
          <button
            onClick={() => setIsEditing(true)}
            className="px-3 py-1 bg-wise-bg-secondary border border-wise-primary-border text-wise-text-primary rounded hover:bg-wise-bg-secondary/80 transition-colors inline-flex items-center gap-2 text-sm"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </button>
        </div>

        {lyrics ? (
          <div className="space-y-4">
            {title && (
              <div className="pb-4 border-b border-wise-primary-border">
                <p className="text-sm text-wise-text-muted mb-1">Song Title</p>
                <p className="text-lg font-semibold text-wise-text-primary">{title}</p>
              </div>
            )}
            <div className="grid grid-cols-3 gap-4 text-sm mb-4">
              <div className="p-3 bg-wise-bg-secondary/50 rounded">
                <p className="text-wise-text-muted">Words</p>
                <p className="text-xl font-bold text-wise-primary">{wordCount}</p>
              </div>
              <div className="p-3 bg-wise-bg-secondary/50 rounded">
                <p className="text-wise-text-muted">Lines</p>
                <p className="text-xl font-bold text-wise-primary">{lineCount}</p>
              </div>
              <div className="p-3 bg-wise-bg-secondary/50 rounded">
                <p className="text-wise-text-muted">Est. Duration</p>
                <p className="text-xl font-bold text-wise-primary">~{Math.ceil(wordCount / 130)}:00</p>
              </div>
            </div>
            <div className="bg-wise-bg-secondary/50 rounded-lg p-4 max-h-96 overflow-y-auto">
              <pre className="text-sm text-wise-text-primary whitespace-pre-wrap font-mono leading-relaxed">
                {lyrics}
              </pre>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <Music className="w-8 h-8 text-wise-primary/30 mx-auto mb-3" />
            <p className="text-wise-text-muted mb-4">No lyrics yet</p>
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-wise-primary hover:bg-wise-primary-hover text-white rounded font-medium transition-colors inline-flex items-center gap-2"
            >
              <Edit2 className="w-4 h-4" />
              Add Lyrics
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-wise-bg-card border border-wise-primary-border rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-wise-text-primary">Edit Lyrics</h3>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-500/10 border border-green-500/30 rounded text-green-400 text-sm">
          Lyrics saved successfully!
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-wise-text-primary mb-2">
          Song Title (optional)
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Managers for Managers"
          className="w-full px-3 py-2 bg-wise-bg-secondary border border-wise-primary-border rounded text-wise-text-primary placeholder-wise-text-muted focus:outline-none focus:border-wise-primary transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-wise-text-primary mb-2">
          Lyrics
        </label>
        <textarea
          value={lyrics}
          onChange={(e) => setLyrics(e.target.value)}
          placeholder="Paste or type your lyrics here..."
          rows={12}
          className="w-full px-3 py-2 bg-wise-bg-secondary border border-wise-primary-border rounded text-wise-text-primary placeholder-wise-text-muted focus:outline-none focus:border-wise-primary transition-colors resize-none font-mono text-sm"
        />
        <div className="mt-2 flex items-center justify-between text-xs text-wise-text-muted">
          <span>{wordCount} words • {lineCount} lines</span>
          <span>Est. {Math.ceil(wordCount / 130)}:00</span>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          onClick={() => {
            setLyrics(initialLyrics);
            setTitle(initialTitle);
            setIsEditing(false);
            setError(null);
          }}
          className="flex-1 px-4 py-2 bg-wise-bg-secondary border border-wise-primary-border text-wise-text-primary rounded hover:bg-wise-bg-secondary/80 transition-colors font-medium"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1 px-4 py-2 bg-wise-primary hover:bg-wise-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white rounded font-medium transition-colors inline-flex items-center justify-center gap-2"
        >
          {isSaving && <Loader className="w-4 h-4 animate-spin" />}
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving...' : 'Save Lyrics'}
        </button>
      </div>
    </div>
  );
}

// Pre-defined lyrics sets for demo
export const SAMPLE_LYRICS = {
  managersForManagers: `[INTRO - CINEMATIC]
Everybody had an idea.
Some wrote it down.
Some watched it disappear.
Some had the tools,
but never built the system.

We had the vision.
No office.
No blueprint.
No guarantee.

Just knowledge...
And the belief that one idea
could become everything.

[VERSE 1]
We was building from the floor,
Trying to find another door.
Every night we stayed awake,
Turning pressure into more.

Had the vision in our hands,
Even when they couldn't understand.
Every loss became a lesson,
Every question built the plan.

We done went from unemployed,
Now the mission been deployed.
Computers used to be our toys,
Now the systems make the noise.

[CHORUS]
What they called imagination
Turned into an operation.
Two minds synchronized,
Now watch the multiplication.

One idea multiplied,
Watch what the system do!
One becomes four,
Four becomes twenty-two!

Managers for managers!
Building every avenue!

WISE²!
THE GRID IS COMING THROUGH!

[VERSE 2]
Knowledge is the superpower,
Wisdom is the code.
Found gold inside the chaos
Everywhere we go.

[OUTRO]
From the darkness to the lights,
We were building every night.

WISE²...
Make the vision come alive.`,
};
