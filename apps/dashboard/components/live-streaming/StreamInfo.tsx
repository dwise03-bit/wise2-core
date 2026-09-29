'use client';

import React, { useState } from 'react';

interface StreamInfoProps {
  title?: string;
  description?: string;
  category?: string;
  tags?: string[];
  scheduledTime?: string;
  isEditable?: boolean;
  // eslint-disable-next-line no-unused-vars
  onUpdate?: (info: Partial<StreamInfoData>) => void;
}

interface StreamInfoData {
  title: string;
  description: string;
  category: string;
  tags: string[];
  scheduledTime: string;
}

/**
 * StreamInfo Component
 * Displays and allows editing of stream metadata
 */
export function StreamInfo({
  title = 'Premium Audio Streaming Session',
  description = 'High-fidelity audio streaming with professional mixing and effects.',
  category = 'Music',
  tags = ['music', 'live', 'audio', 'streaming'],
  scheduledTime = '2024-07-14 14:00 UTC',
  isEditable = true,
  onUpdate,
}: StreamInfoProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<StreamInfoData>({
    title,
    description,
    category,
    tags,
    scheduledTime,
  });

  const handleSubmit = () => {
    onUpdate?.(formData);
    setIsEditing(false);
  };

  const handleTagRemove = (index: number) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((_, i) => i !== index),
    });
  };

  const handleTagAdd = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tag],
      });
    }
  };

  if (isEditing) {
    return (
      <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-md space-y-md">
        {/* Header */}
        <div className="flex items-center justify-between pb-md border-b border-gray-700/50">
          <h3 className="text-sm font-bold text-white uppercase tracking-wide">Edit Stream Info</h3>
          <button
            onClick={() => setIsEditing(false)}
            className="text-gray-400 hover:text-white text-lg"
          >
            ✕
          </button>
        </div>

        {/* Title */}
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wide block mb-1">
            Stream Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-md py-sm bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            placeholder="Enter stream title"
          />
        </div>

        {/* Category */}
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wide block mb-1">
            Category
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-md py-sm bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:border-blue-500"
          >
            <option>Music</option>
            <option>Podcast</option>
            <option>Talk Show</option>
            <option>DJ Set</option>
            <option>Live Performance</option>
            <option>Other</option>
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wide block mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-md py-sm bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
            rows={3}
            placeholder="Enter stream description"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wide block mb-2">
            Tags
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.tags.map((tag, i) => (
              <div
                key={i}
                className="bg-blue-500/20 border border-blue-500/50 text-blue-400 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1"
              >
                {tag}
                <button
                  onClick={() => handleTagRemove(i)}
                  className="hover:text-blue-300"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <input
            type="text"
            placeholder="Add tag and press Enter"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleTagAdd((e.target as HTMLInputElement).value);
                (e.target as HTMLInputElement).value = '';
              }
            }}
            className="w-full px-md py-sm bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm"
          />
        </div>

        {/* Scheduled Time */}
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wide block mb-1">
            Scheduled Time (UTC)
          </label>
          <input
            type="datetime-local"
            value={formData.scheduledTime}
            onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
            className="w-full px-md py-sm bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-md pt-md border-t border-gray-700/50">
          <button
            onClick={handleSubmit}
            className="flex-1 px-md py-sm bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-md transition-colors"
          >
            Save Changes
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="flex-1 px-md py-sm bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-md transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-md space-y-md">
      {/* Header */}
      <div className="flex items-center justify-between pb-md border-b border-gray-700/50">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wide">Stream Info</h3>
          <p className="text-xs text-gray-400 mt-1">Stream metadata</p>
        </div>
        {isEditable && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-gray-400 hover:text-blue-400 transition-colors"
          >
            ✏️
          </button>
        )}
      </div>

      {/* Title */}
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Title</p>
        <h4 className="text-sm font-bold text-white">{title}</h4>
      </div>

      {/* Category */}
      <div className="flex items-center gap-md">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Category</p>
          <div className="inline-block bg-blue-500/20 border border-blue-500/50 text-blue-400 px-2 py-1 rounded-full text-xs font-semibold">
            {category}
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Description</p>
        <p className="text-sm text-gray-300 leading-relaxed">{description}</p>
      </div>

      {/* Tags */}
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Tags</p>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, i) => (
            <div
              key={i}
              className="bg-purple-500/20 border border-purple-500/50 text-purple-400 px-2 py-1 rounded-full text-xs font-semibold"
            >
              {tag}
            </div>
          ))}
        </div>
      </div>

      {/* Scheduled Time */}
      <div className="border-t border-gray-700/50 pt-md">
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Scheduled Start (UTC)</p>
        <p className="text-sm font-mono text-green-400">{scheduledTime}</p>
      </div>
    </div>
  );
}
