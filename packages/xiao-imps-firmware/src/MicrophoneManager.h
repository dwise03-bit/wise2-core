#ifndef MICROPHONE_MANAGER_H
#define MICROPHONE_MANAGER_H

#include <Arduino.h>
#include <driver/i2s.h>
#include <freertos/FreeRTOS.h>
#include <freertos/ringbuf.h>
#include "config.h"

class MicrophoneManager {
public:
  // Singleton instance
  static MicrophoneManager& getInstance();

  // Lifecycle
  bool begin();
  bool end();
  bool isInitialized() const { return initialized; }

  // Audio data retrieval (non-blocking)
  // Returns number of samples read into buffer
  // maxSamples: maximum samples to read
  // Returns: actual samples read (0 if none available)
  int readSamples(int16_t* buffer, int maxSamples);

  // Get audio statistics
  float getLevel() const { return currentLevel; }        // RMS level in dBFS
  int getDroppedFrames() const { return droppedFrames; } // Underrun counter
  int getPendingSamples() const;                          // Samples waiting in buffer

  // Reset statistics
  void resetStats();

private:
  // Private constructor (singleton)
  MicrophoneManager();
  ~MicrophoneManager();

  // Deleted copy/move constructors
  MicrophoneManager(const MicrophoneManager&) = delete;
  MicrophoneManager& operator=(const MicrophoneManager&) = delete;
  MicrophoneManager(MicrophoneManager&&) = delete;
  MicrophoneManager& operator=(MicrophoneManager&&) = delete;

  // I2S initialization
  bool initializeI2S();
  void deinitializeI2S();

  // I2S event handler (called when data is available)
  static void i2sEventHandler(void* arg);

  // Ring buffer for PCM samples
  RingbufHandle_t pcmRingBuffer;

  // State
  bool initialized;
  int droppedFrames;
  float currentLevel;

  // Timing
  unsigned long lastLevelUpdate;
};

#endif // MICROPHONE_MANAGER_H
