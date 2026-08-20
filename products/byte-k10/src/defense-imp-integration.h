/**
 * WISE² K10 Defense IMP Integration Header
 *
 * Drop-in integration for K10 firmware to display Defense IMP data.
 *
 * Usage in byte-k10.ino:
 *   #include "defense-imp-integration.h"
 *   DefenseImpIntegration defense_imp;
 *
 *   // In setup()
 *   defense_imp.init(k10, "http://localhost:3000/api", "k10-001");
 *
 *   // In loop()
 *   if (defense_imp.should_update()) {
 *     defense_imp.fetch_data();
 *     defense_imp.render_overlay(k10.display);
 *   }
 */

#pragma once

#include <WiFi.h>
#include <HTTPClient.h>
#include <HardwareSerial.h>
#include <ArduinoJson.h>

// ============================================================
// USB Serial Protocol for K10 ↔ Host Communication
// ============================================================
/*
Protocol: JSON over UART at 115200 baud

Request format (K10 → Host):
{
  "type": "get_defense_imp_data",
  "device_id": "k10-001",
  "timestamp": 1692547200000
}

Response format (Host → K10):
{
  "timestamp": 1692547200000,
  "deviceId": "k10-001",
  "incidents": {
    "total": 3,
    "recent": [
      {
        "id": "inc_001",
        "type": "fire",
        "distance": 0.8,
        "location": "Main St & 5th Ave",
        "timestamp": 1692547200000,
        "severity": "critical"
      }
    ]
  },
  "alerts": [
    "21:42 - Fire Department response: 3 units en route",
    "21:40 - Severe Weather Warning issued"
  ],
  "health": {
    "cpu": 34,
    "memory": 48,
    "disk": 22,
    "temperature": 51,
    "uptime": 786000,
    "network": {
      "connected": true,
      "signal": 75
    }
  },
  "connectivity": {
    "wifi": true,
    "mesh": true,
    "sdr": false,
    "usb": true
  }
}
*/

class DefenseImpIntegration {
private:
  TFT_eSPI* display;
  HTTPClient http_client;
  String api_base_url;
  String device_id;
  uint32_t last_wifi_attempt_ms;
  uint32_t last_usb_attempt_ms;
  bool wifi_available;
  bool usb_available;

  struct CachedData {
    uint32_t incident_count;
    char top_incident[256];
    char latest_alert[128];
    uint8_t cpu_percent;
    uint8_t ram_percent;
    uint8_t signal_percent;
    bool wifi_connected;
    bool mesh_connected;
    bool sdr_connected;
    uint32_t last_update_ms;
  } cached;

public:
  DefenseImpIntegration()
    : display(nullptr), last_wifi_attempt_ms(0), last_usb_attempt_ms(0),
      wifi_available(false), usb_available(false) {
    memset(&cached, 0, sizeof(cached));
  }

  /**
   * Initialize Defense IMP integration
   * @param disp TFT display object
   * @param base_url API base URL (e.g., "http://192.168.1.100:3000")
   * @param dev_id Device ID (e.g., "k10-001")
   */
  void init(TFT_eSPI* disp, const String& base_url, const String& dev_id) {
    display = disp;
    api_base_url = base_url;
    device_id = dev_id;
    Serial.begin(115200);
  }

  /**
   * Check if it's time to fetch new data
   * @param interval_ms Update interval in milliseconds
   */
  bool should_update(uint32_t interval_ms = 5000) {
    return (millis() - cached.last_update_ms) > interval_ms;
  }

  /**
   * Fetch Defense IMP data via WiFi or USB fallback
   */
  bool fetch_data() {
    // Try WiFi first (every 5s)
    if ((millis() - last_wifi_attempt_ms) > 5000 && WiFi.status() == WL_CONNECTED) {
      if (fetch_via_wifi()) {
        return true;
      }
      last_wifi_attempt_ms = millis();
    }

    // Try USB fallback (every 2s if WiFi unavailable)
    if ((millis() - last_usb_attempt_ms) > 2000) {
      if (fetch_via_usb()) {
        return true;
      }
      last_usb_attempt_ms = millis();
    }

    return false;
  }

  /**
   * Render Defense IMP overlay on display
   * Assumes IMP face is drawn first; overlays data on top
   */
  void render_overlay() {
    if (!display || cached.last_update_ms == 0) {
      return;
    }

    // Top bar: incident counter + latest critical alert
    render_top_bar();

    // Bottom bar: system health metrics
    render_bottom_bar();

    // Right side: connectivity status
    render_connectivity_status();
  }

private:
  bool fetch_via_wifi() {
    String url = api_base_url + "/defense-imp/data";

    http_client.begin(url);
    http_client.addHeader("Content-Type", "application/json");
    http_client.setTimeout(3000);

    int http_code = http_client.GET();

    if (http_code == 200) {
      String payload = http_client.getString();
      http_client.end();
      return parse_json_response(payload);
    }

    http_client.end();
    return false;
  }

  bool fetch_via_usb() {
    // Send request via serial
    DynamicJsonDocument req(256);
    req["type"] = "get_defense_imp_data";
    req["device_id"] = device_id;
    req["timestamp"] = millis();

    String json_str;
    serializeJson(req, json_str);
    Serial.println(json_str);

    // Wait for response (blocking, 1 second timeout)
    uint32_t start = millis();
    String response = "";

    while ((millis() - start) < 1000) {
      if (Serial.available()) {
        char c = Serial.read();
        if (c == '\n') break;
        response += c;
      }
    }

    if (response.length() > 0) {
      return parse_json_response(response);
    }

    return false;
  }

  bool parse_json_response(const String& json_str) {
    DynamicJsonDocument doc(2048);
    DeserializationError error = deserializeJson(doc, json_str);

    if (error) {
      return false;
    }

    // Extract key data for display
    cached.incident_count = doc["incidents"]["total"] | 0;

    // Get top incident
    if (doc["incidents"]["recent"].size() > 0) {
      JsonObject incident = doc["incidents"]["recent"][0];
      snprintf(cached.top_incident, sizeof(cached.top_incident),
               "%s: %.1f mi @ %s",
               incident["type"] | "unknown",
               incident["distance"] | 0.0f,
               incident["location"] | "Unknown");
    }

    // Get latest alert
    if (doc["alerts"].size() > 0) {
      strlcpy(cached.latest_alert,
              doc["alerts"][0] | "No alerts",
              sizeof(cached.latest_alert));
    }

    // Health metrics
    cached.cpu_percent = doc["health"]["cpu"] | 0;
    cached.ram_percent = doc["health"]["memory"] | 0;
    cached.signal_percent = doc["health"]["network"]["signal"] | 0;

    // Connectivity
    cached.wifi_connected = doc["connectivity"]["wifi"] | false;
    cached.mesh_connected = doc["connectivity"]["mesh"] | false;
    cached.sdr_connected = doc["connectivity"]["sdr"] | false;

    cached.last_update_ms = millis();
    return true;
  }

  void render_top_bar() {
    if (!display) return;

    // Clear top bar area (30px height)
    display->fillRect(0, 0, 240, 30, 0x1A1A1A);

    // Draw incident counter
    display->setTextColor(0xFFFFFF);
    display->setTextSize(1);
    display->setCursor(5, 5);

    char incident_str[32];
    snprintf(incident_str, sizeof(incident_str), "▸ %d incidents", cached.incident_count);
    display->print(incident_str);

    // Draw top incident
    if (cached.incident_count > 0) {
      display->setCursor(5, 15);
      display->setTextColor(0xFF9500);  // Orange alert color
      display->print(cached.top_incident);
    }
  }

  void render_bottom_bar() {
    if (!display) return;

    // Clear bottom bar area (30px height)
    display->fillRect(0, 290, 240, 30, 0x1A1A1A);

    display->setTextColor(0xCCCCCC);
    display->setTextSize(1);

    // CPU indicator
    draw_bar_indicator(5, 295, "CPU", cached.cpu_percent);

    // RAM indicator
    draw_bar_indicator(70, 295, "RAM", cached.ram_percent);

    // Signal indicator
    display->setCursor(135, 295);
    char sig_str[16];
    snprintf(sig_str, sizeof(sig_str), "Sig:%d%%", cached.signal_percent);
    display->print(sig_str);

    // Uptime (if available)
    display->setCursor(185, 295);
    display->print("OK");
  }

  void render_connectivity_status() {
    if (!display) return;

    int x = 235;
    int y = 10;

    // WiFi status (top right)
    draw_status_indicator(x, y, cached.wifi_connected, "W");

    // Mesh status
    draw_status_indicator(x, y + 20, cached.mesh_connected, "M");

    // SDR status
    draw_status_indicator(x, y + 40, cached.sdr_connected, "S");
  }

  void draw_bar_indicator(int x, int y, const char* label, uint8_t percent) {
    display->setCursor(x, y);
    display->print(label);

    // Small bar (20px wide, 3px tall)
    int bar_x = x;
    int bar_y = y + 8;
    int bar_w = 20;
    int bar_h = 3;

    // Background
    display->fillRect(bar_x, bar_y, bar_w, bar_h, 0x444444);

    // Fill based on percent
    int fill_w = (percent * bar_w) / 100;
    uint16_t color = 0x00DD00;  // Green
    if (percent > 80) color = 0xFF2E2E;  // Red
    else if (percent > 60) color = 0xFF9500;  // Orange

    display->fillRect(bar_x, bar_y, fill_w, bar_h, color);
  }

  void draw_status_indicator(int x, int y, bool connected, const char* label) {
    uint16_t color = connected ? 0x00DD00 : 0x444444;
    display->fillCircle(x, y, 3, color);
    display->drawCircle(x, y, 3, 0x666666);
  }
};
