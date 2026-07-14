'use client';

import { useState } from 'react';
import type { StreamConfig } from '../../../types/streaming';

export interface StreamSettingsFormProps {
  config: StreamConfig;
  onChange: (config: Partial<StreamConfig>) => void;
  isScheduled?: boolean;
}

export function StreamSettingsForm({
  config,
  onChange,
  isScheduled = false,
}: StreamSettingsFormProps) {
  const [tagInput, setTagInput] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const categories = [
    'Music',
    'Gaming',
    'Creative',
    'Educational',
    'Entertainment',
    'Sports',
    'Technology',
    'Other',
  ];

  const handleAddTag = () => {
    if (tagInput.trim() && !config.tags.includes(tagInput.trim())) {
      onChange({
        tags: [...config.tags, tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    onChange({
      tags: config.tags.filter((t) => t !== tag),
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 space-y-6">
      <div>
        <h3 className="text-xs font-bold text-gray-300 uppercase tracking-widest mb-4">
          Stream Settings
        </h3>
      </div>

      {/* Title */}
      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
          Stream Title
        </label>
        <input
          type="text"
          value={config.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="Enter stream title"
          maxLength={120}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
        />
        <div className="text-xs text-gray-500 mt-1">
          {config.title.length}/120 characters
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
          Description
        </label>
        <textarea
          value={config.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Describe your stream..."
          maxLength={500}
          rows={4}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
        />
        <div className="text-xs text-gray-500 mt-1">
          {config.description.length}/500 characters
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
          Category
        </label>
        <select
          value={config.category}
          onChange={(e) => onChange({ category: e.target.value })}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
          Tags (up to 5)
        </label>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a tag and press Enter"
            disabled={config.tags.length >= 5}
            className={`flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors ${
              config.tags.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          />
          <button
            onClick={handleAddTag}
            disabled={!tagInput.trim() || config.tags.length >= 5}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-sm font-medium rounded transition-colors"
          >
            Add
          </button>
        </div>

        {/* Tag List */}
        {config.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {config.tags.map((tag) => (
              <div
                key={tag}
                className="flex items-center gap-2 px-3 py-1 bg-blue-600/20 border border-blue-500/30 rounded-full text-sm text-blue-400"
              >
                {tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 hover:text-blue-300 transition-colors"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Visibility */}
      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
          Visibility
        </label>
        <div className="flex gap-3">
          {(['public', 'unlisted', 'private'] as const).map((visibility) => (
            <button
              key={visibility}
              onClick={() => onChange({ visibility })}
              className={`flex-1 px-4 py-2 rounded border transition-colors text-sm font-medium capitalize ${
                config.visibility === visibility
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
              }`}
            >
              {visibility === 'public' && '🌍'} {visibility === 'unlisted' && '🔗'}{' '}
              {visibility === 'private' && '🔒'} {visibility}
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Settings */}
      <div className="border-t border-gray-700 pt-6">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
        >
          {showAdvanced ? '▼' : '▶'} Advanced Settings
        </button>

        {showAdvanced && (
          <div className="mt-4 space-y-4 pt-4 border-t border-gray-700">
            {/* Scheduled Stream */}
            {isScheduled && (
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                  Scheduled Start Time
                </label>
                <input
                  type="datetime-local"
                  value={
                    config.scheduledFor
                      ? config.scheduledFor.toISOString().slice(0, 16)
                      : ''
                  }
                  onChange={(e) =>
                    onChange({
                      scheduledFor: e.target.value
                        ? new Date(e.target.value)
                        : undefined,
                    })
                  }
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>
            )}

            {/* Thumbnail */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Thumbnail URL (optional)
              </label>
              <input
                type="url"
                value={config.thumbnail || ''}
                onChange={(e) => onChange({ thumbnail: e.target.value || undefined })}
                placeholder="https://example.com/thumbnail.jpg"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
              <p className="text-xs text-gray-500 mt-1">
                Recommended: 1280x720 JPG or PNG
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Info Message */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
        <p className="text-xs text-blue-400">
          ℹ Stream settings are synchronized across all connected destinations. Changes are applied in real-time.
        </p>
      </div>
    </div>
  );
}
