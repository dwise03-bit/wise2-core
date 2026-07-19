/**
 * Project state serialization/deserialization utilities
 */

import type { Track } from '@wise2/audio';

export interface SerializedTrack {
  id: string;
  name: string;
  volume: number;
  pan: number;
  muted: boolean;
  solo: boolean;
  color: string;
}

export interface SerializedProject {
  id: string;
  name: string;
  bpm: number;
  masterVolume: number;
  tracks: SerializedTrack[];
  createdAt: number;
  updatedAt: number;
}

export function serializeProjectState(
  projectId: string,
  projectName: string,
  tracks: Track[],
  bpm: number,
  masterVolume: number
): SerializedProject {
  return {
    id: projectId,
    name: projectName,
    bpm,
    masterVolume,
    tracks: tracks.map(track => ({
      id: track.getId(),
      name: track.getName(),
      volume: track.getVolume(),
      pan: track.getPan(),
      muted: track.isMuted(),
      solo: track.isSolo(),
      color: track.getColor(),
    })),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function deserializeProjectState(project: SerializedProject) {
  return {
    projectId: project.id,
    projectName: project.name,
    bpm: project.bpm,
    masterVolume: project.masterVolume,
    tracks: project.tracks,
  };
}
