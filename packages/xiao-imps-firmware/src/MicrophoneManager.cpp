#include "MicrophoneManager.h"
#include <cmath>

// Singleton instance
static MicrophoneManager* instance = nullptr;

MicrophoneManager& MicrophoneManager::getInstance() {
  if (instance == nullptr) {
    instance = new MicrophoneManager();
  }
  return *instance;
}

MicrophoneManager::MicrophoneManager()
    : pcmRingBuffer(nullptr),
      initialized(false),
      droppedFrames(0),
      currentLevel(-120.0f),
      lastLevelUpdate(0) {}

MicrophoneManager::~MicrophoneManager() {
  end();
}

bool MicrophoneManager::begin() {
  if (initialized) {
    DEBUG_PRINTLN("[MIC] Already initialized");
    return true;
  }

  // Create ring buffer for PCM samples
  pcmRingBuffer = xRingbufferCreate(PCM_RING_BUFFER_SIZE, RINGBUF_TYPE_BYTEBUF);
  if (pcmRingBuffer == nullptr) {
    DEBUG_PRINTLN("[MIC] Failed to create ring buffer");
    return false;
  }

  // Initialize I2S interface
  if (!initializeI2S()) {
    DEBUG_PRINTLN("[MIC] Failed to initialize I2S");
    vRingbufferDelete(pcmRingBuffer);
    pcmRingBuffer = nullptr;
    return false;
  }

  initialized = true;
  DEBUG_PRINTLN("[MIC] Microphone initialized successfully");
  DEBUG_PRINTLN("[MIC] I2S WS (Word Select)  → GPIO 2");
  DEBUG_PRINTLN("[MIC] I2S SCK (Clock)       → GPIO 3");
  DEBUG_PRINTLN("[MIC] I2S SD (Data)         → GPIO 4");
  DEBUG_PRINTLN("[MIC] Sample rate: 16kHz, 16-bit mono");

  return true;
}

bool MicrophoneManager::end() {
  if (!initialized) {
    return true;
  }

  deinitializeI2S();

  if (pcmRingBuffer != nullptr) {
    vRingbufferDelete(pcmRingBuffer);
    pcmRingBuffer = nullptr;
  }

  initialized = false;
  DEBUG_PRINTLN("[MIC] Microphone shut down");
  return true;
}

bool MicrophoneManager::initializeI2S() {
  // I2S driver configuration
  i2s_config_t i2s_config = {
      .mode = (i2s_mode_t)(I2S_MODE_MASTER | I2S_MODE_RX),
      .sample_rate = AUDIO_SAMPLE_RATE,
      .bits_per_sample = I2S_BITS_PER_SAMPLE_16BIT,
      .channel_format = I2S_CHANNEL_FMT_ONLY_LEFT,
      .communication_format = I2S_COMM_FORMAT_STAND_I2S,
      .intr_alloc_flags = ESP_INTR_FLAG_LEVEL1,
      .dma_buf_count = I2S_BUFFER_COUNT,
      .dma_buf_len = I2S_BUFFER_LEN,
      .use_apll = false,
      .tx_desc_auto_clear = false,
      .fixed_mclk = 0,
  };

  // Install I2S driver
  esp_err_t ret = i2s_driver_install(I2S_PORT_NUM, &i2s_config, 0, nullptr);
  if (ret != ESP_OK) {
    DEBUG_PRINT("[MIC] I2S driver install failed: ");
    DEBUG_PRINTLN(ret);
    return false;
  }

  // Set I2S pin configuration
  i2s_pin_config_t pin_config = {
      .mck_io_num = I2S_PIN_NO_CHANGE, // No MCLK pin
      .bck_io_num = I2S_SCK_PIN,       // GPIO 3 - Serial Clock
      .ws_io_num = I2S_WS_PIN,         // GPIO 2 - Word Select
      .data_out_num = I2S_PIN_NO_CHANGE,  // No TX (RX only)
      .data_in_num = I2S_SD_PIN,       // GPIO 4 - Serial Data Input
  };

  ret = i2s_set_pin(I2S_PORT_NUM, &pin_config);
  if (ret != ESP_OK) {
    DEBUG_PRINT("[MIC] I2S set pin failed: ");
    DEBUG_PRINTLN(ret);
    i2s_driver_uninstall(I2S_PORT_NUM);
    return false;
  }

  // Clear I2S RX buffer before starting
  i2s_zero_dma_buffer(I2S_PORT_NUM);

  // Start I2S RX
  ret = i2s_start(I2S_PORT_NUM);
  if (ret != ESP_OK) {
    DEBUG_PRINT("[MIC] I2S start failed: ");
    DEBUG_PRINTLN(ret);
    i2s_driver_uninstall(I2S_PORT_NUM);
    return false;
  }

  DEBUG_PRINTLN("[MIC] I2S initialized");
  return true;
}

void MicrophoneManager::deinitializeI2S() {
  i2s_stop(I2S_PORT_NUM);
  i2s_driver_uninstall(I2S_PORT_NUM);
  DEBUG_PRINTLN("[MIC] I2S stopped");
}

int MicrophoneManager::readSamples(int16_t* buffer, int maxSamples) {
  if (!initialized || buffer == nullptr || maxSamples <= 0) {
    return 0;
  }

  // Try to read samples from ring buffer (non-blocking)
  size_t bytesAvailable = 0;
  int16_t* ringData = (int16_t*)xRingbufferReceive(pcmRingBuffer, &bytesAvailable, 0);

  if (ringData == nullptr || bytesAvailable == 0) {
    // No data available; try to read from I2S directly
    int16_t tempBuffer[I2S_BUFFER_LEN];
    size_t bytesRead = 0;

    esp_err_t ret = i2s_read(I2S_PORT_NUM, tempBuffer, sizeof(tempBuffer), &bytesRead, 0);
    if (ret != ESP_OK || bytesRead == 0) {
      return 0;
    }

    // Convert bytes to samples (16-bit = 2 bytes per sample)
    int samplesRead = bytesRead / sizeof(int16_t);

    // Clamp to maxSamples
    if (samplesRead > maxSamples) {
      samplesRead = maxSamples;
    }

    // Copy to output buffer
    memcpy(buffer, tempBuffer, samplesRead * sizeof(int16_t));

    // Update RMS level (every 100ms)
    unsigned long now = millis();
    if (now - lastLevelUpdate > 100) {
      float sumSquares = 0.0f;
      for (int i = 0; i < samplesRead; i++) {
        float sample = (float)buffer[i] / 32768.0f;  // Normalize to -1..1
        sumSquares += sample * sample;
      }
      float rms = std::sqrt(sumSquares / samplesRead);
      currentLevel = 20.0f * std::log10(rms + 1e-10f);  // Convert to dBFS
      lastLevelUpdate = now;
    }

    return samplesRead;
  } else {
    // Data available from ring buffer
    int samplesAvailable = bytesAvailable / sizeof(int16_t);
    int samplesToReturn = std::min(samplesAvailable, maxSamples);

    memcpy(buffer, ringData, samplesToReturn * sizeof(int16_t));
    vRingbufferReturnItem(pcmRingBuffer, ringData);

    return samplesToReturn;
  }
}

int MicrophoneManager::getPendingSamples() const {
  if (!initialized || pcmRingBuffer == nullptr) {
    return 0;
  }

  // Get current ring buffer status
  UBaseType_t availableBytes = xRingbufferGetCurFreeSize(pcmRingBuffer);
  // Ring buffer total size minus available = used bytes
  UBaseType_t usedBytes = PCM_RING_BUFFER_SIZE - availableBytes;

  return usedBytes / sizeof(int16_t);
}

void MicrophoneManager::resetStats() {
  droppedFrames = 0;
  currentLevel = -120.0f;
  lastLevelUpdate = millis();
}

void MicrophoneManager::i2sEventHandler(void* arg) {
  // This would be called by an interrupt handler if we implemented
  // interrupt-driven reading. For now, we use polling in readSamples().
  // Kept as placeholder for future optimization.
}
