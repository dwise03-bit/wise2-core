#ifndef CN1_PROTOCOL_H
#define CN1_PROTOCOL_H

#include <Arduino.h>
#include "config.h"

#pragma pack(1)  // Ensure no padding in structures

// ============================================================================
// CN1 PACKET STRUCTURE
// ============================================================================

struct CN1Packet {
  // Header (4 bytes)
  uint8_t sync_byte;           // 0xAA (sync marker)
  uint8_t packet_type;         // Packet type (COMMAND, RESPONSE, STATUS, MIC_AUDIO)
  uint16_t payload_length;     // Length of payload data

  // Payload (up to 256 bytes)
  uint8_t payload[PKT_MAX_PAYLOAD];

  // Trailer (2 bytes)
  uint16_t crc16;              // CRC16 checksum

  // Computed size: 4 + payload_length + 2
};

#pragma pack()

// ============================================================================
// CN1 COMMUNICATION MANAGER
// ============================================================================

class CN1Protocol {
public:
  // Singleton instance
  static CN1Protocol& getInstance();

  // Lifecycle
  bool begin(HardwareSerial& serial);
  bool end();
  bool isConnected() const;

  // Sending data
  // Sends microphone audio packet to CYD
  bool sendMicAudioPacket(const int16_t* audioData, uint16_t sampleCount);

  // Sends status packet to CYD
  bool sendStatusPacket(float micLevel, uint16_t pendingSamples);

  // Low-level send
  bool sendPacket(uint8_t packetType, const uint8_t* payload, uint16_t payloadLen);

  // Receiving data
  bool hasIncomingPacket();
  bool receivePacket(CN1Packet& packet);

  // Statistics
  uint32_t getPacketsSent() const { return packetsSent; }
  uint32_t getPacketsReceived() const { return packetsReceived; }
  uint32_t getTransmissionErrors() const { return transmissionErrors; }

  // Reset statistics
  void resetStats();

private:
  // Private constructor (singleton)
  CN1Protocol();
  ~CN1Protocol();

  // Deleted copy/move constructors
  CN1Protocol(const CN1Protocol&) = delete;
  CN1Protocol& operator=(const CN1Protocol&) = delete;
  CN1Protocol(CN1Protocol&&) = delete;
  CN1Protocol& operator=(CN1Protocol&&) = delete;

  // CRC calculation
  static uint16_t calculateCRC16(const uint8_t* data, uint16_t length);

  // Serial interface
  HardwareSerial* serial;

  // Statistics
  uint32_t packetsSent;
  uint32_t packetsReceived;
  uint32_t transmissionErrors;

  // Receive buffer
  uint8_t rxBuffer[PKT_HEADER_SIZE + PKT_MAX_PAYLOAD + PKT_CRC_SIZE];
  uint16_t rxBufferIndex;
  bool rxSyncFound;
};

#endif // CN1_PROTOCOL_H
