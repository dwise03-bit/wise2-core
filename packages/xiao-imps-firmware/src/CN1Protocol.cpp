#include "CN1Protocol.h"

// Singleton instance
static CN1Protocol* cn1_instance = nullptr;

CN1Protocol& CN1Protocol::getInstance() {
  if (cn1_instance == nullptr) {
    cn1_instance = new CN1Protocol();
  }
  return *cn1_instance;
}

CN1Protocol::CN1Protocol()
    : serial(nullptr),
      packetsSent(0),
      packetsReceived(0),
      transmissionErrors(0),
      rxBufferIndex(0),
      rxSyncFound(false) {}

CN1Protocol::~CN1Protocol() {
  end();
}

bool CN1Protocol::begin(HardwareSerial& ser) {
  serial = &ser;
  serial->begin(UART_BAUD_RATE, SERIAL_8N1, 20, 21);  // RX=GPIO20, TX=GPIO21

  rxBufferIndex = 0;
  rxSyncFound = false;

  DEBUG_PRINTLN("[CN1] Initialized (GPIO22 and GPIO27 reserved for CYD)");
  return true;
}

bool CN1Protocol::end() {
  if (serial != nullptr) {
    serial->end();
    serial = nullptr;
  }
  return true;
}

bool CN1Protocol::isConnected() const {
  return serial != nullptr;
}

bool CN1Protocol::sendMicAudioPacket(const int16_t* audioData, uint16_t sampleCount) {
  if (audioData == nullptr || sampleCount == 0) {
    return false;
  }

  // Payload: 2 bytes sample count + audio data
  uint8_t payload[2 + (sampleCount * 2)];

  // Pack sample count (big-endian)
  payload[0] = (sampleCount >> 8) & 0xFF;
  payload[1] = sampleCount & 0xFF;

  // Copy audio data
  memcpy(&payload[2], audioData, sampleCount * 2);

  uint16_t payloadLen = 2 + (sampleCount * 2);
  return sendPacket(PKT_TYPE_MIC_AUDIO, payload, payloadLen);
}

bool CN1Protocol::sendStatusPacket(float micLevel, uint16_t pendingSamples) {
  // Payload: 4 bytes level (float) + 2 bytes pending samples
  uint8_t payload[6];

  // Pack float as bytes (IEEE 754)
  uint32_t levelBits;
  memcpy(&levelBits, &micLevel, sizeof(float));
  payload[0] = (levelBits >> 24) & 0xFF;
  payload[1] = (levelBits >> 16) & 0xFF;
  payload[2] = (levelBits >> 8) & 0xFF;
  payload[3] = levelBits & 0xFF;

  // Pack pending samples (big-endian)
  payload[4] = (pendingSamples >> 8) & 0xFF;
  payload[5] = pendingSamples & 0xFF;

  return sendPacket(PKT_TYPE_STATUS, payload, 6);
}

bool CN1Protocol::sendPacket(uint8_t packetType, const uint8_t* payload, uint16_t payloadLen) {
  if (serial == nullptr || payloadLen > PKT_MAX_PAYLOAD) {
    transmissionErrors++;
    return false;
  }

  // Build packet in buffer
  uint8_t txBuffer[PKT_HEADER_SIZE + PKT_MAX_PAYLOAD + PKT_CRC_SIZE];

  // Header
  txBuffer[0] = 0xAA;  // Sync byte
  txBuffer[1] = packetType;
  txBuffer[2] = (payloadLen >> 8) & 0xFF;  // Payload length (big-endian)
  txBuffer[3] = payloadLen & 0xFF;

  // Payload
  if (payload != nullptr && payloadLen > 0) {
    memcpy(&txBuffer[4], payload, payloadLen);
  }

  // Calculate CRC16 (over header + payload)
  uint16_t crc = calculateCRC16(txBuffer, PKT_HEADER_SIZE + payloadLen);
  txBuffer[4 + payloadLen] = (crc >> 8) & 0xFF;      // CRC high byte
  txBuffer[5 + payloadLen] = crc & 0xFF;              // CRC low byte

  // Send complete packet
  uint16_t totalLen = PKT_HEADER_SIZE + payloadLen + PKT_CRC_SIZE;
  size_t written = serial->write(txBuffer, totalLen);

  if (written == totalLen) {
    packetsSent++;
    DEBUG_PRINT("[CN1] Sent packet type ");
    DEBUG_PRINT(packetType);
    DEBUG_PRINT(" (");
    DEBUG_PRINT(payloadLen);
    DEBUG_PRINTLN(" bytes)");
    return true;
  } else {
    transmissionErrors++;
    DEBUG_PRINT("[CN1] Send failed (wrote ");
    DEBUG_PRINT(written);
    DEBUG_PRINT(" of ");
    DEBUG_PRINT(totalLen);
    DEBUG_PRINTLN(" bytes)");
    return false;
  }
}

bool CN1Protocol::hasIncomingPacket() {
  if (serial == nullptr) {
    return false;
  }

  while (serial->available()) {
    uint8_t byte = serial->read();

    if (!rxSyncFound) {
      // Looking for sync byte
      if (byte == 0xAA) {
        rxBuffer[0] = byte;
        rxBufferIndex = 1;
        rxSyncFound = true;
        DEBUG_PRINTLN("[CN1] Sync byte found");
      }
    } else {
      // Accumulating packet data
      rxBuffer[rxBufferIndex++] = byte;

      // Need at least header (4 bytes)
      if (rxBufferIndex >= PKT_HEADER_SIZE) {
        // Extract payload length
        uint16_t payloadLen = ((uint16_t)rxBuffer[2] << 8) | rxBuffer[3];

        // Check if complete packet received
        uint16_t expectedLen = PKT_HEADER_SIZE + payloadLen + PKT_CRC_SIZE;
        if (rxBufferIndex >= expectedLen) {
          return true;  // Complete packet ready
        }

        // Prevent buffer overflow
        if (rxBufferIndex >= sizeof(rxBuffer)) {
          rxBufferIndex = 0;
          rxSyncFound = false;
          transmissionErrors++;
          DEBUG_PRINTLN("[CN1] RX buffer overflow");
        }
      }
    }
  }

  return false;
}

bool CN1Protocol::receivePacket(CN1Packet& packet) {
  if (!hasIncomingPacket()) {
    return false;
  }

  // Parse packet
  if (rxBuffer[0] != 0xAA) {
    return false;
  }

  packet.sync_byte = rxBuffer[0];
  packet.packet_type = rxBuffer[1];
  packet.payload_length = ((uint16_t)rxBuffer[2] << 8) | rxBuffer[3];

  // Sanity check
  if (packet.payload_length > PKT_MAX_PAYLOAD) {
    rxBufferIndex = 0;
    rxSyncFound = false;
    return false;
  }

  // Copy payload
  if (packet.payload_length > 0) {
    memcpy(packet.payload, &rxBuffer[4], packet.payload_length);
  }

  // Extract CRC
  uint16_t crcPos = PKT_HEADER_SIZE + packet.payload_length;
  packet.crc16 = ((uint16_t)rxBuffer[crcPos] << 8) | rxBuffer[crcPos + 1];

  // Verify CRC
  uint16_t calculatedCrc = calculateCRC16(rxBuffer, PKT_HEADER_SIZE + packet.payload_length);
  if (calculatedCrc != packet.crc16) {
    DEBUG_PRINTLN("[CN1] CRC mismatch!");
    rxBufferIndex = 0;
    rxSyncFound = false;
    transmissionErrors++;
    return false;
  }

  // Reset receive state
  rxBufferIndex = 0;
  rxSyncFound = false;
  packetsReceived++;

  DEBUG_PRINT("[CN1] Received packet type ");
  DEBUG_PRINT(packet.packet_type);
  DEBUG_PRINT(" (");
  DEBUG_PRINT(packet.payload_length);
  DEBUG_PRINTLN(" bytes)");

  return true;
}

uint16_t CN1Protocol::calculateCRC16(const uint8_t* data, uint16_t length) {
  // CRC-16-CCITT (0xFFFF initial, 0x1021 poly)
  uint16_t crc = 0xFFFF;

  for (uint16_t i = 0; i < length; i++) {
    crc ^= (uint16_t)data[i] << 8;

    for (int j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc = crc << 1;
      }
      crc &= 0xFFFF;
    }
  }

  return crc;
}

void CN1Protocol::resetStats() {
  packetsSent = 0;
  packetsReceived = 0;
  transmissionErrors = 0;
}
