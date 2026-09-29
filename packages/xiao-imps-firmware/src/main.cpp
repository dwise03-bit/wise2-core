#include <Arduino.h>
#include "config.h"
#include "MicrophoneManager.h"
#include "CN1Protocol.h"
#include "AudioPipeline.h"

// ============================================================================
// WISE² IMPS FIRMWARE - XIAO ESP32-S3 + CYD 2.8 + EXTERNAL I2S MIC
// ============================================================================
// Main firmware for Seeed Studio XIAO ESP32-S3 connected to CYD 2.8
// via CN1 connector (GPIO22, GPIO27) with external I2S microphone.
//
// Pin Configuration:
//   CN1 Interface (Reserved - DO NOT MODIFY):
//     GPIO 22 - CYD → XIAO data line
//     GPIO 27 - XIAO → CYD data line
//     3.3V    - Power
//     GND     - Ground
//
//   I2S Microphone:
//     GPIO 2 (D2) - WS (Word Select)
//     GPIO 3 (D3) - SCK (Serial Clock)
//     GPIO 4 (D4) - SD (Serial Data)
//     3.3V        - Power
//     GND         - Ground
//
// Architecture:
//   MicrophoneManager → AudioPipeline → CN1Protocol → CYD
//
// ============================================================================

// Task handles for FreeRTOS
static TaskHandle_t audioTaskHandle = nullptr;
static TaskHandle_t cn1TaskHandle = nullptr;

// ============================================================================
// AUDIO PROCESSING TASK
// ============================================================================
// Runs every AUDIO_POLL_INTERVAL_MS to:
//   1. Read from microphone
//   2. Process audio pipeline
//   3. Send to CYD via CN1

void audioProcessingTask(void* pvParameters) {
  (void)pvParameters;  // Unused

  TickType_t lastWakeTime = xTaskGetTickCount();
  const TickType_t interval = pdMS_TO_TICKS(AUDIO_POLL_INTERVAL_MS);

  while (true) {
    // Process audio at fixed interval (non-blocking)
    AudioPipeline::getInstance().processAudio();

    // Send status packet periodically (every 500ms)
    static unsigned long lastStatusTime = 0;
    unsigned long now = millis();
    if (now - lastStatusTime > 500) {
      MicrophoneManager& mic = MicrophoneManager::getInstance();
      CN1Protocol& cn1 = CN1Protocol::getInstance();
      cn1.sendStatusPacket(mic.getLevel(), mic.getPendingSamples());
      lastStatusTime = now;
    }

    // Wait for next cycle
    vTaskDelayUntil(&lastWakeTime, interval);
  }
}

// ============================================================================
// CN1 COMMUNICATION TASK
// ============================================================================
// Runs every CN1_POLL_INTERVAL_MS to:
//   1. Check for incoming packets from CYD
//   2. Process commands
//   3. Handle status requests

void cn1CommunicationTask(void* pvParameters) {
  (void)pvParameters;  // Unused

  TickType_t lastWakeTime = xTaskGetTickCount();
  const TickType_t interval = pdMS_TO_TICKS(CN1_POLL_INTERVAL_MS);

  CN1Protocol& cn1 = CN1Protocol::getInstance();

  while (true) {
    // Check for incoming packets
    if (cn1.hasIncomingPacket()) {
      CN1Packet packet;
      if (cn1.receivePacket(packet)) {
        // Handle received packet based on type
        switch (packet.packet_type) {
          case PKT_TYPE_COMMAND: {
            // Example: handle commands from CYD
            DEBUG_PRINT("[MAIN] Command received: 0x");
            Serial.println(packet.payload[0], HEX);
            break;
          }

          case PKT_TYPE_RESPONSE: {
            // Handle response from CYD
            DEBUG_PRINTLN("[MAIN] Response received from CYD");
            break;
          }

          case PKT_TYPE_STATUS: {
            // Handle status request from CYD
            DEBUG_PRINTLN("[MAIN] Status request received");
            break;
          }

          default: {
            DEBUG_PRINT("[MAIN] Unknown packet type: ");
            DEBUG_PRINTLN(packet.packet_type);
            break;
          }
        }
      }
    }

    // Wait for next cycle
    vTaskDelayUntil(&lastWakeTime, interval);
  }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

void setupHardware() {
  // Initialize Serial for debugging (with delay to ensure stability)
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n\n");
  Serial.println("╔════════════════════════════════════════════════════════╗");
  Serial.println("║  WISE² IMPS - XIAO ESP32-S3 + CYD 2.8 + I2S Microphone ║");
  Serial.println("╚════════════════════════════════════════════════════════╝");
  Serial.println("");
  Serial.println("BOOT: Starting system initialization...");
  Serial.println("");

  // Initialize components (non-blocking, continue even if one fails)
  bool allOk = true;

  // 1. Microphone Manager
  Serial.println("INIT: Microphone Manager...");
  MicrophoneManager& mic = MicrophoneManager::getInstance();
  if (mic.begin()) {
    Serial.println("✓ Microphone Manager initialized");
  } else {
    Serial.println("✗ Microphone Manager FAILED (continuing anyway)");
    allOk = false;
  }
  delay(100);

  // 2. CN1 Protocol
  Serial.println("INIT: CN1 Protocol...");
  CN1Protocol& cn1 = CN1Protocol::getInstance();
  if (cn1.begin(Serial1)) {
    Serial.println("✓ CN1 Protocol initialized");
  } else {
    Serial.println("✗ CN1 Protocol FAILED (continuing anyway)");
    allOk = false;
  }
  delay(100);

  // 3. Audio Pipeline
  Serial.println("INIT: Audio Pipeline...");
  AudioPipeline& pipeline = AudioPipeline::getInstance();
  if (pipeline.begin()) {
    Serial.println("✓ Audio Pipeline initialized");
  } else {
    Serial.println("✗ Audio Pipeline FAILED (continuing anyway)");
    allOk = false;
  }
  delay(100);

  Serial.println("");
  if (allOk) {
    Serial.println("BOOT: All systems online. Ready for operation.");
  } else {
    Serial.println("BOOT: Warning - some systems not fully initialized");
  }
  Serial.println("");
}

void setupTasks() {
  Serial.println("Starting FreeRTOS tasks...");

  // Create audio processing task (higher priority)
  BaseType_t result = xTaskCreatePinnedToCore(
      audioProcessingTask,     // Task function
      "AudioTask",             // Task name
      AUDIO_TASK_STACK,        // Stack size
      nullptr,                 // Parameters
      5,                       // Priority (1-25, higher = more urgent)
      &audioTaskHandle,        // Task handle
      1                        // Core (0 or 1)
  );

  if (result != pdPASS) {
    Serial.println("ERROR: Failed to create audio task!");
    return;
  }
  Serial.println("✓ Audio processing task created");

  // Create CN1 communication task (lower priority)
  result = xTaskCreatePinnedToCore(
      cn1CommunicationTask,    // Task function
      "CN1Task",               // Task name
      CN1_TASK_STACK,          // Stack size
      nullptr,                 // Parameters
      3,                       // Priority
      &cn1TaskHandle,          // Task handle
      0                        // Core (0 or 1)
  );

  if (result != pdPASS) {
    Serial.println("ERROR: Failed to create CN1 task!");
    return;
  }
  Serial.println("✓ CN1 communication task created");

  Serial.println("");
  Serial.println("System running. Monitoring audio stream...");
  Serial.println("");
}

// ============================================================================
// ARDUINO SETUP
// ============================================================================

void setup() {
  // Initialize Serial FIRST
  Serial.begin(115200);
  delay(1000);

  // Guaranteed output
  Serial.println("\n\n");
  Serial.println("╔════════════════════════════════════════════════════════╗");
  Serial.println("║  WISE² IMPS - XIAO ESP32-S3 FIRMWARE ONLINE             ║");
  Serial.println("╚════════════════════════════════════════════════════════╝");
  Serial.println("");

  setupHardware();
  setupTasks();
}

// ============================================================================
// MAIN LOOP
// ============================================================================
// Main loop remains empty; all work is done in FreeRTOS tasks.

void loop() {
  // Print statistics every 5 seconds
  static unsigned long lastStatsTime = 0;
  unsigned long now = millis();

  if (now - lastStatsTime > 5000) {
    lastStatsTime = now;

    AudioPipeline& pipeline = AudioPipeline::getInstance();
    MicrophoneManager& mic = MicrophoneManager::getInstance();
    CN1Protocol& cn1 = CN1Protocol::getInstance();

    Serial.println("");
    Serial.println("─── SYSTEM STATUS ───");
    Serial.print("Input Level:    ");
    Serial.print(pipeline.getInputLevel());
    Serial.println(" dBFS");

    Serial.print("Gate Level:     ");
    Serial.print(pipeline.getNoiseGateLevel());
    Serial.println(" dBFS");

    Serial.print("VAD Active:     ");
    Serial.println(pipeline.getVADActive() ? "YES" : "NO");

    Serial.print("Pending Samples: ");
    Serial.println(mic.getPendingSamples());

    Serial.print("Speech Frames:  ");
    Serial.println(pipeline.getSpeechFramesCapture());

    Serial.print("Packets Sent:   ");
    Serial.println(cn1.getPacketsSent());

    Serial.print("Packets Recv:   ");
    Serial.println(cn1.getPacketsReceived());

    Serial.print("TX Errors:      ");
    Serial.println(cn1.getTransmissionErrors());

    Serial.println("──────────────────────");
    Serial.println("");
  }

  delay(100);  // Avoid watchdog timeout
}
