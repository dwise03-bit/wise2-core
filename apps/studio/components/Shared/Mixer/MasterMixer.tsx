'use client';

import { useState } from 'react';
import { MixerChannel, type MixerChannelProps } from './MixerChannel';

export interface MixerChannel {
  id: string;
  name: string;
  label: string;
  volume: number;
  peakLevel: number;
  isMuted: boolean;
  isSolo: boolean;
}

export interface MasterMixerProps {
  channels: MixerChannel[];
  masterVolume: number;
  masterPeakLevel: number;
  onChannelVolumeChange: (channelId: string, volume: number) => void;
  onChannelMuteToggle: (channelId: string) => void;
  onChannelSoloToggle: (channelId: string) => void;
  onMasterVolumeChange: (volume: number) => void;
  title?: string;
  showAllTracksLink?: boolean;
}

export function MasterMixer({
  channels,
  masterVolume,
  masterPeakLevel,
  onChannelVolumeChange,
  onChannelMuteToggle,
  onChannelSoloToggle,
  onMasterVolumeChange,
  title = 'LIVE MIXER',
  showAllTracksLink = true,
}: MasterMixerProps) {
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="text-xs font-bold text-gray-300 uppercase tracking-widest">{title}</div>
        </div>
        {showAllTracksLink && (
          <button className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
            View All Tracks
          </button>
        )}
      </div>

      {/* Channels Grid */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {channels.map((channel) => (
          <MixerChannel
            key={channel.id}
            name={channel.name}
            label={channel.label}
            volume={channel.volume}
            peakLevel={channel.peakLevel}
            isMuted={channel.isMuted}
            isSolo={channel.isSolo}
            onVolumeChange={(value) => onChannelVolumeChange(channel.id, value)}
            onMuteToggle={() => onChannelMuteToggle(channel.id)}
            onSoloToggle={() => onChannelSoloToggle(channel.id)}
          />
        ))}
      </div>

      {/* Master Channel */}
      <div className="border-t border-gray-700 pt-4">
        <MixerChannel
          name="MASTER"
          label="Output"
          volume={masterVolume}
          peakLevel={masterPeakLevel}
          isMuted={false}
          isSolo={false}
          onVolumeChange={onMasterVolumeChange}
          onMuteToggle={() => {}}
          onSoloToggle={() => {}}
        />
      </div>
    </div>
  );
}
