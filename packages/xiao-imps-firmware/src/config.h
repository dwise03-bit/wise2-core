#ifndef CONFIG_H
#define CONFIG_H

#include <Arduino.h>

// ============================================================================
// PIN DEFINITIONS - DO NOT MODIFY WITHOUT COORDINATION
// ============================================================================

// CN1 INTERFACE (CYD Communication) - RESERVED
// These pins are dedicated to XIAO ↔ CYD communication via CN1
// DO NOT reassign these pins for any other purpose
#define CN1_VDD_PIN       -1  // 3.3V power line (not GPIO)
#define CN1_GND_PIN       -1  // Ground (not GPIO)
#define CN1_GPIO1         22  // CYD → XIAO data line
#define CN1_GPIO2         27  // XIAO → CYD data line

// I2S MICROPHONE INTERFACE
// External I2S MEMS microphone connections
// WS (Word Select)  → XIAO D2 (GPIO2)
// SCK (Clock)       → XIAO D3 (GPIO3)
// SD (Data)         → XIAO D4 (GPIO4)
// VDD               → 3.3V (power)
// GND               → GND (power return)
// L/R               → GND (mono mode)
#define I2S_WS_PIN        2   // GPIO D2 - Word Select
#define I2S_SCK_PIN       3   // GPIO D3 - Serial Clock
#define I2S_SD_PIN        4   // GPIO D4 - Serial Data (MISO)

// I2S PORT NUMBER
#define I2S_PORT_NUM      I2S_NUM_0

// ============================================================================
// AUDIO CONFIGURATION
// ============================================================================

// I2S Audio Format
#define AUDIO_SAMPLE_RATE  16000      // 16 kHz
#define AUDIO_BIT_WIDTH    16         // 16-bit mono
#define AUDIO_CHANNELS     1          // Mono
#define I2S_BUFFER_COUNT   8          // 8 DMA buffers
#define I2S_BUFFER_LEN     512        // 512 samples per buffer

// Audio Pipeline Parameters
#define NOISE_GATE_THRESHOLD   -50.0f  // dBFS threshold
#define VAD_SAMPLE_DURATION    160     // 10ms at 16kHz
#define VAD_CONFIDENCE_THRESH  0.5f    // Confidence threshold (0-1)
#define WAKE_WORD_CONFIDENCE   0.8f    // Wake word match threshold

// Ring Buffer for PCM samples
#define PCM_RING_BUFFER_SIZE   32000   // ~2 seconds at 16kHz 16-bit mono

// ============================================================================
// UART CONFIGURATION (CN1 Communication)
// ============================================================================

#define UART_BAUD_RATE     115200
#define UART_RX_BUFSIZE    1024
#define UART_TX_BUFSIZE    1024

// ============================================================================
// COMMUNICATION PROTOCOL
// ============================================================================

// Packet Types (existing + new)
#define PKT_TYPE_COMMAND   0x01
#define PKT_TYPE_RESPONSE  0x02
#define PKT_TYPE_STATUS    0x03
#define PKT_TYPE_MIC_AUDIO 0x04      // NEW: Microphone audio data

// Packet Structure
#define PKT_HEADER_SIZE    4
#define PKT_CRC_SIZE       2
#define PKT_MAX_PAYLOAD    256

// ============================================================================
// MEMORY & PERFORMANCE
// ============================================================================

// Memory allocation
#define AUDIO_TASK_STACK   4096       // I2S audio thread stack
#define CN1_TASK_STACK     2048       // CN1 communication thread stack

// Timing
#define AUDIO_POLL_INTERVAL_MS    20  // Poll audio every 20ms
#define CN1_POLL_INTERVAL_MS      10  // Poll CN1 every 10ms

// ============================================================================
// DEBUG OPTIONS
// ============================================================================

#define DEBUG_I2S          1  // Log I2S initialization
#define DEBUG_AUDIO        0  // Log audio samples (use sparingly - high volume)
#define DEBUG_VAD          1  // Log VAD detection events
#define DEBUG_CN1          1  // Log CN1 protocol events

// Debug output helper
#if DEBUG_I2S || DEBUG_AUDIO || DEBUG_VAD || DEBUG_CN1
  #define DEBUG_PRINT(x)   Serial.print(x)
  #define DEBUG_PRINTLN(x) Serial.println(x)
#else
  #define DEBUG_PRINT(x)
  #define DEBUG_PRINTLN(x)
#endif

// ============================================================================
// PLATFORM DETECTION
// ============================================================================

#ifndef ARDUINO_XIAO_ESP32S3
  #error "This firmware is configured for Seeed Studio XIAO ESP32-S3 only"
#endif

#endif // CONFIG_H
