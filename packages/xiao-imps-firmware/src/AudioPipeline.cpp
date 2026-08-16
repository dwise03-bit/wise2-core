#include "AudioPipeline.h"
#include "MicrophoneManager.h"
#include "CN1Protocol.h"
#include <cmath>

// Singleton instance
static AudioPipeline* audio_instance = nullptr;

AudioPipeline& AudioPipeline::getInstance() {
  if (audio_instance == nullptr) {
    audio_instance = new AudioPipeline();
  }
  return *audio_instance;
}

AudioPipeline::AudioPipeline()
    : running(false),
      inputLevel(-120.0f),
      noiseGateLevel(-120.0f),
      vadActive(false),
      wakeWordDetected(false),
      speechFramesCapture(0),
      vadFrameCount(0),
      vadHasActivated(false),
      vadLastActivityTime(0) {}

AudioPipeline::~AudioPipeline() {
  end();
}

bool AudioPipeline::begin() {
  if (running) {
    return true;
  }

  // Ensure microphone is initialized
  MicrophoneManager& mic = MicrophoneManager::getInstance();
  if (!mic.isInitialized()) {
    DEBUG_PRINTLN("[PIPELINE] Microphone not initialized");
    return false;
  }

  // Ensure CN1 protocol is ready
  CN1Protocol& cn1 = CN1Protocol::getInstance();
  if (!cn1.isConnected()) {
    DEBUG_PRINTLN("[PIPELINE] CN1 protocol not connected");
    return false;
  }

  running = true;
  resetStats();

  DEBUG_PRINTLN("[PIPELINE] Audio pipeline started");
  return true;
}

bool AudioPipeline::end() {
  running = false;
  DEBUG_PRINTLN("[PIPELINE] Audio pipeline stopped");
  return true;
}

void AudioPipeline::processAudio() {
  if (!running) {
    return;
  }

  MicrophoneManager& mic = MicrophoneManager::getInstance();
  CN1Protocol& cn1 = CN1Protocol::getInstance();

  // Buffer to hold samples for this processing cycle
  static int16_t sampleBuffer[I2S_BUFFER_LEN];

  // Read samples from microphone (non-blocking)
  int sampleCount = mic.readSamples(sampleBuffer, I2S_BUFFER_LEN);
  if (sampleCount <= 0) {
    return;  // No data available
  }

  // Stage 1: Measure input level (RMS)
  float sumSquares = 0.0f;
  for (int i = 0; i < sampleCount; i++) {
    float normalized = (float)sampleBuffer[i] / 32768.0f;
    sumSquares += normalized * normalized;
  }
  float rms = std::sqrt(sumSquares / sampleCount);
  inputLevel = 20.0f * std::log10(rms + 1e-10f);

  // Stage 2: Apply noise gate
  bool gateActive = applyNoiseGate(sampleBuffer, sampleCount);
  if (gateActive) {
    // Recalculate level after gating
    sumSquares = 0.0f;
    for (int i = 0; i < sampleCount; i++) {
      float normalized = (float)sampleBuffer[i] / 32768.0f;
      sumSquares += normalized * normalized;
    }
    rms = std::sqrt(sumSquares / sampleCount);
    noiseGateLevel = 20.0f * std::log10(rms + 1e-10f);
  } else {
    noiseGateLevel = -120.0f;
  }

  // Stage 3: Detect voice activity
  vadActive = detectVoiceActivity(sampleBuffer, sampleCount);

  // Stage 4: Detect wake word (placeholder)
  wakeWordDetected = detectWakeWord(sampleBuffer, sampleCount);

  // Stage 5: Capture and send speech
  if (vadActive && gateActive) {
    captureAndSend(sampleBuffer, sampleCount);
  }
}

bool AudioPipeline::applyNoiseGate(int16_t* samples, uint16_t sampleCount) {
  if (samples == nullptr || sampleCount == 0) {
    return false;
  }

  // Simple noise gate: if level below threshold, mute
  bool hasSignal = false;

  for (uint16_t i = 0; i < sampleCount; i++) {
    float normalized = (float)samples[i] / 32768.0f;
    float level_dbfs = 20.0f * std::log10(std::abs(normalized) + 1e-10f);

    if (level_dbfs < NOISE_GATE_THRESHOLD) {
      // Below threshold - attenuate
      samples[i] = (int16_t)(samples[i] * 0.1f);  // Reduce by 10x
    } else {
      hasSignal = true;
    }
  }

  return hasSignal;
}

bool AudioPipeline::detectVoiceActivity(const int16_t* samples, uint16_t sampleCount) {
  if (samples == nullptr || sampleCount == 0) {
    return false;
  }

  // Simple VAD: count samples with energy above threshold
  int energySamples = 0;
  const float VAD_LEVEL_THRESHOLD = -30.0f;  // dBFS

  for (uint16_t i = 0; i < sampleCount; i++) {
    float normalized = (float)samples[i] / 32768.0f;
    float level_dbfs = 20.0f * std::log10(std::abs(normalized) + 1e-10f);

    if (level_dbfs > VAD_LEVEL_THRESHOLD) {
      energySamples++;
    }
  }

  // Confidence: percentage of samples with energy
  float confidence = (float)energySamples / sampleCount;

  // Hysteresis: activation requires higher threshold than deactivation
  unsigned long now = millis();

  if (!vadHasActivated) {
    // Need 70% confidence to activate
    if (confidence > 0.7f) {
      vadHasActivated = true;
      vadLastActivityTime = now;
      DEBUG_PRINTLN("[VAD] Speech detected");
    }
    return false;
  } else {
    // Need 30% confidence to stay active
    if (confidence > 0.3f) {
      vadLastActivityTime = now;
      return true;
    }

    // Check timeout: 1 second of silence deactivates
    if (now - vadLastActivityTime > 1000) {
      vadHasActivated = false;
      DEBUG_PRINTLN("[VAD] Silence detected, deactivated");
      return false;
    }

    return true;  // Still in timeout period
  }
}

bool AudioPipeline::detectWakeWord(const int16_t* samples, uint16_t sampleCount) {
  (void)samples;  // Unused in this placeholder
  (void)sampleCount;

  // Placeholder for future wake-word detection (e.g., ML model)
  // For now, return false (no wake word needed - we capture all speech)
  return false;
}

void AudioPipeline::captureAndSend(int16_t* samples, uint16_t sampleCount) {
  if (samples == nullptr || sampleCount == 0) {
    return;
  }

  CN1Protocol& cn1 = CN1Protocol::getInstance();

  // Send audio packet to CYD
  if (cn1.sendMicAudioPacket(samples, sampleCount)) {
    speechFramesCapture++;
  }

  if (speechFramesCapture % 50 == 0) {  // Log every 50 packets
    DEBUG_PRINT("[PIPELINE] Speech capture: ");
    DEBUG_PRINT(speechFramesCapture);
    DEBUG_PRINTLN(" packets sent");
  }
}

void AudioPipeline::resetStats() {
  inputLevel = -120.0f;
  noiseGateLevel = -120.0f;
  vadActive = false;
  wakeWordDetected = false;
  speechFramesCapture = 0;
  vadFrameCount = 0;
  vadHasActivated = false;
  vadLastActivityTime = millis();
}
