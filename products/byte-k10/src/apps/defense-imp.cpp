/**
 * WISE² K10 Defense IMP Integration
 *
 * Displays Defense IMP data overlay on K10 screen:
 * - Center: IMP character face (animated)
 * - Top: Incident counter + critical alerts
 * - Bottom: System health metrics (CPU, RAM, Network)
 * - Right side: Connectivity status indicators
 *
 * Connection priority:
 * 1. WiFi via HTTP polling
 * 2. USB serial fallback
 */

#pragma once

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <cstring>
#include <cstdint>

#define DEFENSE_IMP_UPDATE_INTERVAL_MS 5000  // Poll every 5 seconds
#define DEFENSE_IMP_DISPLAY_X 240
#define DEFENSE_IMP_DISPLAY_Y 320

// Color scheme for Defense IMP
#define COLOR_DEFENSE_RED 0xFF2E2E
#define COLOR_DEFENSE_ORANGE 0xFF9500
#define COLOR_DEFENSE_YELLOW 0xFFD700
#define COLOR_DEFENSE_GREEN 0x00DD00
#define COLOR_DEFENSE_BLUE 0x00B2FF
#define COLOR_TEXT_PRIMARY 0xFFFFFF
#define COLOR_TEXT_SECONDARY 0xCCCCCC
#define COLOR_BACKGROUND 0x1A1A1A

// Incident type icons (simplified)
#define INCIDENT_ICON_POLICE "🛡"
#define INCIDENT_ICON_FIRE "🔥"
#define INCIDENT_ICON_EMS "+"
#define INCIDENT_ICON_TRAFFIC "🚗"
#define INCIDENT_ICON_WEATHER "⚠"

struct DefenseIncident {
  char id[32];
  char type[16];  // police, fire, ems, traffic, weather
  float distance;
  char location[64];
  uint32_t timestamp;
  char severity[16];  // info, warning, critical
};

struct DefenseAlert {
  char message[128];
  uint32_t timestamp;
};

struct DefenseSystemHealth {
  uint8_t cpu;        // 0-100%
  uint8_t memory;     // 0-100%
  uint8_t disk;       // 0-100%
  uint8_t temperature;
  uint32_t uptime;
  bool wifi_connected;
  uint8_t signal_strength;
};

struct DefenseImpState {
  uint32_t incident_count;
  DefenseIncident recent_incidents[5];
  DefenseAlert recent_alerts[5];
  DefenseSystemHealth health;
  bool wifi_connected;
  bool mesh_connected;
  bool sdr_enabled;
  bool usb_connected;
  uint32_t last_update_ms;
  bool data_fresh;
};

class DefenseImpDisplay {
private:
  DefenseImpState state;
  HTTPClient http_client;
  String api_url;
  String device_id;
  uint32_t last_poll_ms;

public:
  DefenseImpDisplay(const String& api_url, const String& device_id)
    : api_url(api_url), device_id(device_id), last_poll_ms(0) {
    memset(&state, 0, sizeof(state));
    state.data_fresh = false;
  }

  /**
   * Poll Defense IMP API for latest data
   */
  bool update() {
    uint32_t now = millis();
    if (now - last_poll_ms < DEFENSE_IMP_UPDATE_INTERVAL_MS) {
      return state.data_fresh;
    }

    last_poll_ms = now;

    // Try WiFi first
    if (WiFi.status() == WL_CONNECTED) {
      return poll_wifi();
    }

    // Fallback to USB serial
    return poll_usb();
  }

  /**
   * Render Defense IMP display on K10 screen
   */
  void render(TFT_eSPI& tft) {
    // Clear background
    tft.fillScreen(COLOR_BACKGROUND);

    // Draw IMP face (center - this integrates with existing face engine)
    draw_imp_face(tft);

    // Draw top bar: incident counter + alert
    draw_top_bar(tft);

    // Draw bottom bar: system health metrics
    draw_bottom_bar(tft);

    // Draw right side: connectivity status
    draw_connectivity_indicators(tft);
  }

private:
  bool poll_wifi() {
    String url = api_url + "/defense-imp/data";

    http_client.begin(url);
    http_client.addHeader("Content-Type", "application/json");

    int http_code = http_client.GET();

    if (http_code == 200) {
      String payload = http_client.getString();
      http_client.end();

      return parse_defense_data(payload);
    } else {
      http_client.end();
      return false;
    }
  }

  bool poll_usb() {
    // Read from Serial (USB) - expect JSON format
    // Format: {"incidents":{"total":5,"recent":[...]}, "health":{...}, "connectivity":{...}}

    if (!Serial.available()) {
      return false;
    }

    String json_data = "";
    while (Serial.available()) {
      json_data += (char)Serial.read();
    }

    return parse_defense_data(json_data);
  }

  bool parse_defense_data(const String& json_str) {
    // Parse JSON response from Defense IMP API
    DynamicJsonDocument doc(8192);
    DeserializationError error = deserializeJson(doc, json_str);

    if (error) {
      return false;
    }

    // Extract incident count
    state.incident_count = doc["incidents"]["total"] | 0;

    // Extract recent incidents
    JsonArray recent = doc["incidents"]["recent"];
    int incident_count = 0;
    for (JsonObject incident : recent) {
      if (incident_count >= 5) break;

      strlcpy(state.recent_incidents[incident_count].id,
              incident["id"] | "", 31);
      strlcpy(state.recent_incidents[incident_count].type,
              incident["type"] | "unknown", 15);
      state.recent_incidents[incident_count].distance = incident["distance"] | 0.0f;
      strlcpy(state.recent_incidents[incident_count].location,
              incident["location"] | "Unknown", 63);
      state.recent_incidents[incident_count].timestamp = incident["timestamp"] | 0;
      strlcpy(state.recent_incidents[incident_count].severity,
              incident["severity"] | "info", 15);

      incident_count++;
    }

    // Extract alerts
    JsonArray alerts = doc["alerts"];
    int alert_count = 0;
    for (const char* alert : alerts) {
      if (alert_count >= 5) break;
      strlcpy(state.recent_alerts[alert_count].message, alert, 127);
      state.recent_alerts[alert_count].timestamp = millis();
      alert_count++;
    }

    // Extract health metrics
    JsonObject health = doc["health"];
    state.health.cpu = health["cpu"] | 0;
    state.health.memory = health["memory"] | 0;
    state.health.disk = health["disk"] | 0;
    state.health.temperature = health["temperature"] | 0;
    state.health.uptime = health["uptime"] | 0;
    state.health.wifi_connected = health["network"]["connected"] | false;
    state.health.signal_strength = health["network"]["signal"] | 0;

    // Extract connectivity
    JsonObject connectivity = doc["connectivity"];
    state.wifi_connected = connectivity["wifi"] | false;
    state.mesh_connected = connectivity["mesh"] | false;
    state.sdr_enabled = connectivity["sdr"] | false;
    state.usb_connected = connectivity["usb"] | false;

    state.last_update_ms = millis();
    state.data_fresh = true;

    return true;
  }

  void draw_imp_face(TFT_eSPI& tft) {
    // Delegate to existing face engine
    // This method would call into the K10's face rendering system
    // keeping the animated IMP character in the center

    // The face engine handles the animated IMP
    // We just ensure it has room for our overlays
    // (top 30px, bottom 30px, right 40px reserved)
  }

  void draw_top_bar(TFT_eSPI& tft) {
    // Draw incident counter in top-left
    tft.setTextColor(COLOR_TEXT_PRIMARY);
    tft.setTextSize(1);
    tft.setCursor(5, 5);

    char incident_str[32];
    snprintf(incident_str, sizeof(incident_str), "Incidents: %d", state.incident_count);
    tft.print(incident_str);

    // Draw critical alert if present
    if (state.incident_count > 0) {
      DefenseIncident& latest = state.recent_incidents[0];
      uint16_t alert_color = COLOR_DEFENSE_GREEN;

      if (strcmp(latest.severity, "critical") == 0) {
        alert_color = COLOR_DEFENSE_RED;
        tft.setTextColor(alert_color);
      } else if (strcmp(latest.severity, "warning") == 0) {
        alert_color = COLOR_DEFENSE_ORANGE;
        tft.setTextColor(alert_color);
      }

      tft.setCursor(5, 15);
      char alert_str[80];
      snprintf(alert_str, sizeof(alert_str), "%s: %.1f mi - %s",
               latest.type, latest.distance, latest.location);
      tft.print(alert_str);
    }
  }

  void draw_bottom_bar(TFT_eSPI& tft) {
    // Draw system health metrics at bottom
    tft.setTextColor(COLOR_TEXT_SECONDARY);
    tft.setTextSize(1);

    int y = DEFENSE_IMP_DISPLAY_Y - 20;

    // CPU indicator
    draw_metric(tft, 5, y, "CPU", state.health.cpu);

    // Memory indicator
    draw_metric(tft, 65, y, "RAM", state.health.memory);

    // Temperature indicator
    char temp_str[32];
    snprintf(temp_str, sizeof(temp_str), "T:%d°C", state.health.temperature);
    tft.setCursor(125, y);
    tft.print(temp_str);

    // Network signal
    char signal_str[32];
    snprintf(signal_str, sizeof(signal_str), "Sig:%d%%", state.health.signal_strength);
    tft.setCursor(180, y);
    tft.print(signal_str);
  }

  void draw_metric(TFT_eSPI& tft, int x, int y, const char* label, uint8_t value) {
    // Draw a metric with a mini bar graph
    tft.setCursor(x, y);
    tft.print(label);

    // Small bar graph (3 pixels tall, 20 pixels wide)
    int bar_x = x;
    int bar_y = y + 8;
    int bar_width = 20;
    int bar_height = 3;

    // Background
    tft.fillRect(bar_x, bar_y, bar_width, bar_height, 0x444444);

    // Value (0-100 maps to 0-bar_width)
    int fill_width = (value * bar_width) / 100;
    uint16_t bar_color = COLOR_DEFENSE_GREEN;
    if (value > 80) bar_color = COLOR_DEFENSE_RED;
    else if (value > 60) bar_color = COLOR_DEFENSE_ORANGE;

    tft.fillRect(bar_x, bar_y, fill_width, bar_height, bar_color);
  }

  void draw_connectivity_indicators(TFT_eSPI& tft) {
    // Draw connectivity status on right side
    int x = DEFENSE_IMP_DISPLAY_X - 15;
    int y = 5;

    // WiFi indicator
    draw_status_dot(tft, x, y, state.wifi_connected ? COLOR_DEFENSE_GREEN : 0x444444, "W");

    // Mesh indicator
    draw_status_dot(tft, x, y + 20, state.mesh_connected ? COLOR_DEFENSE_BLUE : 0x444444, "M");

    // SDR indicator
    draw_status_dot(tft, x, y + 40, state.sdr_enabled ? COLOR_DEFENSE_ORANGE : 0x444444, "S");

    // USB indicator
    draw_status_dot(tft, x, y + 60, state.usb_connected ? COLOR_DEFENSE_YELLOW : 0x444444, "U");
  }

  void draw_status_dot(TFT_eSPI& tft, int x, int y, uint16_t color, const char* label) {
    // Draw small status indicator circle
    tft.fillCircle(x, y, 4, color);
    tft.drawCircle(x, y, 4, COLOR_TEXT_SECONDARY);

    tft.setTextColor(COLOR_TEXT_SECONDARY);
    tft.setTextSize(1);
    tft.setCursor(x - 2, y - 2);
    tft.print(label);
  }
};
