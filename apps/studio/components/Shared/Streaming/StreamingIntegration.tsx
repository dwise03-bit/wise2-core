'use client';

import { useState, useCallback } from 'react';
import { StreamDestinationsPanel } from './StreamDestinationsPanel';
import { StreamSettingsForm } from './StreamSettingsForm';
import { DestinationSettingsModal } from './DestinationSettingsModal';
import type { StreamDestination, StreamConfig } from '../../../types/streaming';

/**
 * Complete streaming integration component that manages stream destinations
 * and settings. This component ties together all streaming UI components
 * with the useStreamingWithAudio hook for state management.
 *
 * Usage:
 * ```tsx
 * const { streaming } = useStreamingWithAudio();
 * <StreamingIntegration
 *   destinations={streaming.destinations}
 *   config={streaming.config}
 *   onConnectDestination={streaming.connectDestination}
 *   onDisconnectDestination={streaming.disconnectDestination}
 *   onUpdateConfig={streaming.updateConfig}
 * />
 * ```
 */
export interface StreamingIntegrationProps {
  /**
   * Array of stream destinations (from useStreaming hook)
   */
  destinations: StreamDestination[];

  /**
   * Current stream configuration
   */
  config: StreamConfig;

  /**
   * Callback when connecting a destination
   */
  onConnectDestination: (destination: StreamDestination) => Promise<void> | void;

  /**
   * Callback when disconnecting a destination
   */
  onDisconnectDestination: (id: string) => Promise<void> | void;

  /**
   * Callback when updating stream configuration
   */
  onUpdateConfig: (config: Partial<StreamConfig>) => void;

  /**
   * Whether operations are in progress
   */
  isLoading?: boolean;

  /**
   * ID of destination currently being loaded
   */
  loadingDestinationId?: string;

  /**
   * Error messages by destination ID
   */
  errors?: Record<string, string>;

  /**
   * Show scheduled stream option
   */
  allowScheduling?: boolean;
}

export function StreamingIntegration({
  destinations,
  config,
  onConnectDestination,
  onDisconnectDestination,
  onUpdateConfig,
  isLoading = false,
  loadingDestinationId,
  errors = {},
  allowScheduling = true,
}: StreamingIntegrationProps) {
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [selectedDestination, setSelectedDestination] =
    useState<StreamDestination | null>(null);

  const handleConnectDestination = useCallback(
    async (destination: StreamDestination) => {
      try {
        await onConnectDestination(destination);
      } catch (error) {
        console.error('Failed to connect destination:', error);
      }
    },
    [onConnectDestination]
  );

  const handleDisconnectDestination = useCallback(
    async (id: string) => {
      try {
        await onDisconnectDestination(id);
      } catch (error) {
        console.error('Failed to disconnect destination:', error);
      }
    },
    [onDisconnectDestination]
  );

  const handleOpenSettings = useCallback((destination: StreamDestination) => {
    setSelectedDestination(destination);
    setSettingsModalOpen(true);
  }, []);

  const handleSaveDestinationSettings = useCallback(
    (destination: StreamDestination) => {
      // Update destination in destinations array
      // This would typically be handled by a separate action
      console.log('Saving destination settings:', destination);
    },
    []
  );

  return (
    <div className="space-y-6">
      {/* Stream Configuration */}
      <StreamSettingsForm
        config={config}
        onChange={onUpdateConfig}
        isScheduled={allowScheduling}
      />

      {/* Stream Destinations */}
      <StreamDestinationsPanel
        destinations={destinations}
        onConnect={handleConnectDestination}
        onDisconnect={handleDisconnectDestination}
        onSettings={handleOpenSettings}
        isLoading={isLoading}
        loadingDestinationId={loadingDestinationId}
        errors={errors}
      />

      {/* Destination Settings Modal */}
      {selectedDestination && (
        <DestinationSettingsModal
          destination={selectedDestination}
          isOpen={settingsModalOpen}
          onClose={() => {
            setSettingsModalOpen(false);
            setSelectedDestination(null);
          }}
          onSave={handleSaveDestinationSettings}
          isLoading={isLoading && loadingDestinationId === selectedDestination.id}
        />
      )}

      {/* Quick Start Guide */}
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
        <h3 className="text-sm font-bold text-white mb-4">Getting Started</h3>
        <div className="space-y-3 text-sm text-gray-300">
          <div className="flex gap-3">
            <span className="text-blue-400 font-bold min-w-fit">1.</span>
            <span>Configure your stream title, description, and category above</span>
          </div>
          <div className="flex gap-3">
            <span className="text-blue-400 font-bold min-w-fit">2.</span>
            <span>
              Click "Connect" on each destination you want to stream to
            </span>
          </div>
          <div className="flex gap-3">
            <span className="text-blue-400 font-bold min-w-fit">3.</span>
            <span>Add your stream key and URL from each platform</span>
          </div>
          <div className="flex gap-3">
            <span className="text-blue-400 font-bold min-w-fit">4.</span>
            <span>Start streaming from the main stream control panel</span>
          </div>
        </div>
      </div>

      {/* Tips & Best Practices */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-green-500/5 border border-green-500/30 rounded-lg p-4">
          <h4 className="text-sm font-bold text-green-400 mb-2">Pro Tips</h4>
          <ul className="text-xs text-green-400/80 space-y-1">
            <li>• Test connection before starting your stream</li>
            <li>• Use consistent titles across platforms</li>
            <li>• Schedule streams for better reach</li>
            <li>• Check network bandwidth before streaming</li>
          </ul>
        </div>
        <div className="bg-blue-500/5 border border-blue-500/30 rounded-lg p-4">
          <h4 className="text-sm font-bold text-blue-400 mb-2">Platform Limits</h4>
          <ul className="text-xs text-blue-400/80 space-y-1">
            <li>• YouTube: 1080p @ 60fps recommended</li>
            <li>• Twitch: 6 Mbps for 1080p60</li>
            <li>• Facebook: 4-8 Mbps for HD</li>
            <li>• LinkedIn: 1080p @ 30fps</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
