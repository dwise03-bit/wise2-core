/**
 * Audio Mixer Export Index
 * Professional streaming audio mixing system
 */

// Core mixer engine
export {
  StreamingAudioMixer,
  AudioDelayCompensator,
  StreamingAudioEncoder,
  type AudioSource,
  type MeteringData,
} from './AudioMixing';

// Integration layer
export {
  StreamingAudioManager,
  RTMPStreamOutput,
  StreamingAudioSystem,
  type AudioSourceConfig,
  type StreamEncodingSettings,
} from './StreamingAudioIntegration';

// Imported explicitly: the re-export above does not bind the name locally.
import { StreamingAudioMixer as StreamingAudioMixerDefault } from './AudioMixing';
export default StreamingAudioMixerDefault;
