'use client';

import { useState } from 'react';
import type { Recording } from '../../../types/streaming';

export interface ShareModalProps {
  recording: Recording;
  isOpen: boolean;
  onClose: () => void;
}

export function ShareModal({ recording, isOpen, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Generate a share link (in production, this would be a real URL)
  const shareLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/recordings/${recording.id}`;
  const shareText = `Check out this recording: ${recording.title}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareToEmail = () => {
    window.location.href = `mailto:?subject=${encodeURIComponent(recording.title)}&body=${encodeURIComponent(shareText + '\n\n' + shareLink)}`;
  };

  const shareOptions = [
    {
      name: 'Copy Link',
      icon: '🔗',
      action: handleCopyLink,
      description: 'Copy share link to clipboard',
    },
    {
      name: 'Email',
      icon: '📧',
      action: handleShareToEmail,
      description: 'Share via email',
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 w-full max-w-md shadow-lg">
        {/* Header */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-100">Share Recording</h3>
          <p className="text-xs text-gray-500 mt-1">Share this recording with others</p>
        </div>

        {/* Recording Info */}
        <div className="bg-gray-800 border border-gray-700 rounded p-3 mb-6">
          <div className="text-sm font-semibold text-gray-200 truncate">{recording.title}</div>
          <div className="flex gap-4 mt-2 text-xs text-gray-400">
            <div>Duration: {Math.floor(recording.duration / 60)}m {recording.duration % 60}s</div>
            <div>Date: {new Date(recording.startTime).toLocaleDateString()}</div>
          </div>
        </div>

        {/* Share Link */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-300 mb-2">Share Link</label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={shareLink}
              className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-gray-300 font-mono"
              onClick={(e) => e.currentTarget.select()}
            />
            <button
              onClick={handleCopyLink}
              className={`px-4 py-2 rounded font-semibold text-sm transition-colors ${
                copied
                  ? 'bg-green-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Share Options */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-300 mb-3">Share Via</label>
          <div className="space-y-2">
            {shareOptions.map((option) => (
              <button
                key={option.name}
                onClick={option.action}
                className="w-full flex items-center gap-3 p-3 border border-gray-700 rounded hover:bg-gray-800 transition-colors"
              >
                <span className="text-xl">{option.icon}</span>
                <div className="text-left flex-1">
                  <div className="text-sm font-semibold text-gray-200">{option.name}</div>
                  <div className="text-xs text-gray-500">{option.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* QR Code Placeholder */}
        <div className="bg-gray-800 border border-gray-700 rounded p-4 mb-6">
          <div className="text-xs text-gray-500 mb-3">QR Code</div>
          <div className="w-full aspect-square bg-gray-900 rounded flex items-center justify-center border border-gray-700">
            <div className="text-center">
              <div className="text-2xl mb-2">📱</div>
              <div className="text-xs text-gray-500">QR Code would generate here</div>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold rounded transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}
