'use client';

import { useState } from 'react';
import type { StreamDestination, DestinationType } from '../../../types/streaming';

export interface DestinationSettingsModalProps {
  destination: StreamDestination;
  isOpen: boolean;
  onClose: () => void;
  onSave: (destination: StreamDestination) => void;
  isLoading?: boolean;
}

export function DestinationSettingsModal({
  destination,
  isOpen,
  onClose,
  onSave,
  isLoading = false,
}: DestinationSettingsModalProps) {
  const [formData, setFormData] = useState<StreamDestination>(destination);
  const [showStreamKey, setShowStreamKey] = useState(false);

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const getDestinationLabel = (type: DestinationType): string => {
    const labels: Record<DestinationType, string> = {
      youtube: 'YouTube',
      twitch: 'Twitch',
      facebook: 'Facebook',
      linkedin: 'LinkedIn',
      rtmp: 'Custom RTMP',
      custom: 'Custom',
    };
    return labels[type];
  };

  const getInstructions = (type: DestinationType): string => {
    const instructions: Record<DestinationType, string> = {
      youtube:
        'Visit studio.youtube.com, go to Settings > Stream, and copy your Stream Key and Ingest URL.',
      twitch:
        'Go to Creator Dashboard > Settings > Stream Key to find your details.',
      facebook:
        'Visit facebook.com/live, create a live event, and get your Stream Key and URL.',
      linkedin:
        'Go to your Page Analytics > Video and copy the RTMP URL and Stream Key.',
      rtmp:
        'Enter your RTMP server URL and stream key from your streaming service.',
      custom: 'Configure your custom streaming endpoint details.',
    };
    return instructions[type];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 sticky top-0 bg-gray-900 z-10">
          <h2 className="text-lg font-bold text-white">
            {getDestinationLabel(formData.type)} Settings
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-300 text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Instructions */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <p className="text-xs text-blue-400 leading-relaxed">
              <strong>Setup Instructions:</strong> {getInstructions(formData.type)}
            </p>
          </div>

          {/* Connection Status */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Connection Status
            </label>
            <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg border border-gray-700">
              <div
                className={`w-3 h-3 rounded-full ${
                  formData.isConnected ? 'bg-green-500' : 'bg-gray-500'
                }`}
              />
              <span className="text-sm text-white">
                {formData.isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>

          {/* URL Field */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              {formData.type === 'rtmp' ? 'RTMP Server URL' : 'Ingest URL'}
            </label>
            <input
              type="url"
              value={formData.url || ''}
              onChange={(e) =>
                setFormData({ ...formData, url: e.target.value })
              }
              placeholder={
                formData.type === 'rtmp'
                  ? 'rtmps://live-api-s.facebook.com:443/rtmp/'
                  : 'https://...'
              }
              disabled={isLoading}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors disabled:opacity-50"
            />
            <p className="text-xs text-gray-500 mt-1">
              Found in your {getDestinationLabel(formData.type)} streaming settings
            </p>
          </div>

          {/* Stream Key Field */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Stream Key
            </label>
            <div className="relative">
              <input
                type={showStreamKey ? 'text' : 'password'}
                value={formData.streamKey || ''}
                onChange={(e) =>
                  setFormData({ ...formData, streamKey: e.target.value })
                }
                placeholder="Your stream key..."
                disabled={isLoading}
                className="w-full px-3 py-2 pr-10 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors disabled:opacity-50"
              />
              <button
                onClick={() => setShowStreamKey(!showStreamKey)}
                disabled={isLoading}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
              >
                {showStreamKey ? '🙈' : '👁'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Keep this secret. Never share your stream key.
            </p>
          </div>

          {/* Test Connection */}
          <button className="w-full px-4 py-2 bg-blue-600/20 border border-blue-500/30 text-blue-400 hover:bg-blue-600/30 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
            disabled={isLoading || !formData.url || !formData.streamKey}
          >
            🔍 Test Connection
          </button>

          {/* Advanced Options */}
          <div className="border-t border-gray-700 pt-6 space-y-4">
            <h3 className="text-sm font-semibold text-gray-300">Advanced Options</h3>

            {/* Audio Settings */}
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked={true}
                  className="w-4 h-4 accent-blue-600"
                  disabled={isLoading}
                />
                <span className="text-sm text-gray-300">Send Audio</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked={true}
                  className="w-4 h-4 accent-blue-600"
                  disabled={isLoading}
                />
                <span className="text-sm text-gray-300">Send Video</span>
              </label>
            </div>

            {/* Resolution Preference */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Preferred Resolution
              </label>
              <select
                defaultValue="1080p"
                disabled={isLoading}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors disabled:opacity-50"
              >
                <option>4K (2160p)</option>
                <option>1080p</option>
                <option>720p</option>
                <option>480p</option>
                <option>360p</option>
              </select>
            </div>

            {/* Bitrate */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Target Bitrate (Mbps)
              </label>
              <input
                type="number"
                defaultValue={6}
                min={0.5}
                max={50}
                step={0.5}
                disabled={isLoading}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors disabled:opacity-50"
              />
              <p className="text-xs text-gray-500 mt-1">
                Auto-adjusted based on network conditions
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-700 bg-gray-800/50">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading || !formData.url || !formData.streamKey}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading && (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
