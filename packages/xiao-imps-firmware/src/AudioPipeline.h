#ifndef AUDIO_PIPELINE_H
#define AUDIO_PIPELINE_H

#include <Arduino.h>
#include "config.h"

// ============================================================================
// AUDIO PROCESSING PIPELINE
// ============================================================================
// Signal flow:
//   Microphone → Noise Gate → VAD → Wake Word → Speech Capture → CN1 Tx
//
// Each stage is non-blocking and processes data as it arrives.

class AudioPipeline {
public:
  // Singleton instance
  static AudioPipeline& getInstance();

  // Lifecycle
  bool begin();
  bool end();
  bool isRunning() const { return running; }

  // Process audio (call periodically, e.g., every 20ms)
  void processAudio();

  // Statistics
  float getInputLevel() const { return inputLevel; }
  float getNoiseGateLevel() const { return noiseGateLevel; }
  bool getVADActive() const { return vadActive; }
  bool getWakeWordDetected() const { return wakeWordDetected; }
  uint32_t getSpeechFramesCapture() const { return speechFramesCapture; }

  // Reset statistics
  void resetStats();

private:
  // Private constructor (singleton)
  AudioPipeline();
  ~AudioPipeline();

  // Deleted copy/move constructors
  AudioPipeline(const AudioPipeline&) = delete;
  AudioPipeline& operator=(const AudioPipeline&) = delete;
  AudioPipeline(AudioPipeline&&) = delete;
  AudioPipeline& operator=(AudioPipeline&&) = delete;

  // Pipeline stages
  // Stage 1: Noise Gate - suppress low-level noise
  bool applyNoiseGate(int16_t* samples, uint16_t sampleCount);

  // Stage 2: Voice Activity Detection - detect speech presence
  bool detectVoiceActivity(const int16_t* samples, uint16_t sampleCount);

  // Stage 3: Wake Word Detection (placeholder for future ML)
  bool detectWakeWord(const int16_t* samples, uint16_t sampleCount);

  // Stage 4: Speech Capture - capture and send audio when speech detected
  void captureAndSend(int16_t* samples, uint16_t sampleCount);

  // State
  bool running;
  float inputLevel;
  float noiseGateLevel;
  bool vadActive;
  bool wakeWordDetected;
  uint32_t speechFramesCapture;

  // VAD state
  uint32_t vadFrameCount;
  bool vadHasActivated;
  unsigned long vadLastActivityTime;
};

#endif // AUDIO_PIPELINE_H
